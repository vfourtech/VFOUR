import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

import "./AdminSidebar.css";

const AdminSidebar = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();

        navigate("/", {
            replace: true,
        });
    };

    return (
        <aside className="admin-sidebar">

            {/* Logo */}

            <div className="admin-sidebar-brand">

                <div className="admin-sidebar-logo">
    <img src="/logo.png" alt="VFOUR" />
</div>

                <span>
                    CONTROL CENTER
                </span>

            </div>


            {/* Navigation */}

            <nav className="admin-sidebar-nav">

                <span className="admin-nav-label">
                    MANAGEMENT
                </span>


                <NavLink
                    to="/admin"
                    end
                    className={({ isActive }) =>
                        `admin-nav-link ${isActive ? "active" : ""}`
                    }
                >
                    <span className="admin-nav-icon">
                        ◇
                    </span>

                    <span>
                        Dashboard
                    </span>
                </NavLink>


                <NavLink
                    to="/admin/projects"
                    className={({ isActive }) =>
                        `admin-nav-link ${isActive ? "active" : ""}`
                    }
                >
                    <span className="admin-nav-icon">
                        □
                    </span>

                    <span>
                        Projects
                    </span>
                </NavLink>


                <NavLink
                    to="/admin/works"
                    className={({ isActive }) =>
                        `admin-nav-link ${isActive ? "active" : ""}`
                    }
                >
                    <span className="admin-nav-icon">
                        ◫
                    </span>

                    <span>
                        Our Works
                    </span>
                </NavLink>


                <NavLink
                    to="/admin/testimonials"
                    className={({ isActive }) =>
                        `admin-nav-link ${isActive ? "active" : ""}`
                    }
                >
                    <span className="admin-nav-icon">
                        “
                    </span>

                    <span>
                        Testimonials
                    </span>
                </NavLink>


                <span className="admin-nav-section-label">
                    PEOPLE
                </span>


                <NavLink
                    to="/admin/employees"
                    className={({ isActive }) =>
                        `admin-nav-link ${isActive ? "active" : ""}`
                    }
                >
                    <span className="admin-nav-icon">
                        ♙
                    </span>

                    <span>
                        Employees
                    </span>
                </NavLink>


                <span className="admin-nav-section-label">
                    ATTENDANCE
                </span>


                <NavLink
                    to="/admin/attendance"
                    className={({ isActive }) =>
                        `admin-nav-link ${isActive ? "active" : ""}`
                    }
                >
                    <span className="admin-nav-icon">
                        ◷
                    </span>

                    <span>
                        Attendance
                    </span>
                </NavLink>


                <NavLink
                    to="/admin/leaverequest"
                    className={({ isActive }) =>
                        `admin-nav-link ${isActive ? "active" : ""}`
                    }
                >
                    <span className="admin-nav-icon">
                        ▣
                    </span>

                    <span>
                        Leave Requests
                    </span>
                </NavLink>

            </nav>


            {/* Bottom */}

            <div className="admin-sidebar-bottom">

                <div className="admin-status">

                    <span className="admin-status-dot" />

                    <span>
                        SYSTEM ONLINE
                    </span>

                </div>


                <button
                    className="admin-logout-button"
                    onClick={handleLogout}
                >

                    <span>
                        ↪
                    </span>

                    LOGOUT

                </button>

            </div>

        </aside>
    );
};

export default AdminSidebar;