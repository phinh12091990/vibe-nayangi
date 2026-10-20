import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, testConnection, initDbSchema } from './db.js';
import {
  hashPassword,
  verifyPassword,
  createToken,
  authenticateToken,
  optionalToken,
  requireAdmin,
  sanitizeAccount
} from './auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 1. Health check & DB Status Endpoint (Public)
app.get('/api/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    postgres: dbStatus
  });
});

// 2. Initialize Database Tables & Admin Seed (Protected: Admin Only)
app.post('/api/init-db', requireAdmin, async (req, res) => {
  try {
    const result = await initDbSchema();
    res.json({ success: true, message: 'Schema ready', result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. AUTHENTICATION (Server-side Login & Registration)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
    }

    const cleanUser = String(username).trim().toLowerCase();
    const query = `
      SELECT * FROM accounts 
      WHERE LOWER(username) = $1 OR LOWER(email) = $1 OR LOWER(name) = $1 
      LIMIT 1;
    `;
    const { rows } = await pool.query(query, [cleanUser]);

    if (!rows.length) {
      return res.status(401).json({ error: 'Tài khoản không tồn tại. Vui lòng kiểm tra lại.' });
    }

    const acc = rows[0];
    const isPasswordValid = verifyPassword(password, acc.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Mật khẩu không chính xác. Vui lòng thử lại.' });
    }

    // Auto-migrate legacy plain passwords to PBKDF2 hash on successful login
    if (!acc.password.startsWith('pbkdf2$')) {
      const secureHash = hashPassword(password);
      await pool.query('UPDATE accounts SET password = $1 WHERE id = $2', [secureHash, acc.id]);
    }

    const token = createToken({
      id: acc.id,
      username: acc.username,
      role: acc.role || 'user'
    });

    res.json({
      success: true,
      token,
      account: sanitizeAccount(acc)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const {
      id, username, name, email, password,
      avatar = '🧑‍💻', age = 26, gender = 'Nam', height = 168, weight = 60,
      activity = 'Văn phòng (Ít vận động)', goal = 'Cân bằng', allergies = []
    } = req.body;

    const cleanUsername = String(username || '').trim().toLowerCase().replace(/\s+/g, '_');
    if (!cleanUsername || cleanUsername.length < 3) {
      return res.status(400).json({ error: 'Tên đăng nhập phải có ít nhất 3 ký tự.' });
    }
    if (!password || String(password).trim().length < 4) {
      return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 4 ký tự.' });
    }

    // Prevent unauthorized registration as admin
    if (cleanUsername === 'admin') {
      return res.status(400).json({ error: "Tên đăng nhập 'admin' dành riêng cho Quản trị viên." });
    }

    // Check if username already exists
    const checkExisted = await pool.query('SELECT id FROM accounts WHERE LOWER(username) = $1 LIMIT 1', [cleanUsername]);
    if (checkExisted.rows.length > 0) {
      return res.status(400).json({ error: `Tên đăng nhập "${cleanUsername}" đã có người sử dụng.` });
    }

    const accountId = id || `acc_${Date.now()}`;
    const createdAt = Date.now();
    const hashedPassword = hashPassword(String(password).trim());
    const role = 'user'; // Strictly user role for public registrations

    const insertQuery = `
      INSERT INTO accounts (id, username, name, email, password, role, avatar, age, gender, height, weight, activity, goal, allergies, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *;
    `;
    const values = [
      accountId, cleanUsername, name ? String(name).trim() : cleanUsername,
      email ? String(email).trim() : '', hashedPassword, role, avatar,
      Number(age), gender, Number(height), Number(weight), activity, goal,
      JSON.stringify(allergies), createdAt
    ];

    const { rows } = await pool.query(insertQuery, values);
    const createdAccount = sanitizeAccount(rows[0]);
    const token = createToken({
      id: createdAccount.id,
      username: createdAccount.username,
      role: createdAccount.role
    });

    res.status(201).json({
      success: true,
      token,
      account: createdAccount
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 4. ACCOUNTS MANAGEMENT
// GET /api/accounts: Authenticated users only, NEVER exposes passwords
app.get('/api/accounts', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM accounts ORDER BY created_at DESC');
    const sanitized = rows.map(r => sanitizeAccount(r));
    res.json(sanitized);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/accounts: Compatible endpoint for account creation with password hashing
app.post('/api/accounts', optionalToken, async (req, res) => {
  try {
    const {
      id, username, name, email, password, role = 'user',
      avatar = '🧑‍💻', age = 26, gender = 'Nam', height = 168, weight = 60,
      activity = 'Văn phòng (Ít vận động)', goal = 'Cân bằng', allergies = []
    } = req.body;

    const cleanUsername = String(username || '').trim().toLowerCase().replace(/\s+/g, '_');
    if (!cleanUsername) {
      return res.status(400).json({ error: 'Username is required.' });
    }

    // Only existing admin can set role='admin'
    const assignedRole = (role === 'admin' && req.user && req.user.role === 'admin') ? 'admin' : 'user';
    const accountId = id || `acc_${Date.now()}`;
    const createdAt = Date.now();
    const rawPassword = password ? String(password).trim() : 'nayangi123';
    const hashedPassword = hashPassword(rawPassword);

    const insertQuery = `
      INSERT INTO accounts (id, username, name, email, password, role, avatar, age, gender, height, weight, activity, goal, allergies, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (username) DO UPDATE 
      SET name = EXCLUDED.name,
          email = EXCLUDED.email,
          avatar = EXCLUDED.avatar,
          age = EXCLUDED.age,
          gender = EXCLUDED.gender,
          height = EXCLUDED.height,
          weight = EXCLUDED.weight,
          activity = EXCLUDED.activity,
          goal = EXCLUDED.goal,
          allergies = EXCLUDED.allergies
      RETURNING *;
    `;
    const values = [
      accountId, cleanUsername, name || cleanUsername, email || '', hashedPassword, assignedRole, avatar,
      Number(age), gender, Number(height), Number(weight), activity, goal,
      JSON.stringify(allergies), createdAt
    ];

    const { rows } = await pool.query(insertQuery, values);
    res.status(201).json(sanitizeAccount(rows[0]));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/accounts/:id: Protected (Owner or Admin only)
app.put('/api/accounts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Authorization check: User can only update their own profile, or admin can update any profile
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Từ chối truy cập: Bạn chỉ có thể cập nhật tài khoản của chính mình.' });
    }

    const { name, email, avatar, age, gender, height, weight, activity, goal, allergies, password } = req.body;

    let updateQuery;
    let values;

    if (password && String(password).trim().length >= 4) {
      const hashed = hashPassword(String(password).trim());
      updateQuery = `
        UPDATE accounts
        SET name = COALESCE($1, name),
            email = COALESCE($2, email),
            avatar = COALESCE($3, avatar),
            age = COALESCE($4, age),
            gender = COALESCE($5, gender),
            height = COALESCE($6, height),
            weight = COALESCE($7, weight),
            activity = COALESCE($8, activity),
            goal = COALESCE($9, goal),
            allergies = COALESCE($10, allergies),
            password = $11
        WHERE id = $12
        RETURNING *;
      `;
      values = [
        name, email, avatar, 
        age ? Number(age) : null, 
        gender, 
        height ? Number(height) : null, 
        weight ? Number(weight) : null, 
        activity, 
        goal, 
        allergies ? JSON.stringify(allergies) : null, 
        hashed,
        id
      ];
    } else {
      updateQuery = `
        UPDATE accounts
        SET name = COALESCE($1, name),
            email = COALESCE($2, email),
            avatar = COALESCE($3, avatar),
            age = COALESCE($4, age),
            gender = COALESCE($5, gender),
            height = COALESCE($6, height),
            weight = COALESCE($7, weight),
            activity = COALESCE($8, activity),
            goal = COALESCE($9, goal),
            allergies = COALESCE($10, allergies)
        WHERE id = $11
        RETURNING *;
      `;
      values = [
        name, email, avatar, 
        age ? Number(age) : null, 
        gender, 
        height ? Number(height) : null, 
        weight ? Number(weight) : null, 
        activity, 
        goal, 
        allergies ? JSON.stringify(allergies) : null, 
        id
      ];
    }

    const { rows } = await pool.query(updateQuery, values);
    if (!rows.length) return res.status(404).json({ error: 'Account not found' });
    res.json(sanitizeAccount(rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. FOODS MANAGEMENT
// GET /api/foods: Public
app.get('/api/foods', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM foods ORDER BY created_at DESC');
    const formatted = rows.map(r => ({
      id: r.id,
      name: r.name,
      categories: r.categories || [],
      nutrition: r.nutrition,
      allergies: r.allergies || [],
      allergens: r.allergies || [],
      emoji: r.emoji,
      priceTier: r.price_tier,
      mood: r.mood || [],
      image: r.image,
      hidden: r.hidden
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/foods: Authenticated
app.post('/api/foods', authenticateToken, async (req, res) => {
  try {
    const { id = Date.now().toString(), name, categories = ['Trưa', 'Tối'], nutrition = 'Cân bằng', allergies = [], emoji = '🍲', priceTier = 'standard', mood = ['hot'], image = null, hidden = false } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Tên món ăn là bắt buộc.' });
    }
    const query = `
      INSERT INTO foods (id, name, categories, nutrition, allergies, emoji, price_tier, mood, image, hidden)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const values = [id, name, JSON.stringify(categories), nutrition, JSON.stringify(allergies), emoji, priceTier, JSON.stringify(mood), image, hidden];
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seed Initial Foods helper (Protected: Admin Only)
app.post('/api/seed-foods', requireAdmin, async (req, res) => {
  try {
    const { foods } = req.body;
    if (!Array.isArray(foods)) return res.status(400).json({ error: 'Foods array required' });

    for (const f of foods) {
      await pool.query(`
        INSERT INTO foods (id, name, categories, nutrition, allergies, emoji, price_tier, mood, image, hidden)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE 
        SET name = EXCLUDED.name,
            categories = EXCLUDED.categories,
            nutrition = EXCLUDED.nutrition,
            allergies = EXCLUDED.allergies,
            emoji = EXCLUDED.emoji,
            price_tier = EXCLUDED.price_tier,
            mood = EXCLUDED.mood,
            image = EXCLUDED.image;
      `, [
        f.id, f.name, JSON.stringify(f.categories || []), f.nutrition || 'Cân bằng',
        JSON.stringify(f.allergies || f.allergens || []), f.emoji || '🍲',
        f.priceTier || 'standard', JSON.stringify(f.mood || ['hot']), f.image || null, false
      ]);
    }
    res.json({ success: true, count: foods.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. MEAL HISTORY (Protected: Authenticated Users)
app.get('/api/history', authenticateToken, async (req, res) => {
  try {
    // Non-admin can only view their own history
    let query = 'SELECT * FROM meal_history WHERE account_id = $1 ORDER BY timestamp DESC';
    let params = [req.user.id];

    if (req.user.role === 'admin' && req.query.accountId) {
      query = 'SELECT * FROM meal_history WHERE account_id = $1 ORDER BY timestamp DESC';
      params = [req.query.accountId];
    } else if (req.user.role === 'admin' && req.query.all === 'true') {
      query = 'SELECT * FROM meal_history ORDER BY timestamp DESC';
      params = [];
    }

    const { rows } = await pool.query(query, params);
    const formatted = rows.map(r => ({
      id: r.id,
      foodId: r.food_id,
      accountId: r.account_id,
      mealType: r.meal_type,
      timestamp: Number(r.timestamp)
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/history', authenticateToken, async (req, res) => {
  try {
    const { id = Date.now().toString(), foodId, mealType = 'Trưa', timestamp = Date.now() } = req.body;
    const accountId = req.user.id; // Bound to authenticated user
    const query = `
      INSERT INTO meal_history (id, food_id, account_id, meal_type, timestamp)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [id, foodId, accountId, mealType, timestamp]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/history/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    // Check ownership
    const checkQuery = await pool.query('SELECT account_id FROM meal_history WHERE id = $1', [id]);
    if (!checkQuery.rows.length) {
      return res.status(404).json({ error: 'History item not found' });
    }
    const item = checkQuery.rows[0];
    if (item.account_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Từ chối: Bạn chỉ có thể xoá nhật ký của chính mình.' });
    }

    await pool.query('DELETE FROM meal_history WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/history', authenticateToken, async (req, res) => {
  try {
    // If admin and no accountId specified, can clear all; otherwise clear only requester's history
    if (req.user.role === 'admin' && req.query.all === 'true') {
      await pool.query('DELETE FROM meal_history');
    } else {
      await pool.query('DELETE FROM meal_history WHERE account_id = $1', [req.user.id]);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Only start listening when run directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 PostgreSQL API Backend server listening on port ${PORT}`);
  });
}

export default app;
