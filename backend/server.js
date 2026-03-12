const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env' }); // Load from root directory
require('dotenv').config(); // Also load from backend directory if present

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_123';

let pool;

async function initDb() {
  // Connect without database first to create it
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    await connection.query("CREATE DATABASE IF NOT EXISTS vue_todo;");
    await connection.end();

    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'vue_todo',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        text VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT false,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log("Database initialized successfully!");
  } catch (error) {
    console.error("Failed to initialize database (Ensure MariaDB is running and credentials are correct). Error:", error.message);
  }
}

initDb();

// Middleware to verify JWT
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Failed to authenticate token' });
    req.userId = decoded.id;
    next();
  });
};

// Register
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const [existing] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existing.length > 0) return res.status(400).json({ error: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

    res.json({ message: 'User registered successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's todos
app.get('/api/todos', authenticate, async (req, res) => {
  try {
    const [todos] = await pool.query('SELECT * FROM todos WHERE user_id = ?', [req.userId]);
    // Map completed from 1/0 to true/false
    const mappedTodos = todos.map(t => ({ ...t, completed: !!t.completed }));
    res.json(mappedTodos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add todo
app.post('/api/todos', authenticate, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text required' });

  try {
    const [result] = await pool.query('INSERT INTO todos (user_id, text, completed) VALUES (?, ?, false)', [req.userId, text]);
    res.json({ id: result.insertId, text, completed: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update todo
app.put('/api/todos/:id', authenticate, async (req, res) => {
  const id = req.params.id;
  const { text, completed } = req.body;

  try {
    // Check if belongs to user
    const [todos] = await pool.query('SELECT * FROM todos WHERE id = ? AND user_id = ?', [id, req.userId]);
    if (todos.length === 0) return res.status(404).json({ error: 'Todo not found' });

    await pool.query('UPDATE todos SET text = ?, completed = ? WHERE id = ? AND user_id = ?', [text, completed, id, req.userId]);
    res.json({ id: parseInt(id), text, completed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete todo
app.delete('/api/todos/:id', authenticate, async (req, res) => {
  const id = req.params.id;
  try {
    const [todos] = await pool.query('SELECT * FROM todos WHERE id = ? AND user_id = ?', [id, req.userId]);
    if (todos.length === 0) return res.status(404).json({ error: 'Todo not found' });

    await pool.query('DELETE FROM todos WHERE id = ? AND user_id = ?', [id, req.userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
