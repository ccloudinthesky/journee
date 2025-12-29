# Quick Setup Guide

## 📝 Before Running

**Important**: You need to add your Google Maps API key and configure the backend!

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
nano .env  # or use any text editor
```

Update the environment variables:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRES_IN=7d
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
DATABASE_PATH=./database/journee.db
FRONTEND_URL=http://localhost:5173
```

**⚠️ 重要：產生 JWT Secret**

為安全起見，請產生一個強大的 JWT Secret 並替換 `JWT_SECRET`：

```bash
# 產生命令（任選一個）
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# 或
openssl rand -base64 32
```

將結果複製並貼到 `.env` 檔案中的 `JWT_SECRET=` 後面。

### 3. Start the Backend Server

```bash
npm run dev
```

The database will be automatically created on first run at `./database/journee.db`.

### 4. Database Features

- **Automatic initialization**: Database and tables are created automatically on first server start
- **Seed data**: New users automatically receive 2 sample trips (Paris and Tainan)
- **Reset database**: Run `npm run reset-db` to reset the database and restart the server

## Frontend Setup

### Step 1: Edit `.env` file

Open `frontend/.env` and add your Browser API Key:

```bash
cd frontend
nano .env  # or use any text editor
```

Update this line:
```env
VITE_GOOGLE_MAPS_API_KEY=your_actual_browser_key_here
```

### Step 2: Run the Frontend Application

```bash
npm run dev
```

The app will open at: `http://localhost:5173`

## ✅ Quick Test

### 1. Register a New User

1. Open the application at `http://localhost:5173`
2. Click the "register" or "login" button
3. Create a new account (or login with an existing one)
4. You'll automatically receive 2 sample trips (Paris and Tainan)

### 2. Explore a Trip

1. Click on either "Paris" or "Tainan" trip card
2. You should see:
   - Left sidebar with daily schedules
   - Map in the center showing locations
   - Search bar at the top
   - Locations are numbered and connected with route lines

### 3. Test Features

- **View locations**: Click on different days to see different locations
- **Search**: Type a location name in the search bar
- **Add location**: Click on a search result to save it to your collection
- **Add to day**: Drag or click to add locations to specific days

## 🐛 Troubleshooting

### Map shows error "Failed to load Google Maps API"

**Solution**: Check that your API key is correctly set in `frontend/.env`

### "Invalid API key" error

**Solutions**:
1. Verify the API key in Google Cloud Console
2. Ensure HTTP referrer restrictions match `http://localhost:5173/*`
3. Confirm Maps JavaScript API is enabled
4. Check billing is enabled on your Google Cloud project

### Port 5173 is already in use

**Solution**:
```bash
# Kill the process
lsof -ti:5173 | xargs kill -9

# Or change the port in vite.config.ts and update API restrictions
```

## 📚 Full Documentation

For complete setup instructions, API configuration, and features, see [README.md](./README.md)

## 🎯 Quick Features to Test

1. **View trips**: Home page shows all trips (Paris and Tainan automatically created)
2. **Explore trip**: Click on either trip to see its schedule
3. **See locations**: Map shows locations with numbered markers
4. **View route**: Lines connect locations in order
5. **Search**: Type any location name in search bar
6. **Save location**: Click on a search result to save to collection
7. **Add to day**: Add saved locations to specific days
8. **Remove location**: Click X button to remove from schedule
9. **Reorder**: Drag to reorder locations within a day

---

**Note**: The database is automatically initialized on first run, and seed data is created for each new user. Data is stored in SQLite database at `backend/database/journee.db`.

