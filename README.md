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

3. **Developer Hub & Android Staging APK Generator**
   - **Direct Sideload APK Download**: Instant browser-triggered download of `FindNdap-Mobile-v1.4.2-staging.apk` with verified SHA-256 package checksums.
   - **Payment Webhook Simulator**: Interactive test bench simulating incoming MTN MoMo callback payloads with copyable cURL commands.
   - **Release Candidate Channels**: Early access to v1.5.0-rc builds and staging changelogs.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 6](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/)
- **Type Checking**: TypeScript 5.8+

---

## 📋 System Prerequisites

Before running the project locally, ensure your computer has:

- **Node.js**: Version **18.x**, **20.x**, or newer (LTS recommended)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation in your terminal:
    ```bash
    node -v
    npm -v
    ```
- **Package Manager**: `npm` (comes bundled with Node.js), `yarn`, `pnpm`, or `bun`

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

# Using Bun
bun install
```

---

### Step 5: Start the Local Full-Stack Server

Run the development command:

```bash
npm run dev
```

This single command executes `tsx server.ts`, which boots up both the Express backend API engine and Vite's frontend server simultaneously on port **3000**.

You will see terminal output:
```text
FindNdap Core Full-Stack Server running at http://0.0.0.0:3000
```

---

### Step 6: View the App in Your Browser

Open your web browser (Chrome, Edge, Firefox, Safari, Brave) and navigate to:
```text
http://localhost:3000
```

- **Frontend App**: Loads at `http://localhost:3000`
- **Backend Health Check**: Accessible at `http://localhost:3000/api/health`
- **Portfolio Stats API**: Accessible at `http://localhost:3000/api/stats`

---

### Step 7: Production Build & Deployment

To verify or test a standalone production build:

```bash
# 1. Build optimized frontend bundle & compile server.ts
npm run build

# 2. Launch production Node.js server
npm start
```

---

## 📜 Available NPM Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| **Full-Stack Dev Server** | `npm run dev` | Boots up the unified Express API server & Vite hot-reload frontend on port 3000 |
| **Production Build** | `npm run build` | Compiles frontend static assets to `/dist` and bundles `server.ts` to `dist/server.cjs` via esbuild |
| **Start Production** | `npm start` | Launches the compiled standalone Node.js production server (`node dist/server.cjs`) |
| **Type Check / Lint** | `npm run lint` | Runs the TypeScript compiler (`tsc --noEmit`) to validate all types with zero errors |
| **Preview Static** | `npm run preview` | Spins up Vite's built-in preview server for client files |
| **Clean Artifacts** | `npm run clean` | Removes prior `dist` builds |

---

## 📁 Project Directory Structure

```text
findndap/
├── index.html                 # Main HTML entry point with meta tags & typography
├── package.json               # Project manifest, scripts, dependencies & build pipeline
├── server.ts                  # Full-stack Express server, REST API endpoints & Vite middleware
├── requirements.txt           # Dependency requirements & endpoint reference list
├── tsconfig.json              # TypeScript compilation rules
├── vite.config.ts             # Vite configuration with Tailwind CSS plugin
├── .env.example               # Template environment variables (Port, Gateway API keys)
├── public/                    # Static public assets
└── src/
    ├── main.tsx               # React application entry point
    ├── App.tsx                # Master state controller, API hydration & layout coordinator
    ├── index.css              # Global styles & Tailwind CSS @import directives
    ├── types.ts               # TypeScript data models (Building, Unit, Ticket, KYC, DashboardStats)
    ├── data/
    │   └── mockData.ts        # Seed data (Douala/Yaoundé properties, units, ledgers)
    ├── services/
    │   └── api.ts             # Unified API client service for Web & Mobile applications
    ├── utils/
    │   └── apkGenerator.ts    # Binary APK buffer generator & download trigger
    └── components/
        ├── Navbar.tsx                   # Glassmorphic header with live telemetry & quick actions
        ├── BrandLogo.tsx                # SVG emblem (cadastral pin + house + lens)
        ├── HeroSection.tsx              # Dynamic hero stats, live ledger badge & mobile preview
        ├── LandlordWorkflowSection.tsx  # MoMo collection, bulk SMS, and work-orders
        ├── AgentCertificationSection.tsx# Cadastral audit requirements & KYC form
        ├── DeveloperSandboxSection.tsx  # Real APK download, REST API Inspector & Webhook simulator
        ├── TestimonialsSection.tsx      # Social proof & Pan-African trust badges
        ├── CallToActionSection.tsx      # Pre-footer engagement card
        ├── Footer.tsx                   # Legal notices, OHADA compliance, contact info
        ├── BuildingRegistrationModal.tsx# Step-by-step building & unit publishing studio
        └── LandlordConsoleModal.tsx     # Full interactive mobile operations simulator
```

---

## ⚡ Troubleshooting & FAQ

### 1. Port 3000 is already in use
If another application is using port 3000:
- Vite will automatically suggest an alternate port (e.g. `http://localhost:3001`).
- Or you can run:
  ```bash
  npx vite --port 5173
  ```

### 2. PowerShell script execution error on Windows
If you see an error like `File ... cannot be loaded because running scripts is disabled on this system`:
Run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```
Then rerun `npm install` and `npm run dev`.

### 3. Node version mismatch
Ensure you are running **Node.js v18 or higher**. Check with `node -v`. If you have an older version, update it from [nodejs.org](https://nodejs.org/) or switch using `nvm`:
```bash
nvm use 20
```

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

All endpoints return and accept JSON payloads with standard HTTP status codes (`200`, `201`, `400`, `404`, `500`).

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
- **Description**: Returns the list of registered properties with cadastral *Titre Foncier* references, amenities, and revenue figures.

##### `GET /api/buildings/:id`
- **Description**: Retrieves full details for a specific building, including all nested units.

##### `POST /api/buildings`
- **Description**: Registers a new building with unit configurations.
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

##### `PATCH /api/units/:id`
- **Description**: Updates unit status, rent pricing, tenant identity, or outstanding balance.
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

##### `POST /api/transactions`
- **Description**: Records a rent settlement from MTN MoMo or Orange Money, automatically reconciling the corresponding unit's arrears.
- **Request Body**:
  ```json
  {
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
- **Request Body**:
  ```json
  {
    "event": "payment.received",
    "amount": 300000,
    "currency": "XAF",
    "payerMsisdn": "+237671223344",
    "unitReference": "Apt 101",
    "tenantName": "Dr. Jean-Marc Bella",
    "transactionRef": "MOMO-LIVE-948120"
  }
  ```

##### `POST /api/momo/simulate`
- **Description**: Unauthenticated, development-only twin of `/api/momo/webhook` used by the in-browser Developer Sandbox. Accepts the same body and performs the same reconciliation. Returns `404` when `NODE_ENV=production`.

---

#### E. Maintenance & Work-Orders

##### `GET /api/tickets`
- **Description**: Retrieves all maintenance work-orders.

##### `POST /api/tickets`
- **Description**: Creates a new maintenance ticket reported by tenant or landlord.
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

##### `PATCH /api/tickets/:id`
- **Description**: Advances ticket status (`Logged` ➔ `In-Review` ➔ `Dispatched` ➔ `Resolved`), assigns a certified contractor vendor, and updates final repair costs.

---

#### F. Bulk SMS Broadcasts

##### `GET /api/sms`
- **Description**: Fetches the dispatch history of bulk announcements sent to tenants.

##### `POST /api/sms`
- **Description**: Dispatches a bulk SMS broadcast via the telecom gateway.
- **Request Body**:
  ```json
  {
    "title": "Scheduled Generator Maintenance",
    "message": "Dear tenants, routine genset servicing will take place on Saturday from 10:00 to 12:00. - FindNdap Ops",
    "target": "All Building Tenants"
  }
  ```

---

#### G. Agent Accreditation & KYC

##### `GET /api/agent/kyc`
- **Description**: Retrieves the active broker's accreditation profile.

##### `POST /api/agent/kyc`
- **Description**: Submits or updates broker accreditation details with official license IDs (*RCCM/NUI*).

##### `POST /api/agent/toggle-demo`
- **Description**: Toggles between Certified and Uncertified broker mode for rapid UI testing and QA demonstrations.

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

### 7. Physical Android Staging APK Generator (`src/utils/apkGenerator.ts`)
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

## 🔒 Legal & Compliance Standards
- **Cadastral Title (*Titre Foncier*) Verification**: Structured to enforce verified land registration standards across Cameroon (MINDCAF guidelines).
- **Digital Leases & Financial Records**: Conforms to the **OHADA Uniform Act on General Commercial Law** and CEMAC digital banking protocols.

---

&copy; 2025–2026 FindNdap Inc. All rights reserved.

