import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD || 'nayangi-secret-token-vibe-challenge-2026';

/**
 * Hash password securely with PBKDF2 and random salt
 */
export function hashPassword(password) {
  if (!password) return '';
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `pbkdf2$${salt}$${hash}`;
}

/**
 * Verify plaintext password against stored hash (supports PBKDF2 & legacy plaintext fallback)
 */
export function verifyPassword(password, storedHash) {
  if (!storedHash || !password) return false;
  if (storedHash.startsWith('pbkdf2$')) {
    const parts = storedHash.split('$');
    if (parts.length !== 3) return false;
    const [, salt, originalHash] = parts;
    const computedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(originalHash, 'hex'));
    } catch {
      return false;
    }
  }
  // Backwards compatibility for existing dev instances
  return password === storedHash;
}

/**
 * Create HMAC-SHA256 Signed JWT Token
 */
export function createToken(payload, expiresInSeconds = 7 * 24 * 3600) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

/**
 * Verify Signed JWT Token
 */
export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  
  try {
    const isSigValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    if (!isSigValid) return null;
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Middleware: Verify Bearer Token or Admin API Key
 */
export function authenticateToken(req, res, next) {
  // Check admin key header if configured
  const adminKey = req.headers['x-admin-key'];
  const configuredAdminKey = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD;
  if (adminKey && configuredAdminKey && adminKey === configuredAdminKey) {
    req.user = { id: 'acc_admin', username: 'admin', role: 'admin' };
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  if (!token) {
    return res.status(401).json({ error: 'Yêu cầu xác thực. Vui lòng đăng nhập để tiếp tục.' });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(403).json({ error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
  }

  req.user = user;
  next();
}

/**
 * Middleware: Optional Bearer Token (sets req.user if provided)
 */
export function optionalToken(req, res, next) {
  const adminKey = req.headers['x-admin-key'];
  const configuredAdminKey = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD;
  if (adminKey && configuredAdminKey && adminKey === configuredAdminKey) {
    req.user = { id: 'acc_admin', username: 'admin', role: 'admin' };
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  if (token) {
    const user = verifyToken(token);
    if (user) req.user = user;
  }
  next();
}

/**
 * Middleware: Require Admin role
 */
export function requireAdmin(req, res, next) {
  // Allow via x-admin-key directly
  const adminKey = req.headers['x-admin-key'];
  const configuredAdminKey = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD;
  if (adminKey && configuredAdminKey && adminKey === configuredAdminKey) {
    req.user = { id: 'acc_admin', username: 'admin', role: 'admin' };
    return next();
  }

  if (!req.user) {
    // Attempt standard authenticateToken first
    return authenticateToken(req, res, () => {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Từ chối truy cập: Quyền Quản trị viên (Admin) là bắt buộc.' });
      }
      next();
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Từ chối truy cập: Quyền Quản trị viên (Admin) là bắt buộc.' });
  }
  next();
}

/**
 * Sanitize account object to NEVER expose password or password hashes
 */
export function sanitizeAccount(r) {
  if (!r) return null;
  return {
    id: r.id,
    username: r.username,
    name: r.name,
    email: r.email,
    role: r.role || 'user',
    avatar: r.avatar,
    age: Number(r.age),
    gender: r.gender,
    height: Number(r.height),
    weight: Number(r.weight),
    activity: r.activity,
    goal: r.goal,
    allergies: Array.isArray(r.allergies) ? r.allergies : (typeof r.allergies === 'string' ? JSON.parse(r.allergies || '[]') : []),
    createdAt: Number(r.created_at)
  };
}
