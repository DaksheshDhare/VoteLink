<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Solidity-Ethereum-363636?style=for-the-badge&logo=solidity&logoColor=white" alt="Solidity" />
  <img src="https://img.shields.io/badge/MongoDB-9.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Supabase-Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
</p>

# 🗳️ VoteLink — Secure Digital Voting Platform

**VoteLink** is a full-stack, blockchain-backed digital voting platform designed for secure, transparent, and accessible elections. It combines multi-factor authentication, facial recognition, Ethereum smart contracts, and real-time monitoring to deliver a tamper-proof voting experience.

---

## ✨ Key Features

### 🔐 Multi-Layer Authentication
- **Email OTP** verification with rate limiting (5 attempts / 15 min) and 5-minute expiry
- **SMS OTP** support for mobile-based verification
- **Facial recognition** using TensorFlow.js & face-api.js for identity verification
- **Voter ID upload & verification** with OCR (Tesseract.js)
- **Aadhaar verification** support for Indian elections
- **Disability certificate** upload for accessibility accommodations

### ⛓️ Blockchain-Backed Voting
- **Ethereum smart contract** (Solidity) with OpenZeppelin security (ReentrancyGuard, AccessControl, Pausable)
- Votes are recorded on-chain with **privacy-preserving hashes** — voters don't need MetaMask; transactions are signed server-side
- **Blockchain Explorer** component for transparent vote auditing
- Automatic vote reconciliation on server startup

### 🗳️ Election Management
- **Election Creation Wizard** for admins to set up new elections
- **Ballot Designer** for customizing ballot layouts
- **Party registration** and candidate management
- **Region-based elections** with Indian state/district support
- **Real-time vote counting** and live results dashboard
- **Result publishing** controls with public/private toggle

### 📊 Monitoring & Security
- **Admin Security Dashboard** with real-time threat monitoring
- **Camera monitoring** for physical polling station oversight
- **Comprehensive audit logging** for all authentication and voting events
- **Exit polls** and analytics
- **Rate limiting** and brute-force protection across all endpoints

### 🌐 Accessibility & Internationalization
- **7 languages** supported: English, Hindi, Gujarati, Marathi, Tamil, Telugu, Bengali
- **Responsive design** with mobile-first approach
- **PWA support** with offline capabilities via Service Worker
- **Disability-friendly** interface with certificate-based accommodations

### 📄 Post-Vote Experience
- **Vote confirmation** with blockchain transaction hash
- **Downloadable voting certificate** (PDF via jsPDF + html2canvas)
- **QR code** generation for vote verification
- **"My Votes" dashboard** for voters to review their participation history

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│           React 18 + TypeScript + Vite + Tailwind CSS        │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────┐   │
│  │  Auth     │ │ Voting   │ │  Admin    │ │  UI          │   │
│  │  Login    │ │ Interface│ │ Dashboard │ │  Components  │   │
│  │  OTP     │ │ Results  │ │ Elections │ │  i18n        │   │
│  │  Face ID │ │ Confirm  │ │ Security  │ │  Responsive  │   │
│  └──────────┘ └──────────┘ └───────────┘ └──────────────┘   │
└──────────────────────┬───────────────────────────────────────┘
                       │ REST API
┌──────────────────────▼───────────────────────────────────────┐
│                       Backend                                │
│               Express.js + Node.js (Port 5000)               │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────┐   │
│  │ Auth     │ │ Voting   │ │ Blockchain│ │  Security    │   │
│  │ Service  │ │ Service  │ │ Service   │ │  Service     │   │
│  │ Email/SMS│ │ Cast     │ │ ethers.js │ │  Rate Limit  │   │
│  │ Sessions │ │ Validate │ │ Hardhat   │ │  Audit Logs  │   │
│  └────┬─────┘ └────┬─────┘ └─────┬─────┘ └──────────────┘   │
│       │             │             │                           │
└───────┼─────────────┼─────────────┼──────────────────────────┘
        │             │             │
   ┌────▼────┐  ┌─────▼────┐  ┌────▼──────────────┐
   │ Supabase│  │ MongoDB  │  │ Ethereum Network  │
   │  Auth   │  │ Database │  │ (Hardhat Local /  │
   │  OTP    │  │ Votes    │  │  Testnet)         │
   └─────────┘  │ Users    │  └───────────────────┘
                │ Sessions │
                │ Audit    │
                └──────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React Router v7 |
| **Backend** | Node.js, Express.js, Mongoose, Helmet, CORS |
| **Database** | MongoDB (primary), Supabase (auth & OTP) |
| **Blockchain** | Solidity, Hardhat, ethers.js, OpenZeppelin Contracts |
| **Auth** | Supabase Auth, JWT, bcrypt, Express Sessions |
| **AI/ML** | TensorFlow.js, face-api.js, Tesseract.js (OCR) |
| **Email** | Nodemailer (Gmail SMTP) |
| **PDF/QR** | jsPDF, html2canvas, qrcode |
| **Validation** | Joi |

---

## 📁 Project Structure

```
VOTE-LINK/
├── backend/
│   ├── authServer.js            # Express server entry point
│   ├── hardhat.config.js        # Hardhat (Ethereum) configuration
│   ├── config/
│   │   ├── database.js          # MongoDB connection & pooling
│   │   └── supabase.js          # Supabase client setup
│   ├── contracts/
│   │   └── SecureVoting.sol     # Solidity voting smart contract
│   ├── controllers/
│   │   └── userController.js    # User-related logic
│   ├── models/                  # Mongoose schemas
│   │   ├── AuditLog.js
│   │   ├── Election.js
│   │   ├── Session.js
│   │   ├── User.js
│   │   └── Vote.js
│   ├── scripts/
│   │   ├── deploy.js            # Smart contract deployment
│   │   ├── checkVotes.js        # Vote verification utility
│   │   └── resetVotingData.js   # Data reset utility
│   ├── services/
│   │   ├── blockchainVoteService.js  # On-chain vote recording
│   │   ├── emailService.js           # Email/OTP delivery
│   │   ├── securityService.js        # Security utilities
│   │   ├── sessionService.js         # Session management
│   │   └── smsOTPService.js          # SMS OTP delivery
│   └── utils/                   # API helpers & error handling
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Root component & routing
│   │   ├── components/
│   │   │   ├── auth/            # Login, Registration, OTP, Face ID, Voter ID
│   │   │   ├── voting/          # Voting interface, Results, Certificates
│   │   │   ├── admin/           # Dashboard, Election management, Security
│   │   │   └── ui/              # Navbar, Language selector, Animations
│   │   ├── services/            # API clients & business logic
│   │   ├── hooks/               # useAuth, useTranslation
│   │   ├── data/                # Indian regions, party data
│   │   ├── types/               # TypeScript type definitions
│   │   └── styles/              # CSS & animations
│   └── public/
│       ├── models/              # Face recognition ML models
│       ├── opencv/              # OpenCV cascade classifiers
│       ├── service-worker.js    # PWA offline support
│       └── offline.html
│
├── ARCHITECTURE.md              # Detailed system architecture doc
└── test_election_system.sh      # End-to-end test script
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **MongoDB** (local instance or Atlas)
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/VOTE-LINK.git
cd VOTE-LINK
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/votelink

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Session
SESSION_SECRET=your_session_secret

# Email (Gmail SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Blockchain (Hardhat)
DEPLOYER_PRIVATE_KEY=your_hardhat_private_key
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 3. Deploy the Smart Contract

```bash
# Start Hardhat local node (in a separate terminal)
npx hardhat node

# Deploy the contract
npx hardhat run scripts/deploy.js --network localhost
```

### 4. Start the Backend

```bash
npm run dev
```

The backend server will start on **http://localhost:5000**.

### 5. Frontend Setup

```bash
cd ../frontend
npm install
```

### 6. Start the Frontend

```bash
npm run dev
```

The frontend will be available at **http://localhost:5173**.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | User authentication |
| `POST` | `/api/auth/verify-otp` | OTP verification |
| `POST` | `/api/auth/biometric` | Biometric verification |
| `GET` | `/api/voter/eligibility` | Check voter eligibility |
| `POST` | `/api/vote/cast` | Cast an encrypted vote |
| `GET` | `/api/vote/certificate` | Download voting certificate |
| `GET` | `/api/results/live` | Live vote counting |
| `POST` | `/api/admin/configure` | Admin election configuration |

---

## 🔒 Security

VoteLink is built with security as a first-class concern:

- **Helmet.js** for HTTP header security
- **CORS** with credential-based whitelisting
- **Rate limiting** — 100 requests per 15 minutes per IP (configurable)
- **Email OTP rate limiting** — 5 attempts per 15 minutes
- **Session management** — 24-hour expiry with secure, httpOnly cookies
- **Input validation** — Joi schemas on all endpoints
- **bcrypt** password hashing
- **ReentrancyGuard** on the smart contract to prevent double-voting attacks
- **AccessControl** with role-based permissions (Admin, Auditor, Voter)
- **Pausable** contract for emergency stops
- **Privacy-preserving vote hashes** — votes are recorded on-chain without revealing content
- **Comprehensive audit logging** of all authentication and voting events

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# End-to-end system test
bash test_election_system.sh
```

---

## 🌍 Supported Languages

| Language | Code | Native Name |
|----------|------|-------------|
| English | `en` | English |
| Hindi | `hi` | हिंदी |
| Gujarati | `gu` | ગુજરાતી |
| Marathi | `mr` | मराठी |
| Tamil | `ta` | தமிழ் |
| Telugu | `te` | తెలుగు |
| Bengali | `bn` | বাংলা |

---

## 🗺️ Roadmap

- [ ] JWT token refresh mechanism
- [ ] Multi-chain deployment (Polygon, Arbitrum)
- [ ] Mobile app (React Native)
- [ ] Advanced biometric authentication (fingerprint)
- [ ] End-to-end encryption for vote payloads
- [ ] Containerized deployment (Docker + Kubernetes)
- [ ] CI/CD pipeline

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the **ISC License**.

---

<p align="center">
  Built with ❤️ for secure and accessible democratic elections
</p>
