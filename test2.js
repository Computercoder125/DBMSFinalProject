const express = require('express');
const mysql = require('mysql');

// Create an instance of Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Create a connection to the MySQL database
const db = mysql.createConnection({
    host: 'localhost', // Replace with your database host
    user: 'root',      // Replace with your database username
    password: 'Bacca101', // Replace with your database password
    database: 'DBMSProject' // Replace with your database name
});

// Connect to the database
db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

// Welcome endpoint
app.get('/', (req, res) => {
    res.send('Welcome to AnyTimeTutoring!'); // You can customize this message
});

// Endpoint to get all students
app.get('/students', (req, res) => {
    db.query('SELECT name FROM students', (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json({
            message: "Welcome to my page!",
            students: results
        });
    });
});

// Endpoint to add a new student
app.post('/student', (req, res) => {
    const { name } = req.body;
    const query = 'INSERT INTO students (name) VALUES (?)';
    db.query(query, [name], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database insertion failed' });
        }
        res.status(201).json({ id: results.insertId, name });
    });
});

// Endpoint to get all tutors
app.get('/tutors', (req, res) => {
    db.query('SELECT tutor_id, name, email, subject_specialization, signup_date, status FROM tutors', (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json({
            message: "List of Tutors",
            tutors: results
        });
    });
});

// Endpoint to add a new tutor
app.post('/tutor', (req, res) => {
    const { name, email, password, subject_specialization, signup_date, status } = req.body;

    const query = `
        INSERT INTO tutors (name, email, password, subject_specialization, signup_date, status) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [name, email, password, subject_specialization, signup_date, status], (err, results) => {
        if (err) {
            console.error('SQL Error:', err);
            return res.status(500).json({ error: 'Database insertion failed', details: err.message });
        }
        res.status(201).json({
            message: 'Tutor added successfully',
            tutor_id: results.insertId,
            name,
            email,
            subject_specialization,
            signup_date,
            status
        });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
