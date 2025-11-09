import jwt from 'jsonwebtoken';
import env from '../constants/env.constants.js';

export const generateToken = (payload) => jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
export const verifyToken = (token) => jwt.verify(token, env.JWT_SECRET);