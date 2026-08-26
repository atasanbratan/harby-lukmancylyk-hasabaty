import { randomUUID } from 'node:crypto';

// Single hardcoded account, as requested — no signup/account management yet.
const USERNAME = 'B.Hocjyyev';
const PASSWORD = '1111';

const activeTokens = new Set();

export function login(username, password) {
  if (username === USERNAME && password === PASSWORD) {
    const token = randomUUID();
    activeTokens.add(token);
    return token;
  }
  return null;
}

export function logout(token) {
  activeTokens.delete(token);
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token || !activeTokens.has(token)) {
    return res.status(401).json({ error: 'Ulgama girmeli.' });
  }
  next();
}
