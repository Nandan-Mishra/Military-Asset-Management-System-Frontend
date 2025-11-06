# Military Asset Management System - Frontend

React frontend application for the Military Asset Management System.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   
   Create a `.env` file in the root directory:
   ```
   VITE_API_URL=http://localhost:5001/api
   ```
   
   Note: Make sure your backend is running on port 5001 (or update the URL accordingly).

3. **Start Development Server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173` (or the port shown in terminal).

## Features

- **Authentication**: Login/Register with role-based access (Admin, Base Commander, Logistics Officer)
- **Dashboard**: View key metrics (Opening Balance, Closing Balance, Net Movement, Assigned, Expended) with filters
- **Purchases**: Create and view purchase records
- **Transfers**: Create and manage asset transfers between bases
- **Assignments & Expenditures**: Track asset assignments and expenditures
- **Bases Management**: Admin-only base management (create, view, delete bases)

## Role-Based Access

- **Admin**: Full access to all features
- **Base Commander**: Access to their assigned base data
- **Logistics Officer**: Limited access to purchases and transfers

## Important Notes

1. **Assets**: Currently, assets need to be referenced by ObjectId. For purchases, transfers, and assignments, you'll need to use existing asset IDs from the backend. Consider creating assets via the backend API first or modify the backend to auto-create assets.

2. **Backend Connection**: Ensure the backend server is running and accessible at the configured `VITE_API_URL`.

3. **CORS**: Make sure your backend allows CORS requests from the frontend origin.

## Project Structure

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

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.
