import { Sidebar } from "@/components/custom/slidebar";
import { Outlet} from "react-router-dom";




export const DashboardCenter = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <Sidebar />
        <>
          <Outlet/>
        </>
      </div>
    </div>
  );
};
