
import { email, minLength, object, pipe, string, type InferInput } from "valibot";
import bcrypt from "bcrypt";

const emailSchema = pipe(string(), email());
const passwordSchema = pipe(string(), minLength(6));
export const authSchema = object({
    email: emailSchema,
    password: passwordSchema
})


export enum Role {
    "ADMIN" = "admin",
    "USER" = "user"
}

export type User = InferInput<typeof authSchema> & {
    id: number;
    role: Role;
    refreshToken?: string;
}

const users: Map<string, User> = new Map();

/**-
 * Create a new user with the given email and password
 * The password is hashed before storing.
 * 
 * @param {string} email - The email of the user
 * @param {string} password - The password of the user
 * @returns {Promise<User>} - The created user
 */

export const createUser = async (email: string, password: string): Promise<User> => {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: User = {
        id: new Date().getTime(),
        email,
        password: hashedPassword,
        role: Role.USER,
    };

    // Almacena el usuario en el Map usando su email como clave
    users.set(email, newUser);

    return newUser;
};

/**-
 * Find a user byn they given email
 * 
 * @param {string} email - The email of the user
 * @returns {Promise<User | undefined>} - The user if found, undefined otherwise
   */

export const findUserByEmail = async (email: string): Promise<User | undefined> => {
    return users.get(email);
}

/**-
 * Validates a user's password
 * 
 * @param {User} user - The user to validate
 * @param {string} password - The password to validate
 * @returns {Promise<boolean>} - True if the password is valid, false otherwise
 */

export const validatePassword = async (user: User, password: string): Promise<boolean> => {
    return bcrypt.compare(password, user.password);
}

/**-
 * Remove token
 * 
 * @param {string} email - The email of the user
 * @returns {Promise<void>} - true if the token is removed, false otherwise
 */

export const revokeUserToken = async (email: string): Promise<boolean> => {
    const foundUser = users.get(email);
    if(!foundUser){
        return false
    }
    users.set(email, {...foundUser, refreshToken: undefined});
    return true;
}
