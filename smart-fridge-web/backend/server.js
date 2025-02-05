const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to SQLite database
const db = new sqlite3.Database("./recipes.db", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) return console.error(err.message);
  console.log("Connected to the database.");
});

// Create recipes table
db.run(`CREATE TABLE IF NOT EXISTS recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  cookTime TEXT,
  ingredients TEXT
)`);

// Get all recipes
app.get("/recipes", (req, res) => {
  db.all("SELECT * FROM recipes", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add new recipe
app.post("/recipes", (req, res) => {
  const { name, cookTime, ingredients } = req.body;
  db.run(`INSERT INTO recipes (name, cookTime, ingredients) VALUES (?, ?, ?)`,
    [name, cookTime, ingredients.join(", ")],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, cookTime, ingredients });
    }
  );
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
