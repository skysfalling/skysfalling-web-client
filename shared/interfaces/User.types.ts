import { IApiResponse } from "./API.types";
/**
 * Basic User Data.
 * Both the client and server will use this interface to represent user data.
 * @property {number} id - The ID of the user
 * @property {string} email - The email of the user
 * @property {string} name - The name of the user
 */
export interface IUserData {
  id: number;
  email: string;
  name: string;
  role?: "user" | "admin" | "moderator";
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Request to get a user from the API.
 * All properties are optional as the API will return a user if any of the properties are provided.
 * @property {number} id - The ID of the user
 * @property {string} email - The email of the user
 * @property {string} name - The name of the user
 */
export interface IUserDataRequest {
  id?: number;
  email?: string;
  name?: string;
}

/**
 * UserData Response.
 * Inherits from {@linkcode IApiResponse}
 * @property {IUserData} user - The user that was fetched
 */
export interface IUserDataResponse extends IApiResponse {
  user?: IUserData;
}

// (( Authentication )) --------------------------------
/**
 * User Authentication Request.
 * 
 * Needed for both Login and Register requests.
 * 
 * Inherits from {@linkcode IUserDataRequest}
 * @prop {string} password - The password of the user
 */
export interface IUserAuthRequest extends IUserDataRequest {
  password: string;
}

/**
 * Response from the API for an auth request
 * Inherits from {@linkcode IApiResponse}
 * @property {IUserData} user - The user that was fetched
 * @property {string} accessToken - The access token for the user
 */
export interface IUserAuthResponse extends IApiResponse {
  user?: IUserData;
  accessToken?: string;
}

