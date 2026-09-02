import { Outlet } from "react-router-dom";

import AdminSidebar
    from "../../components/admin/AdminSidebar";

import "./AdminLayout.css";


const AdminLayout = () => {

    return (
        <div className="admin-layout">

            <AdminSidebar />

            <main className="admin-layout-content">

                <Outlet />

            </main>

        </div>
    );
};


export default AdminLayout;