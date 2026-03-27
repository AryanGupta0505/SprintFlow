# ⚡ SprintFlow – Full Stack Fintech Payment Platform

SprintFlow is a **modern full-stack fintech payment platform** that simulates real-world **digital wallet and banking workflows** including wallet top-ups, bank withdrawals, peer-to-peer transfers, QR payments, payment requests, and transaction analytics.

The project demonstrates how modern fintech systems are architected using **monorepos, microservice-style services, idempotent transaction systems, and event-driven workflows**.

SprintFlow replicates the core experience of **UPI-style payment systems**, enabling users to send money, scan QR codes, request payments, analyze spending patterns, and manage digital wallets through a clean, responsive interface.

---

# 🌐 Live Demo

**User Application**

👉 https://sprintflow-rmhh.onrender.com

*(Use two accounts to test P2P transfers and payment request flows)*

---

# ✨ Core Features

## 🔐 Secure Authentication

- Phone-number based login  
- Password hashing using **bcrypt**  
- Session management using **NextAuth**  
- Secure server-side session validation  
- Protected API routes  

---

## 💰 Digital Wallet System

- Real-time wallet balance tracking  
- Automatic balance updates after transactions  
- Opening balance calculations  
- Wallet top-ups via simulated bank  
- Wallet withdrawals to bank  
- Ledger-style wallet accounting  

---

## 💸 Peer-to-Peer Transfers

- Instant wallet-to-wallet payments  
- Transfer money using phone numbers  
- Atomic balance updates  
- Failure-safe transaction handling  
- Automatic transaction records  

---

## 📷 QR Code Payments

- Generate personal payment QR codes  
- Scan QR codes to send money instantly  
- Camera-based QR scanning  
- Upload QR images for payment  
- Seamless wallet payment integration  

---

## 💳 Payment Request System

A full **request-to-pay flow similar to UPI collect requests**.

Users can:

- Request money from another user  
- View incoming payment requests  
- Approve or decline requests  
- Automatically process payment after approval  
- Track request status *(pending / accepted / declined)*  

This introduces a **new payment flow beyond simple transfers**, simulating real fintech request-based payments.

---

## 📊 Financial Analytics Dashboard

Interactive insights into user spending behavior.

Features include:

- Monthly spending overview  
- Sent vs received transaction comparison  
- Daily transaction activity charts  
- Category-based financial insights  

Built using **Recharts visualization library**.

---

## 📑 Transaction Management

- Complete transaction history  
- Transaction status tracking  
- Transaction lifecycle monitoring  
- Search and filter transactions  
- Download **PDF payment receipts**

---

## 🔔 Real-Time Notification System

A real-time notification infrastructure that alerts users about financial events.

Examples include:

- Payment success notifications  
- Failed transaction alerts  
- Payment request notifications  
- Security alerts  
- Real-time UI updates using **WebSockets**

---

# 🏦 Simulated Banking Infrastructure

SprintFlow includes a **mock banking system** that replicates real banking payment flows.

Features include:

- Simulated bank payment approval interface  
- Bank API server  
- Bank webhook callbacks  
- Payment status verification  
- External service communication  

This demonstrates how **real fintech systems interact with external banking providers**.

---

# 🔄 Transaction Lifecycle & Idempotency

SprintFlow implements a **robust transaction lifecycle system**:

```
Initiated  
↓  
Processing  
↓  
Bank Authorization  
↓  
Webhook Confirmation  
↓  
Completed / Failed  
```

Additional safeguards include:

- **Idempotent transactions** to prevent duplicate payments  
- Safe retry mechanisms  
- Transaction validation before execution  
- Atomic database operations  

These patterns are commonly used in **real payment gateways and fintech platforms**.

---

# 🏗 System Architecture

SprintFlow uses a **Turborepo monorepo architecture** with multiple services.

```
SprintFlow
│
├── apps
│   ├── user-app        # Main fintech application (Next.js)
│   ├── bank-server     # Simulated bank API server
│   ├── bank-web        # Bank payment approval interface
│   ├── bank-webhook    # Webhook processor for transaction confirmations
│   └── merchant-app    # Merchant dashboard (planned)
│
├── packages
│   ├── ui              # Shared UI components
│   ├── db              # Prisma database client
│   └── validation      # Shared Zod validation schemas
```

Benefits of this architecture:

- Shared code between services  
- Faster builds using **Turborepo caching**  
- Modular backend services  
- Scalable fintech infrastructure simulation  

---

# 🔄 Payment Flow Simulation

SprintFlow replicates how **real digital payment systems interact with banking infrastructure**.

```
User App
   ↓
Bank Server API
   ↓
Bank Web Payment Interface
   ↓
Bank Webhook Callback
   ↓
Database Update
   ↓
Wallet Balance Updated
   ↓
User Notification
```

This demonstrates **event-driven financial transaction systems**.

---

# 🛠 Tech Stack

## Frontend

- **Next.js (App Router)**  
- **React**  
- **TypeScript**  
- **TailwindCSS**

---

## Backend

- **Node.js**  
- **Express**  
- **Next.js Backend APIs**  
- **Server Actions**

---

## Database

- **PostgreSQL**  
- **Prisma ORM**

---

## Authentication

- **NextAuth**

---

## Tooling & Libraries

- **Turborepo**  
- **Zod (Schema Validation)**  
- **Axios**  
- **Recharts**  
- **QRCode**  
- **jsPDF**  
- **WebSockets**

---

# 🔐 Security Features

SprintFlow implements multiple fintech-grade security mechanisms.

- Password hashing using **bcrypt**  
- Server-side session validation  
- Strict API input validation using **Zod**  
- Transaction verification logic  
- Idempotent payment protection  
- Secure webhook handling  

---

# ⚙️ Installation

## 1️⃣ Clone the repository

```bash
git clone https://github.com/AryanGupta0505/SprintFlow.git
cd SprintFlow
```

---

## 2️⃣ Install dependencies

```bash
npm install
```

---

## 3️⃣ Setup environment variables

Create `.env` files where required.

Example configuration:

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

```bash
npx prisma migrate dev
```

---

## 5️⃣ Start development servers

```bash
npm run dev
```

---

# 🚀 Deployment

SprintFlow is deployed using modern cloud platforms.

| Service | Platform |
|--------|---------|
| User App | Render |
| Bank Server | Render |
| Bank Web | Vercel |
| Bank Webhook | Render |
| Database | PostgreSQL (Cloud) |

---

# 📌 Key Engineering Concepts Demonstrated

SprintFlow demonstrates multiple **real-world fintech engineering concepts**:

- Digital wallet architecture  
- Peer-to-peer payment infrastructure  
- QR-based payment systems  
- Payment request flows  
- Transaction lifecycle management  
- Idempotent transaction handling  
- Real-time notification systems  
- Event-driven backend workflows  
- Monorepo system design  
- Microservice-style architecture  
- Financial analytics dashboards  
- Cloud-native deployment  

---

# 🎯 Project Goal

SprintFlow was built to explore **real-world fintech system architecture** and demonstrate how scalable digital payment platforms can be implemented using modern full-stack technologies.

---

# 👨‍💻 Author

**Aryan Gupta**

GitHub  
https://github.com/AryanGupta0505