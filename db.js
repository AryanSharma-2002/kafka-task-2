var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "market",
  port: "30306",
});

connection.connect((err) => {
  if (err) {
    console.log("some error ", err.message);
    return;
  }
  console.log("connected");
});

module.exports = { connection };
