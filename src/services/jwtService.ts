import { json } from "express";
import { DbServiceBase } from "./db/dbServiceBase/dbServiceBase.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config({ path: process.env.ENV_PATH });

export class JWTservice extends DbServiceBase {
    secret: string;
    defaultSignOptions: {};
    defaultVerifyOptions: {};
    /**
   * Create a JWT utility instance
   * @param {string} secret - Secret key for signing/verifying tokens
   * @param {object} [defaultSignOptions={}] - Default options for token signing
   * @param {object} [defaultVerifyOptions={}] - Default options for token verification
   */
    constructor(secret: string | undefined, defaultSignOptions = {}, defaultVerifyOptions = {}) {
        super()
        this.secret = secret;
        this.defaultSignOptions = defaultSignOptions;
        this.defaultVerifyOptions = defaultVerifyOptions;
    }

    /**
     * Sign a payload into a JWT token
     * @param {object} payload - Data to include in the token
     * @param {object} [options={}] - Options for token signing
     * @returns {string} Signed JWT token
     */
    sign(payload, options = {}) {
        const mergedOptions = { ...this.defaultSignOptions, ...options };
        return jwt.sign(payload, this.secret, mergedOptions);

    }

    /**
     * Verify and decode a JWT token
     * @param {string} token - Token to verify
     * @param {object} [options={}] - Options for token verification
     * @returns {object} Decoded token payload
     * @throws {Error} If token is invalid or expired
     */
    // verify(token, options = {}) {
    //     const mergedOptions = { ...this.defaultVerifyOptions, ...options };
    //     return jwt.verify(token, this.secret, mergedOptions);
    // }

    verify(token: string, options = {}): Promise<any> {
        return new Promise((resolve, reject) => {
            const mergedOptions = { ...this.defaultVerifyOptions, ...options };
            jwt.verify(token, this.secret, mergedOptions, (err, decoded) => {
                if (err) return reject(err);
                resolve(decoded);
            });
        });
    }

    /**
     * Decode a JWT token without verification
     * @param {string} token - Token to decode
     * @returns {object|null} Decoded payload or null if invalid
     */
    decode(token) {
        return jwt.decode(token);
    }
}

export default new JWTservice(process.env.JWT_SECRET);
