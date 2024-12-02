const express = require("express");
const app = express();
const port = 3000;

// Middleware to parse URL-encoded and JSON bodies
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// MySQL connection setup
const mysql = require('mysql');
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Bacca101", // Use your MySQL root password
  database: "dbmsproject"  // Use your database
});

// Connect to MySQL database
con.connect(function(err) {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log("Connected to MySQL");
});

// Static file server setup for serving HTML files
const fs = require("fs");

function readAndServe(path, res) {
    fs.readFile(path, function(err, data) {
        if (err) {
            res.status(500).send('Error reading file.');
            return;
        }
        res.setHeader('Content-Type', 'text/html');
        res.end(data);
    });
}

// Routes

// Route for homepage (index.html)
app.get("/", function(req, res) {
    readAndServe("./index.html", res);
});

// Route for main page (index.html)
app.get("/main", function(req, res) {
    readAndServe("./index.html", res);
});

// Route for login page (login.html)
app.get("/login", function(req, res) {
    readAndServe("./login.html", res);
});

// Route to fetch and display tutors
app.get("/tutors", (req, res) => {
    const sql_query = "SELECT tutor_id, name, email, subject_specialization, signup_date, status FROM tutors";

    con.query(sql_query, (err, results) => {
        if (err) {
            console.error("Database query failed:", err);
            res.status(500).json({ error: "Database query failed" });
            return;
        }
        // Send JSON response
        res.json({ tutors: results });
    });
});

// Route for tutors page (tutors.html)
app.get("/tutors-page", function(req, res) {
    readAndServe("./tutors.html", res);
});

// Route to handle login
// Does not work at the moment, just gets a database query failed error
app.post('/login', (req, res) => {
    const { uname, psw } = req.body;
  
    // Ensure uname and psw are provided
    if (!uname || !psw) {
      return res.status(400).send('Email and password are required');
    }
  
    // Query to check if the user exists with the given email and password
    // debugging here, inserted emails and password, please change back into question marks "?"
    const sql_query = `SELECT * FROM accounts WHERE email = john.doe@example.com AND password = password123`;
  
    con.query(sql_query, [uname, psw], (err, results) => {
      if (err) {
        // Log specific error to the console
        console.error('Database query failed:', err);
        return res.status(500).send('Database query failed');
      }
  
      if (results.length > 0) {
        // Successful login
        console.log('Login successful for user:', uname);
        res.send('Login successful');
      } else {
        // Invalid credentials
        console.log('Invalid credentials for user:', uname);
        res.status(401).send('Invalid email or password');
      }
    });
  });

// Start the server
app.listen(port, function() {
  console.log("NodeJS app listening on port " + port);
});
