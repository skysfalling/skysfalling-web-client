import { Request, Response, NextFunction } from 'express';
import { IUserData } from '@shared/interfaces';
import { JWTService } from '../services/JWTService';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUserData;
    }
  }
}

interface ValidateHandler {
    (req: Request, res: Response, next: NextFunction): Promise<any>;
}

const VALIDATE_TOKEN_PREFIX = "Validate Token : ";

/**
 * Middleware to validate JWT authentication token
 * 
 * This middleware:
 * 1. Checks for the presence of an access token in the request header
 * 2. Verifies the token's validity using the JWT secret
 * 3. Attaches decoded user information to the request object
 * 4. Allows or denies further request processing based on token validation
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 * @returns Response with error status if token is invalid or missing
 */
export const validateToken: ValidateHandler = async (req, res, next) => {
    // Retrieve the access token from the request headers
    // Expects a header named 'accessToken' containing the JWT
    const accessToken = req.header("accessToken");

    if (!accessToken) {
        console.error(`${VALIDATE_TOKEN_PREFIX} No access token found : `, accessToken);
        return res.status(401).json({ 
            error: "Access token is required",
            message: "Authentication failed: No token provided",
            token: accessToken
        });
    }

    try {
        const user : IUserData | null = JWTService.verifyUserAccessToken(accessToken);
        
        if (!user) {
            console.error(`${VALIDATE_TOKEN_PREFIX} Invalid token : `, accessToken);
            return res.status(403).json({ 
                error: "Invalid token",
                message: "The provided token is invalid or has expired",
                token: accessToken
            });
        }

        // Attach the decoded user to the request
        req.user = user;
        next();

        //console.log(`${VALIDATE_TOKEN_PREFIX} Decoded : `, req.user);

    } catch (err: any) {
      // If token verification fails
      if (err) {
        // Provide different error messages based on the type of verification failure
        switch (err.name) {
            case 'TokenExpiredError':
                console.error(`${VALIDATE_TOKEN_PREFIX} Token expired : `, accessToken);
                return res.status(401).json({ 
                    error: "Token expired",
                    message: "Your session has expired. Please log in again.",
                    token: accessToken,
                });
            case 'JsonWebTokenError':
                console.error(`${VALIDATE_TOKEN_PREFIX} Invalid token : `, accessToken);
                return res.status(403).json({ 
                    error: "Invalid token:",
                    message: "The provided token is malformed or invalid.",
                    token: accessToken,
                });
            default:
                console.error(`${VALIDATE_TOKEN_PREFIX} Unknown error : `, accessToken);
                return res.status(500).json({ 
                    error: "Authentication error",
                    message: "An unexpected error occurred during token verification.",
                    token: accessToken,
                });
            }
        }
    }
};