const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const axios = require("axios");
const fetch = require("node-fetch"); 

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
  ingredients TEXT,
  image TEXT,
  instructions TEXT
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

// Clear alerts and fridge tables on startup (for demo purposes)
db.run("DELETE FROM alerts", (err) => {
  if (err) console.error("Error clearing alerts:", err.message);
  else console.log("Alerts table cleared on startup.");
});
db.run("DELETE FROM fridge", (err) => {
  if (err) console.error("Error clearing fridge contents:", err.message);
  else console.log("Fridge table cleared on startup.");
});


app.delete("/fridge/clear", (req, res) => {
  db.run("DELETE FROM fridge", (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ============ RECIPES ENDPOINTS ============
app.get("/recipes", (req, res) => {
  let sql = "SELECT * FROM recipes";
  let params = [];

  if(req.query.search){
    sql += " WHERE name LIKE ? OR ingredients LIKE ?";
    const searchTerm = `%${req.query.search}%`;
    params.push(searchTerm, searchTerm);

    db.all(sql, params, (err, rows) => {
      if(err){ return res.status(500).json({error: err.message})}
      res.json(rows);

    })

  }
});


app.post("/recipes", (req, res) => {
  const { name, cookTime, ingredients, image, instructions } = req.body;
  if (!name || !cookTime || !ingredients)
    return res.status(400).json({ error: "Missing required fields" });

  const ingredientsStr = Array.isArray(ingredients)
  ? ingredients.join(", ")
  : ingredients;
  

  db.run(
    `INSERT INTO recipes (name, cookTime, ingredients, image, instructions) VALUES (?, ?, ?, ?, ?)`,
    [name, cookTime, ingredientsStr, image || "", instructions || ""],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ 
        id: this.lastID, 
        name, 
        cookTime, 
        ingredients: ingredientsStr.split(","),
        image: image || "",
        instructions: instructions || "" });
    }
  );
});


app.put("/recipes/:id", (req, res) => {
  const { id } = req.params;
  const { name, cookTime, ingredients, image, instructions } = req.body;
  
  const ingredientsStr = Array.isArray(ingredients)
    ? ingredients.join(", ")
    : ingredients;
  db.run(
    `UPDATE recipes SET name = ?, cookTime = ?, ingredients = ?, image = ?, instruction = ?, WHERE id = ?`,
    [name, cookTime, ingredientsStr, image || "" , instructions || "",  id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        id: Number(id),
        name,
        cookTime,
        ingredients: ingredientsStr.split(","),
        image: image || "",
        instructions: instructions || ""
      });
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

// ============ ALERTS ENDPOINTS ============
app.get("/alerts", (req, res) => {
  db.all("SELECT * FROM alerts", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const alerts = rows.map((row) => ({ ...row, checked: row.checked === 1 }));
    res.json(alerts);
  });
});

app.post("/alerts", (req, res) => {
  const { title, description, date, time } = req.body;
  if (!title || !date || !time)
    return res.status(400).json({ error: "Missing required fields" });
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

// ============ SHOPPING LIST ENDPOINTS ============
app.get("/shopping-list", (req, res) => {
  db.all("SELECT * FROM shopping_list", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const items = rows.map((row) => ({ ...row, checked: row.checked === 1 }));
    res.json(items);
  });
});

app.post("/shopping-list", (req, res) => {
  const { name, quantity } = req.body;
  if (!name)
    return res.status(400).json({ error: "Item name is required" });
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

// ============ FRIDGE ENDPOINTS ============
app.get("/fridge", (req, res) => {
  db.all("SELECT * FROM fridge", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/fridge", (req, res) => {
  const { name, quantity, unit, expiry } = req.body;
  if (!name)
    return res.status(400).json({ error: "Item name is required" });
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

// Additional endpoint: Return all fridge items as /items
app.get("/items", (req, res) => {
  db.all("SELECT * FROM fridge", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ============ EXTERNAL BARCODE LOOKUP ============
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

// ============ CAMERA IMAGE ENDPOINT (with fallback testing) ============
app.get("/camera-image", async (req, res) => {
  try {
    const CAMERA_URL = "http://picam.local:5000/image.jpg";
    let response = await fetch(CAMERA_URL).catch(() => null);
    if (!response || !response.ok) {
      // Fallback: Use a local placeholder image (as a Base64 string)
      const fallbackBase64 =
        "iVBORw0KGgoAAAANSUhEUgAAAAUA"+
        "AAAFCAYAAACNbyblAAAAHElEQVQI12P4"+
        "//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";
      const buffer = Buffer.from(fallbackBase64, "base64");
      res.set("Content-Type", "image/png");
      return res.send(buffer);
    }
    const buffer = await response.buffer();
    res.set("Content-Type", "image/jpeg");
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// OPTIONAL daily expiry update
setInterval(() => {
  console.log("Updating expiry tracking...");
  db.all("SELECT * FROM fridge", [], (err, rows) => {
    if (err) return console.error("Error fetching items:", err);
    const today = new Date();
    rows.forEach((item) => {
      if (!item.expiry) return;
      const expiryDate = new Date(item.expiry);
      const timeDiff = expiryDate - today;
      const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      db.run(
        `UPDATE fridge SET expiry = ? WHERE id = ?`,
        [daysLeft < 0 ? "Expired" : item.expiry, item.id],
        (updateErr) => {
          if (updateErr)
            console.error("Error updating expiry status:", updateErr);
        }
      );
    });
  });
}, 24 * 60 * 60 * 1000);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
