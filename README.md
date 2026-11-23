# AgriMitra 2.0

AgriMitra 2.0 is a full-stack agricultural platform that combines a React frontend, a Node.js/Express API, a FastAPI machine-learning service, and MySQL storage.

## Features

- Crop recommendation
- Fertilizer recommendation
- Crop yield prediction
- Agricultural marketplace and equipment listings
- User registration and login
- Real-time commodity price information
- Community, notes, and knowledge resources
- Contract farming and related platform pages

## Project Structure

```text
AgriMitra 2.0/
├── backend/             # Express API and MySQL models
├── frontend/            # React and Vite web application
├── ml-service/          # FastAPI prediction service
│   ├── data/            # Training and reference datasets
│   └── models/          # Serialized machine-learning models
└── README.md
```

## Technology Stack

- Frontend: React 19, Vite, Tailwind CSS, Axios
- Backend: Node.js, Express 5, MySQL, JWT, Cloudinary
- ML service: Python, FastAPI, Uvicorn, pandas, NumPy, scikit-learn
- Authentication: Access JWT and HTTP-only refresh-token cookie

## Prerequisites

Install the following before setup:

- Node.js 18 or newer
- npm
- Python 3.10 or newer
- MySQL Server
- A Cloudinary account
- Git

## Backend Configuration

Create `backend/.env` with the following variables:

```dotenv
PORT=5001
NODE_ENV=development

DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name

JWT_SECRET=replace_with_a_long_random_secret
JWT_REFRESH_SECRET=replace_with_a_different_long_random_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CROP_ML_SERVICE_URL=http://localhost:8000
```

Do not commit real values in `.env`. The repository ignore rules exclude environment files, while `.env.example` can be safely committed if it contains placeholders only.

Create the MySQL database and user described in `backend/.env`. The backend connection settings are in `backend/src/config/db.js`.

## Installation

Run the following commands from the project root.

### 1. ML Service

```powershell
cd ml-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The ML API is available at `http://localhost:8000`.

### 2. Backend API

Open another terminal:

```powershell
cd backend
npm install
npm run dev
```

The backend is available at `http://localhost:5001`.

### 3. Frontend

Open a third terminal:

```powershell
cd frontend
npm install
npm run dev
```

Vite normally serves the frontend at `http://localhost:5173`.

## Running the Complete Application

Start the three services in separate terminals:

1. Start the FastAPI ML service on port `8000`.
2. Start the Express backend on port `5001`.
3. Start the Vite frontend on port `5173`.

The development frontend sends API requests to `http://localhost:5001/api`.

## Frontend Commands

```powershell
cd frontend
npm run dev
npm run build
npm run lint
npm run preview
```

The production frontend build is written to `frontend/dist`.

## Backend Commands

```powershell
cd backend
npm run dev
npm start
```

## API Endpoints

All protected routes require a valid bearer access token unless stated otherwise.

| Area | Base route |
|---|---|
| Users | `/api/users` |
| Refresh token | `/api/refresh` |
| Notes | `/api/notes` |
| Crops | `/api/crops` |
| Crop recommendations | `/api/crop-recommendation` |
| Fertilizer recommendations | `/api/fertilizer-recommendation` |
| Yield predictions | `/api/yield-prediction` |
| Equipment | `/api/equipments` |

ML service endpoints:

| Endpoint | Purpose |
|---|---|
| `POST /predict` | Crop recommendation |
| `POST /predict-fertilizer` | Fertilizer recommendation |
| `POST /predict-yield` | Crop yield prediction |

## Production Build

Build the frontend:

```powershell
cd frontend
npm run build
```

When `NODE_ENV=production`, the Express server can serve the generated `frontend/dist` directory together with the API.

```powershell
cd backend
npm start
```

Configure production environment values on the server or hosting platform. Never copy them from `backend/.env` into source control.

## Security Notes

- Do not commit `.env` files or credentials.
- Use strong, unique JWT secrets.
- Rotate credentials if they are ever exposed in Git history.
- Do not commit `node_modules`, build output, Python virtual environments, or caches.
- Package lockfiles and machine-learning model artifacts are source-controlled.
- Review staged changes before every commit.

## Development Files Ignored by Git

The root and package-level `.gitignore` files exclude:

- Backend and frontend `.env` files
- `node_modules`
- `frontend/dist`
- Python virtual environments and caches
- Coverage output and temporary files
- Editor and operating-system metadata

## Troubleshooting

### Backend cannot connect to MySQL

- Verify that MySQL is running.
- Confirm `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in `backend/.env`.
- Confirm that the database and required user permissions exist.

### Frontend cannot reach the backend

- Confirm the backend is running on port `5001`.
- Confirm `http://localhost:5001` is allowed in `backend/src/config/allowedOrigins.js`.
- Restart the Vite development server after frontend configuration changes.

### ML endpoints return errors

- Confirm the FastAPI service is running on port `8000`.
- Confirm `CROP_ML_SERVICE_URL=http://localhost:8000` in `backend/.env`.
- Confirm all model files exist under `ml-service/models`.

### Cloudinary uploads fail

- Confirm all three Cloudinary environment variables are valid.
- Confirm the Cloudinary account permits the requested upload operations.
