import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, testConnection, initDbSchema } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 1. Health check & DB Status Endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    postgres: dbStatus
  });
});

// 2. Initialize Database Tables & Admin Seed
app.post('/api/init-db', async (req, res) => {
  try {
    const result = await initDbSchema();
    res.json({ success: true, message: 'Schema ready', result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. ACCOUNTS & AUTH
app.get('/api/accounts', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM accounts ORDER BY created_at DESC');
    const formatted = rows.map(r => ({
      id: r.id,
      username: r.username,
      name: r.name,
      email: r.email,
      password: r.password,
      role: r.role,
      avatar: r.avatar,
      age: Number(r.age),
      gender: r.gender,
      height: Number(r.height),
      weight: Number(r.weight),
      activity: r.activity,
      goal: r.goal,
      allergies: r.allergies || [],
      createdAt: Number(r.created_at)
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/accounts', async (req, res) => {
  try {
    const { id, username, name, email, password, role = 'user', avatar = '🧑‍💻', age = 26, gender = 'Nam', height = 168, weight = 60, activity = 'Văn phòng (Ít vận động)', goal = 'Cân bằng', allergies = [] } = req.body;
    
    const accountId = id || `acc_${Date.now()}`;
    const createdAt = Date.now();

    const insertQuery = `
      INSERT INTO accounts (id, username, name, email, password, role, avatar, age, gender, height, weight, activity, goal, allergies, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *;
    `;
    const values = [
      accountId, username.toLowerCase(), name, email || '', password, role, avatar,
      Number(age), gender, Number(height), Number(weight), activity, goal,
      JSON.stringify(allergies), createdAt
    ];

    const { rows } = await pool.query(insertQuery, values);
    const r = rows[0];
    res.status(201).json({
      id: r.id,
      username: r.username,
      name: r.name,
      email: r.email,
      role: r.role,
      avatar: r.avatar,
      age: Number(r.age),
      gender: r.gender,
      height: Number(r.height),
      weight: Number(r.weight),
      activity: r.activity,
      goal: r.goal,
      allergies: r.allergies,
      createdAt: Number(r.created_at)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, avatar, age, gender, height, weight, activity, goal, allergies } = req.body;

    const updateQuery = `
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
    const values = [
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

    const { rows } = await pool.query(updateQuery, values);
    if (!rows.length) return res.status(404).json({ error: 'Account not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. FOODS MANAGEMENT
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

app.post('/api/foods', async (req, res) => {
  try {
    const { id = Date.now().toString(), name, categories = ['Trưa', 'Tối'], nutrition = 'Cân bằng', allergies = [], emoji = '🍲', priceTier = 'standard', mood = ['hot'], image = null, hidden = false } = req.body;
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

// 5. MEAL HISTORY
app.get('/api/history', async (req, res) => {
  try {
    const { accountId } = req.query;
    let query = 'SELECT * FROM meal_history ORDER BY timestamp DESC';
    let params = [];
    if (accountId) {
      query = 'SELECT * FROM meal_history WHERE account_id = $1 ORDER BY timestamp DESC';
      params = [accountId];
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

app.post('/api/history', async (req, res) => {
  try {
    const { id = Date.now().toString(), foodId, accountId = null, mealType = 'Trưa', timestamp = Date.now() } = req.body;
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

app.delete('/api/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM meal_history WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/history', async (req, res) => {
  try {
    const { accountId } = req.query;
    if (accountId) {
      await pool.query('DELETE FROM meal_history WHERE account_id = $1', [accountId]);
    } else {
      await pool.query('DELETE FROM meal_history');
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seed Initial Foods helper
app.post('/api/seed-foods', async (req, res) => {
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

// Only start listening when run directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 PostgreSQL API Backend server listening on port ${PORT}`);
  });
}

export default app;
