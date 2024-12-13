import bcrypt, { hash } from "bcrypt";
import express, { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import {
  IUserAuthRequest,
  IUserAuthResponse,
  IUserData,
  IUserDataResponse,
  IUserDataRequest,
  NullApiResponse
} from "../../../shared/interfaces";
import { validateToken } from "../middlewares/AuthMiddleware";
import db from "../models";

const router: Router = express.Router();
const { Users } = db;

/** Defines the RouteHandler type */
type RouteHandler = (req: Request, res: Response) => Promise<any>;

// #region ======== [[ VALIDATE ]] ========
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateName = (name: string): boolean => {
  return name.length > 3;
};

const validatePassword = (password: string): boolean => {
  return password.length > 0;
};
// #endregion

// #region ======== [[ GET ALL USERS ]] ========
const getAllUsers: RouteHandler = async (req, res) => {
  let response : IUserDataResponse = NullApiResponse;

  try {
    const users = await Users.findAll();
    response = {
      ...response,
      success: true,
      message: "Users Fetched Successfully",
      data: users,
      status: 200
    } as IUserDataResponse;
      
  } catch (error) {
    response = {
      success: false,
      message: "Failed to Fetch Users",
      error: (error as Error).message,
      status: 500
    } as IUserDataResponse;
  }
  return res.status(response.status).json(response);
};
// #endregion

// #region ======== [[ GET SINGLE USER ]] ========  
const getUser: RouteHandler = async (req, res) => {
  const request: IUserDataRequest = {
    id: req.query.id ? Number(req.query.id) : -1,
    email: req.query.email as string | undefined,
    name: req.query.name as string | undefined,
  };
  let response : IUserDataResponse = NullApiResponse;
  let user : IUserData | null = null;

  try {
    if (!user && request.id) {
      user = await Users.findByPk(request.id);
    }
    if (!user && request.email) {
      user = await Users.findOne({ where: { email: request.email } });
    }
    if (!user && request.name) {
      user = await Users.findOne({ where: { name: request.name } });
    }

    // >> ---- SUCCESS ---- <<
    if (user) {
      response = {
        success: true,
        status: 200,
        message: "User Fetched Successfully",
        data: user,
      } as IUserDataResponse;
    }
    // >> ---- NOT FOUND ---- <<
    else
    {
      response = {
        success: false,
        status: 404,
        message: "User Not Found",
        error: new Error("User Not Found"),
      } as IUserDataResponse;
    }

  } catch (error) {
    // >> ---- ERROR ---- <<
    response = {
      ...response,
      success: false,
      status: 500,
      message: "Failed to Fetch User",
      error: (error as Error).message,
    } as IUserDataResponse;
  }
  return res.status(response.status).json(response);
};
// #endregion

// #region ======== [[ GET AUTH STATUS ]] ========
const getAuthStatus: RouteHandler = async (req, res) => {
  let response : IUserAuthResponse = NullApiResponse;
  try {
    if (req.user) {
      const user: IUserData = {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
      };

      response = {
        success: true,
        status: 200,
        message: "Authentication check successful",
        data: user,
      } as IUserAuthResponse;
    }
  } catch (error) {
    response = {
      success: false,
      status: 401,
      message: "Authentication check failed",
      error: new Error("Authentication check failed"),
    } as IUserAuthResponse;
  }
  return res.status(response.status).json(response);
};
// #endregion

// #region ======== [[ REGISTER NEW USER ]] ========
const register: RouteHandler = async (req, res) => {
  const request: IUserAuthRequest = {
    email: req.body.email,
    password: req.body.password,
    name: req.body.name,
  };
  let response : IUserAuthResponse = NullApiResponse;


  try {
    if (!request.email || !request.password || !request.name) {
      response = {
        ...response,
        success: false,
        status: 400,
        message: "Invalid request",
        error: new Error("Invalid request"),
      } as IUserAuthResponse;
    }
    else
    {
      let emailValid, emailExists, nameValid, nameExists, passwordValid : boolean = false;
      emailValid = validateEmail(request.email);
      emailExists = await Users.findOne({ where: { email: request.email } });
      nameValid = validateName(request.name);
      nameExists = await Users.findOne({ where: { name: request.name } });
      passwordValid = validatePassword(request.password);

      // >> ---- SUCCESS : ALL VALID ---- <<
      if (emailValid && !emailExists && nameValid && !nameExists && passwordValid) {
        const hashedPassword = await hash(request.password, 10);
        const newUser = await Users.create({
          email: request.email,
          password: hashedPassword,
          name: request.name,
        });

        response = {
          ...response,
          success: true,
          status: 201,
          message: "User Created & Registered Successfully",
          data: newUser,
        } as IUserDataResponse;
      }
      // >> ---- ERROR : EMAIL NOT VALID ---- <<
      else if (!emailValid) {
        response = {
          ...response,
          success: false,
          status: 400,
          message: "Invalid email",
          error: new Error("Invalid email"),
        } as IUserAuthResponse;
      }
      // >> ---- ERROR : EMAIL EXISTS ---- <<
      else if (emailExists) {
        response = {
          ...response,
          success: false,
          status: 400,
          message: "Email already exists",
          error: new Error("Email already exists"),
        } as IUserAuthResponse;
      }
      // >> ---- ERROR : NAME NOT VALID ---- <<
      else if (!nameValid) {
        response = {
          ...response,
          success: false,
          status: 400,
          message: "Invalid name",
          error: new Error("Invalid name"),
        } as IUserAuthResponse;
      }
      // >> ---- ERROR : NAME EXISTS ---- <<
      else if (nameExists) {
        response = {
          ...response,
          success: false,
          status: 400,
          message: "Name already exists",
          error: new Error("Name already exists"),
        } as IUserAuthResponse;
      }
      // >> ---- ERROR : PASSWORD NOT VALID ---- <<
      else if (!passwordValid) {
        response = {
          ...response,
          success: false,
          status: 400,
          message: "Invalid password",
          error: new Error("Invalid password"),
        } as IUserAuthResponse;
      }
    }
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: (error as Error).message,
    } as IUserAuthResponse);
  }
};
// #endregion

// #region ======== [[ LOGIN USER ]] ========
// Login user
const login: RouteHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await Users.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Could not find email",
        error: new Error("Could not find email"),
      } as IUserAuthResponse);
    }

    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
        error: new Error("Invalid email or password"),
      } as IUserAuthResponse);
    }

    // Generate JWT token
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1d" }
    );

    // << LOGIN SUCCESS >>
    return res.json({
      success: true,
      message: "Login Successful",
      user: user,
      accessToken: accessToken,
    } as IUserAuthResponse);

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: (error as Error).message,
    } as IUserAuthResponse);
  }
};
//#endregion

// #region ======== [[ DELETE USER ]] ========
const deleteUser: RouteHandler = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid user ID",
        error: new Error("Invalid user ID")
      } as IUserDataResponse);
    }

    const user = await Users.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found",
        error: new Error("User not found")
      } as IUserDataResponse);
    }

    await Users.destroy({ where: { id: userId } });
    return res.json({ 
      success: true, 
      message: "User deleted successfully" 
    } as IUserDataResponse);
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to delete user",
      error: (error as Error).message
    } as IUserDataResponse);
  }
};
// #endregion

//#region ======== [[ EDIT USER ]] ========
const editUser: RouteHandler = async (req, res) => {
  const userId = req.params.userId;
  const updatedData = req.body;
  await Users.update(updatedData, { where: { id: userId } });
  res.json({ success: true, message: "User updated successfully" } as IUserDataResponse);
};
//#endregion

// ============================================================================ 
router.get("/", validateToken, getAuthStatus);
router.get("/auth", validateToken, getAuthStatus);
router.get("/getAll", getAllUsers);
router.get("/get", getUser);

router.post("/register", register);
router.post("/login", login);

router.put("/edit", validateToken, editUser);

router.delete("/:userId", validateToken, deleteUser);

export default router;
