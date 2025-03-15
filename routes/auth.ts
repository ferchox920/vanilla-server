import type { IncomingMessage, ServerResponse } from "http";
import {
  addRevokedToken,
  authSchema,
  createUser,
  findUserByEmail,
  HttpMethod,
  revokeUserToken,
  validatePassword,
} from "../models";
import { parseBody } from "../utils/parseBody";
import { safeParse } from "valibot";
import { sign } from "jsonwebtoken";
import config from "../config";
import type { AuthenticatedRequest } from "../middleware/authentication";

/**
 * Authentication router that handles user registration, login, and logout requests.
 *
 * @param {IncomingMessage} req - The HTTP request object.
 * @param {ServerResponse} res - The HTTP response object.
 */
export const authRouter = async (req: IncomingMessage, res: ServerResponse) => {
  const { method, url } = req;

  //
  // 1) Registro
  //
  if (url === "/auth/register" && method === HttpMethod.POST) {
    try {
      const body = await parseBody(req);
      const result = safeParse(authSchema, body);

      // Verifica que la validación sea exitosa
      if (!result.success) {
        res.statusCode = 400;
        res.end(
          JSON.stringify({
            error: "Bad Request",
            details: result.issues,
          }),
        );
        return;
      }

      const { email, password } = body;
      const user = await createUser(email, password);

      res.statusCode = 201; // Created
      res.end(JSON.stringify(user));
      return;
    } catch (err) {
      if (err instanceof SyntaxError) {
        res.statusCode = 400; // Bad Request
        res.end(
          JSON.stringify({ error: "Bad Request", message: "Invalid JSON" }),
        );
      } else {
        res.statusCode = 500; // Internal Server Error
        res.end(JSON.stringify({ error: "Internal Server Error" }));
      }
      return;
    }

  //
  // 2) Login
  //
  } else if (url === "/auth/login" && method === HttpMethod.POST) {
    try {
      const body = await parseBody(req);
      const result = safeParse(authSchema, body);

      if (!result.success) {
        res.statusCode = 400;
        res.end(
          JSON.stringify({
            error: "Bad Request",
            details: result.issues,
          }),
        );
        return;
      }

      const { email, password } = body;
      const user = await findUserByEmail(email);

      // Verifica si el usuario existe y la contraseña es válida
      if (!user || !(await validatePassword(user, password))) {
        res.statusCode = 401; // Unauthorized
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }

      // Genera tokens
      const accessToken = sign(
        { id: user.id, email: user.email, role: user.role },
        config.jwtSecret,
        { expiresIn: "1h" },
      );
      const refreshToken = sign({ id: user.id }, config.jwtSecret, {
        expiresIn: "1d",
      });

      // Guarda el refresh token en el usuario
      user.refreshToken = refreshToken;

      res.statusCode = 200; // OK
      res.end(JSON.stringify({ accessToken, refreshToken }));
      return;
    } catch (err) {
      if (err instanceof SyntaxError) {
        res.statusCode = 400;
        res.end(
          JSON.stringify({ error: "Bad Request", message: "Invalid JSON" }),
        );
      } else {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: "Internal Server Error" }));
      }
      return;
    }

  //
  // 3) Logout
  //
  } else if (url === "/auth/logout" && method === HttpMethod.POST) {
    try {
      const token = req.headers["authorization"]?.split(" ")[1];

      // Si no hay token
      if (!token) {
        res.statusCode = 401; // Unauthorized
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }

      // Se revoca el token actual
      addRevokedToken(token);

      // Revisamos si hay un usuario en la request
      const formattedReq = req as AuthenticatedRequest;
      if (
        formattedReq.user &&
        typeof formattedReq.user === "object" &&
        "id" in formattedReq.user
      ) {
        const result = revokeUserToken(formattedReq.user.email);
        if (!result) {
          res.statusCode = 403; // Forbidden
          res.end(JSON.stringify({ error: "Forbidden" }));
          return;
        }
      }

      res.statusCode = 200; // OK
      res.end(JSON.stringify({ message: "Logged out successfully" }));
      return;
    } catch (err) {
      if (err instanceof SyntaxError) {
        res.statusCode = 400;
        res.end(
          JSON.stringify({ error: "Bad Request", message: "Invalid JSON" }),
        );
      } else {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: "Internal Server Error" }));
      }
      return;
    }

  //
  // 4) Ruta no encontrada
  //
  } else {
    res.statusCode = 404; // Not Found
    res.end(JSON.stringify({ error: "Not Found" }));
    return;
  }
};
