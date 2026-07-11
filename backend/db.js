const mysql = require("mysql2");
const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, ".env")
});

console.log("MYSQLHOST:", process.env.MYSQLHOST);
console.log("MYSQLPORT:", process.env.MYSQLPORT);
console.log("MYSQLUSER:", process.env.MYSQLUSER);
console.log("MYSQLDATABASE:", process.env.MYSQLDATABASE);

const db = mysql
    .createPool({
        host: process.env.MYSQLHOST,
        port: process.env.MYSQLPORT,
        user: process.env.MYSQLUSER,
        password: process.env.MYSQLPASSWORD,
        database: process.env.MYSQLDATABASE,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    })
    .promise();

db.getConnection()
    .then((connection) => {
        console.log("MySQL Connected ✅");
        connection.release();
    })
    .catch((err) => {
        console.log("Database Error:", err);
    });

module.exports = db;