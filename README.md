# 🪖 Military Asset Management System

🎯 **[Live Demo](https://military-asset-management-system-nandan-main.vercel.app)**
🎥 **[Watch Working Video](https://www.loom.com/share/b0bda9f94b8a494c96b3ee92eb17d120)**


---

## 📘 Project Description

The **Military Asset Management System** is a full-stack application built to **track, manage, and audit military assets** across multiple bases.  
It provides **transparency, accountability, and efficiency** in handling **asset purchases, transfers, assignments, and expenditures** — ensuring that every item is tracked throughout its lifecycle.

---

## ⚙️ Core Features

- 🧾 **Asset Purchases:** Record new acquisitions with pricing, vendor info, and base assignment.  
- 🔄 **Asset Transfers:** Secure inter-base transfer workflow (`pending → approved → completed`).  
- 🎖️ **Asset Assignments:** Assign assets to personnel with return tracking.  
- 💥 **Asset Expenditures:** Record permanent asset usage with reason tracking.  
- 📊 **Dashboard Analytics:** Real-time stats on Opening Balance, Closing Balance, Net Movement, etc.  
- 🔐 **Unified Authentication:** Single `/api/user/auth` for login & registration.  
- 🧩 **Role-Based Access:** Admin, Base Commander, and Logistics Officer levels.

---

## 🧱 Project Structure

```
src/
├── components/          # Reusable components
│   ├── Layout.jsx      # Main layout with sidebar navigation
│   └── ProtectedRoute.jsx  # Route protection wrapper
├── contexts/           # React contexts
│   └── AuthContext.jsx # Authentication context
├── pages/              # Page components
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Purchases.jsx
│   ├── Transfers.jsx
│   ├── Assignments.jsx
│   └── Bases.jsx
├── services/           # API services
│   └── api.js          # Axios instance and API functions
├── App.jsx             # Main app component with routing
└── App.css             # Global styles
```

## 💻 How to Run Locally (Frontend)

### 🧾 Prerequisites
Make sure you have the following installed:
- **Node.js v18+**
- **npm (Node Package Manager)**

---

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/<your-username>/Military-Asset-Management-System-Frontend.git
cd Military-Asset-Management-System-Frontend
```
### 2️⃣ Setup 
```bash
npm install
```
### 3️⃣ Create a .env file inside the frontend folder
```bash
VITE_API_URL=http://localhost:5001/api
```
### 4️⃣ Start the frontend server
```bash
npm run dev
```

### 5️⃣ Open the Application
Now open your browser and visit 👉 http://localhost:5173

##🧠 Author

Nandan Kumar Mishra

📧 nandanmishra@example.com

“Designed with precision. Built for accountability.”

##🏅 License

This project is licensed under the MIT License – feel free to modify and use it.
