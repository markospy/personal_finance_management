import { NavLink } from "react-router-dom";

interface LinkProps {
  title: string;
  to: string;
}


function Link({title, to}: LinkProps) {
  return (
    <li className="p-2 border-b-4 border-b-blue-50 rounded-xl font-semibold text-blue-900">
      <NavLink
        to={to}
        className={({ isActive, isPending }) => isPending ? "bg-blue-100" : isActive ? "bg-blue-500" : ""}
      >
          {title}
      </NavLink>
    </li>
  );
}


export const Sidebar = () => (
    <aside className="mx-auto min-w-40 max-h-fit bg-blue-100 shadow-m rounded-sm">
      <ul>
        <Link title="Accounts" to="/dashboard/accounts"/>
        <Link title="Transactions" to="/dashboard/transactions"/>
        <Link title="Budget" to="/dashboard/budget"/>
        <Link title="Categories" to="/dashboard/categories"/>
      </ul>
    </aside>
  );