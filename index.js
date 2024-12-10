const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const fs = require("fs");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Allows creation of session where we can store appointments for user
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

// MySQL connection setup
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

/**********************
// Routes
***********************/

// Route for homepage (start.html), send them to start page to get authenticated
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

  // Create query that generates tutors
  const sql_query =
    "SELECT tutor_id, name, email, subject_specialization, signup_date, status FROM tutors";

  con.query(sql_query, (err, results) => {
    if (err) {
      console.error("Database query failed:", err);
      res.status(500).json({ error: "Database query failed" });
      return;
    }
    res.json({ tutors: results }); // Sends results as a json file to tutor page
  });
});

// Route for tutors page (tutors.html)
app.get("/tutors-page", function (req, res) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  // Calls /tutors to retrieve JSON file and display to user
  readAndServe("./tutors.html", res);
});

// Route for booking appointments
// Route for booking appointments
app.post("/view", (req, res) => {
  if (!req.session.user) {
    return res.status(401).send("User not logged in");
  }

  // Gets tutor id, account id, and appointment date
  const { tutor_id, appointment_date } = req.body;
  const account_id = req.session.user.id;

  // Validate inputs
  if (!tutor_id || !appointment_date) {
    return res.status(400).send("Tutor ID and appointment date are required");
  }

  // Check if there's already an appointment with the same tutor on the same date
  const checkQuery = `
    SELECT * FROM appointments 
    WHERE tutor_id = ? AND appointment_date = ?`;

  con.query(checkQuery, [tutor_id, appointment_date], (checkErr, results) => {
    if (checkErr) {
      console.error("Error checking for existing appointments:", checkErr);
      return res.status(500).send("Error checking for existing appointments");
    }

    if (results.length > 0) {
      // If an appointment already exists with this tutor on this date, reject the booking
      return res.status(409).json({
        error: "An appointment with this tutor on this date already exists",
      });
    }

    // Proceed to insert the appointment if no conflicts
    const sqlQuery =
      "INSERT INTO appointments (account_id, tutor_id, appointment_date) VALUES (?, ?, ?)";

    con.query(
      sqlQuery,
      [account_id, tutor_id, appointment_date],
      (insertErr) => {
        if (insertErr) {
          console.error("Error saving appointment:", insertErr);
          return res.status(500).send("Error saving appointment");
        }

        res.status(200).json({ message: "Appointment booked successfully" });
      }
    );
  });
});

// Route for view appointments page
app.get("/view-appointment", (req, res) => {
  if (!req.session.user) {
    return res.status(401).send("User not logged in");
  }

  // Actually allows users to see the appointments
  res.sendFile(__dirname + "/appointments.html", (err) => {
    if (err) {
      console.error("Error serving appointments.html:", err);
      return res.status(500).send("Error loading appointments page");
    }
  });
});

// Route to get appointments that fetches appointment fromd database
app.get("/api/appointments", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "User not logged in" });
  }

  const account_id = req.session.user.id; // Get the account_id from the session

  // Query the database to fetch appointments for the logged-in user
  const sqlQuery = `
    SELECT 
      a.appointment_id, 
      a.appointment_date, 
      t.name AS tutor_name, 
      t.subject_specialization 
    FROM appointments a 
    JOIN tutors t ON a.tutor_id = t.tutor_id 
    WHERE a.account_id = ?`;

  con.query(sqlQuery, [account_id], (err, results) => {
    if (err) {
      console.error("Error fetching appointments:", err);
      return res.status(500).json({ error: "Error fetching appointments" });
    }

    res.json({ appointments: results });
  });
});

// Route to delete an appointment
app.delete("/api/appointments/:id", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "User not logged in" });
  }

  const appointmentId = req.params.id;
  const accountId = req.session.user.id;

  // Ensure the appointment belongs to the logged-in user before deleting
  const sqlQuery = `
    DELETE FROM appointments 
    WHERE appointment_id = ? AND account_id = ?`;

  con.query(sqlQuery, [appointmentId, accountId], (err, result) => {
    if (err) {
      console.error("Error deleting appointment:", err);
      return res.status(500).json({ error: "Error deleting appointment" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Appointment not found or does not belong to user" });
    }

    res.status(200).json({ message: "Appointment canceled successfully" });
  });
});

// Route for login action
app.post("/login", (req, res) => {
  const { uname, psw } = req.body;

  // Make sure they provide an email and password
  if (!uname || !psw) {
    return res.status(400).send("Email and password are required");
  }

  // Query the database to verify user credentials
  const sql_query = `SELECT * FROM accounts WHERE email = ? AND password = ?`;

  con.query(sql_query, [uname, psw], (err, results) => {
    if (err) {
      console.error("Database query failed:", err);
      return res.status(500).send("Database query failed");
    }

    // If a user is found, log them in
    if (results.length > 0) {
      const user = results[0]; // Getting the user details from the result
      req.session.user = {
        id: user.account_id, // Store account_id in session, not the username
        username: user.email, // Storing email as username
      };

      console.log("Login successful for user:", user.email);
      res.redirect("/main"); // Redirect to the main page after login
    } else {
      console.log("Invalid credentials for user:", uname);
      res.redirect("/login?error=invalid"); // Redirect to login with error
    }
  });
});

// Signup route
app.post("/signup", (req, res) => {
  const { name, email, psw } = req.body;

  // Makes sure it is an actual email
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
