import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/index.js';
import { registerSchema, loginSchema } from '../validators/authValidator.js';
import { AppError } from '../utils/errors.js';

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role, email: user.email }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export async function register(req, res, next) {
  try {
    const payload = await registerSchema.validateAsync(req.body, { abortEarly: false, stripUnknown: true });

    const exists = await User.findOne({ where: { email: payload.email } });
    if (exists) {
      throw new AppError('El correo ya está registrado', 409);
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const user = await User.create({ ...payload, passwordHash });

    const token = signToken(user);
    res.status(201).json({ ok: true, token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const payload = await loginSchema.validateAsync(req.body, { abortEarly: false, stripUnknown: true });

    const user = await User.findOne({ where: { email: payload.email } });
    if (!user) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const validPassword = await bcrypt.compare(payload.password, user.passwordHash);
    if (!validPassword) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const token = signToken(user);
    res.json({ ok: true, token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
  } catch (error) {
    next(error);
  }
}
