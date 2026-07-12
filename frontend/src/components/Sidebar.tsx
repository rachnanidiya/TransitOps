import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <aside className="hidden md:block w-64 bg-gray-800 text-white">
      <div className="px-4 py-6 border-b">
        <h1 className="text-xl font-bold">TransitOps</h1>
      </div>
      <nav className="mt-6 space-y-1">
        <NavLink
          to="/"
          end
          className={(props) => `
            flex items-center px-3 py-2 rounded-md text-sm font-medium
            ${props.isActive ? 'bg-indigo-600' : 'hover:bg-gray-700'}
          `}
        >
          <DashboardIcon className="mr-4 h-5 w-5" />
          Dashboard
        </NavLink>

        <NavLink
          to="/vehicles"
          className={(props) => `
            flex items-center px-3 py-2 rounded-md text-sm font-medium
            ${props.isActive ? 'bg-indigo-600' : 'hover:bg-gray-700'}
          `}
        >
          <TruckIcon className="mr-4 h-5 w-5" />
          Vehicles
        </NavLink>

        <NavLink
          to="/drivers"
          className={(props) => `
            flex items-center px-3 py-2 rounded-md text-sm font-medium
            ${props.isActive ? 'bg-indigo-600' : 'hover:bg-gray-700'}
          `}
        >
          <UsersIcon className="mr-4 h-5 w-5" />
          Drivers
        </NavLink>

        <NavLink
          to="/trips"
          className={(props) => `
            flex items-center px-3 py-2 rounded-md text-sm font-medium
            ${props.isActive ? 'bg-indigo-600' : 'hover:bg-gray-700'}
          `}
        >
          <MapPinIcon className="mr-4 h-5 w-5" />
          Trips
        </NavLink>

        <NavLink
          to="/maintenance"
          className={(props) => `
            flex items-center px-3 py-2 rounded-md text-sm font-medium
            ${props.isActive ? 'bg-indigo-600' : 'hover:bg-gray-700'}
          `}
        >
          <WrenchIcon className="mr-4 h-5 w-5" />
          Maintenance
        </NavLink>


        <NavLink
          to="/expenses"
          className={(props) => `
            flex items-center px-3 py-2 rounded-md text-sm font-medium
            ${props.isActive ? 'bg-indigo-600' : 'hover:bg-gray-700'}
          `}
        >
          <PiggyBankIcon className="mr-4 h-5 w-5" />
          Expenses
        </NavLink>

        <NavLink
          to="/reports"
          className={(props) => `
            flex items-center px-3 py-2 rounded-md text-sm font-medium
            ${props.isActive ? 'bg-indigo-600' : 'hover:bg-gray-700'}
          `}
        >
          <ChartBarIcon className="mr-4 h-5 w-5" />
          Reports
        </NavLink>
      </nav>
    </aside>
  );
};

// Simple icon components
const DashboardIcon = ({ className }: { className?: string }) => <svg className={className || "h-5 w-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7V5a2 2 0 012-2h2"/><path d="M17 3h4a2 2 0 012 2v2"/><path d="M7 21v-2a2 2 0 012-2h2"/><path d="M15 17h4a2 2 0 002-2v-2"/><path d="M3 12a8 8 0 018-8v8z"/></svg>;
const TruckIcon = ({ className }: { className?: string }) => <svg className={className || "h-5 w-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 7h.0100.012M7 7l5 5m0 0a2 2 0 001.414.586l1.293.293a2 2 0 001.415-.586M7 7v4a2 2 0 002 2h4"/><path d="M11 9V5a2 2 0 012-2h2a2 2 0 012 2v4"/></svg>;
const UsersIcon = ({ className }: { className?: string }) => <svg className={className || "h-5 w-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 000-7.75"/></svg>;
const MapPinIcon = ({ className }: { className?: string }) => <svg className={className || "h-5 w-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 8l-6-6-2.5 2.5-.62 1.06-1.06.62 2.5 2.5-6 6Z"/><circle cx="11" cy="11" r="3"/></svg>;
const WrenchIcon = ({ className }: { className?: string }) => <svg className={className || "h-5 w-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15.363 6.363l1.414 1.414M18.364 9.364l1.414 1.414M13.354 13.354l-1.414 1.414M18.364 9.364V14M15 11h3M15 11l-1.606 1.606"/></svg>;
const PiggyBankIcon = ({ className }: { className?: string }) => <svg className={className || "h-5 w-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2c2.21 0 4 1.79 4 4v1h4a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 012-2h4V6c0-2.21 1.79-4 4-4z"/><circle cx="12" cy="13" r="3"/></svg>;
const ChartBarIcon = ({ className }: { className?: string }) => <svg className={className || "h-5 w-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="4" x2="12" y2="20"/><line x1="8" y1="8" x2="8" y2="20"/><line x1="16" y1="12" x2="16" y2="20"/></svg>;

export default Sidebar;