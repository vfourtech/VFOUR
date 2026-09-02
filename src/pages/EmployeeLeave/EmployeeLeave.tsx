import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../lib/supabase";

import "./EmployeeLeave.css";


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


interface LeaveRequest {
    id: string;
    employee_id: string;
    start_date: string;
    end_date: string;
    leave_type: string;
    reason: string | null;
    status: string;
    created_at: string;
}


const EmployeeLeave = () => {
    const navigate = useNavigate();


    /* =================================================
       STATE
    ================================================= */

    const [employee, setEmployee] =
        useState<Employee | null>(null);

    const [leaveRequests, setLeaveRequests] =
        useState<LeaveRequest[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    /* =================================================
       FORM
    ================================================= */

    const [leaveType, setLeaveType] =
        useState("Casual");

    const [startDate, setStartDate] =
        useState("");

    const [endDate, setEndDate] =
        useState("");

    const [reason, setReason] =
        useState("");


    /* =================================================
       LOAD EMPLOYEE + REQUESTS
    ================================================= */

    useEffect(() => {
        let mounted = true;


        const loadData = async () => {
            try {
                setLoading(true);
                setError("");


                /* CURRENT USER */

                const {
                    data: { user },
                    error: userError,
                } = await supabase.auth.getUser();


                if (userError || !user) {
                    navigate("/employee", {
                        replace: true,
                    });

                    return;
                }


                /* EMPLOYEE */

                const {
                    data: employeeData,
                    error: employeeError,
                } = await supabase
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
                    .eq("user_id", user.id)
                    .eq("role", "employee")
                    .eq("is_active", true)
                    .maybeSingle();


                if (employeeError || !employeeData) {
                    console.error(
                        "Employee loading error:",
                        employeeError
                    );

                    await supabase.auth.signOut();

                    navigate("/employee", {
                        replace: true,
                    });

                    return;
                }


                if (!mounted) {
                    return;
                }


                setEmployee(employeeData);


                /* LEAVE REQUESTS */

                const {
                    data: leaveData,
                    error: leaveError,
                } = await supabase
                    .from("leave_requests")
                    .select(`
                        id,
                        employee_id,
                        start_date,
                        end_date,
                        leave_type,
                        reason,
                        status,
                        created_at
                    `)
                    .eq(
                        "employee_id",
                        employeeData.id
                    )
                    .order("created_at", {
                        ascending: false,
                    });


                if (leaveError) {
                    console.error(
                        "Leave request loading error:",
                        leaveError
                    );

                    setError(
                        "Unable to load your leave requests."
                    );

                    return;
                }


                if (!mounted) {
                    return;
                }


                setLeaveRequests(
                    (leaveData as LeaveRequest[]) || []
                );

            } catch (error) {
                console.error(
                    "Leave page error:",
                    error
                );

                if (mounted) {
                    setError(
                        "Unable to load the leave section."
                    );
                }

            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };


        loadData();


        return () => {
            mounted = false;
        };
    }, [navigate]);


    /* =================================================
       SUBMIT LEAVE REQUEST
    ================================================= */

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();


        if (!employee) {
            return;
        }


        setError("");
        setSuccess("");


        /* VALIDATION */

        if (!startDate) {
            setError(
                "Please select a start date."
            );

            return;
        }


        if (!endDate) {
            setError(
                "Please select an end date."
            );

            return;
        }


        if (
            new Date(endDate) <
            new Date(startDate)
        ) {
            setError(
                "End date cannot be before the start date."
            );

            return;
        }


        /* SUBMIT */

        try {
            setSubmitting(true);


            const {
                error: insertError,
            } = await supabase
                .from("leave_requests")
                .insert({
                    employee_id:
                        employee.id,

                    start_date:
                        startDate,

                    end_date:
                        endDate,

                    leave_type:
                        leaveType,

                    reason:
                        reason.trim() || null,

                    status:
                        "Pending",
                });


            if (insertError) {
                console.error(
                    "Leave request error:",
                    insertError
                );

                setError(
                    "Unable to submit your leave request. Please try again."
                );

                return;
            }


            /* CLEAR FORM */

            setStartDate("");
            setEndDate("");
            setReason("");
            setLeaveType("Casual");


            setSuccess(
                "Your leave request has been submitted successfully."
            );


            /* RELOAD REQUESTS */

            const {
                data: updatedRequests,
            } = await supabase
                .from("leave_requests")
                .select(`
                    id,
                    employee_id,
                    start_date,
                    end_date,
                    leave_type,
                    reason,
                    status,
                    created_at
                `)
                .eq(
                    "employee_id",
                    employee.id
                )
                .order("created_at", {
                    ascending: false,
                });


            setLeaveRequests(
                (updatedRequests as LeaveRequest[]) || []
            );

        } catch (error) {
            console.error(
                "Leave submit error:",
                error
            );

            setError(
                "Something went wrong. Please try again."
            );

        } finally {
            setSubmitting(false);
        }
    };


    /* =================================================
       LOGOUT
    ================================================= */

    const handleLogout = async () => {
        await supabase.auth.signOut();

        navigate("/employee", {
            replace: true,
        });
    };


    /* =================================================
       FORMAT DATE
    ================================================= */

    const formatDate = (date: string) => {
        return new Date(
            `${date}T00:00:00`
        ).toLocaleDateString([], {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };


    /* =================================================
       REQUEST COUNTS
    ================================================= */

    const pendingCount = useMemo(
        () =>
            leaveRequests.filter(
                (request) =>
                    request.status ===
                    "Pending"
            ).length,
        [leaveRequests]
    );


    const approvedCount = useMemo(
        () =>
            leaveRequests.filter(
                (request) =>
                    request.status ===
                    "Approved"
            ).length,
        [leaveRequests]
    );


    const rejectedCount = useMemo(
        () =>
            leaveRequests.filter(
                (request) =>
                    request.status ===
                    "Rejected"
            ).length,
        [leaveRequests]
    );


    /* =================================================
       LOADING
    ================================================= */

    if (loading) {
        return (
            <div className="employee-leave-loading">
                LOADING LEAVE REQUESTS...
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
        <main className="employee-leave-page">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="employee-leave-sidebar">

                <div className="employee-leave-sidebar-top">

                    <div className="employee-leave-logo">
                        VFOUR
                    </div>

                    <div className="employee-leave-caption">
                        EMPLOYEE PORTAL
                    </div>


                    <nav className="employee-leave-nav">

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
                            className="active"
                        >
                            LEAVE REQUESTS
                        </button>


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


                {/* SIDEBAR USER */}

                <div className="employee-leave-sidebar-bottom">

                    <div className="employee-leave-user">

                        <div className="employee-leave-avatar">
                            {employee.name
                                .charAt(0)
                                .toUpperCase()}
                        </div>


                        <div className="employee-leave-user-info">

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
                        className="employee-leave-logout"
                        onClick={handleLogout}
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

            <section className="employee-leave-main">


                {/* HEADER */}

                <header className="employee-leave-header">

                    <span>
                        VFOUR / EMPLOYEE SYSTEM
                    </span>

                    <h1>
                        Leave Requests
                    </h1>

                    <p>
                        Submit a leave request and track
                        your request history.
                    </p>

                </header>


                {/* ALERTS */}

                {error && (
                    <div className="employee-leave-alert error">

                        <span className="alert-icon">
                            !
                        </span>

                        <p>
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                setError("")
                            }
                        >
                            ×
                        </button>

                    </div>
                )}


                {success && (
                    <div className="employee-leave-alert success">

                        <span className="alert-icon">
                            ✓
                        </span>

                        <p>
                            {success}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                setSuccess("")
                            }
                        >
                            ×
                        </button>

                    </div>
                )}


                {/* =================================================
                    APPLY FOR LEAVE
                ================================================= */}

                <section className="employee-leave-section">

                    <div className="employee-leave-section-title">
                        <h2>
                            APPLY FOR LEAVE
                        </h2>
                    </div>


                    <div className="employee-leave-form-card">

                        <form
                            onSubmit={handleSubmit}
                            className="employee-leave-form"
                        >

                            {/* LEAVE TYPE */}

                            <div className="employee-leave-field">

                                <label htmlFor="leave-type">
                                    LEAVE TYPE
                                </label>

                                <select
                                    id="leave-type"
                                    value={leaveType}
                                    onChange={(event) =>
                                        setLeaveType(
                                            event.target.value
                                        )
                                    }
                                    disabled={submitting}
                                >
                                    <option value="Casual">
                                        Casual
                                    </option>

                                    <option value="Sick">
                                        Sick
                                    </option>

                                    <option value="Earned">
                                        Earned
                                    </option>

                                    <option value="Emergency">
                                        Emergency
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>
                                </select>

                            </div>


                            {/* START DATE */}

                            <div className="employee-leave-field">

                                <label htmlFor="start-date">
                                    START DATE
                                </label>

                                <input
                                    id="start-date"
                                    type="date"
                                    value={startDate}
                                    onChange={(event) =>
                                        setStartDate(
                                            event.target.value
                                        )
                                    }
                                    min={
                                        new Date()
                                            .toISOString()
                                            .split("T")[0]
                                    }
                                    disabled={submitting}
                                />

                            </div>


                            {/* END DATE */}

                            <div className="employee-leave-field">

                                <label htmlFor="end-date">
                                    END DATE
                                </label>

                                <input
                                    id="end-date"
                                    type="date"
                                    value={endDate}
                                    onChange={(event) =>
                                        setEndDate(
                                            event.target.value
                                        )
                                    }
                                    min={
                                        startDate ||
                                        new Date()
                                            .toISOString()
                                            .split("T")[0]
                                    }
                                    disabled={submitting}
                                />

                            </div>


                            {/* REASON */}

                            <div className="employee-leave-field full">

                                <label htmlFor="leave-reason">
                                    REASON
                                </label>

                                <textarea
                                    id="leave-reason"
                                    value={reason}
                                    onChange={(event) =>
                                        setReason(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter the reason for your leave..."
                                    rows={5}
                                    disabled={submitting}
                                />

                            </div>


                            {/* SUBMIT */}

                            <div className="employee-leave-submit-area">

                                <button
                                    type="submit"
                                    className="employee-leave-submit"
                                    disabled={submitting}
                                >
                                    <span>
                                        {submitting
                                            ? "SUBMITTING..."
                                            : "SUBMIT REQUEST"}
                                    </span>

                                    <span>
                                        →
                                    </span>
                                </button>

                            </div>

                        </form>

                    </div>

                </section>


                {/* =================================================
                    REQUEST OVERVIEW
                ================================================= */}

                <section className="employee-leave-section">

                    <div className="employee-leave-section-title">
                        <h2>
                            REQUEST OVERVIEW
                        </h2>
                    </div>


                    <div className="employee-leave-summary">

                        <div className="summary-pending">
                            <span>
                                PENDING
                            </span>

                            <strong>
                                {pendingCount}
                            </strong>
                        </div>


                        <div className="summary-approved">
                            <span>
                                APPROVED
                            </span>

                            <strong>
                                {approvedCount}
                            </strong>
                        </div>


                        <div className="summary-rejected">
                            <span>
                                REJECTED
                            </span>

                            <strong>
                                {rejectedCount}
                            </strong>
                        </div>


                        <div className="summary-total">
                            <span>
                                TOTAL REQUESTS
                            </span>

                            <strong>
                                {leaveRequests.length}
                            </strong>
                        </div>

                    </div>

                </section>


                {/* =================================================
                    REQUEST HISTORY
                ================================================= */}

                <section className="employee-leave-section">

                    <div className="employee-leave-section-title">
                        <h2>
                            MY LEAVE REQUESTS
                        </h2>
                    </div>


                    <div className="employee-leave-history">

                        <div className="employee-leave-history-header">

                            <span>
                                DATE
                            </span>

                            <span>
                                TYPE
                            </span>

                            <span>
                                REASON
                            </span>

                            <span>
                                STATUS
                            </span>

                        </div>


                        {leaveRequests.length === 0 ? (

                            <div className="employee-leave-empty">
                                NO LEAVE REQUESTS FOUND.
                            </div>

                        ) : (

                            leaveRequests.map(
                                (request) => (

                                    <div
                                        key={request.id}
                                        className="employee-leave-history-row"
                                    >

                                        <div>

                                            <strong>
                                                {formatDate(
                                                    request.start_date
                                                )}
                                            </strong>

                                            <span>
                                                to{" "}
                                                {formatDate(
                                                    request.end_date
                                                )}
                                            </span>

                                        </div>


                                        <span>
                                            {request.leave_type}
                                        </span>


                                        <span className="employee-leave-reason">
                                            {request.reason ||
                                                "No reason provided"}
                                        </span>


                                        <span>

                                            <span
                                                className={`employee-leave-status employee-leave-status-${request.status
                                                    .toLowerCase()
                                                    .replace(
                                                        /\s+/g,
                                                        "-"
                                                    )}`}
                                            >
                                                {request.status}
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


export default EmployeeLeave;