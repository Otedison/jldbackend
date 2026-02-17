# Backend Database + API (MERN)

This folder contains MongoDB setup and a local Express API for:
- news/blogs
- resources + download tracking
- careers
- events
- subscriptions

## Structure
- `db/init-mongo.js`: creates collections, indexes, and seed documents
- `src/server.js`: Express API entry
- `src/models/*`: Mongoose models
- `src/routes/*`: API endpoints
- `.env.example`: environment template
- `scripts/db.sh`: helper commands for Mongo (optional)

## Prerequisites

### Install MongoDB (Required)

#### macOS (using Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Ubuntu/Debian
```bash
# Import MongoDB GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Windows
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Run the installer with default options
3. MongoDB will be installed at `C:\Program Files\MongoDB\Server\7.0\bin`
4. Create a data directory: `C:\data\db`
5. Start MongoDB: `mongod --dbpath C:\data\db`

#### Or use MongoDB Atlas (Cloud - Recommended for quick setup)
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account and a free cluster
3. Get your connection string (replace `<password>` with your password)
4. Add to `.env`: `MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/jukwaa_hub`

## 1. Configure Environment
1. `cp .env.example .env`
2. Edit `.env` with your MongoDB connection details (or use defaults for local MongoDB)

## 2. Start MongoDB (if using local installation)
```bash
# macOS
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongod

# Or manually (from MongoDB bin directory)
mongod --dbpath /path/to/data/db
```

## 3. Start API server
```bash
npm install
npm run dev
```

API default URL: `http://localhost:5000/api`

## Important env values
- `PORT=5000`
- `FRONTEND_ORIGIN=http://localhost:5173`
- `MONGO_URI=mongodb://jukwaa_admin:change_me@127.0.0.1:27017/jukwaa_hub?authSource=admin`
- `ALLOW_START_WITHOUT_DB=true` (dev fallback: server starts and DB routes return `503` if Mongo is down)

**Note**: Before starting the server, ensure you've:
1. Installed MongoDB (local or Atlas)
2. Created a user `jukwaa_admin` with password `change_me` (or update `.env` with your credentials)
3. Created database `jukwaa_hub` (or update `MONGO_DB_NAME` in `.env`)

## API endpoints
- `GET /api/health`
- `GET /api/news?limit=12`
- `GET /api/blogs?status=published&limit=20&type=blog`
- `GET /api/resources?category=Toolkit&search=budget`
- `POST /api/resources/:id/download`
- `GET /api/careers?status=open&limit=20`
- `GET /api/events?upcoming=true&limit=6`
- `POST /api/subscriptions`

## MongoDB Helper Commands (for local installation)

### macOS
- Start: `brew services start mongodb-community`
- Stop: `brew services stop mongodb-community`
- Mongo Shell: `mongosh`

### Ubuntu/Linux
- Start: `sudo systemctl start mongod`
- Stop: `sudo systemctl stop mongod`
- Status: `sudo systemctl status mongod`
- Mongo Shell: `mongosh`

### Connect to MongoDB
```bash
# Local MongoDB shell
mongosh "mongodb://jukwaa_admin:change_me@127.0.0.1:27017/jukwaa_hub?authSource=admin"

# Or if using MongoDB Atlas
mongosh "<your-atlas-connection-string>"
```

