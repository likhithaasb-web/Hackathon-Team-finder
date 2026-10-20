import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'hackmate_fallback_secret_key_change_in_prod_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const generateToken = (userId, role = 'user') => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
