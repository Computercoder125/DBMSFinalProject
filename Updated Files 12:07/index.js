const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const fs = require("fs");

const app = express();
const port = 3000;

// Middleware to parse URL-encoded and JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware setup
app.use(
  session({
    secret: "your-secret-key", // Change to a strong secret
    resave: false,
    saveUninitialized: false,
  })
);

// MySQL connection setup
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "01102004", // Use your MySQL root password
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

// Routes

// Route for homepage (index.html)
app.get("/", function (req, res) {
  readAndServe("./start.html", res);
});

// Route for login page (login.html)
app.get("/login", function (req, res) {
  readAndServe("./login.html", res);
});

// Route for signup page (signup.html)
app.get("/signup", function (req, res) {
  readAndServe("./signup.html", res);
});

// Route for view appointments page (view.html)
app.get("/view", function (req, res) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  readAndServe("./view.html", res);
});

// Route for main page (index.html)
app.get("/main", function (req, res) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  readAndServe("./index.html", res);
});

// Route to fetch and display tutors
app.get("/tutors", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  const sql_query =
    "SELECT tutor_id, name, email, subject_specialization, signup_date, status FROM tutors";

  con.query(sql_query, (err, results) => {
    if (err) {
      console.error("Database query failed:", err);
      res.status(500).json({ error: "Database query failed" });
      return;
    }
    res.json({ tutors: results });
  });
});

// Route for tutors page (tutors.html)
app.get("/tutors-page", function (req, res) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  readAndServe("./tutors.html", res);
});

// Route for profile page
app.get("/profile", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  const user = req.session.user;
  res.send(`Welcome ${user.username}`);
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
      console.error("Database query failed:", err);
      return res.status(500).send("Database query failed");
    }

    if (results.length > 0) {
      // Successful login, set session data
      req.session.user = {
        id: results[0].id,
        username: uname,
      };

      console.log("Login successful for user:", uname);
      res.redirect("/main"); // Redirect to the main page
    } else {
      console.log("Invalid credentials for user:", uname);
      res.redirect("/login"); // Redirect back to login page
    }
  });
});

// Signup route
app.post("/signup", (req, res) => {
  const { name, email, psw } = req.body;

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.redirect("/login");
  }

  // Insert into database
  const sqlQuery =
    "INSERT INTO accounts (name, email, password) VALUES (?, ?, ?)";
  con.query(sqlQuery, [name, email, psw], (err) => {
    if (err) {
      console.error("Error saving account:", err);
      return res.status(500).send("Error saving account");
    }

    // Send a success message and redirect to login
    res.send(
      `<script>alert('Account created successfully!'); window.location.href='/login';</script>`
    );
  });
});

// Route for contacts page (contacts.html)
app.get("/contacts", function (req, res) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  readAndServe("./contacts.html", res);
});

// Route to handle logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error logging out");
    }
    res.redirect("/login"); // Redirect back to login page
  });
});

// 404 route for handling unknown URLs
app.use((req, res) => {
  res.status(404);
  readAndServe("./weird.html", res);
});

// Start the server
app.listen(port, function () {
  console.log("NodeJS app listening on port " + port);
});
