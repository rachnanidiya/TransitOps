# TransitOps Frontend

A modern frontend for the TransitOps transport operations platform built with React, TypeScript, Tailwind CSS, and Shadcn UI.

## Technology Stack

- **React 18** with Vite
- **TypeScript**
- **Tailwind CSS** for styling
- **Shadcn UI** (built on Radix UI) for accessible components
- **Lucide React** for icons
- **React Router v6** for client-side routing
- **TanStack Query (React Query)** for data fetching and state management
- **Axios** for HTTP requests
- **Recharts** for data visualization
- **TanStack Table (v8)** for advanced data tables
- **React Hook Form** + **Zod** for form validation

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- The TransitOps backend running (see backend README)

### Installation

1. Clone the repository (if not already done)
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the frontend root with:
   ```
   VITE_API_URL=http://localhost:5000
   ```
   (Adjust if your backend runs on a different URL)

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` by default.

### Building for Production

```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          Page components (views)
│   ├── services/       API service configuration (Axios instance)
│   ├── store/          State management (if not using React Query)
│   ├── App.tsx         Main application router
│   ├── main.tsx       Entry point
│   └── index.css       Tailwind CSS imports
├── public/             Static assets
├── index.html          HTML template
├── package.json        Dependencies and scripts
├── tailwind.config.js  Tailwind configuration
├── postcss.config.js   PostCSS configuration
└── tsconfig.json       TypeScript configuration
```

## Features Implemented

- **Authentication**: Login page with JWT token storage
- **Dashboard**: Overview page with KPI cards (using React Query for data fetching)
- **Routing**: Protected routes requiring authentication
- **API Service**: Axios instance with automatic token attachment
- **State Management**: React Query for server state
- **Styling**: Tailwind CSS with dark mode support
- **Icons**: Lucide React for consistent iconography

## Next Steps

To complete the application, implement the following pages:

1. **Vehicle Management** (`src/pages/vehicles/`)
   - List view with create/edit/delete functionality
   - Filtering by type and status
2. **Driver Management** (`src/pages/drivers/`)
   - License expiration tracking
   - Safety score monitoring
3. **Trip Dispatching** (`src/pages/trips/`)
   - Create new trips (draft state)
   - Dispatch trips (change vehicle/driver status)
   - Complete trips (input actual distance/fuel)
4. **Maintenance & Expenses** (`src/pages/maintenance`, `src/pages/expenses`)
   - Log maintenance activities
   - Record fuel and other expenses
5. **Reports** (`src/pages/reports`)
   - Fuel efficiency analytics
   - Fleet utilization reports
   - ROI calculations
   - CSV export functionality

Each feature should follow the established patterns:
- Use React Query for data fetching/mutation
- Implement forms with React Hook Form + Zod validation
- Use Shadcn UI components for consistent UI
- Protect routes with authentication checks