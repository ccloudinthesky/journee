import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { config } from './env';
import path from 'path';
import fs from 'fs';

// Create database directory if it doesn't exist
const dbDir = path.dirname(config.databasePath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
const db = new sqlite3.Database(config.databasePath);

// Promisify database methods
const dbRun = promisify(db.run.bind(db)) as (sql: string, params?: any[]) => Promise<{ changes: number; lastID: number }>;
const dbGet = promisify(db.get.bind(db)) as (sql: string, params?: any[]) => Promise<any>;
const dbAll = promisify(db.all.bind(db)) as (sql: string, params?: any[]) => Promise<any[]>;

// Database schema
const createTables = `
-- users 表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- trips 表
CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  cover_image TEXT DEFAULT 'https://images.unsplash.com/photo-1707550936239-aa262b3ef116?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA==&auto=format&fit=crop&q=80&w=2070',
  deleted BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- day_schedules 表
CREATE TABLE IF NOT EXISTS day_schedules (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL,
  day_number INTEGER NOT NULL,
  date TEXT NOT NULL,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

-- locations 表
CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  day_schedule_id TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  place_id TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  type TEXT NOT NULL,
  position INTEGER NOT NULL,
  opening_hours TEXT,
  photo_url TEXT,
  rating REAL,
  phone_number TEXT,
  FOREIGN KEY (day_schedule_id) REFERENCES day_schedules(id) ON DELETE CASCADE
);

-- saved_locations 表
CREATE TABLE IF NOT EXISTS saved_locations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  place_id TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  type TEXT NOT NULL,
  opening_hours TEXT,
  photo_url TEXT,
  rating REAL,
  phone_number TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`;

// Initialize database
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Create tables one by one
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS trips (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        cover_image TEXT DEFAULT 'https://images.unsplash.com/photo-1707550936239-aa262b3ef116?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA==&auto=format&fit=crop&q=80&w=2070',
        deleted BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS day_schedules (
        id TEXT PRIMARY KEY,
        trip_id TEXT NOT NULL,
        day_number INTEGER NOT NULL,
        position INTEGER NOT NULL,
        saved_location_id TEXT NOT NULL,
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
        FOREIGN KEY (saved_location_id) REFERENCES saved_locations(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS saved_locations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        trip_id TEXT NOT NULL,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        place_id TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        type TEXT NOT NULL,
        opening_hours TEXT,
        photo_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
      )`
    ];

    for (const table of tables) {
      await dbRun(table);
    }
    
    // Run migrations
    try {
      // Add deleted column to trips table if it doesn't exist
      await dbRun(`ALTER TABLE trips ADD COLUMN deleted BOOLEAN DEFAULT 0;`);
      console.log('Migration: Added deleted column to trips table');
    } catch (error) {
      // Column might already exist, which is fine
      if (error instanceof Error && !error.message.includes('duplicate column name')) {
        console.error('Migration error:', error);
      }
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Database helper functions
export const database = {
  run: dbRun,
  get: dbGet,
  all: dbAll,
  
  // Helper function to generate UUID
  generateId: (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  // Helper function to get current timestamp
  getCurrentTimestamp: (): string => {
    return new Date().toISOString();
  },

  // Helper function to calculate days between dates
  calculateDaysBetween: (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
  },

  // Helper function to generate dates array
  generateDatesArray: (startDate: string, endDate: string): string[] => {
    const dates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }
    
    return dates;
  }
};

// Close database connection
export const closeDatabase = (): void => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
  });
};
