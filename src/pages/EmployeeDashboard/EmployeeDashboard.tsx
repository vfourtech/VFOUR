import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../lib/supabase";

import "./EmployeeDashboard.css";


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


const EmployeeDashboard = () => {

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

    const [checkingAction, setCheckingAction] =
        useState(false);

    const [error, setError] =
        useState("");

    const [todayCheckIn, setTodayCheckIn] =
        useState<string | null>(null);

    const [todayCheckOut, setTodayCheckOut] =
        useState<string | null>(null);

    const [workingHours, setWorkingHours] =
        useState("--");


    /* =================================================
       MODAL STATE
    ================================================= */

    const [showCheckInModal, setShowCheckInModal] =
        useState(false);

    const [showCheckOutModal, setShowCheckOutModal] =
        useState(false);


    /* =================================================
       GET TODAY
    ================================================= */

    const getToday = () => {

        const now = new Date();

        const year =
            now.getFullYear();

        const month =
            String(
                now.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                now.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };


    /* =================================================
       WEEKEND CHECK
    ================================================= */

    const isWeekend = () => {

        const day =
            new Date().getDay();

        return (
            day === 0 ||
            day === 6
        );
    };


    /* =================================================
       CURRENT TIME
    ================================================= */

    const formatCurrentTime = () => {

        return new Date().toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };


    /* =================================================
       LOAD ATTENDANCE
    ================================================= */

    const loadAttendance = async (
        employeeId: string
    ) => {

        try {

            const {
                data,
                error: attendanceError,
            } = await supabase
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
                    employeeId
                )
                .order(
                    "date",
                    {
                        ascending: false,
                    }
                )
                .limit(31);


            if (attendanceError) {

                console.error(
                    "Attendance loading error:",
                    attendanceError
                );

                setError(
                    "Unable to load attendance records."
                );

                return;
            }


            const records =
                (data as AttendanceRecord[]) || [];


            setAttendance(records);


            /* =========================================
               RESET TODAY
            ========================================= */

            setTodayCheckIn(null);
            setTodayCheckOut(null);
            setWorkingHours("--");


            /* =========================================
               FIND TODAY
            ========================================= */

            const today =
                getToday();


            const todayRecord =
                records.find(
                    (record) =>
                        record.date === today
                );


            if (todayRecord) {

                setTodayCheckIn(
                    todayRecord.check_in
                );

                setTodayCheckOut(
                    todayRecord.check_out
                );

                setWorkingHours(
                    todayRecord.working_hours || "--"
                );
            }

        } catch (error) {

            console.error(
                "Attendance loading error:",
                error
            );

            setError(
                "Unable to load attendance records."
            );
        }
    };


    /* =================================================
       LOAD EMPLOYEE
    ================================================= */

    useEffect(() => {

        let mounted = true;


        const loadEmployee = async () => {

            try {

                setLoading(true);
                setError("");


                /* =========================================
                   CURRENT USER
                ========================================= */

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


                /* =========================================
                   EMPLOYEE RECORD
                ========================================= */

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

                    console.error(
                        "Employee loading error:",
                        employeeError
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


                if (!mounted) {
                    return;
                }


                setEmployee(
                    employeeData
                );


                await loadAttendance(
                    employeeData.id
                );

            } catch (error) {

                console.error(
                    "Employee dashboard error:",
                    error
                );

                if (mounted) {

                    setError(
                        "Unable to load employee dashboard."
                    );
                }

            } finally {

                if (mounted) {
                    setLoading(false);
                }
            }
        };


        loadEmployee();


        return () => {
            mounted = false;
        };

    }, [navigate]);


    /* =================================================
       CHECK IN
       Returns true only when successfully completed.
    ================================================= */

    const handleCheckIn = async (): Promise<boolean> => {

        if (
            !employee ||
            todayCheckIn
        ) {
            return false;
        }


        if (isWeekend()) {

            setError(
                "Attendance is not required on Saturday or Sunday."
            );

            return false;
        }


        try {

            setCheckingAction(true);
            setError("");


            const today =
                getToday();

            const now =
                new Date().toISOString();


            const {
                error: insertError,
            } =
                await supabase
                    .from("attendance")
                    .insert({
                        employee_id:
                            employee.id,

                        date:
                            today,

                        check_in:
                            now,

                        status:
                            "Present",
                    });


            if (insertError) {

                console.error(
                    "Check-in error:",
                    insertError
                );


                if (
                    insertError.code ===
                    "23505"
                ) {

                    setError(
                        "You have already checked in today."
                    );

                } else {

                    setError(
                        "Unable to check in. Please try again."
                    );
                }


                await loadAttendance(
                    employee.id
                );

                return false;
            }


            await loadAttendance(
                employee.id
            );


            return true;

        } catch (error) {

            console.error(
                "Check-in error:",
                error
            );

            setError(
                "Unable to check in. Please try again."
            );

            return false;

        } finally {

            setCheckingAction(false);
        }
    };


    /* =================================================
       CHECK OUT
       Returns true only when successfully completed.
    ================================================= */

    const handleCheckOut = async (): Promise<boolean> => {

        if (
            !employee ||
            !todayCheckIn ||
            todayCheckOut
        ) {
            return false;
        }


        if (isWeekend()) {

            setError(
                "Attendance is not required on Saturday or Sunday."
            );

            return false;
        }


        try {

            setCheckingAction(true);
            setError("");


            const today =
                getToday();

            const now =
                new Date().toISOString();


            /* =========================================
               FIND TODAY'S RECORD
            ========================================= */

            const {
                data: todayRecord,
                error: findError,
            } =
                await supabase
                    .from("attendance")
                    .select(`
                        id,
                        check_in,
                        check_out
                    `)
                    .eq(
                        "employee_id",
                        employee.id
                    )
                    .eq(
                        "date",
                        today
                    )
                    .maybeSingle();


            if (
                findError ||
                !todayRecord
            ) {

                console.error(
                    "Today's attendance record not found:",
                    findError
                );

                setError(
                    "Today's attendance record could not be found."
                );

                return false;
            }


            /* =========================================
               ALREADY CHECKED OUT
            ========================================= */

            if (
                todayRecord.check_out
            ) {

                setError(
                    "You have already checked out today."
                );

                await loadAttendance(
                    employee.id
                );

                return false;
            }


            /* =========================================
               UPDATE CHECK OUT

               Supabase calculates working_hours
               and final status through the database trigger.
            ========================================= */

            const {
                error: updateError,
            } =
                await supabase
                    .from("attendance")
                    .update({
                        check_out: now,
                    })
                    .eq(
                        "id",
                        todayRecord.id
                    );


            if (updateError) {

                console.error(
                    "Check-out error:",
                    updateError
                );

                setError(
                    "Unable to check out. Please try again."
                );

                return false;
            }


            await loadAttendance(
                employee.id
            );


            return true;

        } catch (error) {

            console.error(
                "Check-out error:",
                error
            );

            setError(
                "Unable to check out. Please try again."
            );

            return false;

        } finally {

            setCheckingAction(false);
        }
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
       TODAY
    ================================================= */

    const formattedToday =
        new Date().toLocaleDateString(
            [],
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
            }
        );


    /* =================================================
       STATISTICS
    ================================================= */

    const presentCount =
        attendance.filter(
            (record) =>
                record.status === "Present"
        ).length;


    const halfDayCount =
        attendance.filter(
            (record) =>
                record.status === "Half Day"
        ).length;


    const absentCount =
        attendance.filter(
            (record) =>
                record.status === "Absent"
        ).length;


    const leaveCount =
        attendance.filter(
            (record) =>
                record.status === "Leave"
        ).length;


    const weekend =
        isWeekend();


    /* =================================================
       LOADING
    ================================================= */

    if (loading) {

        return (
            <div className="employee-dashboard-loading">

                <div className="employee-dashboard-loading-box">

                    <div className="employee-dashboard-loading-logo">
                        VFOUR
                    </div>

                    <span>
                        LOADING EMPLOYEE PORTAL
                    </span>

                </div>

            </div>
        );
    }


    if (!employee) {
        return null;
    }


    /* =================================================
       DASHBOARD
    ================================================= */

    return (

        <main className="employee-dashboard-page">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="employee-sidebar">

                <div className="employee-sidebar-top">

                    <div className="employee-logo">
                        VFOUR
                    </div>


                    <div className="employee-sidebar-caption">
                        EMPLOYEE PORTAL
                    </div>


                    <nav
                        className="employee-sidebar-nav"
                        aria-label="Employee navigation"
                    >

                        <button
                            type="button"
                            className="employee-nav-item active"
                            onClick={() =>
                                navigate(
                                    "/employee/dashboard"
                                )
                            }
                        >
                            <span>
                                DASHBOARD
                            </span>
                        </button>


                        <button
                            type="button"
                            className="employee-nav-item"
                            onClick={() =>
                                navigate(
                                    "/employee/attendance"
                                )
                            }
                        >
                            <span>
                                ATTENDANCE
                            </span>
                        </button>


                        <button
                            type="button"
                            className="employee-nav-item"
                            onClick={() =>
                                navigate(
                                    "/employee/leave"
                                )
                            }
                        >
                            <span>
                                LEAVE REQUESTS
                            </span>
                        </button>


                        <button
                            type="button"
                            className="employee-nav-item"
                            onClick={() =>
                                navigate(
                                    "/employee/profile"
                                )
                            }
                        >
                            <span>
                                PROFILE
                            </span>
                        </button>

                    </nav>

                </div>


                {/* =================================================
                    SIDEBAR USER
                ================================================= */}

                <div className="employee-sidebar-bottom">

                    <div className="employee-user">

                        <div className="employee-user-avatar">

                            {employee.name
                                .charAt(0)
                                .toUpperCase()}

                        </div>


                        <div className="employee-user-info">

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
                        className="employee-logout"
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

            <section className="employee-main">


                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="employee-header">

                    <div className="employee-header-left">

                        <span className="employee-header-label">
                            VFOUR / EMPLOYEE SYSTEM
                        </span>


                        <h1>

                            Welcome,{" "}

                            <span>
                                {
                                    employee.name.split(
                                        " "
                                    )[0]
                                }
                            </span>

                        </h1>

                    </div>


                    <div className="employee-header-right">

                        <span>
                            TODAY
                        </span>

                        <strong>
                            {formattedToday}
                        </strong>

                    </div>

                </header>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="employee-alert">

                        <div className="employee-alert-icon">
                            !
                        </div>


                        <span>
                            {error}
                        </span>


                        <button
                            type="button"
                            onClick={() =>
                                setError("")
                            }
                            aria-label="Close error"
                        >
                            ×
                        </button>

                    </div>

                )}


                {/* =================================================
                    WEEKEND NOTICE
                ================================================= */}

                {weekend && (

                    <div className="employee-weekend-banner">

                        <div>

                            <span>
                                WEEKEND
                            </span>

                            <h2>
                                NO ATTENDANCE TODAY
                            </h2>

                        </div>


                        <p>
                            Attendance is not required
                            on Saturday and Sunday.
                        </p>

                    </div>

                )}


                {/* =================================================
                    TODAY'S ATTENDANCE
                ================================================= */}

                <section className="employee-section">

                    <div className="employee-section-title">

                        <h2>
                            TODAY'S ATTENDANCE
                        </h2>

                    </div>


                    <div className="employee-today-grid">


                        {/* CHECK IN */}

                        <div className="employee-info-card">

                            <span className="employee-card-label">
                                CHECK IN
                            </span>


                            <strong className="employee-card-value">

                                {
                                    formatTime(
                                        todayCheckIn
                                    )
                                }

                            </strong>


                            <span className="employee-card-note">
                                START TIME
                            </span>

                        </div>


                        {/* CHECK OUT */}

                        <div className="employee-info-card">

                            <span className="employee-card-label">
                                CHECK OUT
                            </span>


                            <strong className="employee-card-value">

                                {
                                    formatTime(
                                        todayCheckOut
                                    )
                                }

                            </strong>


                            <span className="employee-card-note">
                                END TIME
                            </span>

                        </div>


                        {/* WORKING HOURS */}

                        <div className="employee-info-card">

                            <span className="employee-card-label">
                                WORKING HOURS
                            </span>


                            <strong className="employee-card-value">
                                {workingHours}
                            </strong>


                            <span className="employee-card-note">
                                TOTAL TIME
                            </span>

                        </div>


                        {/* ACTION */}

                        <div className="employee-action-card">

                            {weekend ? (

                                <div className="employee-weekend-action">

                                    <span>
                                        SATURDAY / SUNDAY
                                    </span>

                                    <strong>
                                        NO CHECK-IN
                                    </strong>

                                </div>

                            ) : !todayCheckIn ? (

                                <button
                                    type="button"
                                    className="employee-attendance-button"
                                    onClick={() =>
                                        setShowCheckInModal(
                                            true
                                        )
                                    }
                                    disabled={
                                        checkingAction
                                    }
                                >

                                    <span>
                                        CHECK IN
                                    </span>

                                    <span className="employee-button-arrow">
                                        →
                                    </span>

                                </button>

                            ) : !todayCheckOut ? (

                                <button
                                    type="button"
                                    className="employee-attendance-button"
                                    onClick={() =>
                                        setShowCheckOutModal(
                                            true
                                        )
                                    }
                                    disabled={
                                        checkingAction
                                    }
                                >

                                    <span>
                                        CHECK OUT
                                    </span>

                                    <span className="employee-button-arrow">
                                        →
                                    </span>

                                </button>

                            ) : (

                                <div className="employee-attendance-complete">

                                    <span>
                                        ATTENDANCE COMPLETED
                                    </span>

                                    <strong>
                                        ✓
                                    </strong>

                                </div>

                            )}

                        </div>

                    </div>

                </section>


                {/* =================================================
                    ATTENDANCE RULES
                ================================================= */}

                <section className="employee-section">

                    <div className="employee-section-title">

                        <h2>
                            ATTENDANCE RULES
                        </h2>

                    </div>


                    <div className="employee-rules-grid">


                        <div className="employee-rule-card">

                            <span>
                                WORKING HOURS
                            </span>

                            <strong>
                                10:00 AM — 06:00 PM
                            </strong>

                            <p>
                                Regular working hours are
                                Monday through Friday.
                            </p>

                        </div>


                        <div className="employee-rule-card">

                            <span>
                                PRESENT
                            </span>

                            <strong>
                                8+ HOURS
                            </strong>

                            <p>
                                Eight hours or more of
                                recorded work counts as
                                Present.
                            </p>

                        </div>


                        <div className="employee-rule-card">

                            <span>
                                HALF DAY
                            </span>

                            <strong>
                                4 — 7 HOURS
                            </strong>

                            <p>
                                Four hours to less than
                                eight hours counts as
                                Half Day.
                            </p>

                        </div>


                        <div className="employee-rule-card">

                            <span>
                                WEEKEND
                            </span>

                            <strong>
                                NO ATTENDANCE
                            </strong>

                            <p>
                                Saturday and Sunday do not
                                require attendance.
                            </p>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    ATTENDANCE OVERVIEW
                ================================================= */}

                <section className="employee-section">

                    <div className="employee-section-title">

                        <h2>
                            ATTENDANCE OVERVIEW
                        </h2>

                    </div>


                    <div className="employee-overview-grid">


                        <div className="employee-overview-card">

                            <span>
                                PRESENT
                            </span>

                            <strong>
                                {presentCount}
                            </strong>

                        </div>


                        <div className="employee-overview-card">

                            <span>
                                HALF DAY
                            </span>

                            <strong>
                                {halfDayCount}
                            </strong>

                        </div>


                        <div className="employee-overview-card">

                            <span>
                                ABSENT
                            </span>

                            <strong>
                                {absentCount}
                            </strong>

                        </div>


                        <div className="employee-overview-card">

                            <span>
                                LEAVE
                            </span>

                            <strong>
                                {leaveCount}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    ATTENDANCE HISTORY
                ================================================= */}

                <section className="employee-section">

                    <div className="employee-section-title">

                        <h2>
                            ATTENDANCE HISTORY
                        </h2>

                    </div>


                    <div className="employee-history">

                        <div className="employee-history-header">

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


                        {attendance.length === 0 ? (

                            <div className="employee-history-empty">
                                NO ATTENDANCE RECORDS FOUND.
                            </div>

                        ) : (

                            attendance.map(
                                (record) => (

                                    <div
                                        className="employee-history-row"
                                        key={
                                            record.id
                                        }
                                    >

                                        <span>
                                            {
                                                formatDate(
                                                    record.date
                                                )
                                            }
                                        </span>


                                        <span>
                                            {
                                                formatTime(
                                                    record.check_in
                                                )
                                            }
                                        </span>


                                        <span>
                                            {
                                                formatTime(
                                                    record.check_out
                                                )
                                            }
                                        </span>


                                        <span>
                                            {
                                                record.working_hours ||
                                                "--"
                                            }
                                        </span>


                                        <span>

                                            <span
                                                className={`employee-status employee-status-${record.status
                                                    .toLowerCase()
                                                    .replace(
                                                        /\s+/g,
                                                        "-"
                                                    )}`}
                                            >
                                                {
                                                    record.status
                                                }
                                            </span>

                                        </span>

                                    </div>

                                )
                            )

                        )}

                    </div>

                </section>

            </section>


            {/* =================================================
                CHECK IN CONFIRMATION MODAL
            ================================================= */}

            {showCheckInModal && (

                <div
                    className="employee-modal-overlay"
                    onClick={() => {

                        if (!checkingAction) {
                            setShowCheckInModal(false);
                        }

                    }}
                >

                    <div
                        className="employee-confirm-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="employee-modal-top">

                            <span>
                                ATTENDANCE
                            </span>


                            <button
                                type="button"
                                className="employee-modal-close"
                                onClick={() => {

                                    if (!checkingAction) {

                                        setShowCheckInModal(
                                            false
                                        );

                                    }

                                }}
                                disabled={
                                    checkingAction
                                }
                                aria-label="Close"
                            >
                                ×
                            </button>

                        </div>


                        <div className="employee-modal-content">

                            <span className="employee-modal-label">
                                CONFIRM ACTION
                            </span>


                            <h2>
                                CHECK IN?
                            </h2>


                            <p>
                                You are about to start
                                your working day.
                            </p>


                            <div className="employee-modal-time">

                                <span>
                                    CURRENT TIME
                                </span>

                                <strong>
                                    {
                                        formatCurrentTime()
                                    }
                                </strong>

                            </div>

                        </div>


                        <div className="employee-modal-actions">

                            <button
                                type="button"
                                className="employee-modal-cancel"
                                onClick={() =>
                                    setShowCheckInModal(
                                        false
                                    )
                                }
                                disabled={
                                    checkingAction
                                }
                            >
                                CANCEL
                            </button>


                            <button
                                type="button"
                                className="employee-modal-confirm"
                                onClick={async () => {

                                    const success =
                                        await handleCheckIn();


                                    if (success) {

                                        setShowCheckInModal(
                                            false
                                        );

                                    }

                                }}
                                disabled={
                                    checkingAction
                                }
                            >

                                <span>

                                    {
                                        checkingAction
                                            ? "CHECKING IN..."
                                            : "CONFIRM CHECK IN"
                                    }

                                </span>


                                <span>
                                    →
                                </span>

                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* =================================================
                CHECK OUT CONFIRMATION MODAL
            ================================================= */}

            {showCheckOutModal && (

                <div
                    className="employee-modal-overlay"
                    onClick={() => {

                        if (!checkingAction) {
                            setShowCheckOutModal(false);
                        }

                    }}
                >

                    <div
                        className="employee-confirm-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="employee-modal-top">

                            <span>
                                ATTENDANCE
                            </span>


                            <button
                                type="button"
                                className="employee-modal-close"
                                onClick={() => {

                                    if (!checkingAction) {

                                        setShowCheckOutModal(
                                            false
                                        );

                                    }

                                }}
                                disabled={
                                    checkingAction
                                }
                                aria-label="Close"
                            >
                                ×
                            </button>

                        </div>


                        <div className="employee-modal-content">

                            <span className="employee-modal-label">
                                CONFIRM ACTION
                            </span>


                            <h2>
                                CHECK OUT?
                            </h2>


                            <p>
                                You are about to end
                                your working day.
                            </p>


                            <div className="employee-modal-time">

                                <div>

                                    <span>
                                        CHECK IN
                                    </span>

                                    <strong>
                                        {
                                            formatTime(
                                                todayCheckIn
                                            )
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        CURRENT TIME
                                    </span>

                                    <strong>
                                        {
                                            formatCurrentTime()
                                        }
                                    </strong>

                                </div>

                            </div>

                        </div>


                        <div className="employee-modal-actions">

                            <button
                                type="button"
                                className="employee-modal-cancel"
                                onClick={() =>
                                    setShowCheckOutModal(
                                        false
                                    )
                                }
                                disabled={
                                    checkingAction
                                }
                            >
                                CANCEL
                            </button>


                            <button
                                type="button"
                                className="employee-modal-confirm"
                                onClick={async () => {

                                    const success =
                                        await handleCheckOut();


                                    if (success) {

                                        setShowCheckOutModal(
                                            false
                                        );

                                    }

                                }}
                                disabled={
                                    checkingAction
                                }
                            >

                                <span>

                                    {
                                        checkingAction
                                            ? "CHECKING OUT..."
                                            : "CONFIRM CHECK OUT"
                                    }

                                </span>


                                <span>
                                    →
                                </span>

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </main>
    );
};


export default EmployeeDashboard;