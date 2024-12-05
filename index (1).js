const express = require("express");
const app = express();
const port = 3000;

// Middleware to parse URL-encoded and JSON bodies
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// MySQL connection setup
const mysql = require("mysql");
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Bacca101", // Use your MySQL root password
  database: "dbmsproject", // Use your database
});

// Connect to MySQL database
con.connect(function (err) {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL");
});

// Static file server setup for serving HTML files
const fs = require("fs");

function readAndServe(path, res) {
  fs.readFile(path, function (err, data) {
    if (err) {
      res.status(500).send("Error reading file.");
      return;
    }
    res.setHeader("Content-Type", "text/html");
    res.end(data);
  });
}

let currentUsername = ""; // Variable to hold the username
let currentPassword = ""; // Variable to hold the password

// Routes

// Route for homepage (index.html)
app.get("/", function (req, res) {
  readAndServe("./login.html", res);
});

// Route for main page (index.html)
app.get("/main", function (req, res) {
  readAndServe("./index.html", res);
});

// Route for login page (login.html)
app.get("/login", function (req, res) {
  readAndServe("./login.html", res);
});

// Route for login page (login.html)
app.get("/signup", function (req, res) {
  readAndServe("./signup.html", res);
});

// Route for main page (index.html)
app.get("/main", function (req, res) {
  readAndServe("./index.html", res);
});

// Route for main page (index.html)
app.get("/view", function (req, res) {
  readAndServe("./view.html", res);
});

// Route to fetch and display tutors
// Used to grab data from database and turn it into json, to which /tutors-page take info and makes into html
// We don't need to rely on a js file to render
app.get("/tutors", (req, res) => {
  const sql_query =
    "SELECT tutor_id, name, email, subject_specialization, signup_date, status FROM tutors";

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
app.get("/tutors-page", function (req, res) {
  readAndServe("./tutors.html", res);
});

// Route to handle login
app.post("/login", (req, res) => {
  const { uname, psw } = req.body;

  // Ensure uname and psw are provided
  if (!uname || !psw) {
    return res.status(400).send("Email and password are required");
  }

  // Query to check if the user exists with the given email and password
  const sql_query = `SELECT * FROM accounts WHERE email = ? AND password = ?`;

  con.query(sql_query, [uname, psw], (err, results) => {
    if (err) {
      // Log specific error to the console
      console.error("Database query failed:", err);
      return res.status(500).send("Database query failed");
    }

    // Check if the user exists
    if (results.length > 0) {
      // Successful login, save login details in variables
      currentUsername = uname; // Save username
      currentPassword = psw; // Save password
      console.log(uname);
      console.log(psw);

      console.log("Login successful for user:", uname);
      res.redirect("/main"); // Redirect to the main page
    } else {
      // Invalid credentials
      console.log("Invalid credentials for user:", uname);
      res.redirect("/login"); // Redirect back to login page
    }
  });
});

app.post("/signup", (req, res) => {
  const { name, email, psw } = req.body;

  // Save to database (example query)
  const sql_query =
    "INSERT INTO accounts (name, email, password) VALUES (?, ?, ?)";
  con.query(sql_query, [name, email, psw], (err, results) => {
    if (err) {
      console.error("Error saving account:", err);
      return res.status(500).send("Error saving account");
    }

    res.send("Account created successfully");
  });
});

// Start the server
app.listen(port, function () {
  console.log("NodeJS app listening on port " + port);
});
