CREATE DATABASE IF NOT EXISTS smart_bharat;

USE smart_bharat;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15),
    password VARCHAR(255)
);

CREATE TABLE admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255)
);

CREATE TABLE schemes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    scheme_name VARCHAR(255),
    description TEXT
);

CREATE TABLE applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    applicant_name VARCHAR(100) NOT NULL,
    aadhaar VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    scheme_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);