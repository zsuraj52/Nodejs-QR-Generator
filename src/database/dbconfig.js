import mysql from 'mysql';
import dotenv from 'dotenv';
dotenv.config();

const connection = mysql.createConnection({
    host: "localhost",
    user: "test",
    password: "Mysql@123",
    database:"task1"
});

connection.connect(function(err) {
if (err) throw err;
console.log("Database Connected Successfully !");
});
export default connection;