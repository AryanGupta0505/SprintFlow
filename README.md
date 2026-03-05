# ⚡ SprintFlow – Full Stack Fintech Payment Platform

SprintFlow is a **modern full-stack fintech payment platform** that simulates real-world **digital wallet and banking workflows** including wallet top-ups, bank withdrawals, peer-to-peer transfers, QR payments, and transaction analytics.

The project demonstrates how modern fintech systems are architected using **microservices, monorepos, and scalable backend infrastructure**.

SprintFlow replicates the core experience of **UPI-style payment systems**, enabling users to send money, scan QR codes, analyze spending patterns, and manage digital wallets through a clean, responsive interface.

---

# 🌐 Live Demo

**User Application**

👉 https://sprint-flow-sigma.vercel.app/

*(Use two accounts to test P2P transfers and wallet flows)*

---

# ✨ Core Features

## 🔐 Secure Authentication

* Phone-number based login
* Password hashing using **bcrypt**
* Session management using **NextAuth**
* Server-side session validation

---

## 💰 Digital Wallet System

* Real-time wallet balance tracking
* Automatic wallet updates after transactions
* Opening balance calculations
* Withdrawal (bank → wallet) functionality
* Deposit (wallet → bank) functionality
* Real-time Balance updates

---

## 💸 Peer-to-Peer Transfers

* Instant wallet-to-wallet payments
* Transfer money using phone numbers
* Automatic balance synchronization
* Transaction validation and failure handling

---

## 📷 QR Code Payments

* Generate personal payment QR codes
* Scan QR codes to send money instantly
* Camera-based QR scanning
* Upload QR image for payment

---

## 📊 Financial Analytics Dashboard

Interactive insights into user spending behavior:

* Monthly spending overview
* Sent vs received comparisons
* Daily transaction activity charts
* Category-based spending analysis

Built using **Recharts visualization library**.

---

## 📑 Transaction Management

* Full transaction history
* Filter and search transactions
* Transaction status tracking
* Download **PDF receipts** for payments

---

## 🔔 Notification System

* Internal notification pipeline
* Transaction success and failure alerts
* Real-time status updates

---

# 🏗 System Architecture

SprintFlow uses a **Turborepo monorepo architecture** with multiple services that simulate real fintech infrastructure.

```
SprintFlow
│
├── apps
│   ├── user-app        # Main fintech application (Next.js)
│   ├── bank-server     # Simulated bank backend API
│   ├── bank-web        # Banking payment confirmation interface
│   ├── bank-webhook    # Bank callback system for transaction processing
│   └── merchant-app    # Merchant payment dashboard (planned)
│
├── packages
│   ├── ui              # Shared UI components
│   ├── db              # Prisma database client
│   └── validation      # Shared Zod validation schemas
```

This architecture allows:

* Modular service separation
* Shared packages across applications
* Faster builds with Turborepo caching
* Scalable fintech infrastructure simulation

---

# 🔄 Payment Flow Simulation

SprintFlow replicates a **real digital payment workflow**.

```
User App
   ↓
Bank Server
   ↓
Bank Web Payment Page
   ↓
Bank Webhook
   ↓
Database Update
   ↓
Wallet Balance Updated
```

This demonstrates how **real banking APIs interact with payment gateways**.

---

# 🛠 Tech Stack

## Frontend

* **Next.js (App Router)**
* **React**
* **TypeScript**
* **TailwindCSS**
---

## Backend

* **Node.js**
* **Express**
* **Next.js Backend APIs**
* **Next.js Server Actions**

---

## Database

* **PostgreSQL**
* **Prisma ORM**

---

## Authentication

* **NextAuth**

---

## Tooling

* **Turborepo**
* **Zod Validation**
* **Axios**
* **jsPDF (PDF generation)**
* **Recharts**
* **QRCode**

---

# 🔐 Security Features

SprintFlow includes multiple security mechanisms:

* Password hashing with **bcrypt**
* Server-side session validation
* Zod schema validation
* Transaction verification checks
* Secure API request handling

---

# ⚙️ Installation

## 1️⃣ Clone the repository

```bash
git clone https://github.com/AryanGupta0505/SprintFlow.git
cd SprintFlow
```

---

## 2️⃣ Install dependencies

```
npm install
```

---

## 3️⃣ Setup environment variables

Create `.env` files where required.

Example:

```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
NEXT_PUBLIC_BANK_SERVER_URL=
NEXT_PUBLIC_BANK_WEBHOOK_URL=
NEXT_PUBLIC_BANK_WEB_URL=
```

---

## 4️⃣ Run database migrations

```
npx prisma migrate dev
```

---

## 5️⃣ Start development servers

```
npm run dev
```

---

# 🚀 Deployment

SprintFlow is deployed using modern cloud platforms:

| Service      | Platform           |
| ------------ | ------------------ |
| User App     | Vercel             |
| Bank Server  | Railway            |
| Bank Web     | Vercel             |
| Bank Webhook | Railway            |
| Database     | PostgreSQL (Cloud) |

---

# 📌 Key Concepts Demonstrated

This project demonstrates multiple **real-world fintech engineering concepts**:

* Full-stack payment architecture
* Monorepo system design
* Secure authentication systems
* QR-based payment infrastructure
* Wallet and ledger management
* Financial analytics dashboards
* Microservice-style application structure
* Cloud deployment pipelines

---

# 🎯 Project Goal

SprintFlow was built to explore **real-world fintech system architecture** and demonstrate how scalable digital payment platforms can be implemented using modern full-stack technologies.

---

# 👨‍💻 Author

**Aryan Gupta**

GitHub
https://github.com/AryanGupta0505
