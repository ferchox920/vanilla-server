import type { ServerResponse } from "http";
import type { AuthenticatedRequest } from "./authentication";
import type { User } from "../models";

/**
 * Middleware function to authorize users based on their roles.
 *
 * This function ensures that the authenticated user has one of the required roles.
 * If the user does not have the necessary permissions, a 403 Forbidden response is returned.
 *
 * @param {string[]} roles - An array of allowed roles that have access to the requested resource.
 * @returns {(req: AuthenticatedRequest, res: ServerResponse) => Promise<boolean>} 
 * A middleware function that checks the user's role and determines if they are authorized.
 */
export const authorizeRoles = (...roles: string[]) => {
  return async (
    req: AuthenticatedRequest,
    res: ServerResponse
  ): Promise<boolean> => {
    const userRole = (req.user as User)?.role;

    if (!userRole || !roles.includes(userRole)) {
      res.statusCode = 403;
      res.end(JSON.stringify({ error: "Forbidden: Insufficient permissions" }));
      return false;
    }

    return true;
  };
};
