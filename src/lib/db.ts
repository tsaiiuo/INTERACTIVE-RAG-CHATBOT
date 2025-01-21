import mysql from "mysql2/promise";
import { ResultSetHeader, RowDataPacket } from "mysql2";

const pool = mysql.createPool({
  host: process.env.AWSRDB_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 測試資料庫連接
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Successfully connected to MySQL database.");
    connection.release();
    return true;
  } catch (error) {
    console.error("Error connecting to MySQL database:", error);
    return false;
  }
};

export const db = {
  query: async <T extends RowDataPacket[] | ResultSetHeader>(
    sql: string,
    values: any[] = []
  ) => {
    const [rows, fields] = await pool.execute(sql, values);
    return [rows as T, fields];
  },
};

// 在應用啟動時測試連接
testConnection();
