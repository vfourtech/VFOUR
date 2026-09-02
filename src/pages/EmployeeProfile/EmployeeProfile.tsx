import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../lib/supabase";

import "./EmployeeProfile.css";


interface Employee {
    id: string;
    user_id: string;
    employee_id: string;
    name: string;
    email: string;
    role: string;
    department: string | null;
    profile_image: string | null;
    is_active: boolean;
}


const EmployeeProfile = () => {
    const navigate = useNavigate();


    const [employee, setEmployee] =
        useState<Employee | null>(null);

    const [authEmail, setAuthEmail] =
        useState("");

    const [loading, setLoading] =
        useState(true);


    /* =================================================
       LOAD EMPLOYEE
    ================================================= */

    useEffect(() => {

        const loadEmployee = async () => {

            try {

                setLoading(true);


                /* GET AUTHENTICATED USER */

                const {
                    data: {
                        user,
                    },
                    error: userError,
                } =
                    await supabase.auth.getUser();


                if (
                    userError ||
                    !user
                ) {

                    navigate(
                        "/employee",
                        {
                            replace: true,
                        }
                    );

                    return;
                }


                /* AUTH EMAIL */

                setAuthEmail(
                    user.email || ""
                );


                /* GET EMPLOYEE RECORD */

                const {
                    data,
                    error,
                } =
                    await supabase
                        .from("employees")
                        .select(`
                            id,
                            user_id,
                            employee_id,
                            name,
                            email,
                            role,
                            department,
                            profile_image,
                            is_active
                        `)
                        .eq(
                            "user_id",
                            user.id
                        )
                        .eq(
                            "role",
                            "employee"
                        )
                        .eq(
                            "is_active",
                            true
                        )
                        .maybeSingle();


                if (
                    error ||
                    !data
                ) {

                    console.error(
                        "Employee profile error:",
                        error
                    );

                    await supabase.auth.signOut();

                    navigate(
                        "/employee",
                        {
                            replace: true,
                        }
                    );

                    return;
                }


                setEmployee(data);

            } catch (error) {

                console.error(
                    "Profile loading error:",
                    error
                );

                navigate(
                    "/employee",
                    {
                        replace: true,
                    }
                );

            } finally {

                setLoading(false);

            }
        };


        loadEmployee();

    }, [navigate]);


    /* =================================================
       LOGOUT
    ================================================= */

    const handleLogout = async () => {

        await supabase.auth.signOut();

        navigate(
            "/employee",
            {
                replace: true,
            }
        );
    };


    /* =================================================
       LOADING
    ================================================= */

    if (loading) {

        return (
            <div className="employee-profile-loading">
                LOADING PROFILE...
            </div>
        );

    }


    if (!employee) {
        return null;
    }


    /* =================================================
       PROFILE
    ================================================= */

    return (
        <main className="employee-profile-page">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="employee-profile-sidebar">

                <div className="employee-profile-sidebar-top">

                    <div className="employee-profile-logo">
                        VFOUR
                    </div>


                    <div className="employee-profile-caption">
                        EMPLOYEE PORTAL
                    </div>


                    <nav className="employee-profile-nav">

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/employee/dashboard"
                                )
                            }
                        >
                            DASHBOARD
                        </button>


                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/employee/attendance"
                                )
                            }
                        >
                            ATTENDANCE
                        </button>


                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/employee/leave"
                                )
                            }
                        >
                            LEAVE REQUESTS
                        </button>


                        <button
                            type="button"
                            className="active"
                        >
                            PROFILE
                        </button>

                    </nav>

                </div>


                {/* SIDEBAR USER */}

                <div className="employee-profile-sidebar-bottom">

                    <div className="employee-profile-sidebar-user">

                        <div className="employee-profile-avatar-small">
                            {
                                employee.name
                                    .charAt(0)
                                    .toUpperCase()
                            }
                        </div>


                        <div className="employee-profile-user-info">

                            <strong>
                                {employee.name}
                            </strong>

                            <span>
                                {employee.employee_id}
                            </span>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="employee-profile-logout"
                        onClick={
                            handleLogout
                        }
                    >
                        <span>
                            LOG OUT
                        </span>

                        <span>
                            ↗
                        </span>
                    </button>

                </div>

            </aside>


            {/* =================================================
                MAIN
            ================================================= */}

            <section className="employee-profile-main">


                {/* HEADER */}

                <header className="employee-profile-header">

                    <span>
                        VFOUR / EMPLOYEE SYSTEM
                    </span>

                    <h1>
                        Profile
                    </h1>

                    <p>
                        Your employee account information.
                    </p>

                </header>


                {/* =================================================
                    PROFILE CARD
                ================================================= */}

                <section className="employee-profile-card">


                    {/* PHOTO */}

                    <div className="employee-profile-photo-area">

                        {employee.profile_image ? (

                            <img
                                src={
                                    employee.profile_image
                                }
                                alt={
                                    employee.name
                                }
                            />

                        ) : (

                            <div className="employee-profile-photo-placeholder">

                                {
                                    employee.name
                                        .charAt(0)
                                        .toUpperCase()
                                }

                            </div>

                        )}

                    </div>


                    {/* DETAILS */}

                    <div className="employee-profile-details">


                        <div className="employee-profile-name-block">

                            <span>
                                EMPLOYEE
                            </span>

                            <h2>
                                {employee.name}
                            </h2>

                            <p>
                                {employee.role}
                            </p>

                        </div>


                        <div className="employee-profile-info-grid">


                            {/* EMPLOYEE ID */}

                            <div>

                                <span>
                                    EMPLOYEE ID
                                </span>

                                <strong>
                                    {employee.employee_id}
                                </strong>

                            </div>


                            {/* EMAIL */}

                            <div>

                                <span>
                                    EMAIL
                                </span>

                                <strong>
                                    {authEmail || employee.email}
                                </strong>

                            </div>


                            {/* DEPARTMENT */}

                            <div>

                                <span>
                                    DEPARTMENT
                                </span>

                                <strong>
                                    {employee.department || "—"}
                                </strong>

                            </div>


                            {/* ROLE */}

                            <div>

                                <span>
                                    ROLE
                                </span>

                                <strong>
                                    {employee.role}
                                </strong>

                            </div>


                            {/* ACCOUNT STATUS */}

                            <div>

                                <span>
                                    ACCOUNT STATUS
                                </span>

                                <strong className="profile-status-active">
                                    ACTIVE
                                </strong>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    SECURITY
                ================================================= */}

                <section className="employee-profile-security">

                    <div>

                        <span>
                            ACCOUNT SECURITY
                        </span>

                        <h2>
                            Password & Access
                        </h2>

                        <p>
                            To change your password,
                            use the password recovery
                            option from the employee
                            login page.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/employee/forgot-password"
                            )
                        }
                    >

                        <span>
                            RESET PASSWORD
                        </span>

                        <span>
                            →
                        </span>

                    </button>

                </section>

            </section>

        </main>
    );
};


export default EmployeeProfile;