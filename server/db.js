import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

// Read config from DATABASE_URL or individual PG* env variables
const connectionString = process.env.DATABASE_URL;

const poolConfig = connectionString
  ? {
      connectionString,
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false
    }
  : {
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT) || 5432,
      database: process.env.PGDATABASE || 'nayangi',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false
    };

export const pool = new Pool(poolConfig);

// Test database connection helper
export async function testConnection() {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW() as current_time, current_database() as db_name');
    client.release();
    return {
      connected: true,
      time: res.rows[0].current_time,
      database: res.rows[0].db_name
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
}

// Initialise DB Schema
export async function initDbSchema() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. ACCOUNTS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id VARCHAR(64) PRIMARY KEY,
        username VARCHAR(64) UNIQUE NOT NULL,
        name VARCHAR(128) NOT NULL,
        email VARCHAR(128),
        password VARCHAR(255) NOT NULL,
        role VARCHAR(32) DEFAULT 'user',
        avatar VARCHAR(32) DEFAULT '🧑‍💻',
        age INT DEFAULT 26,
        gender VARCHAR(16) DEFAULT 'Nam',
        height NUMERIC DEFAULT 168,
        weight NUMERIC DEFAULT 62,
        activity VARCHAR(128) DEFAULT 'Văn phòng (Ít vận động)',
        goal VARCHAR(64) DEFAULT 'Cân bằng',
        allergies JSONB DEFAULT '[]'::jsonb,
        created_at BIGINT NOT NULL
      );
    `);

    // 2. FOODS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS foods (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        categories JSONB DEFAULT '["Trưa", "Tối"]'::jsonb,
        nutrition VARCHAR(64) DEFAULT 'Cân bằng',
        allergies JSONB DEFAULT '[]'::jsonb,
        emoji VARCHAR(16) DEFAULT '🍲',
        price_tier VARCHAR(32) DEFAULT 'standard',
        mood JSONB DEFAULT '["hot"]'::jsonb,
        image TEXT,
        hidden BOOLEAN DEFAULT FALSE,
        created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
      );
    `);

    // 3. MEAL HISTORY TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS meal_history (
        id VARCHAR(64) PRIMARY KEY,
        food_id VARCHAR(64) NOT NULL,
        account_id VARCHAR(64),
        meal_type VARCHAR(64),
        timestamp BIGINT NOT NULL
      );
    `);

    // 4. GROUP MEMBERS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS group_members (
        id VARCHAR(64) PRIMARY KEY,
        account_id VARCHAR(64),
        name VARCHAR(128) NOT NULL,
        allergies JSONB DEFAULT '[]'::jsonb,
        active BOOLEAN DEFAULT TRUE
      );
    `);

    // Ensure Master Admin account exists
    await client.query(`
      INSERT INTO accounts (
        id, username, name, email, password, role, avatar, age, gender, height, weight, activity, goal, allergies, created_at
      )
      VALUES (
        'acc_admin', 'admin', 'Quản Trị Viên', 'admin@nayangi.vn', 'admin', 'admin', '👑', 30, 'Nam', 172, 68, 'Văn phòng (Ít vận động)', 'Cân bằng', '[]'::jsonb, 1710000000000
      )
      ON CONFLICT (username) DO NOTHING;
    `);

    await client.query('COMMIT');
    console.log('✅ PostgreSQL Schema initialized successfully.');
    return { success: true };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to initialize DB schema:', err);
    throw err;
  } finally {
    client.release();
  }
}
