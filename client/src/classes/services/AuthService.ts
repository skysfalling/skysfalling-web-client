import axios, { AxiosResponse } from "axios";
import * as Yup from "yup";
import { NetworkSettings, UserSettings } from "../../Settings";
import { IApiResponse, IUserAuthRequest, IUserAuthResponse, IUserData, NullApiResponse } from "shared/interfaces";
import StorageService from "./StorageService";
import { AuthContextValues } from "src/context";
import ErrorService from "shared/ErrorService";
import UserService from "./UserService";

const USER_DATABASE_URL = `${NetworkSettings.serverUrl}/users`;
const USER_CHECK_AUTH_URL = `${USER_DATABASE_URL}/auth`;
const USER_LOGIN_URL = `${USER_DATABASE_URL}/login`;
const USER_REGISTER_URL = `${USER_DATABASE_URL}/register`;

const AUTH_SERVICE_PREFIX = "[AuthService]";
const CHECK_AUTH_PREFIX = `${AUTH_SERVICE_PREFIX} CheckAuthentication - `;
const LOGIN_PREFIX = `${AUTH_SERVICE_PREFIX} Login - `;
const LOGOUT_PREFIX = `${AUTH_SERVICE_PREFIX} Logout - `;
const REGISTER_PREFIX = `${AUTH_SERVICE_PREFIX} Register - `;


/**
 * Authentication Service
 * 
 * @author [skysfalling]
 * @version [1.0.0]
 * @since [2024-12-13]
 * 
 * @description
 * This service is responsible for handling all authentication related operations.
 * It provides methods for checking authentication, logging in, logging out, and registering users.
 */
class AuthService {

  // #region ================ [[ VALIDATION SCHEMAS ]] ================
  public static AuthLoginValidationSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(UserSettings.password.minLength, `Password must be at least ${UserSettings.password.minLength} characters long`)
      .max(UserSettings.password.maxLength, `Password must be at most ${UserSettings.password.maxLength} characters long`)
      .required('Password is required'),
  });

  public static AuthRegistrationValidationSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(UserSettings.password.minLength, `Password must be at least ${UserSettings.password.minLength} characters long`)
      .max(UserSettings.password.maxLength, `Password must be at most ${UserSettings.password.maxLength} characters long`)
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'),], 'Passwords must match')
      .required('Confirm password is required'),
  });
  // #endregion

  // #region ================ [[ AUTHENTICATION ]] ================

/**
 * Get Authentication Headers
 * @returns {Object | null} - Authentication Headers or null if no token
 */
public static GetAuthHeaders() : {Authorization: string} {
  const token = StorageService.GetAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : { Authorization: "" };
}

  /**
   * Check if the current client user is authenticated
   * @returns {Promise<IUserAuthResponse>} - Check Auth Response
   */
  static async CheckAuthentication(): Promise<IUserAuthResponse> {
    console.log(`${CHECK_AUTH_PREFIX} Checking Authentication Request`);
    let response : IUserAuthResponse = NullApiResponse;
    
    try {
      const headers = this.GetAuthHeaders();
      
      // If no headers (no token), return unauthenticated response
      if (!headers) {
        return {
          ...response,
          success: false,
          message: "No authentication token found",
          status: 401
        };
      }

      const serverResponse : AxiosResponse<IUserAuthResponse> = await axios.get(
        USER_CHECK_AUTH_URL, 
        { headers }
      );
      
      console.log(`${CHECK_AUTH_PREFIX} Server Response : `, serverResponse);

      // Check if the response is successful
      if (serverResponse.status === 200) {
        response = {
          success: true,
          message: serverResponse.data.message,
          status: serverResponse.status,
          user: serverResponse.data.user,
          accessToken: serverResponse.data.accessToken,
        }
      }
    }
    catch (error) {
      // Handle specific error cases
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        response = {
          ...response,
          success: false,
          message: "Authentication required",
          status: 401
        };
      } else {
        ErrorService.HandleAPIRequestError(CHECK_AUTH_PREFIX, error);
      }
    }

    return response;
  }

  // #endregion

  // #region ================ [[ LOGIN ]] ================
  /**
   * Send Login Request to Server
   * @param request {IUserAuthRequest} - Login Request
   * @param setAuthContext {Function(values: AuthContextValues)} - Function to set Auth Context
   * @returns {Promise<IUserAuthResponse>} - Login Response
   */
  static async Login(request: IUserAuthRequest, setAuthContext: (values: AuthContextValues) => void): Promise<IUserAuthResponse> {
    console.log(`${LOGIN_PREFIX} Request : `, request);
    let response: IUserAuthResponse = NullApiResponse;

    try {
      const serverResponse = await axios.post(USER_LOGIN_URL, request);
      console.log(`${LOGIN_PREFIX} ServerResponse : `, serverResponse);

      response = serverResponse.data;
      if (!response.error && response.user) {
        const userData: IUserData | undefined = await UserService.GetUser({ id: response.user.id });
        if (userData) {
          response = {
            ...response,
            user: userData,
            message: serverResponse.data.message
          };

          StorageService.SetAccessToken(response.accessToken);
          setAuthContext({ status: true, user: userData });

          console.log(`${LOGIN_PREFIX} Success : `, response);
          return response;
        }
      }
    }
    catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(`${LOGIN_PREFIX} Axios Error : `, error.response);
        response = {
          ...response,
          message: error.response?.data.message || "Login failed",
          error: error instanceof Error ? error.message : "Unknown Error",
        };
      }
      else if (error instanceof Error) {
        console.log(`${LOGIN_PREFIX} Error : `, error);
        response = {
          ...response,
          message: error.message,
          error: error.message,
        };
      }
      else {
        console.log(`${LOGIN_PREFIX} Unknown Error : `, error);
        response = {
          ...response,
          message: "Login failed",
          error: "Unknown Error",
        };
      }

      console.log(`${LOGIN_PREFIX} Response : `, response);
      return response;
    }

    // Return default response
    return response;
  }
  // #endregion

  // #region ================ [[ LOGOUT ]] ================
  /**
   * Logout User
   * @returns {Promise<IUserAuthResponse>} - Logout Response
   */
  static async Logout(setAuthContext: (values: AuthContextValues) => void): Promise<IApiResponse> {
    StorageService.RemoveAccessToken();
    setAuthContext({ status: false, user: undefined });

    let response : IApiResponse = NullApiResponse;

    console.log(`${LOGOUT_PREFIX} Response : `, response);
    return response;
  }
  // #endregion

  // #region ================ [[ REGISTER ]] ================
  /**
   * Send Register Request to Server
   * @param request {IUserAuthRequest} - Register Request
   * @param setAuthContext {Function(values: AuthContextValues)} - Function to set Auth Context
   * @returns {Promise<IRegisterResponse>} - Register Response
   */
  static async Register(request: IUserAuthRequest, setAuthContext: (values: AuthContextValues) => void): Promise<IUserAuthResponse> {
    let response: IUserAuthResponse = NullApiResponse;
    try {

      // << CHECK IF USER EXISTS >> ------------------------------
      const existingUser = await UserService.GetUser({ email: request.email });
      if (existingUser) {
        return {
          ...response,
          message: 'User with this email already exists',
          error: "Duplicate User",
        };
      }

      // << REGISTER USER >> ----------------------------------------
      const serverResponse = await axios.post(USER_REGISTER_URL, request);
      if (!serverResponse.data.error) {
        const loginResponse: IUserAuthResponse = await AuthService.Login(request, setAuthContext);
        response = {
          ...response,
          success: loginResponse.success,
          user: loginResponse.user,
          message: loginResponse.message,
          error: loginResponse.error,
        };
      }
    }
    catch (error) {
      let errorResponse: IUserAuthResponse = {
        ...response,
        error: error instanceof Error ? error.message : "Unknown Error",
      }

      if (axios.isAxiosError(error)) {
        console.log(`${REGISTER_PREFIX} Error : `, error);

        // More detailed error handling
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          return {
            ...errorResponse,
            message: error.response.data.message || 'Registration failed',
          };
        } else if (error.request) {
          // The request was made but no response was received
          return {
            ...errorResponse,
            message: 'No response received from server',
          };
        } else {
          // Something happened in setting up the request that triggered an Error
          return {
            ...errorResponse,
            message: 'Error setting up registration request',
          };
        }
      }

      // Fallback for non-axios errors
      return {
        ...errorResponse,
        message: 'An unexpected error occurred during registration',
        error: error instanceof Error ? error.message : "Unknown Error",
      };
    }

    // Return default response
    return response;
  }
  // #endregion
}

export default AuthService;