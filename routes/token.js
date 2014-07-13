var uuid = require('node-uuid');
var getUUID = function () {
 return uuid.v1();
}


//GET by id

exports.tokenOne = function (dbconnection, tokenid, error, callback) {
 var query = "SELECT * FROM sql346494.tokens where token ='" + tokenid + "'";
 dbconnection.query(query, function (err, rows, fields) {
  // There was an error or not?
  if (err != null) {
   error();
  } else {
   if (rows.length < 1) {
    error();
   } else {
    callback();
   }
  }
 });
};

// DELETE by id 

exports.tokenDelete = function (dbconnection) {
 var query = "DELETE FROM sql346494.tokens WHERE expirydate < NOW()";
 dbconnection.query(query, function (err, rows, fields) {
  // There was an error or not?
  if (err != null) {
   console.log("Token Query error:" + err);
  } else {
   console.log("DELETED EXPIRED TOKENS...");
  }
 });
};



// POST category
exports.tokenAdd = function (dbconnection, userid, callback) {

 var uuid = getUUID();
 console.log("UUID : " + uuid);
 console.log("userid : " + userid);
 var expiryDate = new Date(new Date().getTime() + 60 * 60 * 24 * 1000).toISOString().slice(0, 19).replace('T', ' ');

 var query = "INSERT INTO `sql346494`.`tokens`(`token`, `expirydate`, `userid`) VALUES ('" + uuid + "','" + expiryDate + "'," + userid + ");"
 dbconnection.query(query, function (err, rows, fields) {
  console.log(query);
  if (err != null) {
   console.log("Query error while creating Token:" + err);
  } else {
   var query2 = "SELECT * FROM tokens where id=" + rows.insertId;
   dbconnection.query(query2, function (err, data, fields) {
    console.log(rows.insertId);
    if (err != null) {
     callback({
      status: "Error",
      message: "Error occurred while creating Token"
     });
    } else {
     data[0].status = "Success";
     callback(data[0]);
    };
   })
  }
 });

};
