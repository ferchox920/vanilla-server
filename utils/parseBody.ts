import type { IncomingMessage } from "http";
import { StringDecoder } from "string_decoder";

/**
 * Parses the request body from an IncomingMessage stream.
 *
 * @param {IncomingMessage} req - The HTTP request object.
 * @returns {Promise<any>} A promise that resolves with the parsed JSON body or rejects with an error.
 */
export const parseBody = (req: IncomingMessage): Promise<any> => {
  return new Promise((resolve, reject) => {
    const decoder = new StringDecoder("utf-8");
    let buffer = "";

    req.on("data", (chunk) => {
      buffer += decoder.write(chunk);
    });

    req.on("end", () => {
      buffer += decoder.end();
      try {
        resolve(JSON.parse(buffer));
      } catch (err) {
        reject(err);
      }
    });

    req.on("error", (err) => {
      reject(err);
    });
  });
};
