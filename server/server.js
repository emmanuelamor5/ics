const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./database.js');
const fs  = require('fs');


const app = express();
const PORT = 5000;

// --- Middleware ---
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3001', credentials: true }));

app.use(session({
  store: new pgSession({ pool: pool, tableName: 'session' }),
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed!'), false);
  }
});



// --- Auth Routes ---
app.post('/api/signup', async (req, res) => {
  const { firstname, lastname, username, password, email, specify, sacco, ntsa_license} = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (firstname, lastname, username, password, email, specify, sacco, ntsa_license) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [firstname, lastname, username, hashedPassword, email, specify, sacco || null, req.body.ntsa_license || null]
    );
    res.status(201).json({ message: 'User created successfully', user: newUser.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating user' });
  }
  if (specify === 'Driver') {
  if (!sacco || !ntsa_license) {
    return res.status(400).json({ error: 'Driver details required' });
  }
  // Store sacco and license
}
});

const sessions = new Map();

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
  const severity_level = req.body.severity_level || 'medium'; // Default to 'low' if not provided

  try {
    await pool.query(
      'INSERT INTO posts (image_url, description, type, severity_level ) VALUES ($1, $2, $3, $4)',
      [image_url, description, type,severity_level]
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

    if (type && ['accident', 'traffic_update', 'poor_visibility', 'police_checkpoint', 'road_construction', 'flood', 'closure'].includes(type)) {
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
      "SELECT * FROM posts WHERE type = 'accident' OR type = 'traffic_update' OR type = 'police_checkpoint' OR type ='flood' OR type = 'road_construction' OR type ='poor_visibility' OR type = 'closure' ORDER BY created_at DESC",
      
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
      SELECT
        lf.*,
        c.id           AS claim_id,
        c.claimer_name,
        c.contact_info,
        c.details      AS claim_details,
        c.is_confirmed,
        c.is_approved,
        c.created_at   AS claim_created_at
      FROM lostandfound lf
      LEFT JOIN claims c
        ON lf.id = c.lost_item_id
      ORDER BY lf.date DESC;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching lost items with claims' });
  }
});


// GET all stages from the database
app.get('/api/stages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM stages');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching stages:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET all saccos from the database
app.get('/api/saccos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM saccos');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching saccos:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET saccos with joined route and stage information
app.get('/api/saccos/details', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.sacco_id,
        s.name,
        s.base_fare_range,
        r.route_id,
        r.display_name AS route_name,
        st.stage_id,
        st.name AS stage_name
      FROM saccos s
      LEFT JOIN routes r ON s.route_id = r.route_id
      LEFT JOIN stages st ON s.sacco_stage_id = st.stage_id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching sacco details:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// fetch routes from the database
app.get('/api/routes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM routes');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching routes:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET operations (joined info from saccos, routes, and stages)
app.get('/api/operations', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        sc.sacco_id,
        sc.name AS sacco_name,
        sc.base_fare_range,
        r.display_name AS route_name,
        s1.name AS from_stage,
        s1.latitude AS stage_latitude,
        s1.longitude AS stage_longitude
      FROM saccos sc
      JOIN routes r ON sc.route_id = r.route_id
      JOIN stages s1 ON sc.sacco_stage_id = s1.stage_id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching operations:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Initialize ratings table
const initializeRatingsTable = async () => {
  try {
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'ratings'
      );
    `);

    if (!tableExists.rows[0].exists) {
      await pool.query(`
        CREATE TABLE ratings (
          id SERIAL PRIMARY KEY,
          sacco_id INTEGER REFERENCES saccos(sacco_id) ON DELETE CASCADE,
          cleanliness_rating INTEGER CHECK (cleanliness_rating BETWEEN 1 AND 5),
          safety_rating INTEGER CHECK (safety_rating BETWEEN 1 AND 5),
          service_rating INTEGER CHECK (service_rating BETWEEN 1 AND 5),
          average_rating DECIMAL(3,2) GENERATED ALWAYS AS (
            (cleanliness_rating + safety_rating + service_rating)::DECIMAL / 3
          ) STORED,
          review_text TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Ratings table created successfully');
    }
  } catch (err) {
    console.error('Error initializing ratings table:', err);
  }
};

// Call this during startup
initializeRatingsTable();




// GET all ratings
app.get('/api/ratings', async (req, res) => {
  try {
    const { sacco_id, sort = 'newest', page = 1, limit = 10 } = req.query;

    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const offset = (pageInt - 1) * limitInt;

    let whereClauses = [];
    let queryParams = [];
    let paramIndex = 1;

    if (sacco_id) {
      whereClauses.push(`r.sacco_id = $${paramIndex}`);
      queryParams.push(sacco_id);
      paramIndex++;
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Sorting logic (based on average of 3 fields)
    let orderBy;
    switch (sort) {
      case 'highest':
        orderBy = '(r.cleanliness_rating + r.safety_rating + r.service_rating) / 3.0 DESC';
        break;
      case 'lowest':
        orderBy = '(r.cleanliness_rating + r.safety_rating + r.service_rating) / 3.0 ASC';
        break;
      case 'newest':
      default:
        orderBy = 'r.created_at DESC';
    }

    // Main SELECT query with LIMIT + OFFSET
    const query = `
  SELECT r.*, s.sacco_name,
    ROUND((r.cleanliness_rating + r.safety_rating + r.service_rating) / 3.0, 2) AS average_rating
  FROM ratings r
  JOIN saccos s ON s.sacco_id = r.sacco_id
  ${whereClause}
  ORDER BY ${orderBy}
  LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
`;

    
    queryParams.push(limitInt, offset);

    const result = await pool.query(query, queryParams);

    // Total count query for pagination
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM ratings r ${whereClause}`,
      queryParams.slice(0, paramIndex - 1)
    );
    const total = parseInt(countResult.rows[0].count);

    // Return result + pagination
    res.json({
      ratings: result.rows,
      pagination: {
        currentPage: pageInt,
        totalPages: Math.ceil(total / limitInt),
        totalRatings: total,
        hasNext: pageInt * limitInt < total,
        hasPrev: pageInt > 1
      }
    });

  } catch (err) {
    console.error('Error fetching ratings:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// GET average ratings for a sacco
app.get('/api/ratings/average/:sacco_id', async (req, res) => {
  try {
    const { sacco_id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        AVG(cleanliness_rating) AS avg_cleanliness,
        AVG(safety_rating) AS avg_safety,
        AVG(service_rating) AS avg_service,
        AVG(average_rating) AS overall_avg,
        COUNT(*) AS total_ratings
      FROM ratings
      WHERE sacco_id = $1
    `, [sacco_id]);

    if (result.rows[0].total_ratings === '0') {
      return res.status(404).json({ error: 'No ratings found for this sacco' });
    }

    res.json({
      sacco_id,
      avg_cleanliness: parseFloat(result.rows[0].avg_cleanliness).toFixed(1),
      avg_safety: parseFloat(result.rows[0].avg_safety).toFixed(1),
      avg_service: parseFloat(result.rows[0].avg_service).toFixed(1),
      overall_avg: parseFloat(result.rows[0].overall_avg).toFixed(1),
      total_ratings: parseInt(result.rows[0].total_ratings)
    });
  } catch (err) {
    console.error('Error fetching average ratings:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST a new rating
app.post('/api/ratings', async (req, res) => {
  try {
    const { sacco_id, cleanliness_rating, safety_rating, service_rating, review_text } = req.body;
    const result = await pool.query(
      `INSERT INTO ratings (sacco_id, cleanliness_rating, safety_rating, service_rating, review_text)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [sacco_id, cleanliness_rating, safety_rating, service_rating, review_text]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error submitting rating:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// PUT update a rating
app.put('/api/ratings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { cleanliness_rating, safety_rating, service_rating, review_text } = req.body;

    // Validate rating values if provided
    const validateRating = (rating) => rating === undefined || (rating >= 1 && rating <= 5);
    if (!validateRating(cleanliness_rating) || !validateRating(safety_rating) || !validateRating(service_rating)) {
      return res.status(400).json({ error: 'Ratings must be between 1 and 5' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (cleanliness_rating !== undefined) {
      updates.push(`cleanliness_rating = $${paramIndex}`);
      values.push(cleanliness_rating);
      paramIndex++;
    }

    if (safety_rating !== undefined) {
      updates.push(`safety_rating = $${paramIndex}`);
      values.push(safety_rating);
      paramIndex++;
    }

    if (service_rating !== undefined) {
      updates.push(`service_rating = $${paramIndex}`);
      values.push(service_rating);
      paramIndex++;
    }

    if (review_text !== undefined) {
      updates.push(`review_text = $${paramIndex}`);
      values.push(review_text);
      paramIndex++;
    }

    // Always update the updated_at timestamp
    updates.push(`updated_at = NOW()`);

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    const result = await pool.query(`
      UPDATE ratings
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating rating:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE a rating
app.delete('/api/ratings/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
  SELECT sacco_id, cleanliness_rating, safety_rating, service_rating, review_text
  FROM ratings
`);
    const deleteResult = await pool.query('DELETE FROM ratings WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    res.json({ message: 'Rating deleted successfully' });
  } catch (err) {
    console.error('Error deleting rating:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Delete lost item after claim confirmed
app.delete('/api/lost-item/:id', async (req, res) => {
  const { id } = req.params;

  // Ensure user is authenticated
  if (!req.session.user || req.session.user.role !== 'Driver') {
    return res.status(403).json({ error: 'Only drivers can delete their own approved lost items' });
  }

  try {
    // Check if this lost item has an approved claim
    const claimCheck = await pool.query(
      `SELECT * FROM claims WHERE lost_item_id = $1 AND is_approved = TRUE`,
      [id]
    );

    if (claimCheck.rows.length === 0) {
      return res.status(400).json({ error: 'This item has not been approved yet or no claim exists' });
    }

    // Delete the lost item
    await pool.query('DELETE FROM lostandfound WHERE id = $1', [id]);
    res.json({ success: true, message: 'Successful Deletion of Lost Item' });
  } catch (err) {
    console.error('Error deleting lost item by driver:', err);
    res.status(500).json({ error: 'Server error during delete' });
  }
});

// CREATE route
app.post('/api/routes', async (req, res) => {
  const { display_name } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO routes (display_name) VALUES ($1) RETURNING *',
      [display_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating route:', err);
    res.status(500).json({ error: 'Failed to create route' });
  }
});


// DELETE route
app.delete('/api/routes/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM routes WHERE route_id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting route:', err);
    res.status(500).json({ error: 'Failed to delete route' });
  }
});
// UPDATE route
app.put('/api/routes/:id', async (req, res) => {
  const { display_name } = req.body;
  try {
    const result = await pool.query(
      'UPDATE routes SET display_name = $1 WHERE route_id = $2 RETURNING *',
      [display_name, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating route:', err);
    res.status(500).json({ error: 'Failed to update route' });
  }
});

// CREATE stage
app.post('/api/stages', async (req, res) => {
  const { name, latitude, longitude } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO stages (name, latitude, longitude) VALUES ($1, $2, $3) RETURNING *',
      [name, latitude, longitude]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating stage:', err);
    res.status(500).json({ error: 'Failed to create stage' });
  }
});

// DELETE stage
app.delete('/api/stages/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM stages WHERE stage_id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting stage:', err);
    res.status(500).json({ error: 'Failed to delete stage' });
  }
});

// UPDATE stage
app.put('/api/stages/:id', async (req, res) => {
  const { name, latitude, longitude } = req.body;
  try {
    const result = await pool.query(
      'UPDATE stages SET name = $1, latitude = $2, longitude = $3 WHERE stage_id = $4 RETURNING *',
      [name, latitude, longitude, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Stage not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating stage:', err);
    res.status(500).json({ error: 'Failed to update stage' });
  }
});

// CREATE sacco
app.post('/api/saccos', async (req, res) => {
  const { sacco_name, base_fare_range, route_id, sacco_stage_id } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO saccos (sacco_name, base_fare_range, route_id, sacco_stage_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [sacco_name, base_fare_range, route_id, sacco_stage_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating sacco:', err);
    res.status(500).json({ error: 'Failed to create sacco' });
  }
});


// DELETE sacco
app.delete('/api/saccos/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM saccos WHERE sacco_id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting sacco:', err);
    res.status(500).json({ error: 'Failed to delete sacco' });
  }
});

// UPDATE sacco
app.put('/api/saccos/:id', async (req, res) => {
  const { name, base_fare_range, route_id, sacco_stage_id } = req.body;
  try {
    const result = await pool.query(
      'UPDATE saccos SET name = $1, base_fare_range = $2, route_id = $3, sacco_stage_id = $4 WHERE sacco_id = $5 RETURNING *',
      [name, base_fare_range, route_id, sacco_stage_id, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sacco not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating sacco:', err);
    res.status(500).json({ error: 'Failed to update sacco' });
  }
});




// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({ error: 'Only image files are allowed!' });
  }
  
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, firstname, lastname, email, username, specify, sacco, ntsa_license FROM users ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a user
app.delete('/api/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Updated endpoints for your server.js

// Update the confirm claim endpoint with better validation
app.put('/api/claims/:id/confirm', async (req, res) => {
  const { id } = req.params;
  
  // Validate that ID is provided and is a valid number
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid claim ID provided' });
  }

  try {
    const result = await pool.query(
      'UPDATE claims SET is_confirmed = TRUE WHERE id = $1 RETURNING *', 
      [parseInt(id)]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Claim not found' });
    }
    
    res.json({ success: true, message: 'Claim confirmed by driver' });
  } catch (err) {
    console.error('Error confirming claim:', err);
    res.status(500).json({ error: 'Failed to confirm claim' });
  }
});

// Get confirmed claims for admin with better data structure
app.get('/api/admin/claims', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.claimer_name,
        c.contact_info,
        c.details,
        c.is_confirmed,
        c.is_approved,
        c.created_at,
        c.lost_item_id,
        lf.lostitem, 
        lf.description AS lost_description, 
        lf.route, 
        lf.date, 
        lf.sacco, 
        lf.image_url,
        lf.created_at as item_created_at
      FROM claims c
      JOIN lostandfound lf ON lf.id = c.lost_item_id
      WHERE c.is_confirmed = TRUE AND c.is_approved = FALSE
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching confirmed claims:', err);
    res.status(500).json({ error: 'Failed to fetch claims' });
  }
});

// Approve claim with validation
app.put('/api/admin/claims/:id/approve', async (req, res) => {
  const { id } = req.params;
  
  // Validate that ID is provided and is a valid number
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid claim ID provided' });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Update claim as approved
    const claimResult = await client.query(
      'UPDATE claims SET is_approved = TRUE WHERE id = $1 RETURNING lost_item_id', 
      [parseInt(id)]
    );
    
    if (claimResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Claim not found' });
    }
    
    const lostItemId = claimResult.rows[0].lost_item_id;
    
    // Optional: Delete the lost item after approval
    // Uncomment the next line if you want to auto-delete items after approval
    // await client.query('DELETE FROM lostandfound WHERE id = $1', [lostItemId]);
    
    await client.query('COMMIT');
    res.json({ success: true, message: 'Claim approved by admin' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error approving claim:', err);
    res.status(500).json({ error: 'Failed to approve claim' });
  } finally {
    client.release();
  }
});

// Delete lost item with validation
app.delete('/api/admin/lost-item/:id', async (req, res) => {
  const { id } = req.params;
  
  // Validate that ID is provided and is a valid number
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid item ID provided' });
  }

  try {
    const result = await pool.query('DELETE FROM lostandfound WHERE id = $1 RETURNING *', [parseInt(id)]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lost item not found' });
    }
    
    res.json({ success: true, message: 'Lost item deleted successfully' });
  } catch (err) {
    console.error('Error deleting lost item:', err);
    res.status(500).json({ error: 'Failed to delete lost item' });
  }
});

// Delete a user with validation
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  
  // Validate that ID is provided and is a valid number
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid user ID provided' });
  }

  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [parseInt(id)]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ message: 'Invalid post ID' });
  }
  try {
    const result = await pool.query('DELETE FROM posts WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: 'Error deleting post' });
  }
});








// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

