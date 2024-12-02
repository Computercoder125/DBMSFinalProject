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
