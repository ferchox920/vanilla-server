export const config = {
    jwtSecret: process.env.JWT_KEY as string || "secret",
    port: process.env.PORT as string || "3000",
};

export default config;