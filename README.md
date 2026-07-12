# TransitOps 🚚

TransitOps is a modern, comprehensive fleet management web application designed to help transportation companies monitor, dispatch, and maintain their vehicles, drivers, and daily operations efficiently.

## Features ✨

*   **📊 Interactive Dashboard:** Get a real-time overview of fleet operations, including active vehicles, active drivers, total revenue, expenses, net profit, fleet utilization, and maintenance ratio.
*   **🚛 Vehicle Management:** Track your entire fleet (Trucks, Vans, Buses). Monitor statuses (Available, On Trip, In Shop), load capacities, acquisition costs, and current odometers.
*   **🧑‍✈️ Driver Management:** Manage your workforce, track license validities, categorize licenses (HMV, LMV), and monitor driver safety scores.
*   **🗺️ Trip Dispatching:** Plan trips between cities, dispatch vehicles with drivers, track cargo weight, planned vs actual distance, and revenue generated per trip.
*   **🔧 Maintenance Logging:** Keep your fleet healthy by scheduling and logging maintenance (Oil Changes, Tire Replacements, Engine Repairs) and tracking associated costs.
*   **💸 Expense Tracking:** Log and monitor day-to-day operational expenses like Fuel, Tolls, Driver Meals, and Permits.

## Tech Stack 🛠️

### Frontend
*   **Framework:** React (TypeScript) via Vite
*   **Styling:** Tailwind CSS (v4) with custom glassmorphism and modern UI design
*   **State Management & Data Fetching:** React Query & Axios
*   **Icons:** Lucide React

### Backend
*   **Framework:** Flask (Python)
*   **Database:** SQLite via SQLAlchemy ORM
*   **Authentication:** JWT (JSON Web Tokens) with Role-Based Access Control (RBAC)

## Getting Started 🚀

### Prerequisites
*   Node.js (v18+)
*   Python (3.8+)
*   npm or yarn

### 1. Backend Setup

1. Navigate to the root directory.
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up the database:
   ```bash
   flask db upgrade
   ```
   *(Optional)* To seed the database with realistic sample data:
   ```bash
   python seed_india.py
   ```
5. Start the Flask server:
   ```bash
   python run.py
   ```
   The backend will run on `http://localhost:5000`.

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` folder with the following content:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173`).

### 3. Default Admin Credentials

If you seeded the database using the provided seed script, you can log in using:
*   **Email:** admin@transitops.com
*   **Password:** password123

## Architecture & API 📐

All backend API routes are prefixed with `/api`.
*   `/api/auth/*` - Authentication and Login
*   `/api/vehicles/*` - CRUD operations for fleet vehicles
*   `/api/drivers/*` - CRUD operations for drivers
*   `/api/trips/*` - Trip scheduling and status updates (Draft, Dispatched, Completed)
*   `/api/maintenance/*` - Vehicle servicing records
*   `/api/expenses/*` - Operational cost tracking
*   `/api/reports/dashboard` - Aggregated metrics for the frontend dashboard

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
