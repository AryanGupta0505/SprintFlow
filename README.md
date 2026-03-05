# 🚀 SprintFlow – Full Stack Fintech Payment Platform

SprintFlow is a **modern full-stack fintech application** that enables seamless **QR-based payments, wallet management, and transaction analytics**.
It simulates the core functionality of digital payment platforms like **UPI wallets and mobile banking apps**, built using a **scalable Turborepo monorepo architecture**.

The platform allows users to **send and receive money using QR codes, manage wallet balances, view transaction history, analyze spending, and download payment receipts**, all through a clean and responsive interface.

---

# ✨ Features

## 🔐 Secure Authentication

* Phone number based authentication
* Secure password hashing with **bcrypt**
* Session management using **NextAuth**

## 💳 Wallet System

* Digital wallet with real-time balance tracking
* Opening balance calculations
* Transaction history with timestamps
* Automatic wallet updates after payments

## 📷 QR Code Payments

* Generate personal QR codes
* Scan QR codes to send money instantly
* Camera and upload-based QR scanning

## 📊 Transaction Dashboard

* Complete transaction history
* Search and filter transactions
* Download **PDF transaction receipts**

## 📈 Financial Analytics

* Spending insights using interactive charts
* Transaction summaries
* Wallet balance tracking

## 🔔 Notifications

* Internal notification pipeline
* Transaction status alerts

---

# 🏗 Architecture

SprintFlow uses a **Turborepo monorepo architecture** that separates applications and shared packages for scalability.

```
SprintFlow
│
├── apps
│   ├── user-app        # Main fintech user application
│   ├── merchant-app    # Merchant payment dashboard
│   ├── bank-server     # Dummy bank backend server
│   ├── bank-web        # Dummy banking web interface
│   └── bank-webhook    # Simulated bank transaction webhook
│
├── packages
│   ├── ui              # Shared UI component library
│   ├── db              # Prisma database client
│   └── validation      # Shared validation schemas
```

This architecture enables:

* Shared components across apps
* Faster builds using Turborepo caching
* Clear separation of services

---

# 🛠 Tech Stack

## Frontend

* **React**
* **Next.js (App Router)**
* **TypeScript**
* **TailwindCSS**
* **Reusable UI Components**

## Backend

* **Node.js**
* **Express**
* **Next.js API Routes**

## Database

* **PostgreSQL**
* **Prisma ORM**

## Authentication

* **NextAuth**

## Tooling

* **Turborepo**
* **Zod Validation**
* **Recharts (Analytics charts)**
* **QRCode (QR generation)**
* **jsPDF (PDF receipts)**

---

# 🔐 Security Features

* Password hashing using **bcrypt**
* Input validation using **Zod**
* Server-side authentication checks
* Transaction verification logic

---

# 📦 Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/AryanGupta0505/SprintFlow.git
cd SprintFlow
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Setup environment variables

Create `.env` files where required.

Example:

```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

### 4️⃣ Run database migrations

```
npx prisma migrate dev
```

### 5️⃣ Start development servers

```
npm run dev
```

---

# 📄 Key Capabilities Demonstrated

SprintFlow demonstrates:

* Full-stack fintech system design
* Monorepo architecture using Turborepo
* Secure authentication flows
* QR-based payment infrastructure
* Transaction processing systems
* Financial analytics dashboards
* PDF receipt generation
* Simulated banking integration

---

# 🎯 Project Purpose

SprintFlow was built to explore **real-world fintech architecture** and demonstrate how modern digital payment systems can be developed using **scalable full-stack technologies**.

---

# 👨‍💻 Author

**Aryan Gupta**

GitHub:
https://github.com/AryanGupta0505
