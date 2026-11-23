# AgriMitra Project Context for AI Coding Tools

This document describes the project as it exists in the source tree. Treat observed implementation as authoritative; product descriptions and UI labels do not imply that a real service (for example, payment processing or identity verification) is integrated.

## 1. Product summary

AgriMitra is a student-project web application intended to connect Indian farmers, buyers, and agricultural communities. The UI presents:

- A crop marketplace where users can list and browse produce.
- An equipment marketplace for buying or renting agricultural equipment.
- Community notes.
- Registration and login.
- Static knowledge, commodity-price, contract-farming, about, and contact pages.

The application has a React single-page frontend and an Express API backed by MySQL. Some features are database-backed CRUD; several other screens are static/demo flows. The visible business context is Indian agriculture (₹ prices, Indian cities/states, government and farming resources).

## 2. Repository map

```text
.
├── backend/
│   ├── package.json
│   └── src/
│       ├── server.js
│       ├── config/       # MySQL pool and CORS configuration
│       ├── controllers/  # HTTP request handlers
│       ├── middleware/   # JWT and CORS credential handling
│       ├── models/       # SQL query functions
│       └── routes/       # Express routers
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── lib/axios.js
        ├── components/
        └── pages/
```

`backend/node_modules` and `frontend/node_modules` are installed dependencies, not project source. There is no root-level package manifest, central schema/migrations directory, or established test suite in the source inventory. The frontend README is still the generic Vite template.

## 3. Tech stack and conventions

### Frontend

- JavaScript ES modules and JSX; no TypeScript.
- React 19, Vite 7, React Router 7, Axios, Tailwind CSS 4 via the Vite plugin, Lucide icons, and `react-hot-toast`.
- The app is mounted by `frontend/src/main.jsx` inside `StrictMode` and `BrowserRouter`; page routes are declared in `frontend/src/App.jsx`.
- Styling is primarily Tailwind utility classes. `frontend/src/index.css` imports Tailwind. `App.css` contains leftover Vite starter styles and is not imported by the app entry point.
- Routing imports are mixed between `react-router` and `react-router-dom`; follow nearby code, and verify any routing changes against the installed package version.
- The shared Axios client is `frontend/src/lib/axios.js`: API base is `http://localhost:5001/api` in Vite development and `/api` otherwise. It has no configured interceptors, cookies option, or automatic token refresh.
- Frontend scripts (`cd frontend`): `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`.

### Backend

- Node.js ES modules, Express 5, and `mysql2/promise`.
- The API starts at `backend/src/server.js`, defaults to port `5001`, connects to MySQL before listening, and exits if the initial database connection fails.
- Models issue parameterized SQL queries directly; there is no ORM-based schema management. Although `mongoose` is in the backend dependencies, current persistence code uses MySQL.
- Backend scripts (`cd backend`): `npm run dev` (nodemon) and `npm start`.
- Environment variables are loaded using `dotenv`. Required names visible in source are `PORT`, `NODE_ENV`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, and `JWT_REFRESH_SECRET`. Values belong in the local environment and must not be copied into context documents or external prompts.

## 4. Frontend routes and page responsibilities

The route-to-component map is in `frontend/src/App.jsx`.

| Route | Component/file | Current responsibility |
|---|---|---|
| `/` | `frontend/src/pages/HomePage.jsx` | Landing page, navigation, product overview; reads the `user` object from local storage to render a signed-in greeting/profile state. |
| `/marketplace` | `frontend/src/pages/MarketplacePage.jsx` | Loads crops from `GET /crops`, filters by search/category, and links to crop listing/payment. |
| `/payment` | `frontend/src/pages/PaymentPage.jsx` | Demo crop-order summary; on “pay”, deletes the crop and navigates to coming soon. |
| `/register` | `frontend/src/pages/RegistrationPage.jsx` | Creates an account through the registration API. |
| `/login` | `frontend/src/pages/LoginPage.jsx` | Logs in, stores the access token and user in local storage, then navigates home. |
| `/about-us` | `frontend/src/pages/AboutUs.jsx` | Static project mission, team names, and impact figures. The displayed figures are presentation content, not queried metrics. |
| `/list-crop` | `frontend/src/pages/ListItemPage.jsx` | Form to submit a crop listing to the API. |
| `/coming-soon` | `frontend/src/pages/ComingSoon.jsx` | Placeholder screen used by unfinished/demo workflows. |
| `/knowledge` | `frontend/src/pages/KnowledgePage.jsx` | Static, searchable/category-filtered farming resource cards with external links. |
| `/equipment` | `frontend/src/pages/EquipmentsPage.jsx` | Loads equipment, searches, offers verification and buy/rent navigation. |
| `/commodity-prices` | `frontend/src/pages/RealTimePrice.jsx` | Fetches commodity records from data.gov.in in the browser and displays a small fixed crop/market selection and historical graph link. |
| `/verified-farmer` | `frontend/src/pages/VerifyEquipment.jsx` | Questionnaire that locally evaluates equipment responses and updates an equipment record. It is not a trusted backend verification workflow. |
| `/list-equipment` | `frontend/src/pages/ListEquipments.jsx` | Form to create equipment listings. |
| `/equipment-payment` | `frontend/src/pages/EquipmentPayment.jsx` | Demo buy/rent summary; both actions currently delete the equipment listing. |
| `/community-notes` | `frontend/src/pages/CommunityPage.jsx` | Fetches, searches, creates, edits, and deletes community notes. |
| `/contact-us` | `frontend/src/pages/Contact.jsx` | Static contact information and UI; no contact form/API integration is evident. |
| `/contract-farming` | `frontend/src/pages/ContractFarming.jsx` | Static sample company/contract data and search; apply action navigates to coming soon. |
| `*` | Inline in `frontend/src/App.jsx` | Simple not-found message. |

`frontend/src/components/scrollToTop.jsx` scrolls to the top when the pathname changes. The home and some other pages have their own navigation markup rather than a shared layout component.

## 5. Backend request flow and API

`backend/src/server.js` installs middleware in this order: development CORS, JSON/url-encoded parsing, cookie parser, credential header middleware, public user/refresh/notes routers, JWT verification, then protected crop/equipment routers and static frontend build serving.

### Authentication endpoints — `/api/users`

| Method and path | Handler | Behavior |
|---|---|---|
| `POST /api/users/register` | `registerUser` | Accepts `{ username, email, password }`, checks for matching email or username, hashes password with bcrypt, inserts user. |
| `POST /api/users/login` | `loginUser` | Accepts `{ email, password }`; returns `{ message, accessToken, user }`; also sets an HttpOnly `refreshToken` cookie. Access JWT lasts 15 minutes; refresh JWT lasts 7 days. |
| `POST /api/users/logout` | `logoutUser` | Expects `{ refreshToken }` in the request body and removes it from the user's stored refresh tokens. |

`GET /api/refresh` reads the refresh token cookie, checks it against the stored refresh-token list, and returns a new access token.

The frontend stores `accessToken` and serialized `user` in local storage. Protected data requests manually include the stored access token in the `Authorization` header. Login/register use hard-coded `http://localhost:5001` URLs rather than the shared Axios base URL. The home-page logout only clears the stored `user` and reloads; it does not call the logout endpoint or clear `accessToken`. No frontend refresh-token flow is wired to `GET /api/refresh`.

### Crops — `/api/crops` (JWT-protected)

| Method and path | Handler | Behavior |
|---|---|---|
| `GET /api/crops` | `getCrops` | Returns all crops ordered newest first. |
| `POST /api/crops/create` | `createCrop` | Inserts a crop from the nested payload described below. |
| `DELETE /api/crops/:id` | `deleteCrop` | Deletes a crop by ID. |

Expected create payload, based on `backend/src/models/Crops.js`:

```json
{
  "cropName": "Wheat",
  "farmerName": "Farmer name",
  "location": { "city": "Bengaluru", "state": "Karnataka" },
  "harvestedDate": "YYYY-MM-DD",
  "quantityKg": 100,
  "pricePerKg": 20,
  "contactInfo": { "phone": "phone", "email": "email" }
}
```

### Equipment — `/api/equipments` (JWT-protected)

| Method and path | Handler | Behavior |
|---|---|---|
| `GET /api/equipments` | `getAllEquipments` | Returns all equipment rows. |
| `POST /api/equipments/create` | `createEquipment` | Creates a listing. Requires name, description, owner, city/state, buy price, and rent price. |
| `PUT /api/equipments/:id` | `updateEquipment` | Replaces the row fields from the supplied data; current verification UI uses this endpoint. |
| `DELETE /api/equipments/:id` | `deleteEquipment` | Deletes the listing by ID. |

Create/update payload uses `{ name, verified, description, ownerName, location: { city, state }, buyPrice, rentPricePerDay }`.

### Community notes — `/api/notes` (currently outside the JWT middleware)

| Method and path | Handler | Behavior |
|---|---|---|
| `GET /api/notes` | `fetchNotes` | Returns all notes, newest first. |
| `GET /api/notes/:id` | Inline route handler | Returns one note or 404. |
| `POST /api/notes` | `addNote` | Requires `{ title, content, author }`; creates and returns a note. |
| `PUT /api/notes/:id` | `editNote` | Requires at least one of title/content/author; the model updates all three values from the body. |
| `DELETE /api/notes/:id` | `removeNote` | Deletes a note by ID. |

The route ordering means all notes operations are mounted before `app.use(verifyJWT)`. Do not assume note reads or writes are authenticated.

## 6. Database and data shape

The connection pool is `backend/src/config/db.js`; it requires the `DB_*` environment values and uses a MySQL pool with a maximum of 10 connections.

### Source-visible table fields

- `users`: the source expects `id`, `username`, `email`, `password`, and JSON `refreshTokens`. User SQL references these fields, but a users-table DDL/migration file was not found.
- `crops`: the `createCropTable` helper in `backend/src/models/Crops.js` declares `id`, `cropName`, `farmerName`, `city`, `state`, `harvestedDate`, `quantityKg`, `pricePerKg`, `phone`, `email`, `createdAt`, and `updatedAt`.
- `equipments`: SQL expects `id`, `name`, `verified`, `description`, `ownerName`, `city`, `state`, `buyPrice`, and `rentPricePerDay`. No DDL/migration file was found.
- `notes`: SQL expects `id`, `title`, `content`, `author`, `createdAt`, and `updatedAt`. No DDL/migration file was found.

Although a crop-table creation helper exists, no call to it was found in the server startup path. Provision the tables using a separate database setup before running the API; do not assume the server creates all tables.

### Important API/UI shape mismatch

MySQL crop and equipment selects return flat `city` and `state` fields, but the marketplace and equipment views also read `row.location.city` and `row.location.state`. SQL crop rows similarly contain `phone`/`email`, while the creation form sends nested `contactInfo`. The frontend also references image/category values that are not in the visible crop DDL. Keep the actual stored/API shape in mind when changing these pages; reconcile the contract deliberately rather than assuming rows are nested objects.

## 7. Configuration and integrations

- CORS allow-list is in `backend/src/config/allowedOrigins.js`; development CORS middleware is enabled only when `NODE_ENV !== "production"`.
- In production, the backend serves `../frontend/dist` as static files. Build the frontend before expecting it to serve the SPA assets.
- Commodity pricing is fetched directly from a data.gov.in URL by `frontend/src/pages/RealTimePrice.jsx`. The source currently embeds a query API key; do not reproduce the key in prompts or documentation, and consider moving it to configuration and rotating it before sharing/deploying.
- Knowledge links, contact details, contract-farming examples, and impact stats are embedded in frontend source; they are not backend-managed content.
- There is no integrated payment provider in the inspected source. “Payment” is a demo UI and triggers record deletion rather than a financial transaction.
- There is no image upload flow visible; marketplace cards reference image values/default image paths.

## 8. Known behavior and caveats for future changes

These are source observations, not endorsements of intended product behavior:

1. **Payment is destructive demo behavior.** Crop “payment” deletes a crop. Both equipment buy and rent delete the equipment listing. Never treat these handlers as completed commerce logic.
2. **Crop submission does not await the API call in the form handler.** `ListItemPage.jsx` can display success and navigate before the request result is known.
3. **Equipment verification is client-evaluated.** The questionnaire performs checks in the browser and then sends a broad equipment update with placeholder owner/location/price fields. The server accepts the `verified` field; there is no evidence of an admin or document-review process.
4. **Authentication differs across screens.** The crop/equipment APIs require a bearer token. Notes, registration, login, and refresh routes are mounted before JWT middleware. Some frontend API calls use the shared client; login/registration use hard-coded local API URLs.
5. **Session lifecycle is incomplete on the frontend.** A refresh endpoint exists but is not wired into the Axios client; home logout does not call backend logout and removes only `user`.
6. **Database provisioning is external.** No complete schema or migration setup is present in the source tree; create tables before running API features.
7. **SQL return shape and frontend assumptions differ.** Crop/equipment records have flat `city`/`state` columns but views use nested `location` in display/payment paths. Crop `image`/`category` are not in the visible table definition.
8. **Error and loading UX varies by page.** Some data loaders show toasts, some log errors only, and several flows do not await or render API failures consistently.
9. **No automated tests were found in the source inventory.** Existing verification is primarily the frontend build/linter; use a focused manual/API test or add tests for behavior-changing work.
10. **Treat secrets as private.** `backend/.env` exists and was intentionally not read or reproduced. Inspect only variable names/document placeholders when working on configuration. The commodity API key is also embedded in client source; avoid copying it.

## 9. Working instructions for another AI

When modifying this project:

1. Inspect the target page, its API route/controller/model, and the shared client before changing behavior. Keep backend and frontend payload shapes synchronized.
2. Preserve existing JS/JSX, ES module, React Router, Tailwind, Express, and parameterized MySQL patterns unless the task calls for a migration.
3. Do not expose `.env` contents or any API key in responses, docs, diffs, logs, or new code.
4. Do not describe a mock/demo flow as a real production feature. Confirm intended behavior with the user before replacing simulated payment, verification, or static content with external services.
5. Avoid unrelated refactors. Report schema prerequisites and required environment variable *names*, never secret values.
6. Validate frontend changes with `cd frontend; npm run build` and, where relevant, `npm run lint`. Backend has no configured test or lint script; exercise the affected endpoint and check startup/DB assumptions.

## 10. Useful source files

- Frontend route map: `frontend/src/App.jsx`
- Frontend entry point: `frontend/src/main.jsx`
- Shared API client: `frontend/src/lib/axios.js`
- Backend middleware order and API mount points: `backend/src/server.js`
- Database pool: `backend/src/config/db.js`
- Auth flows: `backend/src/controllers/usersController.js`, `backend/src/controllers/refreshController.js`
- Crop API and SQL: `backend/src/routes/cropRoutes.js`, `backend/src/controllers/cropController.js`, `backend/src/models/Crops.js`
- Equipment API and SQL: `backend/src/routes/equipmentsRoutes.js`, `backend/src/controllers/equipmentsController.js`, `backend/src/models/Equipment.js`
- Notes API and SQL: `backend/src/routes/notesRoutes.js`, `backend/src/controllers/notesController.js`, `backend/src/models/Note.js`
