import { createPool } from "mysql2";
import dotenv from "dotenv";

dotenv.config()

const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}).promise();

export const userRegistration = async (username, password, email) => {
  const [rows] = await pool.query("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", [username, password, email]);


  return rows;
};

export default pool; 
