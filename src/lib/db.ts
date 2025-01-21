import mysql from "mysql2/promise";
import { ResultSetHeader, RowDataPacket } from "mysql2";

const pool = mysql.createPool({
  host: process.env.AWSRDB_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 20, // 降低連接數限制
  queueLimit: 0,
  enableKeepAlive: true, // 啟用連接保活
  keepAliveInitialDelay: 0,
  idleTimeout: 60000, // 空閒連接超時時間（毫秒）
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

// 添加連接池事件監聽
pool.on("acquire", function (connection) {
  console.log("Connection %d acquired", connection.threadId);
});

pool.on("release", function (connection) {
  console.log("Connection %d released", connection.threadId);
});

export const db = {
  query: async <T extends RowDataPacket[] | ResultSetHeader>(
    sql: string,
    values: any[] = []
  ) => {
    const connection = await pool.getConnection();
    try {
      const [rows, fields] = await connection.execute(sql, values);
      return [rows as T, fields];
    } finally {
      connection.release();
    }
  },
};

// 在應用啟動時測試連接
testConnection();
