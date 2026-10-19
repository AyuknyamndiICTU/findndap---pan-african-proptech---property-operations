# FindNdap — Pan-African Proptech & Cadastral Verification Platform

**FindNdap** is a specialized Pan-African real estate management ecosystem engineered for property owners, certified brokers, and tenant communities across the CEMAC and OHADA regions (specifically Cameroon: Douala, Yaoundé, and regional hubs).

The platform bridges real-time Mobile Money rent settlements (MTN MoMo & Orange Money), cadastral land-title verification (*Titre Foncier*), direct bulk telecom SMS notifications, multi-stage maintenance work-order dispatching, and accredited broker building registration studios.

---

## 🌟 Key Application Features

1. **Interactive Landlord Mobile Operations Console**
   - **Unified Portfolio Overview**: Real-time monitoring of occupancy rates, monthly gross yield in XAF (FCFA), and rent collection progress.
   - **Automated Mobile Money Ledger**: Live reconciliation for MTN MoMo and Orange Money transactions with receipt generation, arrear alerts, and escrow locking.
   - **Telecom Bulk SMS Broadcaster**: Bilingual (EN/FR) notification engine sending payment reminders, scheduled maintenance alerts, and utility announcements directly to tenant mobile numbers.
   - **4-Stage Maintenance Triage**: Work-order progression (`Logged` ➔ `In-Review` ➔ `Dispatched` ➔ `Resolved`) with priority levels, photo verification, and certified contractor quotes.
   - **Unit Inventory Manager**: Dynamic vacancy toggles, lease terms, and rent rate adjustments.

2. **Certified Agent Network & Building Registration Studio**
   - **Anti-Fraud Cadastral Verification**: Audit against official *Titre Foncier* (TF) registry numbers, land tenure certificates, and GPS boundaries.
   - **Agent Accreditation KYC**: Broker intake capturing RCCM/NUI commercial registration, jurisdiction, and Mobile Money commission payout details.
   - **Building Publishing Studio**: Digital onboarding for residential and commercial multi-unit properties, including infrastructure amenities (borehole/forage, generator, 24/7 security, solar inverter).

3. **Developer Hub & Android App Download**
   - **Android APK Download**: Download buttons serve the real build configured in `.env` (`VITE_APK_URL`); until one is published they show "APK not available yet".
   - **Payment Webhook Simulator**: Interactive test bench (administrator only, disabled in production) simulating incoming MTN MoMo callback payloads, with copyable cURL commands for the secret-protected webhook.
   - **Live REST API Inspector**: Calls the public read endpoints and shows the JSON responses.

4. **Accounts, Persistence & Languages**
   - **Role-based logins**: A landlord/administrator account and agent accounts, configured in `.env`. Reading is public; every change requires signing in.
   - **Real certification review**: Agents upload an ID document and apply; an administrator reviews the document and approves or rejects the application.
   - **Neon Postgres database**: All data, including agent ID documents, is stored in Postgres (Neon), created and filled with demo data on first start.
   - **Ready for Vercel**: The frontend is served from Vercel's CDN and the API runs as a single Vercel Function (see [Deploying to Vercel + Neon](#-deploying-to-vercel--neon)).
   - **PDF receipts**: Downloadable rent receipts for completed payments, in English or French.
   - **English / French interface**: The EN/FR switch translates the whole interface, and server messages follow the chosen language.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 6](https://vite.dev/)
- **API Server**: [Express 4](https://expressjs.com/)
- **Database**: [Neon](https://neon.com/) serverless Postgres via [node-postgres (`pg`)](https://node-postgres.com/)
- **Hosting**: [Vercel](https://vercel.com/) (static frontend + one Node.js function for the API)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/)
- **Type Checking**: TypeScript 5.8+

---

## 📋 System Prerequisites

Before running the project locally, ensure your computer has:

- **Node.js**: Version **22** or newer
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation in your terminal:
    ```bash
    node -v
    npm -v
    ```
- **Package Manager**: `npm` (comes bundled with Node.js)
- **A Neon account** (free tier is enough): [neon.com](https://neon.com/). The app needs a Postgres database even for local development.

---

## 🚀 How to Run in Any IDE or Code Editor

Follow these simple steps after downloading and extracting the ZIP archive:

### Step 1: Extract the ZIP Archive
Extract the downloaded `.zip` file to your preferred folder (e.g., `Desktop/findndap` or `Documents/Projects/findndap`).

---

### Step 2: Open the Folder in Your IDE

#### Option A: Visual Studio Code or Cursor
1. Open **VS Code** or **Cursor**.
2. Click **File** ➔ **Open Folder...** (or press `Ctrl+O` on Windows/Linux, `Cmd+O` on macOS).
3. Select the extracted project folder.
4. *(Recommended Extensions)*:
   - **Tailwind CSS IntelliSense**
   - **ESLint**
   - **Prettier - Code formatter**

#### Option B: WebStorm or IntelliJ IDEA
1. Open **WebStorm** / **IntelliJ**.
2. Click **Open** and choose the extracted folder.
3. WebStorm will automatically detect the `package.json` file and configure Vite and TypeScript.

#### Option C: Sublime Text, Atom, or Zed
1. Launch the editor.
2. Drag and drop the folder into the editor window or select **File** ➔ **Open Folder**.

---

### Step 3: Open the Integrated Terminal

Open the terminal inside your IDE:
- In **VS Code / Cursor**: Press `` Ctrl + ` `` (or `Cmd + \`` on macOS) or navigate to **Terminal ➔ New Terminal**.
- In **WebStorm**: Click the **Terminal** tab at the bottom.
- Alternatively, open **Command Prompt**, **PowerShell**, or **macOS Terminal**, and navigate into the folder:
  ```bash
  cd path/to/extracted-folder
  ```

---

### Step 4: Install Dependencies

Run the following command to download and install all required packages:

```bash
npm install
```

*(Or if you use another package manager)*:
```bash
# Using Yarn
yarn install

# Using pnpm
pnpm install
```

---

### Step 5: Create Your Configuration (`.env`)

```bash
npm run setup
```

This copies `.env.example` to `.env`, generates a random administrator password and webhook secret, and prints the admin password **once**, so store it. It never overwrites an existing `.env` (use `npm run setup -- --force` to regenerate).

Then open `.env` and paste a Neon connection string into `DATABASE_URL`. Use a **separate Neon branch for development** so local testing never touches production data:

1. In the [Neon console](https://console.neon.tech/), open your project → **Branches** → **Create branch**, name it `dev`.
2. Select the `dev` branch → **Connect** → keep **Connection pooling** on → copy the connection string (its host contains `-pooler`).
3. Paste it into `.env`:

   ```dotenv
   DATABASE_URL="postgresql://user:password@ep-xxxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require"
   ```

Then add agent accounts if you need them:

```dotenv
AGENT_ACCOUNTS="beatrice:a-strong-password,etienne:another-password"
```

Accounts are re-read from `.env` at every start: changing a password there changes it in the app, and removing an account disables it. Passwords must be at least 8 characters.

---

### Step 6: Start the Local Full-Stack Server

Run the development command:

```bash
npm run dev
```

This starts the Express API and Vite's frontend dev server together on port **3000** (set `PORT` in `.env` to change it). On first start it creates the tables in your Neon database and fills them with demo buildings, units, payments and work-orders (set `SEED_DEMO_DATA=false` beforehand to start empty).

You will see terminal output:
```text
FindNdap Core Full-Stack Server running at http://0.0.0.0:3000
```

If an account in `.env` is invalid (for example a password shorter than 8 characters), a warning starting with `[auth]` is printed and that account is skipped. If `DATABASE_URL` is missing or wrong, the server stops with "Could not start the server" and the reason.

---

### Step 7: View the App in Your Browser

Open your web browser (Chrome, Edge, Firefox, Safari, Brave) and navigate to:
```text
http://localhost:3000
```

- **Frontend App**: Loads at `http://localhost:3000`
- **Backend Health Check**: Accessible at `http://localhost:3000/api/health`
- **Portfolio Stats API**: Accessible at `http://localhost:3000/api/stats`

---

### Step 8: Production Build & Deployment

To verify or test a standalone production build:

```bash
# 1. Build optimized frontend bundle & compile server.ts
npm run build

# 2. Launch production Node.js server
npm start
```

The production server runs from the project folder, serves the built files from `dist/`, and reads the same `.env`. To host on Vercel instead, see [Deploying to Vercel + Neon](#-deploying-to-vercel--neon). Set `VITE_APK_URL` **before** `npm run build` if you want the APK buttons enabled (it is baked into the client bundle). In production the in-browser payment simulator (`/api/momo/simulate`) is disabled.

---

## 📜 Available NPM Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| **First-time Setup** | `npm run setup` | Creates `.env` from `.env.example` with a generated admin password and webhook secret |
| **Full-Stack Dev Server** | `npm run dev` | Starts the Express API and the Vite hot-reload frontend on port 3000 |
| **Production Build** | `npm run build` | Builds the frontend into `dist/` and bundles `server.ts` into `dist/server.cjs`. On Vercel (or with `npm run build -- --vercel`) it also writes `.vercel/output` |
| **Start Production** | `npm start` | Runs the built production server (`node dist/server.cjs`) |
| **Type Check / Lint** | `npm run lint` | Runs the TypeScript compiler (`tsc --noEmit`) |
| **Clean Artifacts** | `npm run clean` | Removes the `dist/` folder |

All scripts call Node directly (no shell commands or `node_modules/.bin` shims), so they work on Windows, macOS and Linux, including from folders whose names contain `&`.

---

## 📁 Project Directory Structure

```text
findndap/
├── index.html                 # Main HTML entry point with meta tags & typography
├── package.json               # Project manifest, scripts & dependencies
├── server.ts                  # Local entry point: API + Vite dev server (npm run dev) or dist/ (npm start)
├── vercel.json                # Vercel project settings (build command; output comes from scripts/build.mjs)
├── server/
│   ├── app.ts                 # Express app: every REST API route, auth & roles, start-up (schema, seed, accounts)
│   ├── vercel.ts              # Vercel Function entry point (wraps the Express app)
│   ├── db.ts                  # Postgres (Neon) schema, first-run seeding and data access (pg)
│   ├── auth.ts                # Password hashing, .env account sync, sessions, role checks, login rate limit
│   ├── validation.ts          # Input validators, allowed values, collision-safe ids
│   ├── pdf.ts                 # Dependency-free PDF receipt generator (EN/FR)
│   └── http.ts                # English/French error and message helpers (Accept-Language)
├── scripts/
│   ├── setup-env.mjs          # `npm run setup`: creates .env with generated secrets
│   ├── build.mjs              # `npm run build`: Vite build, server bundle, and on Vercel the .vercel/output folder
│   └── clean.mjs              # `npm run clean`
├── requirements.txt           # Dependency requirements & endpoint reference list
├── tsconfig.json              # TypeScript compilation rules
├── vite.config.ts             # Vite configuration with Tailwind CSS plugin
├── .env.example               # Configuration template (database URL, accounts, secrets, APK link)
├── public/                    # Static public assets
└── src/
    ├── main.tsx               # React application entry point (wrapped in the language provider)
    ├── App.tsx                # Session, data loading from the API, modals & layout
    ├── index.css              # Global styles & Tailwind CSS @import directives
    ├── types.ts               # TypeScript data models (Building, Unit, Ticket, KYC, Auth, DashboardStats)
    ├── vite-env.d.ts          # Types for VITE_* build-time settings
    ├── i18n/                  # English/French dictionaries and the language context
    ├── data/
    │   └── mockData.ts        # Seed data written to the database on first start
    ├── services/
    │   └── api.ts             # API client: session token, language header, downloads
    ├── utils/
    │   ├── apk.ts             # Android download links from VITE_APK_* settings
    │   ├── format.ts          # Date and XAF formatting
    │   ├── smsAudience.ts     # SMS audiences shared by server and client
    │   └── useModalDismiss.ts # Escape-to-close for dialogs
    └── components/
        ├── Navbar.tsx                   # Header: language switch, sign in/out, account menu
        ├── LoginModal.tsx               # Sign-in dialog
        ├── BrandLogo.tsx                # SVG emblem (cadastral pin + house + lens)
        ├── HeroSection.tsx              # Live hero stats & badges, mobile preview, radar tab
        ├── CadastralRadarHologram.tsx   # Map of the registered buildings
        ├── LandlordWorkflowSection.tsx  # MoMo collection, bulk SMS, and work-orders
        ├── AgentCertificationSection.tsx# Certification application, review status, certified pass
        ├── AgentApprovalsPanel.tsx      # Administrator review of agent applications
        ├── DeveloperSandboxSection.tsx  # APK download, REST API Inspector & webhook simulator
        ├── TestimonialsSection.tsx      # Social proof & Pan-African trust badges
        ├── CallToActionSection.tsx      # Pre-footer engagement card
        ├── Footer.tsx                   # Legal notices, OHADA compliance, contact info
        ├── BuildingRegistrationModal.tsx# Step-by-step building & unit publishing (certified agents)
        ├── LandlordConsoleModal.tsx     # Landlord operations console (read-only unless signed in as admin)
        └── UnitPricingCard.tsx          # Rent editing, leasing and ending leases for one unit
```

---

## ⚡ Troubleshooting & FAQ

### 1. Port 3000 is already in use
If another application is using port 3000, set a different port in `.env` (for example `PORT=3005`) and restart `npm run dev`.

### 2. "Could not start the server: DATABASE_URL is not set" (or a connection error)
- Paste your Neon connection string into `DATABASE_URL` in `.env` (see Step 5). It must start with `postgresql://` and end with `?sslmode=require`.
- If Neon says the password is wrong, reset it in the Neon console (**Roles**) and copy a fresh connection string.
- On Vercel, check **Project Settings → Environment Variables** contains `DATABASE_URL` for the right environment, then redeploy.

### 3. "Sign in" fails or there is no admin account
- Check `ADMIN_PASSWORD` is set and at least 8 characters (in `.env` locally, in the Vercel project settings online), then restart or redeploy. Look for `[auth]` warnings in the terminal or in Vercel's function logs.
- After 5 failed attempts for the same username from the same IP, sign-in is blocked for 15 minutes.

### 4. Resetting the demo data
Delete and recreate the database (Neon console → your branch → **Databases**), or simply create a new Neon branch and point `DATABASE_URL` at it. Tables and demo data are recreated on the next start. This also deletes uploaded agent documents and all certification decisions.

### 5. PowerShell script execution error on Windows
If you see an error like `File ... cannot be loaded because running scripts is disabled on this system`, run:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```
Then rerun `npm install` and `npm run dev`.

### 6. Node version mismatch
Run **Node.js 22 or newer**. Check with `node -v` and update from [nodejs.org](https://nodejs.org/) if needed.

---

## 🚀 Deploying to Vercel + Neon

The app deploys to Vercel as a static frontend (served from Vercel's CDN) plus **one Node.js Vercel Function** that runs the whole Express API. All data, including agent ID documents, lives in a **Neon Postgres** database. Nothing is stored on Vercel's servers.

```text
Browser ──► Vercel CDN (dist/: HTML, JS, CSS)
        └─► /api/*  ──► Vercel Function (server/vercel.ts → Express app) ──► Neon Postgres
```

`npm run build` does everything needed. On Vercel it detects the `VERCEL` environment variable and writes the [Build Output API](https://vercel.com/docs/build-output-api) folder `.vercel/output` itself: the frontend as static files, and the API bundled with all its dependencies into a single function. `vercel.json` only tells Vercel to run that build.

### Step A: Push the code to GitHub

Vercel deploys from your Git repository. Commit and push your latest code:

```bash
git add -A
git commit -m "Prepare Vercel + Neon deployment"
git push
```

`.env` is git-ignored, so your passwords are **not** pushed. You'll enter them in Vercel in Step D.

### Step B: Import the project into Vercel

1. Sign in at [vercel.com](https://vercel.com/) (use **Continue with GitHub**).
2. Click **Add New… → Project**.
3. Find your repository in the list and click **Import**. If it's missing, click **Adjust GitHub App Permissions** and give Vercel access to it.
4. On the **Configure Project** screen:
   - **Framework Preset**: leave it as Vercel shows it (`vercel.json` sets it to *Other*).
   - **Root Directory**: leave as `./`.
   - **Build and Output Settings**: leave everything off/default (`vercel.json` sets the build command to `npm run build`).
5. **Don't click Deploy yet.** The first deploy works best once the database and variables exist. If you already clicked it, that's fine: the API will show errors until Steps C and D are done, then you redeploy (Step E).

### Step C: Create the Neon database from Vercel

1. In your new Vercel project, open the **Storage** tab.
2. Click **Create Database** (or **Connect Database → Create New**), choose **Neon** (Serverless Postgres), and click **Continue**.
   - If asked, choose **Create New Neon Account** and accept the terms. Billing goes through Vercel; the free plan is enough to start.
3. Pick a **region close to your users and to your Vercel functions**. Vercel functions run in Washington D.C. (`iad1`) by default; for Cameroon users, choose a European region such as **Frankfurt (eu-central-1)** for Neon, and set Vercel's function region to Frankfurt too (**Settings → Functions → Function Region → `fra1`**).
4. Name the database (e.g. `findndap`) and click **Create**.
5. On **Connect Project**, select your project and tick **Production**, **Preview** and **Development**, then click **Connect**.
   - Optional: under **Advanced Options**, enabling **Preview** gives every preview deployment its own copy of the database.

Vercel now has a `DATABASE_URL` environment variable pointing at Neon's pooled connection. The app reads it automatically.

### Step D: Add the app's environment variables

Open **Settings → Environment Variables** and add these. Tick **Production** and **Preview** for each. Use **different, strong passwords** from your local `.env`, and click **Save** after each one.

| Key | Value | Required |
| :--- | :--- | :--- |
| `ADMIN_PASSWORD` | A strong password, at least 8 characters (generate one with `node -e "console.log(require('crypto').randomBytes(12).toString('base64url'))"`) | Yes |
| `ADMIN_USERNAME` | e.g. `admin` (defaults to `admin`) | No |
| `AGENT_ACCOUNTS` | e.g. `beatrice:Strong-Pass-1,etienne:Strong-Pass-2` | No |
| `MOMO_WEBHOOK_SECRET` | A long random string (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) | For the payment webhook |
| `SEED_DEMO_DATA` | `false` to start with an empty database instead of the demo buildings and payments | No |
| `VITE_APK_URL` / `VITE_APK_VERSION` | The real Android app link, once you have one | No |

You don't need `PORT` or `DATABASE_URL` here: Vercel ignores the first and Step C already set the second.

### Step E: Deploy

- If you haven't deployed yet, go back to the project and click **Deploy**.
- If you already deployed, open **Deployments**, click **⋯** on the latest one and choose **Redeploy**. Variables are only picked up by new deployments.

When the build finishes, open the site URL (e.g. `https://findndap.vercel.app`). On the **first request** the API creates the tables, loads the demo data (unless `SEED_DEMO_DATA=false`) and creates the accounts. That first request takes a few seconds longer.

### Step F: Check it works

1. Open `https://<your-site>/api/health`. It should show `{"status":"ok",…}`.
2. Open the site, click **Sign in**, and log in as the admin you set in Step D.
3. If something fails, open the Vercel project → **Logs** (or **Deployments → the deployment → Functions**). Start-up problems are logged with `[auth]` or `[api]` prefixes, or as "DATABASE_URL is not set".

### After deployment

- **Every `git push` deploys automatically**: pushes to the main branch go to production, other branches get preview URLs.
- **Changing accounts or passwords**: edit the variables in **Settings → Environment Variables**, then **Redeploy**. Accounts sync from the variables when each new function instance starts; a removed account is disabled immediately and its sessions are revoked.
- **Changing `VITE_APK_URL`** also needs a redeploy, because it is built into the frontend.
- **Your local `npm run dev`** keeps using the `DATABASE_URL` in `.env`. Point it at a separate Neon branch (Step 5 above) so testing never changes production data. To pull the Vercel variables into a local file instead, use the [Vercel CLI](https://vercel.com/docs/cli/env): `npx vercel env pull .env.development.local`.

### Limits to know about

- **Agent ID documents are limited to 3 MB**: Vercel rejects requests larger than 4.5 MB, and a file grows by about a third when uploaded. Documents are stored in the database.
- **The in-browser payment simulator** in the Developer Hub is disabled on production deployments. Real payments arrive through `POST /api/momo/webhook` (with `X-Webhook-Secret`).
- **Function time limit**: API requests are limited to 30 seconds (set in `scripts/build.mjs`); normal requests take well under a second.

---

## 📱 Mobile App API Reference & Configuration Guide

FindNdap features a built-in, production-ready full-stack Express REST API (`server.ts`) directly integrated with the application. This API provides live data, dynamically recomputed portfolio analytics, and automated ledger operations that can be linked to any mobile application (React Native, Flutter, Swift/iOS, or Kotlin/Android).

---

### 1. Mobile Client Base URL Configuration

When configuring your mobile application client, set the `API_BASE_URL` depending on your testing runtime:

| Testing Environment | Base URL | Notes |
| :--- | :--- | :--- |
| **Android Studio Emulator** | `http://10.0.2.2:3000` | `10.0.2.2` maps directly to your host machine's `localhost` |
| **iOS Simulator** | `http://localhost:3000` | Shared networking with macOS host |
| **Physical Android / iOS Handset** | `http://<YOUR_COMPUTER_LAN_IP>:3000` | e.g. `http://192.168.1.120:3000`. Both phone and computer must be on the same Wi-Fi network. |
| **Cloud Run / Production** | `https://your-domain.com` | Production URL with SSL/HTTPS |

> **Android Cleartext Traffic Note:**
> For local HTTP testing on Android (API 28+), ensure your `AndroidManifest.xml` has:
> ```xml
> <application
>     android:usesCleartextTraffic="true"
>     ... >
> ```

---

### 2. Complete REST API Endpoints Catalog

All endpoints return and accept JSON payloads with standard HTTP status codes (`200`, `201`, `400`, `401`, `403`, `404`, `409`, `429`, `500`, `503`). Invalid input is rejected with `400` and a JSON body of the form `{ "success": false, "error": "<reason>" }`.

**Authentication & roles.** All `GET` endpoints (except the agent/admin ones below) are public. Every other request needs a session token from `POST /api/auth/login`, sent as `Authorization: Bearer <token>`:
- **Admin** (landlord/administrator): units, payments, work-orders, SMS, payment simulator, agent approvals.
- **Agent**: their own certification application; registering buildings once certified.

Missing or expired token → `401`; wrong role → `403`. Tokens last 12 hours and can be revoked with `POST /api/auth/logout`.

**Language.** Send `Accept-Language: fr` to receive error and confirmation messages in French (English otherwise).

#### 0. Authentication

##### `POST /api/auth/login`
- **Request Body**: `{ "username": "admin", "password": "…" }`
- **Response**: `{ "token": "<64 hex chars>", "expiresAt": "<ISO date>", "user": { "id", "username", "role" }, "agentKYC": <agent's certification record, or null for admins> }`
- Wrong credentials → `401`. After 5 failures for the same username from the same IP, further attempts get `429` for 15 minutes.

##### `POST /api/auth/logout`
- Revokes the token sent in the `Authorization` header.

##### `GET /api/auth/me`
- Returns the signed-in `user` and, for agents, their `agentKYC` record. `401` if the token is missing or expired.

#### A. System & Real-Time Analytics

##### `GET /api/health`
- **Description**: Returns backend service health, version, and server uptime.
- **Sample Response**:
  ```json
  {
    "status": "ok",
    "service": "FindNdap Cadastral & Proptech Core API",
    "version": "1.4.2",
    "uptimeSeconds": 142.5,
    "timestamp": "2026-09-09T03:40:00.000Z"
  }
  ```

##### `GET /api/mobile/config`
- **Description**: Retrieves dynamic configuration for the mobile client, including active payment gateways and endpoint maps.
- **Sample Response**:
  ```json
  {
    "appName": "FindNdap Mobile",
    "version": "1.4.2",
    "environment": "staging-sandbox",
    "currency": "XAF",
    "momoGatewayStatus": "ONLINE",
    "orangeMoneyGatewayStatus": "ONLINE"
  }
  ```

##### `GET /api/stats`
- **Description**: Computes and returns dynamic real-time portfolio statistics calculated directly from active buildings, units, and transactions.
- **Sample Response**:
  ```json
  {
    "totalBuildings": 3,
    "totalUnits": 5,
    "occupiedUnits": 3,
    "availableUnits": 2,
    "underMaintenanceUnits": 0,
    "occupancyRate": 60.0,
    "totalMonthlyRevenueXAF": 1430000,
    "collectedRevenueXAF": 1070000,
    "pendingArrearsXAF": 220000,
    "collectionRatePercent": 74.8,
    "collectedUnitsCount": 2,
    "pendingArrearsUnitsCount": 1,
    "activeTicketsCount": 2,
    "resolvedTicketsCount": 1,
    "certifiedAgentsCount": 1,
    "recentTransactionsCount": 4,
    "lastUpdated": "2026-09-09T03:40:00.000Z"
  }
  ```

---

#### B. Buildings & Properties

##### `GET /api/buildings`
- **Description**: Returns the list of registered properties with cadastral *Titre Foncier* references, amenities, and revenue figures. `totalUnits`, `availableUnits`, `occupancyRate` and `monthlyRevenueXAF` (rent of occupied units) are always computed live from the units registry, here and in `GET /api/buildings/:id`.

##### `GET /api/buildings/:id`
- **Description**: Retrieves full details for a specific building, including all nested units.

##### `POST /api/buildings` (agent)
- **Description**: Registers a new building with unit configurations.
- **Rules**:
  - Only a signed-in agent whose certification an administrator approved (`403` otherwise). `registeredBy` is set by the server from the agent's certification; ids are generated by the server.
  - `name` and `cadastreNumber` are required; a `cadastreNumber` that is already registered returns `409`.
  - `propertyType` must be `Residential Complex`, `Commercial`, `Mixed Use` or `Student Residence`.
  - Each unit needs a `unitNumber` (unique within the building) and a positive `rentAmountXAF`; `status` must be `Available`, `Occupied` or `Under Maintenance`.
  - Unit counts, occupancy and revenue are derived from `units` (any values sent are ignored); missing `amenities` default to `[]`.
- **Request Body**:
  ```json
  {
    "building": {
      "name": "Résidence La Grace",
      "cadastreNumber": "TF-DLA/2024/77812",
      "city": "Douala",
      "neighborhood": "Bonamoussadi",
      "propertyType": "Residential Complex",
      "totalUnits": 8,
      "availableUnits": 2,
      "monthlyRevenueXAF": 2400000,
      "occupancyRate": 75,
      "amenities": ["Borehole (Forage)", "Standby Genset", "24/7 Security Guard"]
    },
    "units": [
      {
        "unitNumber": "Apt 1",
        "type": "2 Bedroom Modern",
        "rentAmountXAF": 300000,
        "status": "Available"
      }
    ]
  }
  ```

---

#### C. Units & Occupancy

##### `GET /api/units?buildingId={id}&status={status}`
- **Description**: Lists rental units with optional query filters by `buildingId` and `status` (`Available`, `Occupied`, `Under Maintenance`).

##### `PATCH /api/units/:id` (admin)
- **Description**: Updates unit status, rent pricing, tenant identity, or outstanding balance.
- **Rules**:
  - `status` must be `Available`, `Occupied` or `Under Maintenance`; `rentAmountXAF` must be positive and `balanceDueXAF` non-negative.
  - `tenantPhone`, if sent, must be a Cameroon mobile number.
  - Marking a unit `Occupied` requires a `tenantName` (sent now or already on the unit).
  - Marking a unit `Available` ends the lease and clears `tenantName`/`tenantPhone`; it is refused with `409` while `balanceDueXAF` is above zero.
- **Request Body**:
  ```json
  {
    "status": "Occupied",
    "rentAmountXAF": 320000,
    "tenantName": "Emmanuel Nono",
    "tenantPhone": "+237 699 11 22 33",
    "balanceDueXAF": 0
  }
  ```

---

#### D. Financial Ledger & Mobile Money Settlements

##### `GET /api/transactions`
- **Description**: Lists all reconciled and escrow-locked financial records.

##### `POST /api/transactions` (admin)
- **Description**: Records a rent settlement from MTN MoMo or Orange Money, automatically reconciling the corresponding unit's arrears.
- **Rules**: a positive `amountXAF` is required, plus `tenantName` unless `unitId` points to a leased unit (the tenant, building and unit are then taken from the unit); `method` must be `MTN MoMo` or `Orange Money`; `status` must be `Completed`, `Escrow_Locked` or `Arrears`.
- **Unit matching**: Unit numbers repeat across buildings, so the unit is resolved by `unitId` when given, otherwise by exact `buildingName` + `unitNumber`, narrowed by `tenantName` if still ambiguous. If no single unit matches, the payment is recorded but no arrears are reconciled.
- **Request Body**:
  ```json
  {
    "unitId": "u-102",
    "tenantName": "Sophie Ebanda",
    "buildingName": "Résidence Le Cristal",
    "unitNumber": "Apt 102",
    "amountXAF": 450000,
    "method": "Orange Money",
    "txRef": "OM-CMR-8472910"
  }
  ```

##### `POST /api/momo/webhook`
- **Description**: Callback receiver for MTN MoMo & Orange Money telecom webhooks. Automatically processes payment notifications, settles arrears, and updates the dynamic ledger.
- **Authentication**: Requires an `X-Webhook-Secret` header matching the server's `MOMO_WEBHOOK_SECRET` environment variable (compared in constant time). Missing or wrong secret → `401`. If `MOMO_WEBHOOK_SECRET` is not set, every request is rejected with `503`.
- **Rules**: `amount` must be a positive number (`400` otherwise). The unit is matched the same way as `POST /api/transactions` (`unitId`, or `buildingName` + `unitReference`, then `tenantName`); `reconciledUnit` in the response is `null` when no single unit matches.
- **Request Body**:
  ```json
  {
    "event": "payment.received",
    "amount": 300000,
    "currency": "XAF",
    "payerMsisdn": "+237671223344",
    "unitReference": "Apt 101",
    "buildingName": "Résidence Le Cristal",
    "tenantName": "Dr. Jean-Marc Bella",
    "transactionRef": "MOMO-LIVE-948120"
  }
  ```

##### `POST /api/momo/simulate` (admin)
- **Description**: Development-only twin of `/api/momo/webhook` used by the in-browser Developer Sandbox. Requires an admin session instead of the webhook secret, accepts the same body and performs the same reconciliation. Returns `404` in production builds.

##### `GET /api/transactions/:id/receipt?lang=en|fr`
- **Description**: Downloads an official PDF receipt for a `Completed` payment (`409` for escrow or arrears records). `lang` defaults to the `Accept-Language` header.

---

#### E. Maintenance & Work-Orders

##### `GET /api/tickets`
- **Description**: Retrieves all maintenance work-orders.

##### `POST /api/tickets` (admin)
- **Description**: Creates a new maintenance ticket reported by tenant or landlord.
- **Rules**: give `unitId` (building, unit and tenant are filled in from it) or `buildingName` + `unitNumber`; `description` is required; `category` must be `Plumbing`, `Electrical`, `Generator`, `Security` or `Masonry`; `urgency` must be `Low`, `Medium`, `High` or `Emergency`.
- **Request Body**:
  ```json
  {
    "buildingName": "Les Terrasses d’Akwa",
    "unitNumber": "Suite 204",
    "tenantName": "Christian Mbia",
    "category": "Electrical",
    "description": "Generator automatic changeover switch delay",
    "urgency": "High"
  }
  ```

##### `PATCH /api/tickets/:id` (admin)
- **Description**: Advances ticket status (`Logged` ➔ `In-Review` ➔ `Dispatched` ➔ `Resolved`), assigns a certified contractor vendor, and updates final repair costs. Unknown `status` values or a negative `costXAF` return `400`.

---

#### F. Bulk SMS Broadcasts

##### `GET /api/sms`
- **Description**: Fetches the dispatch history of bulk announcements sent to tenants.

##### `POST /api/sms` (admin)
- **Description**: Records a bulk SMS broadcast and its recipient count. **Messages are not yet sent to a real SMS provider**; connecting one is still to do.
- **Targets**: `all`, `arrears` (tenants with a balance due), or `building:<buildingId>`; the audience label (e.g. `All Building Tenants`) is also accepted, and `target` defaults to `all`. `recipientCount` is the number of tenants in that audience with a phone number on file. Unknown targets, empty audiences, and blank `title`/`message` return `400`.
- **Request Body**:
  ```json
  {
    "title": "Scheduled Generator Maintenance",
    "message": "Dear tenants, routine genset servicing will take place on Saturday from 10:00 to 12:00. - FindNdap Ops",
    "target": "building:bld-001"
  }
  ```

---

#### G. Agent Accreditation & KYC

##### `GET /api/agent/kyc` (agent)
- **Description**: Returns the signed-in agent's certification record (`status`: `unverified`, `in-review`, `certified` or `rejected`, plus `badgeId` and the reviewer's `reviewNote`).

##### `POST /api/agent/kyc` (agent)
- **Description**: Submits (or updates) a certification application. It always goes to `in-review`; agents can never certify themselves. Certified agents get `409` (an administrator must revoke first).
- **Rules**: `fullName`, `agencyName`, `licenseId` (*RCCM/NUI*) and `city` are required; `momoNumber` must be a Cameroon mobile number (9 digits starting with `6`, optional `+237`). An ID document is required on the first submission: `document: { name, mimeType, dataBase64 }` with `mimeType` `application/pdf`, `image/jpeg` or `image/png`, at most 3 MB (Vercel caps request bodies at 4.5 MB); the file's content must match its type.

##### `GET /api/admin/agents` (admin)
- **Description**: Lists all applications, those awaiting review first.

##### `GET /api/admin/agents/:userId/document` (admin)
- **Description**: Downloads the applicant's uploaded ID document.

##### `POST /api/admin/agents/:userId/review` (admin)
- **Request Body**: `{ "decision": "approve" | "reject", "note": "…" }`
- **Rules**: only applications `in-review` can be approved (a `FND-CERT-YYYY-XXXXXX` badge is issued); rejecting requires a `note` and also works on certified agents (revocation).

---

### 3. Mobile App Client Integration Code Snippets

#### React Native / Expo (TypeScript)
```typescript
// services/api.ts
import axios from 'axios';
import { Platform } from 'react-native';

const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3000', // Android Emulator
  ios: 'http://localhost:3000',     // iOS Simulator
  default: 'http://192.168.1.100:3000' // Physical device (replace with your LAN IP)
});

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000
});

export const fetchDashboardStats = async () => {
  const response = await apiClient.get('/stats');
  return response.data;
};
```

#### Flutter (Dart)
```dart
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

class FindNdapApi {
  static String get baseUrl {
    if (Platform.isAndroid) return 'http://10.0.2.2:3000/api';
    return 'http://localhost:3000/api';
  }

  static Future<Map<String, dynamic>> getStats() async {
    final response = await http.get(Uri.parse('$baseUrl/stats'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load portfolio stats');
  }
}
```

---

## 📝 System Modifications & Change Log

This section details all architectural enhancements, feature implementations, and system modifications integrated into the **FindNdap** codebase.

---

### 1. Full-Stack Architecture Transition (`server.ts` & `package.json`)
- **Node.js + Express Backend Layer**:
  - Implemented `server.ts` to transform the application from a purely client-side static prototype into a complete **Full-Stack Proptech Platform**.
  - Mounted Vite middleware in development mode for instantaneous TypeScript compilation, with automated static fallback in production (`dist/index.html`).
- **Production-Grade Compilation Pipeline**:
  - Configured `package.json` scripts:
    - `"dev": "tsx server.ts"` — runs the Express TypeScript server natively with hot-reloading.
    - `"build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs"` — pre-bundles the backend into a clean CommonJS binary, eliminating runtime ES module path resolution errors.
    - `"start": "node dist/server.cjs"` — provides a zero-dependency production entry point.
- **Universal CORS & Emulator Support**:
  - Enabled unrestricted cross-origin headers (`*`) on all API routes, allowing Android Studio Emulators (`10.0.2.2`), iOS Simulators (`localhost`), and physical test handsets on local Wi-Fi networks to connect directly without CORS blocking.

---

### 2. Dynamic Real-Time Portfolio Statistics Engine (`/api/stats`)
- **Elimination of Hardcoded Statistics**:
  - Replaced static placeholder numbers in the UI with a live mathematical computation function (`computeStats()`).
- **Real-Time Portfolio Math**:
  - **Occupancy Rate**: `(occupiedUnits / totalUnits) * 100` re-evaluated immediately when unit statuses change.
  - **Live Rent Ledger**: Aggregates all completed MoMo/Orange Money transactions against monthly potential gross yield.
  - **Outstanding Arrears**: Calculates exact unpaid balance across occupied units (`balanceDueXAF`).
  - **Work-Order SLAs**: Computes the ratio of active vs. resolved contractor work-orders.
  - **Accredited Broker Network**: Reflects verified broker count from the agent KYC registry.

---

### 3. Comprehensive REST API Suite for Web & Mobile
Implemented a full suite of REST endpoints in `server.ts` serving both the web management dashboard and companion mobile applications:
- **`GET /api/health`**: Telemetry endpoint returning server uptime, API version (`1.4.2`), and service status.
- **`GET /api/mobile/config`**: Dynamic mobile configuration delivering telecom gateway states (MTN MoMo & Orange Money: `ONLINE`) and endpoint mappings.
- **`GET /api/stats`**: Live recomputed portfolio metrics.
- **`GET /api/buildings` & `POST /api/buildings`**: Property listing and creation with cadastral *Titre Foncier* references and infrastructure amenities.
- **`GET /api/units` & `PATCH /api/units/:id`**: Unit directory with query filtering (`buildingId`, `status`) and real-time status/pricing updates.
- **`GET /api/transactions` & `POST /api/transactions`**: Mobile money rent transaction recorder that automatically clears corresponding tenant unit arrears.
- **`POST /api/momo/webhook`**: Telecom payment callback receiver (protected by the `X-Webhook-Secret` header) that processes incoming payment callbacks and triggers instant ledger reconciliation.
- **`POST /api/momo/simulate`**: Development-only, unauthenticated payment simulator used by the Developer Sandbox (disabled in production).
- **`GET /api/tickets` & `POST /api/tickets` & `PATCH /api/tickets/:id`**: 4-stage maintenance dispatching lifecycle (`Logged` ➔ `In-Review` ➔ `Dispatched` ➔ `Resolved`).
- **`GET /api/sms` & `POST /api/sms`**: Direct telecom gateway bulk SMS dispatcher for tenant announcements.
- **`GET /api/agent/kyc` & `POST /api/agent/kyc`**: Broker accreditation intake capturing license IDs (*RCCM/NUI*) and MoMo payout accounts.
- **`POST /api/agent/toggle-demo`**: Rapid QA toggle switching between Certified and Uncertified broker states to test gatekeeper locks.

---

### 4. Unified Client API Service (`src/services/api.ts`)
- Created a robust frontend API client layer utilizing the native browser `fetch` API.
- Implemented structured error handling and graceful fallbacks to preserve UI functionality during network interruptions.
- Provides type-safe promise methods for all CRUD operations, webhook simulations, and dynamic stats retrieval.

---

### 5. Hero Section Dynamic Data Synchronization (`src/components/HeroSection.tsx`)
- Updated `HeroSection.tsx` to receive live dashboard statistics via the `stats` prop.
- Replaced static markup with live data:
  - Total property count and active unit counts.
  - Live occupancy percentage badge.
  - Live collected revenue in XAF (FCFA) with an animated status indicator.
  - Dynamic progress bar reflecting actual collection percentage.
  - Units collected vs. units pending arrears counts.
  - Maintenance triage turnaround and resolved ticket counts.

---

### 6. Interactive Developer Hub & Live API Inspector (`src/components/DeveloperSandboxSection.tsx`)
- **Live REST API Inspector**:
  - Integrated an interactive endpoint test bar directly into the Developer Sandbox.
  - Landlords and developers can click endpoint buttons (`/api/stats`, `/api/buildings`, `/api/units`, `/api/transactions`, `/api/tickets`, `/api/mobile/config`) to execute live HTTP requests and view formatted JSON responses inside an in-browser code viewer.
- **Live MoMo Webhook Callback Simulator**:
  - The webhook simulation button dispatches a real HTTP `POST` request to the dev-only `/api/momo/simulate` route (the production `/api/momo/webhook` requires the `X-Webhook-Secret` header, which must never be shipped to the browser).
  - Reconciles outstanding arrears on unit `Apt 101` in real time, displays server confirmation, and notifies parent components to refresh portfolio figures.

---

### 7. Physical Android Staging APK Generator (`src/utils/apkGenerator.ts`) — removed in 12
- Engineered a client-side binary APK builder generating a valid ZIP-compliant archive format.
- Packages essential Android bundle assets including `AndroidManifest.xml` (configured with `usesCleartextTraffic`), `classes.dex`, `resources.arsc`, and FindNdap launcher metadata.
- Enables property managers and mobile engineers to click **"Download APK"** and receive an immediate physical file download (`FindNdap-Mobile-v1.4.2-staging.apk`) with verified SHA-256 integrity checksums.

---

### 8. Cadastral Integrity & Broker Gatekeeper Controls (`src/App.tsx`)
- Synchronized top-level application state (`buildings`, `units`, `transactions`, `tickets`, `agentKYC`, `stats`) with the backend API upon initial render.
- Linked modal actions (building registration, ticket status advancement, rent payments, KYC submission) to backend endpoints.
- Maintained strict anti-fraud rules: unaccredited brokers cannot publish buildings until their *Titre Foncier* and commercial license (*RCCM*) credentials pass accreditation audit.

---

### 9. Environment & Documentation Hardening
- **`.env.example`**: Documented all server port settings (`PORT=3000`), mobile money webhook secrets, and bulk SMS telecom gateway URLs.
- **`requirements.txt`**: Added runtime requirements, startup commands, and REST endpoint references.
- **`README.md`**: Enriched with mobile emulator networking setup (`10.0.2.2`), Android cleartext network security guidelines, React Native and Flutter integration code samples, and this comprehensive modification log.

---

### 10. Modern UI Motion Detection, 3D Perspective Tilt & Holographic Interactivity
In response to modern high-end web design references with fluid motion, cursor tracking, and 3D effects:
- **Atmospheric Ambient Cursor Glow (`src/components/CursorGlowFollower.tsx`)**:
  - Engineered a smooth, hardware-accelerated ambient light orb following cursor movement across the viewport with desktop pointer detection (`pointer: coarse` filtering for mobile battery preservation).
  - Dynamic reticle pulse when hovering interactive buttons, links, or clickable components.
- **Physics-Based 3D Perspective Tilt Engine (`src/components/FuturisticTiltCard.tsx`)**:
  - Computes real-time angular tilt (`rotateX` and `rotateY`) based on cursor coordinates relative to the card's center.
  - Implements dynamic specular glare spotlight reflection tracking mouse position via high-resolution radial gradients.
  - Generates holographic border glows, laser sweep lines, and preserves 3D depth (`transform-style: preserve-3d`) enabling inner elements to physically float with outward Z-axis elevation (`translateZ`).
- **3D Cadastral Radar Hologram HUD (`src/components/CadastralRadarHologram.tsx`)**:
  - Interactive 3D satellite radar display tracking real cadastral property nodes across Douala (Bonanjo, Akwa), Yaoundé (Bastos), and Kribi.
  - Continuous 360° rotating radar sweep beam (`animate-radar`) with pulsing cadastral beacons.
  - Responsive mouse motion detection that dynamically tilts the radar in 3D perspective and highlights the nearest property title (*Titre Foncier*).
  - Live telemetry readout with GPS coordinates, MINDCAF satellite sync status (99.8%), and active unit counts.
- **Multi-Layered Floating 3D Badges (`src/components/FloatingHolographicBadge.tsx`)**:
  - Floating badges that break out of card and smartphone boundaries with smooth floating drift keyframes and 3D parallax depth (e.g., *TF-DLA/2024/77812 Verified*, *MTN MoMo +250,000 XAF Reconciled*, *GPS 4.0511°N*).
- **Interactive View Switcher in Hero Section (`src/components/HeroSection.tsx`)**:
  - Allows landlords and developers to switch between the **3D Mobile Operations Hub** and the **3D Cadastral Radar HUD**.
  - Dynamic ambient spotlight tracking mouse motion across the entire hero canvas.
- **Workflow & Sandbox 3D Upgrades**:
  - Integrated 3D tilt cards, laser sweeps, and floating interactive pills across the 4 landlord workflow pillars in `LandlordWorkflowSection.tsx` and the developer sandbox in `DeveloperSandboxSection.tsx`.

---

### 11. High-Tech Cybernetic Visual System Upgrade (Video Aesthetic Overhaul)
Inspired by cutting-edge interactive product showcases (Zenith, CSWatch, Vibram, and holographic hardware):
- **Streamlined Holographic Telemetry Badges (`src/components/FloatingHolographicBadge.tsx`)**:
  - Crisp, frosted glass floating chips (*Titre Foncier Sync*, *MoMo Instant Settlement*, *GPS Satellite Geo-Lock*) cleanly positioned around the card perimeter with zero obstruction to core UI contents.
- **Glowing Cybernetic Portal Ring (`src/components/GlowingPortalRing.tsx`)**:
  - Multi-concentric neon rings pulsing behind the central interactive smartphone and radar consoles.
  - Dual counter-rotating energy arcs (`spin-clockwise` and `spin-counter-clockwise`) with radial lens flares and cyber-grid alignment.
- **Airborne Levitation Physics & Dynamic Ground Shadow (`src/index.css`)**:
  - Smooth zero-gravity vertical hovering keyframe (`animate-levitate`) applied to the main 3D presentation cards.
  - Mathematically synchronized elliptical ground shadow (`animate-levitate-shadow`) that scales down and diffuses when the card elevates, creating realistic spatial altitude.
- **Massive Typographic Watermarks**:
  - Monumental outlined display lettering (`FINDNDAP` and `CADASTRAL TRUST NETWORK`) seamlessly embedded into the hero background using custom stroke utilities (`text-outline-stroke-dark` / `text-outline-stroke-light`).
- **Persistent Glassmorphic HUD Dock (`src/components/FuturisticHudDock.tsx`)**:
  - Floating bottom navigation deck featuring frosted glass backdrop blur, live network latency indicator (`18ms`), quick jumping to Agent Portal, Landlord Console, and Developer Sandbox.
  - One-click trigger for the 3D Cadastral Radar HUD and instant Dark/Light futuristic theme switching.
- **Precision HUD Reticles (`hudCorners`)**:
  - Stylized technical corner brackets framing the 3D tilt cards for an authentic cyber-tactical interface look.

---

### 12. Accounts, Persistence, Real Certification, Receipts & Bilingual Interface
- **SQLite persistence** *(replaced by Neon Postgres in 13)*: all data is stored in `data/findndap.db` and survives restarts; demo data is seeded only into an empty database. Record ids are now random (`tx-3f9a1c0b7e2d`) instead of time-based, and timestamps are stored as ISO dates.
- **Role-based logins** (`server/auth.ts`): an administrator account and agent accounts configured in `.env`; scrypt password hashing, 12-hour session tokens (stored hashed), login rate limiting. Reads stay public; every write requires the right role.
- **Real certification**: agents upload a PDF/JPG/PNG ID document (type checked against the file's content) and apply; administrators review the document and approve (badge issued) or reject with a reason in the console's new *Agent Approvals* tab. The demo certification toggle, "Reset Demo State", the pre-certified demo agent and the fake quick-fill document were removed.
- **Console**: read-only for visitors; new work-order form; real PDF receipts (`GET /api/transactions/:id/receipt`); payments recorded against a unit's id.
- **Live data everywhere**: the hero badges and the radar map use the registered buildings and payments; the fake "Avg SLA", broker counts, APK sizes and download counters were removed. Collection rate is capped at 100%.
- **Android APK**: the fake generated file was removed; download buttons use `VITE_APK_URL` and say "APK not available yet" until a real build is published.
- **English/French**: the EN/FR switch translates the whole interface; server messages follow the chosen language (`Accept-Language`).
- **Accessibility**: Escape closes dialogs, the hero phone card works with the keyboard, icon-only dock buttons have labels, and account avatars show initials instead of a stock photo.
- **Tooling**: `npm run setup` creates `.env` with generated secrets; all npm scripts call Node directly so they work on every OS and in folders containing `&`; `npm start` now really runs in production mode.

---

### 13. Vercel + Neon Deployment
- **Postgres instead of SQLite** (`server/db.ts`): the app now uses Neon serverless Postgres through `pg` with a small connection pool, as Neon recommends for Vercel Fluid compute (`attachDatabasePool` from `@vercel/functions` closes idle connections before a function is suspended). `DATABASE_URL` replaces `DATA_DIR`; `better-sqlite3` was removed.
- **Safe start-up on many instances**: schema creation, first-run demo seeding (`SEED_DEMO_DATA`) and account sync run under a Postgres advisory lock, so serverless instances starting at the same time never conflict. Uniqueness (Titre Foncier, unit numbers, usernames) is enforced by the database; racing duplicates get `409`.
- **Nothing on disk**: agent ID documents are stored in the database (`BYTEA`) with a 3 MB limit (Vercel's request limit is 4.5 MB); login rate limiting is stored in the database so it holds across instances.
- **App split for serverless**: `server/app.ts` builds the Express API, `server/vercel.ts` exposes it as a Vercel Function, and `server.ts` stays the local entry point. `scripts/build.mjs` writes the Vercel Build Output (`.vercel/output`) with the API bundled into one self-contained file, avoiding Vercel's per-file tracing of TypeScript imports.
- **Docs**: click-by-click Vercel + Neon deployment guide above; `.env.example` now documents `DATABASE_URL`.

---

## 🔒 Legal & Compliance Standards
- **Cadastral Title (*Titre Foncier*) Verification**: Structured to enforce verified land registration standards across Cameroon (MINDCAF guidelines).
- **Digital Leases & Financial Records**: Conforms to the **OHADA Uniform Act on General Commercial Law** and CEMAC digital banking protocols.

---

&copy; 2025–2026 FindNdap Inc. All rights reserved.

