import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { database } from '../config/database';
import { generateToken } from '../utils/jwt';
import { ApiResponse, LoginResponse, RegisterResponse, User } from '../types';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { createSeedTripsForUser } from '../config/seedData';

// Register user
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  // Check if user already exists
  const existingUser = await database.get(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (existingUser) {
    throw createError('User with this email already exists', 409);
  }

  // Hash password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Create user
  const userId = database.generateId();
  const createdAt = database.getCurrentTimestamp();

  await database.run(
    'INSERT INTO users (id, email, username, password_hash, created_at) VALUES (?, ?, ?, ?, ?)',
    [userId, email, username, passwordHash, createdAt]
  );

  // Create seed trips for the new user
  try {
    await createSeedTripsForUser(userId);
  } catch (error) {
    console.error('Error creating seed trips:', error);
    // Don't fail registration if seed data fails
  }

  // Generate token
  const token = generateToken(userId, email);

  // Get created user (without password)
  const user = await database.get(
    'SELECT id, email, username, created_at FROM users WHERE id = ?',
    [userId]
  ) as Omit<User, 'password_hash'>;

  const response: ApiResponse<RegisterResponse> = {
    success: true,
    data: {
      user,
      token
    },
    message: 'User registered successfully'
  };

  res.status(201).json(response);
});

// Login user
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user
  const user = await database.get(
    'SELECT * FROM users WHERE email = ?',
    [email]
  ) as User | undefined;

  if (!user) {
    throw createError('Invalid email or password', 401);
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    throw createError('Invalid email or password', 401);
  }

  // Generate token
  const token = generateToken(user.id, user.email);

  // Remove password from user object
  const { password_hash, ...userWithoutPassword } = user;

  const response: ApiResponse<LoginResponse> = {
    success: true,
    data: {
      user: userWithoutPassword,
      token
    },
    message: 'Login successful'
  };

  res.json(response);
});

// Logout user (client-side token removal)
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const response: ApiResponse<null> = {
    success: true,
    message: 'Logout successful'
  };

  res.json(response);
});

// Get current user profile
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const response: ApiResponse<Omit<User, 'password_hash'>> = {
    success: true,
    data: req.user,
    message: 'Profile retrieved successfully'
  };

  res.json(response);
});
