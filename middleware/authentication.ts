import type { IncomingMessage, ServerResponse } from "http";
import { verify, type JwtPayload } from "jsonwebtoken";
import { isTokenRevoked } from "../models";
import config from "../config";

/**
 * Extends the `IncomingMessage` interface to include a `user` property
 * that will store the decoded JWT payload if authentication is successful.
 */
export interface AuthenticatedRequest extends IncomingMessage {
    user?: JwtPayload | string;
}

/**
 * Middleware function to authenticate a JWT token.
 *
 * This function:
 * - Extracts the token from the `Authorization` header.
 * - Checks if the token is null or missing.
 * - Verifies if the token has been revoked.
 * - Decodes and verifies the token using the configured JWT secret.
 * - Stores the decoded user information in `req.user` if successful.
 *
 * @param req - The incoming request, which may contain an authentication token.
 * @param res - The server response object, used to return errors when authentication fails.
 * @returns A promise that resolves to `true` if authentication succeeds, or `false` otherwise.
 */
export const authenticateToken = async (
    req: AuthenticatedRequest,
    res: ServerResponse,
): Promise<boolean> => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return false;
    }

    if (isTokenRevoked(token)) {
        res.statusCode = 403;
        res.end(JSON.stringify({ error: "Forbidden" }));
        return false;
    }

    try {
        const decoded = verify(token, config.jwtSecret);
        req.user = decoded;
        return true;
    } catch (_err) {
        res.statusCode = 403;
        res.end(JSON.stringify({ error: "Forbidden" }));
        return false;
    }
};
