/**
 * A set to store revoked tokens.
 * 
 * This is used to keep track of tokens that have been explicitly invalidated.
 */
const revokedToken: Set<string> = new Set();

/**
 * Revokes a token by adding it to the `revokedToken` set.
 * 
 * @param token - The token to be revoked.
 */
export const addRevokedToken = (token: string): void => {
    revokedToken.add(token);
};

/**
 * Checks if a given token has been revoked.
 * 
 * @param token - The token to check.
 * @returns `true` if the token has been revoked, otherwise `false`.
 */
export const isTokenRevoked = (token: string): boolean => {
    return revokedToken.has(token);
};
