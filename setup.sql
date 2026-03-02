CREATE DATABASE IF NOT EXISTS ticket_management;
USE ticket_management;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255),
    agency VARCHAR(255),
    department VARCHAR(255),
    contactNumber VARCHAR(20),
    contactEmail VARCHAR(255),
    machineName VARCHAR(255),
    impact VARCHAR(50),
    category VARCHAR(255),
    subCategory VARCHAR(255),
    subject VARCHAR(255),
    description TEXT,
    status ENUM('Open', 'In Progress', 'Closed') DEFAULT 'Open',
    admin_reply TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username)
);

CREATE TABLE IF NOT EXISTS ticket_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT,
    file_name VARCHAR(255),
    file_path VARCHAR(255),
    file_type VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

-- Insert a default admin account
-- Username: admin, Password: admin (hashed)
INSERT IGNORE INTO users (username, password, role) VALUES ('admin', '$2a$08$K6zFkSj3s.m/gC6t1M1lKe6t2u8P9Y7S3g4B5y6z7w8v9a0b1c2d3', 'admin');
