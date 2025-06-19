const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./database.js');

const app = express();
const PORT = 5000;

// --- Middleware ---
app.use(express.json());

// CORS config for React frontend 
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));

// Persistent session store using PostgreSQL
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session'
  }),
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // use true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Multer config for file uploads ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// --- Auth Routes ---
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

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = userResult.rows[0];

    if (user && await bcrypt.compare(password, user.password)) {
      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.specify
      };
      res.json({
        message: 'Login successful',
        username: req.session.user.username,
        specify: user.specify
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

app.get('/api/me', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Not logged in' });

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [req.session.user.username]);
    const user = result.rows[0];
    res.json({
      username: user.username,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      specify: user.specify,
      profile_photo: user.profile_photo || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch user details' });
  }
});

// --- Profile Update ---
app.post('/api/update-profile', upload.single('profilePhoto'), async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Not authenticated' });

  const { firstname, lastname, username, email, specify } = req.body;
  const profile_photo = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [req.session.user.username]);
    if (!userCheck.rows[0]) return res.status(404).json({ message: 'User not found' });

    if (profile_photo) {
      await pool.query(
        `
        UPDATE users
        SET firstname = $1,
            lastname = $2,
            username = $3,
            email = $4,
            specify = $5,
            profile_photo = $6
        WHERE username = $7
        `,
        [firstname, lastname, username, email, specify, profile_photo, req.session.user.username]
      );
    } else {
      await pool.query(
        `
        UPDATE users
        SET firstname = $1,
            lastname = $2,
            username = $3,
            email = $4,
            specify = $5
        WHERE username = $6
        `,
        [firstname, lastname, username, email, specify, req.session.user.username]
      );
    }

    req.session.user = { username, role: specify };
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating profile' });
  }
});


// --- Posts & Road Updates ---
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

app.get('/api/alerts', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM posts WHERE type = 'accident' OR type = 'traffic_update' ORDER BY created_at DESC",
      
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching alerts' });
  }
});

// --- Lost and Found ---
app.post('/api/lost-item', upload.single('image'), async (req, res) => {
  const { description, lostitem, route, date, sacco } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  if (!req.session.user || req.session.user.role !== 'Driver') {
    return res.status(403).json({ message: 'Only drivers can submit lost item reports' });
  }

  try {
    await pool.query(
      'INSERT INTO lostandfound (lostitem, route, date, sacco, description, image_url) VALUES ($1, $2, $3, $4, $5, $6)',
      [lostitem, route, date, sacco, description, image_url]
    );
    res.status(201).json({ message: 'Lost item report submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving lost item report' });
  }
});


// --- Claims ---
app.post('/api/claim-item', async (req, res) => {
  const { lost_item_id, claimer_name, contact_info, details } = req.body;

  if (!req.session.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    await pool.query(
      `INSERT INTO claims (lost_item_id, claimer_name, contact_info, details)
       VALUES ($1, $2, $3, $4)`,
      [lost_item_id, claimer_name, contact_info, details]
    );
    res.status(201).json({ message: 'Claim submitted successfully' });
  } catch (err) {
    console.error('Claim error:', err);
    res.status(500).json({ message: 'Error submitting claim' });
  }
});

// Get lost items with claims
app.get('/api/lost-items', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT lf.*, c.claimer_name, c.contact_info, c.details AS claim_details
      FROM lostandfound lf
      LEFT JOIN claims c ON lf.id = c.lost_item_id
      ORDER BY lf.date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching lost items with claims' });
  }
});


// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


