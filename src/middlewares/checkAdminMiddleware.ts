import { Request, Response, NextFunction } from "express";
import jwtService from "../services/jwtService.js";

const allowedRoles = ["admin"];

const checkAdmin = async (req: any, res: Response, next: NextFunction) => {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Missing or invalid authorization header" });
        return
    }

    const token = authHeader.split(" ")[1];

    try {
        // 2. Verify and decode token ASYNC
        const decoded: any = await jwtService.verify(token); // Add await here

        console.log({ decoded });

        // 3. Check if token contains user data with role
        if (!decoded.user?.role) {
            res.status(403).json({ message: "Invalid token payload" });
            return
        }

        const userRole = decoded.user.role;

        // 4. Validate role against allowed roles
        if (!allowedRoles.includes(userRole)) {
            res.status(403).json({
                message: `Access denied. Required roles: ${allowedRoles.join(", ")}`
            });
            return
        }

        // 5. Attach user to request for downstream use
        req.user = decoded.user;
        next();

    } catch (error) {
        // Handle token verification errors
        res.status(401).json({ message: "Invalid or expired token" });
        return
    }
};

export default checkAdmin;