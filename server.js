const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'parasar123', // Use your MySQL password
    database: 'ticket_management'
});

db.connect(err => {
    if (err) {
        console.error('MySQL Connection Error:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com', // Replace with your email
        pass: 'your-email-password'   // Replace with your email password or app password
    }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 4 * 1024 * 1024 }, // Limit file size to 4MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb('Error: File upload only supports the following filetypes - ' + filetypes);
    }
});

// Create uploads directory if not exists
const fs = require('fs');
if (!fs.existsSync('uploads')){
    fs.mkdirSync('uploads');
}

// User Registration
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).send('Error checking username');
        if (results.length > 0) return res.status(400).send('Username already exists');

        const hashedPassword = bcrypt.hashSync(password, 8);
        db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, results) => {
            if (err) return res.status(500).send('Error registering user');
            res.status(200).send('User registered successfully');
        });
    });
});

// User Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).send('Error logging in');
        if (results.length === 0) return res.status(404).send('User not found');

        const user = results[0];
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) return res.status(401).send('Invalid password');

        res.status(200).json({ 
            message: 'Login successful', 
            username: user.username, 
            role: user.role 
        });
    });
});

// Ticket Submission
app.post('/tickets', upload.single('attachment'), (req, res) => {
    const ticket = {
        username: req.body.username, // Who raised the ticket
        agency: req.body.agency,
        department: req.body.department,
        contactNumber: req.body.contactNumber,
        contactEmail: req.body.contactEmail,
        machineName: req.body.machineName,
        impact: req.body.impact,
        category: req.body.category,
        subCategory: req.body.subCategory,
        subject: req.body.subject,
        description: req.body.description,
        status: 'Open'
    };

    db.query('INSERT INTO tickets SET ?', ticket, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error submitting ticket');
        }

        const ticketId = results.insertId;

        if (req.file) {
            const attachment = {
                ticket_id: ticketId,
                file_name: req.file.filename,
                file_path: req.file.path,
                file_type: req.file.mimetype
            };
            db.query('INSERT INTO ticket_attachments SET ?', attachment);
        }

        // Email Notification
        const mailOptions = {
            from: 'your-email@gmail.com',
            to: req.body.contactEmail,
            subject: `Ticket Raised: ${ticket.subject}`,
            text: `Your ticket (ID: ${ticketId}) has been successfully raised.\nStatus: Open\n\nDescription: ${ticket.description}`
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) console.error('Error sending email:', error);
            res.status(200).send('Ticket submitted successfully. ID: ' + ticketId);
        });
    });
});

// Get Tickets (Filter by user or all for admin)
app.get('/tickets', (req, res) => {
    const { username, role } = req.query;
    let query = 'SELECT * FROM tickets ORDER BY created_at DESC';
    let params = [];

    if (role !== 'admin' && username) {
        query = 'SELECT * FROM tickets WHERE username = ? ORDER BY created_at DESC';
        params = [username];
    }

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).send('Error fetching tickets');
        res.json(results);
    });
});

// Update Ticket Status
app.put('/tickets/:id/status', (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    db.query('UPDATE tickets SET status = ? WHERE id = ?', [status, id], (err, results) => {
        if (err) return res.status(500).send('Error updating status');
        res.status(200).send('Status updated');
    });
});

// Reply to Ticket
app.post('/tickets/:id/reply', (req, res) => {
    const { reply } = req.body;
    const { id } = req.params;

    db.query('UPDATE tickets SET admin_reply = ?, status = "Closed" WHERE id = ?', [reply, id], (err, results) => {
        if (err) return res.status(500).send('Error replying to ticket');

        // Fetch ticket details to send email
        db.query('SELECT contactEmail, subject FROM tickets WHERE id = ?', [id], (err, rows) => {
            if (rows.length > 0) {
                const mailOptions = {
                    from: 'your-email@gmail.com',
                    to: rows[0].contactEmail,
                    subject: `Re: ${rows[0].subject} (Closed)`,
                    text: `Your ticket has been resolved and closed.\n\nAdmin Reply: ${reply}`
                };
                transporter.sendMail(mailOptions);
            }
        });

        res.status(200).send('Reply sent and ticket closed');
    });
});

// Get Stats
app.get('/stats', (req, res) => {
    db.query('SELECT status, COUNT(*) as count FROM tickets GROUP BY status', (err, results) => {
        if (err) return res.status(500).send('Error fetching stats');
        res.json(results);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});