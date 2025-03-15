const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./smart-fridge.db", (err) => {
  if (err) {
    console.error("Database connection error:", err.message);
    process.exit(1);
  }
  console.log("Connected to the smart-fridge.db database.");
});

db.run(
  `CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    cookTime TEXT,
    ingredients TEXT
  )`,
  (err) => {
    if (err) console.error("Error creating recipes table:", err.message);
  }
);

db.run(
  `CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    date TEXT,
    time TEXT,
    checked INTEGER DEFAULT 0
  )`,
  (err) => {
    if (err) console.error("Error creating alerts table:", err.message);
  }
);

db.run(
  `CREATE TABLE IF NOT EXISTS shopping_list (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    quantity TEXT,
    checked INTEGER DEFAULT 0
  )`,
  (err) => {
    if (err) console.error("Error creating shopping_list table:", err.message);
  }
);

db.run(
  `CREATE TABLE IF NOT EXISTS fridge (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    quantity TEXT,
    unit TEXT,
    expiry DATE
  )`,
  (err) => {
    if (err) console.error("Error creating fridge table:", err.message);
  }
);

app.get("/recipes", (req, res) => {
  db.all("SELECT * FROM recipes", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/recipes", (req, res) => {
  const { name, cookTime, ingredients } = req.body;
  if (!name || !cookTime || !ingredients) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  db.run(
    `INSERT INTO recipes (name, cookTime, ingredients) VALUES (?, ?, ?)`,
    [name, cookTime, ingredients.join(", ")],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, cookTime, ingredients });
    }
  );
});

app.put("/recipes/:id", (req, res) => {
  const { id } = req.params;
  const { name, cookTime, ingredients } = req.body;
  db.run(
    `UPDATE recipes SET name = ?, cookTime = ?, ingredients = ? WHERE id = ?`,
    [name, cookTime, ingredients.join(", "), id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: Number(id), name, cookTime, ingredients });
    }
  );
});

app.delete("/recipes/:id", (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM recipes WHERE id = ?`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.get("/alerts", (req, res) => {
  db.all("SELECT * FROM alerts", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const alerts = rows.map((row) => ({ ...row, checked: row.checked === 1 }));
    res.json(alerts);
  });
});

app.post("/alerts", (req, res) => {
  const { title, description, date, time } = req.body;
  if (!title || !date || !time) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  db.run(
    `INSERT INTO alerts (title, description, date, time) VALUES (?, ?, ?, ?)`,
    [title, description, date, time],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        id: this.lastID,
        title,
        description,
        date,
        time,
        checked: false,
      });
    }
  );
});

app.put("/alerts/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, date, time, checked } = req.body;
  const checkedValue = checked ? 1 : 0;
  db.run(
    `UPDATE alerts SET title = ?, description = ?, date = ?, time = ?, checked = ? WHERE id = ?`,
    [title, description, date, time, checkedValue, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        id: Number(id),
        title,
        description,
        date,
        time,
        checked,
      });
    }
  );
});

app.delete("/alerts/:id", (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM alerts WHERE id = ?`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.post("/inventory/upload", (req, res) => {
  const { inventory } = req.body;
  if (!inventory || !Array.isArray(inventory)) {
    return res.status(400).json({ error: "Invalid inventory data format." });
  }

  const insertPromises = inventory.map((item) => {
    const { name, count } = item;
    const quantity = count?.toString() || "0";
    const unit = "cnt.";
    const expiry = "";

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO fridge (name, quantity, unit, expiry) VALUES (?, ?, ?, ?)`,
        [name, quantity, unit, expiry],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, name, quantity, unit, expiry });
        }
      );
    });
  });

  Promise.all(insertPromises)
    .then((results) => res.json({ success: true, itemsAdded: results.length }))
    .catch((err) => {
      console.error("Error inserting inventory items:", err);
      res.status(500).json({ error: err.message });
    });
});

app.get("/fridge", (req, res) => {
  db.all("SELECT * FROM fridge", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const today = new Date();
    const itemsWithExpiry = rows.map(item => {
      if (!item.expiry) return { ...item, daysUntilExpiry: "No expiry set" };

      const expiryDate = new Date(item.expiry);
      const timeDiff = expiryDate - today;
      const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      return { ...item, daysUntilExpiry: daysLeft >= 0 ? `${daysLeft} days left` : "Expired" };
    });

    res.json(itemsWithExpiry);
  });
});



app.post("/fridge", (req, res) => {
  const { name, quantity, unit, expiry } = req.body;
  if (!name) return res.status(400).json({ error: "Item name is required" });

  db.run(
    `INSERT INTO fridge (name, quantity, unit, expiry) VALUES (?, ?, ?, ?)`,
    [name, quantity || "", unit || "", expiry ? new Date(expiry).toISOString().split("T")[0] : null],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, quantity, unit, expiry });
    }
  );
});


app.put("/fridge/:id", (req, res) => {
  const { id } = req.params;
  const { name, quantity, unit, expiry } = req.body;
  
  db.run(
    `UPDATE fridge SET name = ?, quantity = ?, unit = ?, expiry = ? WHERE id = ?`,
    [name, quantity, unit, expiry ? new Date(expiry).toISOString().split("T")[0] : null, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: Number(id), name, quantity, unit, expiry });
    }
  );
});


app.delete("/fridge/:id", (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM fridge WHERE id = ?`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

const PORT = process.env.PORT || 5001;


setInterval(() => {
  console.log("Updating expiry tracking...");
  db.all("SELECT * FROM fridge", [], (err, rows) => {
      if (err) return console.error("Error fetching items:", err);

      const today = new Date();
      rows.forEach(item => {
          if (!item.expiry) return;

          const expiryDate = new Date(item.expiry);
          const timeDiff = expiryDate - today;
          const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

          db.run(
              `UPDATE fridge SET expiry = ? WHERE id = ?`,
              [daysLeft < 0 ? "Expired" : item.expiry, item.id],
              (updateErr) => {
                  if (updateErr) console.error("Error updating expiry status:", updateErr);
              }
          );
      });
  });
}, 24 * 60 * 60 * 1000); // Run every 24 hours

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    const url = `https://api.upcitemdb.com/prod/trial/lookup?upc=${code}`;
    const response = await axios.get(url);
    const data = response.data;

    if (!data || data.code !== "OK" || !data.items || data.items.length === 0) {
      return res.json({ found: false, productName: "" });
    }

    const productName = data.items[0].title || "";
    return res.json({ found: true, productName });
  } catch (error) {
    console.error("Error in external lookup:", error.message);
    return res.json({ found: false, productName: "" });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
