const { connection } = require("./db");
const query = (sqlQuery) => {
  return new Promise((resolve, reject) => {
    connection.query(sqlQuery, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

module.exports = { query };
