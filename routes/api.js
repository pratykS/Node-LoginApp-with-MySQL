var crypto = require('crypto');
var token = require('./token');

exports.users = function (dbconnection) {
 return function (req, res) {
  var query = "SELECT * FROM sql346494.users;";
  dbconnection.query(query, function (err, rows) {
   // There was an error or not?
   if (err != null) {
    res.end("Query error:" + err);
   } else {
    res.json(rows);
   }
  });
 }
};




// POST category
exports.usersAdd = function (dbconnection) {
 return function (req, res) {
  var email = req.body.email;
  var fname = req.body.firstname;
  var lname = req.body.lastname;
  var country = req.body.country;
  var password = req.body.password;
  var pw = crypto.createHmac('sha1', 'abcdeg').update(password.toString()).digest('hex');
  var query = "INSERT INTO sql346494.users (email,password,firstname,lastname,country) VALUES ('" + email + "','" + pw + "','" + fname + "','" + lname + "','" + country + "');"
  console.log("QUERYYYY : " + query);
  dbconnection.query(query, function (err, rows) {
   if (err != null) {
    res.end("Query1 error:" + err);
    console.log(query)
   } else {
    var query2 = "SELECT * FROM users WHERE id=" + rows.insertId;
    dbconnection.query(query2, function (err, data, fields) {
     if (err != null) {
      res.end("Query2 error:" + err);
     } else {
      token.tokenAdd(dbconnection, rows.insertId, function () {
       if (data.status == "Error") {
        res.end("Error while adding Token:" + data.message);
       } else {
        console.log('QUERY : ' + JSON.stringify(data));
        res.render('profile.ejs', {
         user: data[0] // get the user out of session and pass to template
        });
       }
      })
     };
    })
    //    console.log("DATA 1 : " + JSON.stringify(rows));
    //    res.send(rows)
   }
  });
 }
};


//Login Method
exports.userLogin = function (dbconnection) {

 return function (req, res) {

  console.log('in user');
  var email = req.body.email;
  var passwordfrmUser = req.body.password;
  if (passwordfrmUser == null) {
   res.send({
    message: "Password cannot be blank."
   }, 401);
   res.end()
  } else {
   console.log("EMAIL: " + email);
   console.log('password = ' + passwordfrmUser);
   var query = "SELECT email,password,id,firstname,lastname,country FROM sql346494.users where email ='" + email + "';";
   dbconnection.getConnection(function (err, connection) {
    connection.query(query, function (err, rows, fields) {
     console.log("QUERY : " + query);
     console.log("DATA : " + JSON.stringify(rows));
     // There was an error or not?
     if (err != null) {
      console.log(err);

      res.end("Login Query error:" + err);
     } else {
      if (rows.length == 0) {
       console.log('No data from query');
       res.send({
        message: "Incorrect eMail"
       }, 401);
       res.end();
      } else {
       var pw = crypto.createHmac('sha1', 'abcdeg').update(passwordfrmUser).digest('hex');
       console.log("PW : " + pw);
       if (pw == rows[0].password) {
        token.tokenAdd(connection, rows[0].id, function (data) {
         if (data.status == "Error") {
          res.end("Error while adding Token:" + data.message);
         } else {
          res.render('profile.ejs', {
           user: rows[0]
          });
         }
        })
       } else {
        res.send({
         message: "In Correct UserName and Password"
        }, 401);
        res.end();
       }
      }
     }
    });
    connection.release();
   });
  }

 }
};