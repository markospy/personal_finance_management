import { NavLink } from "react-router-dom";


export const Sidebar = () => (
    <aside className="w-64 bg-white shadow-md">
      <ul>
        <li className="p-4 border-b">
          <NavLink
            to="/dashboard/accounts"
            className={({ isActive, isPending }) => isPending ? "bg-blue-200" : isActive ? "bg-blue-500" : ""}
          >
              Accounts
          </NavLink>
        </li>
        <li className="p-4 border-b">
          <NavLink
            to="/dashboard/budget"
            className={({ isActive, isPending }) => isPending ? "bg-blue-200" : isActive ? "bg-blue-500" : ""}
          >
              Budget
          </NavLink>
        </li>
        <li className="p-4 border-b">
          <NavLink
            to="/dashboard/expenses"
            className={({ isActive, isPending }) => isPending ? "bg-blue-200" : isActive ? "bg-blue-500" : ""}
          >
              Expenses
          </NavLink>
        </li>
        <li className="p-4 border-b">
          <NavLink
            to="/dashboard/incomes"
            className={({ isActive, isPending }) => isPending ? "bg-blue-200" : isActive ? "bg-blue-500" : ""}
          >
              Incomes
          </NavLink>
        </li>
        <li className="p-4 border-b">
          <NavLink
            to="/dashboard/categories"
            className={({ isActive, isPending }) => isPending ? "bg-blue-200" : isActive ? "bg-blue-500" : ""}
          >
              Categories
          </NavLink>
        </li>
      </ul>
    </aside>
  );