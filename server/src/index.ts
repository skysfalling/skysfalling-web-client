import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sequelize } from "./models/db";

import userRoutes from "./routes/UserRoutes";

// ====================== << DOTENV VARIABLES >> ======================
dotenv.config();

// ====================== << EXPRESS SERVER >> ======================
const app: Express = express();
app.use(cors());
app.use(express.json());

// ====================== << ROUTES >> ======================
app.use("/users", userRoutes);

// ====================== << SERVER LISTENERS >> ======================
sequelize.sync().then(() => {
  app.listen(process.env.SERVER_PORT, () => {
    console.log(`Connected to server on port ${process.env.SERVER_PORT}`);
  });
}); 