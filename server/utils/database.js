// utils/database.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

let connection = null;

export const getConnection = () => connection;

export const connectDB = async () => {
  try {
    if (!connection) {
      const user = process.env.USER;
      const password = process.env.PASSWORD;
      const database = process.env.DB_NAME;
      const host = process.env.DB_HOST || "localhost";

      connection = await mysql.createConnection({
        host,
        user,
        password,
        database
      });

      console.log("DB Connected");
    }
  } catch (error) {
    console.error("DB Connection Error:", error.message);
    process.exit(1);
  }
};
