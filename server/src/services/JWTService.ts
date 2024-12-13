import jwt from 'jsonwebtoken';
import { IUserData } from '@shared/interfaces';

export class JWTService {
  private static readonly SECRET_KEY = process.env.JWT_SECRET || "skysfalling_website_secret_key";
  private static readonly DEFAULT_EXPIRATION = "1d";

  /**
   * Generates a JWT token for a user
   * @param {IUserData} user - The user to generate a token for
   * @param {string} expiresIn - Optional expiration time (defaults to 1 day)
   * @returns {string} The generated JWT token
   */
  static generateToken(user: IUserData, expiresIn: string = JWTService.DEFAULT_EXPIRATION): string {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email 
      },
      JWTService.SECRET_KEY,
      { expiresIn }
    );
  }

  /**
   * Verifies a JWT token
   * @param {string} token - The token to verify
   * @returns {IUserData | null} The decoded token payload or null if invalid
   */
  static verifyUserAccessToken(token: string): IUserData | null {
    try {
      return jwt.verify(token, JWTService.SECRET_KEY) as IUserData;
    } catch (error) {
      return null;
    }
  }
}
