# FinanceFlow - Personal Finance Management System

FinanceFlow is a modern personal finance management application that helps users manage income, expenses, debts, budgets, and financial reports efficiently. The system also integrates an AI-powered chatbot assistant to support users with financial insights and guidance. The application provides a responsive user interface with dark/light theme support and data visualization features.

---

# Member List

| Name                  | Role                                                                |
| --------------------- | ------------------------------------------------------------------- |
| Khuc Ngoc Anh         | Project Manager, Backend Developer, Assistant Frontend Developer    |
| Do Thi Phuong Thao    | Frontend Developer, Assistant Tester, Assistant Backend Developer   |
| Le Thi Khanh Linh     | UI/UX Designer / Assistant Frontend Developer / Lead Tester         |


---

# Tech Stack

| Layer            | Technology        |
| ---------------- | ----------------- |
| Frontend         | React 18 + Vite 5 |
| Backend          | Node.js + Express |
| Database         | MongoDB           |
| Authentication   | JWT               |
| State Management | Zustand           |
| Charts           | Recharts          |
| Styling          | Tailwind CSS      |
| AI Integration   | OpenAI API        |
| API Testing      | Postman           |

---

# Main Features

1. Authentication: Register, login, forgot password, change password           
2. Income Management: Add, edit, delete, and filter income transactions                   
3. Expense Management: Add, edit, delete, and search expense transactions                 
4. Debt Management: Manage debts and loans, track borrowing/lending records, due dates, and repayment progress 
5. Categories: Create and customize categories with icons and colors                         
6. Dashboard & Statistics: Financial analytics with pie charts, bar charts, and trend reports             
7. Budget Management: Set monthly budgets and receive overspending alerts                  
8. Reports: Generate and export financial reports in PDF and Excel          
9. Reminders: Bill reminders and recurring payment notifications                  
10. AI Chatbot Assistant: AI-powered chatbot for financial guidance, spending insights, and user support      
11. User Settings: Update user profile and change password               

---

# Overall Project Structure

```bash
expense-manager/
├── backend/
│   ├── node_modules/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                     # MongoDB connection
│   │   │
│   │   ├── controllers/                  # Business logic
│   │   │   ├── authController.js
│   │   │   ├── budgetController.js
│   │   │   ├── categoryController.js
│   │   │   ├── reminderController.js
│   │   │   ├── reportController.js
│   │   │   └── transactionController.js
│   │   │
│   │   ├── jobs/
│   │   │   └── reminderJob.js            # Scheduled reminder tasks
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.js                   # JWT authentication middleware
│   │   │
│   │   ├── models/                       # MongoDB schemas
│   │   │   ├── Budget.js
│   │   │   ├── Category.js
│   │   │   ├── Debt.js
│   │   │   ├── DebtTransaction.js
│   │   │   ├── Reminder.js
│   │   │   ├── Transaction.js
│   │   │   └── User.js
│   │   │
│   │   ├── routes/                       # API routes
│   │   │   ├── auth.js
│   │   │   ├── budgets.js
│   │   │   ├── categories.js
│   │   │   ├── chat.js
│   │   │   ├── debtRoutes.js
│   │   │   ├── reminders.js
│   │   │   ├── reports.js
│   │   │   ├── transactions.js
│   │   │   └── users.js
│   │   │
│   │   ├── utils/                        # Utility/helper functions
│   │   │
│   │   └── server.js                     # Backend entry point
│   │
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── node_modules/
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/
│   │   │   │   └── DebtChart.jsx
│   │   │   │
│   │   │   ├── chatbot/
│   │   │   │   ├── Chatbot.css
│   │   │   │   └── Chatbot.jsx
│   │   │   │
│   │   │   ├── layout/                   # Sidebar, Navbar, Layout
│   │   │   └── ui/                       # Reusable UI components
│   │   │
│   │   ├── pages/                        # Application pages
│   │   │   ├── Budgets.jsx
│   │   │   ├── Categories.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DebtPage.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Reminders.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── Statistics.jsx
│   │   │   └── TransactionsPage.jsx
│   │   │
│   │   ├── services/                     # API services
│   │   ├── store/
│   │   │   └── index.js                  # Zustand state management
│   │   │
│   │   ├── utils/                        # Utility functions
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── setup.sh                             
```

---

# Required Tools

Before running the project, install the following software:

* Node.js >= 18.x
* npm or yarn
* MongoDB >= 7.x
* Git
* VS Code (recommended)

---

# Environment Variable Setup

## Backend `.env`

Create a `.env` file inside the `backend/` folder using the provided `.env.example`.

```evn
PORT=5001
MONGODB_URI=mongodb://localhost:27017/expense_db
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

OPENAI_API_KEY=your-secret-openai-api-key-change-in-production
```

---

# Installation Steps

## 1. Clone Repository

```bash
git clone 
cd expense-manager
```

---

# How to Run Backend

```bash
cd backend
npm install
npm run dev
```

Backend server runs at:

```bash
http://localhost:5001
```

---

# How to Run Frontend

Open a new terminal:

```bash
cd frontend
npm install 
npm install vite
npm run dev
```

Frontend application runs at:

```bash
http://localhost:5173
```

---

# Database Setup / Migration / Seeding

## Local MongoDB

Start MongoDB locally:

```bash
mongod
```

Or use MongoDB Atlas cloud database.

---

# How to Run the Full System from a Clean Machine

## Step 1 — Install Required Software

Install:

* Node.js
* npm
* MongoDB
* Git

---

## Step 2 — Clone the Project

```bash
git clone 
cd expense-manager
```

---

## Step 3 — Configure Environment Variables

Create:

```bash
backend/.env
```

Based on:

```bash
backend/.env.example
```

---

## Step 4 — Install Dependencies

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

---

## Step 5 — Start MongoDB

```bash
mongod
```

Or connect to MongoDB Atlas.

---

## Step 6 — Run Backend Server

```bash
cd backend
npm run dev
```

---

## Step 7 — Run Frontend Application

Open another terminal:

```bash
cd frontend
npm run dev
```

---

# Demo Account

Create an account to 

---

# Security Features

* JWT authentication
* Password hashing with bcrypt
* Protected API routes
* Rate limiting
* CORS configuration
* Input validation

---

# API Endpoints

## Authentication

```bash
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/profile
PUT    /api/auth/change-password
```

## Transactions

```bash
GET    /api/transactions
POST   /api/transactions
PUT    /api/transactions/:id
DELETE /api/transactions/:id
GET    /api/transactions/stats
GET    /api/transactions/dashboard
```

## Debt Management

```bash
GET    /api/debts
POST   /api/debts
PUT    /api/debts/:id
DELETE /api/debts/:id
GET    /api/debts/stats
```

## Categories

```bash
GET    /api/categories
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id
```

## Budgets

```bash
GET    /api/budgets
POST   /api/budgets
PUT    /api/budgets/:id
DELETE /api/budgets/:id
```

## Reports

```bash
GET    /api/reports
GET    /api/reports/export/excel
GET    /api/reports/export/pdf
```

## Reminders

```bash
GET    /api/reminders
POST   /api/reminders
PUT    /api/reminders/:id
DELETE /api/reminders/:id
```

## AI Chatbot

```bash
POST   /api/chatbot
```

---

# Known Issues

* PDF export may be slower with large datasets.
* Some chart components may display differently on older browsers.
* MongoDB Atlas free tier may experience slower response times.
* AI chatbot responses depend on external API availability.
* Dark/light mode preference is stored locally in browser storage.
