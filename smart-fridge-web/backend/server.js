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

db.run(`CREATE TABLE IF NOT EXISTS recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  cookTime TEXT,
  ingredients TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  description TEXT,
  date TEXT,
  time TEXT,
  checked INTEGER DEFAULT 0
)`);

db.run(`CREATE TABLE IF NOT EXISTS shopping_list (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  quantity TEXT,
  checked INTEGER DEFAULT 0
)`);

db.run(`CREATE TABLE IF NOT EXISTS fridge (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  quantity TEXT,
  unit TEXT,
  expiry TEXT
)`);

// Recursively finds objects with { name: string, count: number/unit? }
function parseNestedData(data, results = []) {
  if (Array.isArray(data)) {
    for (const element of data) {
      parseNestedData(element, results);
    }
  } else if (data && typeof data === "object") {
    if (typeof data.name === "string" && data.hasOwnProperty("count")) {
      results.push({
        name: data.name,
        count: data.count,
        unit: data.unit || ""
      });
    }
    for (const key of Object.keys(data)) {
      parseNestedData(data[key], results);
    }
  }
  return results;
}

// ============ RECIPES ============
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

// ============ ALERTS ============
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
      res.json({ id: this.lastID, title, description, date, time, checked: false });
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
      res.json({ id: Number(id), title, description, date, time, checked });
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

// ============ SHOPPING LIST ============
app.get("/shopping-list", (req, res) => {
  db.all("SELECT * FROM shopping_list", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const items = rows.map((row) => ({ ...row, checked: row.checked === 1 }));
    res.json(items);
  });
});

app.post("/shopping-list", (req, res) => {
  const { name, quantity } = req.body;
  if (!name) return res.status(400).json({ error: "Item name is required" });
  db.run(
    `INSERT INTO shopping_list (name, quantity) VALUES (?, ?)`,
    [name, quantity || ""],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, quantity: quantity || "", checked: false });
    }
  );
});

app.put("/shopping-list/:id", (req, res) => {
  const { id } = req.params;
  const { name, quantity, checked } = req.body;
  const checkedValue = checked ? 1 : 0;
  db.run(
    `UPDATE shopping_list SET name = ?, quantity = ?, checked = ? WHERE id = ?`,
    [name, quantity, checkedValue, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: Number(id), name, quantity, checked });
    }
  );
});

app.delete("/shopping-list/:id", (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM shopping_list WHERE id = ?`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ============ FRIDGE ============
app.get("/fridge", (req, res) => {
  db.all("SELECT * FROM fridge", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/fridge", (req, res) => {
  const { name, quantity, unit, expiry } = req.body;
  if (!name) return res.status(400).json({ error: "Item name is required" });
  db.run(
    `INSERT INTO fridge (name, quantity, unit, expiry) VALUES (?, ?, ?, ?)`,
    [name, quantity || "", unit || "", expiry || ""],
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
    [name, quantity, unit, expiry, id],
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

app.get("/items", (req, res) => {
  db.all("SELECT * FROM fridge", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ============ BARCODE LOOKUP ============
app.get("/barcodes/lookup/:code", async (req, res) => {
  let { code } = req.params;
  try {
    if (code.length === 13 && code.startsWith("0")) {
      code = code.slice(1);
    }
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

// ============ INVENTORY UPLOAD (NESTED JSON) ============
app.post("/inventory/upload", (req, res) => {
  const { inventory } = req.body;
  if (!inventory || !Array.isArray(inventory)) {
    return res.status(400).json({ error: "Invalid inventory data format. Expecting { inventory: [ ... ] }" });
  }
  const itemsToInsert = inventory.map(obj => ({
    name: obj.name,
    quantity: obj.count?.toString() || "0",
    unit: obj.unit || "",
    expiry: ""
  }));

  const insertPromises = itemsToInsert.map((item) => {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO fridge (name, quantity, unit, expiry) VALUES (?, ?, ?, ?)`,
        [item.name, item.quantity, item.unit, item.expiry],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...item });
        }
      );
    });
  });

  Promise.all(insertPromises)
    .then(results => res.json({ success: true, itemsAdded: results.length, details: results }))
    .catch(err => {
      console.error("Error inserting inventory items:", err);
      res.status(500).json({ error: err.message });
    });
});

// ============ NESTED RANDOM JSON (Your parseNestedData) ============
app.post("/random-json", async (req, res) => {
  try {
    const data = req.body;
    const items = parseNestedData(data);
    if (items.length === 0) {
      return res.json({ success: false, message: "No items found in JSON" });
    }
    const insertPromises = items.map((item) => {
      const name = item.name;
      const quantity = item.count.toString();
      const unit = item.unit || "";
      return new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO fridge (name, quantity, unit, expiry) VALUES (?, ?, ?, ?)`,
          [name, quantity, unit, ""],
          function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, name, quantity, unit });
          }
        );
      });
    });
    const results = await Promise.all(insertPromises);
    return res.json({
      success: true,
      itemsAdded: results.length,
      details: results,
    });
  } catch (error) {
    console.error("Error processing random JSON:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// OPTIONAL daily expiry update
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
}, 24 * 60 * 60 * 1000);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
