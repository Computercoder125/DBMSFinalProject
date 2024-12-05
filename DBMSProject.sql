create database dbmsproject;
use dbmsproject;
CREATE TABLE tutors (
    tutor_id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(100),
    subject_specialization VARCHAR(50),
    signup_date DATE,
    status ENUM('active', 'inactive')
);

CREATE TABLE accounts (
    account_id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(100)
);

CREATE TABLE appointments (
    appointment_id INT PRIMARY KEY, -- a person can have several appointments with the same tutor, need to distinguish
    account_id INT, -- foreign keys so that we know which account is with which tutor
    tutor_id INT,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    FOREIGN KEY (tutor_id) REFERENCES tutors(tutor_id) ON DELETE CASCADE
);



-- Insert the data
INSERT INTO tutors (tutor_id, name, email, password, subject_specialization, signup_date, status) VALUES
(1, 'Bob Smith', 'bob.s@example.com', 'BobSecure@45', 'Mathematics', '2024-10-05', 'active'),
(2, 'Emma Brown', 'emma.b@example.com', 'TutorEmma22!', 'Science', '2024-10-01', 'active'),
(3, 'Harry Lee', 'harry.l@example.com', 'TutorHarry42!', 'English', '2024-09-18', 'inactive'),
(4, 'Jack Black', 'jack.b@example.com', 'BlackJack!56', 'History', '2024-10-12', 'active'),
(5, 'Mia Evans', 'mia.e@example.com', 'Mia*2024', 'Art', '2024-10-20', 'active'),
(6, 'Paul Green', 'paul.g@example.com', 'GreenPaul99@', 'Computer Science', '2024-10-22', 'active'),
(7, 'Rachel Adams', 'rachel.a@example.com', 'Rachel123Pass!', 'Chemistry', '2024-10-10', 'inactive'),
(8, 'Sam Young', 'sam.y@example.com', 'YoungSam!23', 'Physics', '2024-09-27', 'active'),
(9, 'Tina Walker', 'tina.w@example.com', 'WalkerTina$45', 'Biology', '2024-10-03', 'active'),
(10, 'Victor Brown', 'victor.b@example.com', 'Brown@Victor88', 'Literature', '2024-09-14', 'active'),
(11, 'Wendy Green', 'wendy.g@example.com', 'GreenWendy34$', 'Music', '2024-09-30', 'inactive'),
(12, 'Zoe Parker', 'zoe.p@example.com', 'ParkerZoe#12', 'Languages', '2024-10-15', 'active');


INSERT INTO accounts (account_id, name, email, password) VALUES
(1, 'John Doe', 'john.doe@example.com', 'password123'),
(2, 'Jane Smith', 'jane.smith@example.com', 'password234'),
(3, 'Alice Johnson', 'alice.johnson@example.com', 'password345'),
(4, 'Bob Brown', 'bob.brown@example.com', 'password456'),
(5, 'Charlie Davis', 'charlie.davis@example.com', 'password567'),
(6, 'David Miller', 'david.miller@example.com', 'password678'),
(7, 'Eva Wilson', 'eva.wilson@example.com', 'password789'),
(8, 'Frank Taylor', 'frank.taylor@example.com', 'password890'),
(9, 'Grace Anderson', 'grace.anderson@example.com', 'password901'),
(10, 'Hannah Thomas', 'hannah.thomas@example.com', 'password012');

