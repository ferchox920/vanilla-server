import cors from 'cors';
import { createServer } from 'http';
import { authRouter, CharacterRouter } from './routes';
import config from './config';

const corsMiddleware = cors();

const server = createServer((req, res) => {
    corsMiddleware(req, res, async () => {
        res.setHeader('Content-Type', 'application/json');

        try {
            if (req.url?.startsWith('/auth')) {
                await authRouter(req, res);
            } else if (req.url?.startsWith('/characters')) {
                await CharacterRouter(req, res);
            } else {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: "Not Found" }));
            }
        } catch (_err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: "Internal Server Error" }));
        }
    });
});

server.listen(config.port, () => {
    console.log("Server is running on port 3000");
});
