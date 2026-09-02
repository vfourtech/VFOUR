import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../lib/supabase";

import "./EmployeeAttendance.css";


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


interface AttendanceRecord {
    id: string;
    date: string;
    check_in: string | null;
    check_out: string | null;
    working_hours: string | null;
    status: string;
}


const EmployeeAttendance = () => {

    const navigate = useNavigate();


    /* =================================================
       STATE
    ================================================= */

    const [employee, setEmployee] =
        useState<Employee | null>(null);

    const [attendance, setAttendance] =
        useState<AttendanceRecord[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [monthFilter, setMonthFilter] =
        useState(
            new Date().toISOString().slice(0, 7)
        );

    const [statusFilter, setStatusFilter] =
        useState("All");


    /* =================================================
       LOAD EMPLOYEE + ATTENDANCE
    ================================================= */

    useEffect(() => {

        const loadData = async () => {

            try {

                setLoading(true);


                const {
                    data: {
                        user,
                    },
                } =
                    await supabase.auth.getUser();


                if (!user) {

                    navigate(
                        "/employee",
                        {
                            replace: true,
                        }
                    );

                    return;
                }


                const {
                    data: employeeData,
                    error: employeeError,
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
                    employeeError ||
                    !employeeData
                ) {

                    await supabase.auth.signOut();

                    navigate(
                        "/employee",
                        {
                            replace: true,
                        }
                    );

                    return;
                }


                setEmployee(
                    employeeData
                );


                const {
                    data: attendanceData,
                    error: attendanceError,
                } =
                    await supabase
                        .from("attendance")
                        .select(`
                            id,
                            date,
                            check_in,
                            check_out,
                            working_hours,
                            status
                        `)
                        .eq(
                            "employee_id",
                            employeeData.id
                        )
                        .order(
                            "date",
                            {
                                ascending: false,
                            }
                        );


                if (attendanceError) {

                    console.error(
                        attendanceError
                    );

                    return;
                }


                setAttendance(
                    (attendanceData as AttendanceRecord[]) || []
                );

            } catch (error) {

                console.error(
                    "Attendance page error:",
                    error
                );

            } finally {

                setLoading(false);

            }
        };


        loadData();

    }, [navigate]);


    /* =================================================
       FILTERED RECORDS
    ================================================= */

    const filteredAttendance =
        useMemo(() => {

            return attendance.filter(
                (record) => {

                    const matchesMonth =
                        record.date.startsWith(
                            monthFilter
                        );


                    const matchesStatus =
                        statusFilter === "All" ||
                        record.status === statusFilter;


                    return (
                        matchesMonth &&
                        matchesStatus
                    );

                }
            );

        }, [
            attendance,
            monthFilter,
            statusFilter,
        ]);


    /* =================================================
       STATISTICS
    ================================================= */

    const presentCount =
        filteredAttendance.filter(
            (record) =>
                record.status === "Present"
        ).length;


    const halfDayCount =
        filteredAttendance.filter(
            (record) =>
                record.status === "Half Day"
        ).length;


    const absentCount =
        filteredAttendance.filter(
            (record) =>
                record.status === "Absent"
        ).length;


    const leaveCount =
        filteredAttendance.filter(
            (record) =>
                record.status === "Leave"
        ).length;


    /* =================================================
       FORMAT DATE
    ================================================= */

    const formatDate = (
        date: string
    ) => {

        return new Date(
            `${date}T00:00:00`
        ).toLocaleDateString(
            [],
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );

    };


    /* =================================================
       FORMAT TIME
    ================================================= */

    const formatTime = (
        value: string | null
    ) => {

        if (!value) {
            return "--";
        }


        return new Date(
            value
        ).toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        );

    };


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
            <div className="employee-attendance-loading">
                LOADING ATTENDANCE...
            </div>
        );

    }


    if (!employee) {
        return null;
    }


    /* =================================================
       PAGE
    ================================================= */

    return (

        <main className="employee-attendance-page">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="employee-attendance-sidebar">

                <div>

                    <div className="employee-attendance-logo">
                        VFOUR
                    </div>


                    <div className="employee-attendance-caption">
                        EMPLOYEE PORTAL
                    </div>


                    <nav className="employee-attendance-nav">


                        {/* DASHBOARD */}

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


                        {/* ATTENDANCE */}

                        <button
                            type="button"
                            className="active"
                        >
                            ATTENDANCE
                        </button>


                        {/* LEAVE REQUESTS */}

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


                        {/* PROFILE */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/employee/profile"
                                )
                            }
                        >
                            PROFILE
                        </button>


                    </nav>

                </div>


                {/* =================================================
                    USER
                ================================================= */}

                <div>

                    <div className="employee-attendance-user">

                        <div className="employee-attendance-avatar">

                            {employee.name
                                .charAt(0)
                                .toUpperCase()}

                        </div>


                        <div>

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
                        className="employee-attendance-logout"
                        onClick={handleLogout}
                    >

                        LOG OUT

                        <span>
                            ↗
                        </span>

                    </button>

                </div>

            </aside>


            {/* =================================================
                CONTENT
            ================================================= */}

            <section className="employee-attendance-main">


                {/* HEADER */}

                <header className="employee-attendance-header">

                    <div>

                        <span>
                            VFOUR / EMPLOYEE SYSTEM
                        </span>


                        <h1>
                            Attendance
                        </h1>


                        <p>
                            View your complete attendance
                            history and monthly records.
                        </p>

                    </div>

                </header>


                {/* =================================================
                    FILTERS
                ================================================= */}

                <section className="employee-attendance-filters">


                    <div className="employee-filter">

                        <label htmlFor="attendance-month">
                            MONTH
                        </label>


                        <input
                            id="attendance-month"
                            type="month"
                            value={monthFilter}
                            onChange={(event) =>
                                setMonthFilter(
                                    event.target.value
                                )
                            }
                        />

                    </div>


                    <div className="employee-filter">

                        <label htmlFor="attendance-status">
                            STATUS
                        </label>


                        <select
                            id="attendance-status"
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                        >

                            <option value="All">
                                All Statuses
                            </option>


                            <option value="Present">
                                Present
                            </option>


                            <option value="Half Day">
                                Half Day
                            </option>


                            <option value="Absent">
                                Absent
                            </option>


                            <option value="Leave">
                                Leave
                            </option>

                        </select>

                    </div>

                </section>


                {/* =================================================
                    SUMMARY
                ================================================= */}

                <section className="employee-attendance-summary">


                    <div>

                        <span>
                            PRESENT
                        </span>


                        <strong>
                            {presentCount}
                        </strong>

                    </div>


                    <div>

                        <span>
                            HALF DAY
                        </span>


                        <strong>
                            {halfDayCount}
                        </strong>

                    </div>


                    <div>

                        <span>
                            ABSENT
                        </span>


                        <strong>
                            {absentCount}
                        </strong>

                    </div>


                    <div>

                        <span>
                            LEAVE
                        </span>


                        <strong>
                            {leaveCount}
                        </strong>

                    </div>


                </section>


                {/* =================================================
                    TABLE
                ================================================= */}

                <section className="employee-attendance-table-section">


                    <div className="employee-attendance-section-title">
                        ATTENDANCE RECORDS
                    </div>


                    <div className="employee-attendance-table">


                        <div className="employee-attendance-table-head">

                            <span>
                                DATE
                            </span>


                            <span>
                                CHECK IN
                            </span>


                            <span>
                                CHECK OUT
                            </span>


                            <span>
                                HOURS
                            </span>


                            <span>
                                STATUS
                            </span>

                        </div>


                        {filteredAttendance.length === 0 ? (

                            <div className="employee-attendance-empty">
                                NO RECORDS FOUND FOR THIS PERIOD.
                            </div>

                        ) : (

                            filteredAttendance.map(
                                (record) => (

                                    <div
                                        className="employee-attendance-table-row"
                                        key={record.id}
                                    >

                                        <span>
                                            {formatDate(
                                                record.date
                                            )}
                                        </span>


                                        <span>
                                            {formatTime(
                                                record.check_in
                                            )}
                                        </span>


                                        <span>
                                            {formatTime(
                                                record.check_out
                                            )}
                                        </span>


                                        <span>
                                            {record.working_hours || "--"}
                                        </span>


                                        <span>

                                            <span
                                                className={`employee-attendance-status employee-attendance-status-${record.status
                                                    .toLowerCase()
                                                    .replace(
                                                        /\s+/g,
                                                        "-"
                                                    )}`}
                                            >
                                                {record.status}
                                            </span>

                                        </span>

                                    </div>

                                )
                            )

                        )}

                    </div>

                </section>

            </section>

        </main>

    );

};


export default EmployeeAttendance;