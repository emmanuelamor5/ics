const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const pool = require('./database.js');

const app = express();
const PORT = 5000;

// --- Middleware ---
app.use(express.json());

// ✅ Proper CORS config to allow cookies from React frontend
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));

// ✅ Session setup
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {secure: false}
}));

// ✅ Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Multer for image uploads ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// --- Routes ---

// ✅ Signup
app.post('/api/signup', async (req, res) => {
  const { firstname, lastname, username, password, email, specify } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (firstname, lastname, username, password, email, specify) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [firstname, lastname, username, hashedPassword, email, specify]
    );
    res.status(201).json({ message: 'User created successfully', user: newUser.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// ✅ Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = userResult.rows[0];
    if (user && await bcrypt.compare(password, user.password)) {
      req.session.user = { username: user.username, role: user.specify };
      res.json({ message: 'Login successful', user: req.session.user });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid'); // clears session cookie
    res.json({ message: 'Logged out successfully' });
  });
});


// ✅ Get current user
app.get('/api/me', (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Not logged in' });
  res.json(req.session.user);
});

// ✅ Submit post (driver)
app.post('/api/post', upload.single('image'), async (req, res) => {
  const { description, type } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    await pool.query(
      'INSERT INTO posts (image_url, description, type) VALUES ($1, $2, $3)',
      [image_url, description, type]
    );
    res.status(201).json({ message: 'Post submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving post' });
  }
});

// ✅ Get posts (commuter view)
app.get('/api/posts', async (req, res) => {
  const { type } = req.query;

  try {
    let query = 'SELECT * FROM posts';
    const values = [];

    if (type && ['accident', 'traffic_update'].includes(type)) {
      query += ' WHERE type = $1';
      values.push(type);
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

