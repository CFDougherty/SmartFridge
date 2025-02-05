const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database setup
const db = new sqlite3.Database('./alerts.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) console.error(err.message);
    console.log('Connected to the database.');
});

// Create table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        date TEXT,
        time TEXT,
        checked BOOLEAN
    )
`);

// Routes
app.get('/alerts', (req, res) => {
    db.all('SELECT * FROM alerts', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/alerts', (req, res) => {
    const { title, description, date, time } = req.body;
    const checked = false; // Default value
    const sql = `INSERT INTO alerts (title, description, date, time, checked) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [title, description, date, time, checked], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID });
    });
});

app.delete('/alerts/:id', (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM alerts WHERE id = ?`;
    db.run(sql, id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Alert deleted.' });
    });
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
