const mysql = require("mysql2");
const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, ".env")
});

console.log("MYSQLHOST:", process.env.MYSQLHOST);
console.log("MYSQLPORT:", process.env.MYSQLPORT);
console.log("MYSQLUSER:", process.env.MYSQLUSER);
console.log("MYSQLDATABASE:", process.env.MYSQLDATABASE);

const db = mysql.createPool({

    host: process.env.MYSQLHOST,
    port: Number(process.env.MYSQLPORT),
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,

    waitForConnections: true,
    connectionLimit: 20,
    maxIdle: 20,
    idleTimeout: 60000,
    queueLimit: 0,

    enableKeepAlive: true,
    keepAliveInitialDelay: 0

}).promise();

(async () => {

    try {

        const connection = await db.getConnection();

        console.log("✅ MySQL Connected");

        connection.release();

    } catch (err) {

        console.log("❌ Database Error");
        console.log(err);

    }

})();

module.exports = db;