import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./LeaveRequests.css";

interface Employee {
    id: string;
    employee_id: string;
    name: string;
    email: string;
    department: string | null;
    profile_image: string | null;
}

interface LeaveRequest {
    id: string;
    employee_id: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    reason: string | null;
    status: string;
    admin_comment: string | null;
    reviewed_by: string | null;
    reviewed_at: string | null;
    created_at: string;
    employees: Employee | null;
}

type StatusFilter =
    | "All"
    | "Pending"
    | "Approved"
    | "Rejected"
    | "Cancelled";

const LeaveRequests = () => {
    /* =========================================================
       STATE
    ========================================================= */

    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] =
        useState<StatusFilter>("All");
    const [typeFilter, setTypeFilter] =
        useState("All");

    const [selectedRequest, setSelectedRequest] =
        useState<LeaveRequest | null>(null);

    const [adminComment, setAdminComment] =
        useState("");

    const [reviewing, setReviewing] =
        useState(false);

    /* =========================================================
       LOAD REQUESTS
    ========================================================= */

    const loadRequests = async () => {
        try {
            setLoading(true);
            setError("");

            const {
                data,
                error: fetchError,
            } = await supabase
                .from("leave_requests")
                .select(`
                    id,
                    employee_id,
                    leave_type,
                    start_date,
                    end_date,
                    reason,
                    status,
                    admin_comment,
                    reviewed_by,
                    reviewed_at,
                    created_at,
                    employees (
                        id,
                        employee_id,
                        name,
                        email,
                        department,
                        profile_image
                    )
                `)
                .order("created_at", {
                    ascending: false,
                });

            if (fetchError) {
                console.error(
                    "Leave requests loading error:",
                    fetchError
                );

                setError(
                    fetchError.message ||
                    "Unable to load leave requests."
                );

                return;
            }

            setRequests(
                (data ?? []) as unknown as LeaveRequest[]
            );
        } catch (err) {
            console.error(
                "Leave requests error:",
                err
            );

            setError(
                "Unable to load leave requests."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    /* =========================================================
       DATE HELPERS
    ========================================================= */

    const getDays = (
        startDate: string,
        endDate: string
    ) => {
        const start = new Date(
            `${startDate}T00:00:00`
        );

        const end = new Date(
            `${endDate}T00:00:00`
        );

        const difference =
            end.getTime() - start.getTime();

        return (
            Math.floor(
                difference / (1000 * 60 * 60 * 24)
            ) + 1
        );
    };

    const formatDate = (date: string) => {
        return new Date(
            `${date}T00:00:00`
        ).toLocaleDateString([], {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatDateTime = (date: string | null) => {
        if (!date) {
            return "—";
        }

        return new Date(date).toLocaleString([], {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    /* =========================================================
       TODAY
    ========================================================= */

    const today = new Date()
        .toISOString()
        .split("T")[0];

    /* =========================================================
       SUMMARY COUNTS
    ========================================================= */

    const pendingCount = useMemo(() => {
        return requests.filter(
            (request) =>
                request.status === "Pending"
        ).length;
    }, [requests]);

    const approvedCount = useMemo(() => {
        return requests.filter(
            (request) =>
                request.status === "Approved"
        ).length;
    }, [requests]);

    const rejectedCount = useMemo(() => {
        return requests.filter(
            (request) =>
                request.status === "Rejected"
        ).length;
    }, [requests]);

    const onLeaveTodayCount = useMemo(() => {
        return requests.filter(
            (request) =>
                request.status === "Approved" &&
                request.start_date <= today &&
                request.end_date >= today
        ).length;
    }, [requests, today]);

    /* =========================================================
       LEAVE TYPES
    ========================================================= */

    const leaveTypes = useMemo(() => {
        const types = requests
            .map((request) => request.leave_type)
            .filter(Boolean);

        return Array.from(
            new Set(types)
        );
    }, [requests]);

    /* =========================================================
       FILTER REQUESTS
    ========================================================= */

    const filteredRequests = useMemo(() => {
        const searchValue =
            search.trim().toLowerCase();

        return requests.filter((request) => {
            const employee =
                request.employees;

            const matchesSearch =
                !searchValue ||
                employee?.name
                    ?.toLowerCase()
                    .includes(searchValue) ||
                employee?.employee_id
                    ?.toLowerCase()
                    .includes(searchValue) ||
                employee?.email
                    ?.toLowerCase()
                    .includes(searchValue) ||
                request.leave_type
                    ?.toLowerCase()
                    .includes(searchValue);

            const matchesStatus =
                statusFilter === "All" ||
                request.status === statusFilter;

            const matchesType =
                typeFilter === "All" ||
                request.leave_type === typeFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesType
            );
        });
    }, [
        requests,
        search,
        statusFilter,
        typeFilter,
    ]);

    /* =========================================================
       OPEN REQUEST
    ========================================================= */

    const openRequest = (
        request: LeaveRequest
    ) => {
        setSelectedRequest(request);
        setAdminComment(
            request.admin_comment || ""
        );
        setError("");
        setSuccess("");
    };

    /* =========================================================
       CLOSE MODAL
    ========================================================= */

    const closeModal = () => {
        if (reviewing) {
            return;
        }

        setSelectedRequest(null);
        setAdminComment("");
    };

    /* =========================================================
       REVIEW REQUEST
    ========================================================= */

    const reviewRequest = async (
        decision: "Approved" | "Rejected"
    ) => {
        if (!selectedRequest) {
            return;
        }

        try {
            setReviewing(true);
            setError("");
            setSuccess("");

            /* ---------------------------------------------
               CURRENT ADMIN
            --------------------------------------------- */

            const {
                data: {
                    user,
                },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                setError(
                    "Unable to verify administrator."
                );

                return;
            }

            /* ---------------------------------------------
               VERIFY ADMIN PROFILE
            --------------------------------------------- */

            const {
                data: adminProfile,
                error: profileError,
            } = await supabase
                .from("profiles")
                .select(`
                    user_id,
                    role,
                    is_active
                `)
                .eq("user_id", user.id)
                .eq("role", "admin")
                .eq("is_active", true)
                .maybeSingle();

            if (
                profileError ||
                !adminProfile
            ) {
                setError(
                    "You do not have permission to review leave requests."
                );

                return;
            }

            /* ---------------------------------------------
               UPDATE REQUEST
            --------------------------------------------- */

            const {
                error: updateError,
            } = await supabase
                .from("leave_requests")
                .update({
                    status: decision,
                    admin_comment:
                        adminComment.trim() || null,
                    reviewed_by: user.id,
                    reviewed_at:
                        new Date().toISOString(),
                })
                .eq(
                    "id",
                    selectedRequest.id
                )
                .eq(
                    "status",
                    "Pending"
                );

            if (updateError) {
                console.error(
                    "Leave review error:",
                    updateError
                );

                setError(
                    updateError.message ||
                    "Unable to update leave request."
                );

                return;
            }

            /* ---------------------------------------------
               REFRESH DATA
            --------------------------------------------- */

            await loadRequests();

            setSuccess(
                `Leave request ${decision.toLowerCase()} successfully.`
            );

            setSelectedRequest(null);
            setAdminComment("");
        } catch (err) {
            console.error(
                "Review request error:",
                err
            );

            setError(
                "Something went wrong while reviewing the request."
            );
        } finally {
            setReviewing(false);
        }
    };

    /* =========================================================
       STATUS CLASS
    ========================================================= */

    const getStatusClass = (
        status: string
    ) => {
        return `admin-leave-status admin-leave-status-${status
            .toLowerCase()
            .replace(/\s+/g, "-")}`;
    };

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div className="admin-leave-loading">
                <span>
                    LOADING LEAVE REQUESTS...
                </span>
            </div>
        );
    }

    /* =========================================================
       PAGE
    ========================================================= */

    return (
        <main className="admin-leave-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="admin-leave-header">

                <div>
                    <span className="admin-leave-eyebrow">
                        VFOUR / ADMIN SYSTEM
                    </span>

                    <h1>
                        Leave Requests
                    </h1>

                    <p>
                        Review employee leave requests,
                        approve or reject applications,
                        and track current leave status.
                    </p>
                </div>

                <div className="admin-leave-header-meta">
                    <span>
                        TOTAL REQUESTS
                    </span>

                    <strong>
                        {requests.length}
                    </strong>
                </div>

            </header>

            {/* =================================================
                ALERTS
            ================================================= */}

            {error && (
                <div className="admin-leave-alert error">

                    <span>!</span>

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
                <div className="admin-leave-alert success">

                    <span>✓</span>

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
                SUMMARY
            ================================================= */}

            <section className="admin-leave-summary">

                <div className="admin-leave-summary-card">

                    <span>
                        PENDING
                    </span>

                    <strong>
                        {pendingCount}
                    </strong>

                    <small>
                        Awaiting review
                    </small>

                </div>

                <div className="admin-leave-summary-card">

                    <span>
                        APPROVED
                    </span>

                    <strong>
                        {approvedCount}
                    </strong>

                    <small>
                        Approved requests
                    </small>

                </div>

                <div className="admin-leave-summary-card">

                    <span>
                        REJECTED
                    </span>

                    <strong>
                        {rejectedCount}
                    </strong>

                    <small>
                        Rejected requests
                    </small>

                </div>

                <div className="admin-leave-summary-card">

                    <span>
                        ON LEAVE TODAY
                    </span>

                    <strong>
                        {onLeaveTodayCount}
                    </strong>

                    <small>
                        Currently on approved leave
                    </small>

                </div>

            </section>

            {/* =================================================
                TOOLBAR
            ================================================= */}

            <section className="admin-leave-toolbar">

                <div className="admin-leave-search">

                    <span>
                        SEARCH
                    </span>

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search employee, ID, email or leave type..."
                    />

                </div>

                <div className="admin-leave-filter">

                    <span>
                        STATUS
                    </span>

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value as StatusFilter
                            )
                        }
                    >
                        <option value="All">
                            All
                        </option>

                        <option value="Pending">
                            Pending
                        </option>

                        <option value="Approved">
                            Approved
                        </option>

                        <option value="Rejected">
                            Rejected
                        </option>

                        <option value="Cancelled">
                            Cancelled
                        </option>
                    </select>

                </div>

                <div className="admin-leave-filter">

                    <span>
                        LEAVE TYPE
                    </span>

                    <select
                        value={typeFilter}
                        onChange={(event) =>
                            setTypeFilter(
                                event.target.value
                            )
                        }
                    >
                        <option value="All">
                            All
                        </option>

                        {leaveTypes.map(
                            (type) => (
                                <option
                                    key={type}
                                    value={type}
                                >
                                    {type}
                                </option>
                            )
                        )}

                    </select>

                </div>

                <button
                    type="button"
                    className="admin-leave-refresh"
                    onClick={loadRequests}
                    disabled={loading}
                >
                    ↻
                    <span>
                        REFRESH
                    </span>
                </button>

            </section>

            {/* =================================================
                REQUEST TABLE
            ================================================= */}

            <section className="admin-leave-table-section">

                <div className="admin-leave-table-top">

                    <div>
                        <span>
                            01
                        </span>

                        <h2>
                            ALL LEAVE REQUESTS
                        </h2>
                    </div>

                    <p>
                        {filteredRequests.length}{" "}
                        request
                        {filteredRequests.length !== 1
                            ? "s"
                            : ""}{" "}
                        shown
                    </p>

                </div>

                <div className="admin-leave-table-wrapper">

                    <table className="admin-leave-table">

                        <thead>
                            <tr>

                                <th>
                                    EMPLOYEE
                                </th>

                                <th>
                                    LEAVE TYPE
                                </th>

                                <th>
                                    DATES
                                </th>

                                <th>
                                    DAYS
                                </th>

                                <th>
                                    STATUS
                                </th>

                                <th>
                                    REQUESTED
                                </th>

                                <th>
                                    ACTION
                                </th>

                            </tr>
                        </thead>

                        <tbody>

                            {filteredRequests.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan={7}
                                        className="admin-leave-empty"
                                    >
                                        <div>
                                            <strong>
                                                NO LEAVE REQUESTS FOUND
                                            </strong>

                                            <span>
                                                Try changing your search
                                                or filter settings.
                                            </span>
                                        </div>
                                    </td>

                                </tr>

                            ) : (

                                filteredRequests.map(
                                    (request) => {

                                        const employee =
                                            request.employees;

                                        return (
                                            <tr
                                                key={
                                                    request.id
                                                }
                                            >

                                                {/* EMPLOYEE */}

                                                <td>

                                                    <div className="admin-leave-employee">

                                                        {employee?.profile_image ? (

                                                            <img
                                                                src={
                                                                    employee.profile_image
                                                                }
                                                                alt={
                                                                    employee.name
                                                                }
                                                            />

                                                        ) : (

                                                            <div className="admin-leave-avatar">
                                                                {employee?.name
                                                                    ?.charAt(
                                                                        0
                                                                    )
                                                                    .toUpperCase() ||
                                                                    "?"}
                                                            </div>

                                                        )}

                                                        <div>

                                                            <strong>
                                                                {employee?.name ||
                                                                    "Unknown Employee"}
                                                            </strong>

                                                            <span>
                                                                {employee?.employee_id ||
                                                                    "—"}
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* LEAVE TYPE */}

                                                <td>

                                                    <span className="admin-leave-type">
                                                        {
                                                            request.leave_type
                                                        }
                                                    </span>

                                                </td>

                                                {/* DATES */}

                                                <td>

                                                    <div className="admin-leave-dates">

                                                        <strong>
                                                            {
                                                                formatDate(
                                                                    request.start_date
                                                                )
                                                            }
                                                        </strong>

                                                        <span>
                                                            to
                                                        </span>

                                                        <strong>
                                                            {
                                                                formatDate(
                                                                    request.end_date
                                                                )
                                                            }
                                                        </strong>

                                                    </div>

                                                </td>

                                                {/* DAYS */}

                                                <td>

                                                    <strong className="admin-leave-days">
                                                        {
                                                            getDays(
                                                                request.start_date,
                                                                request.end_date
                                                            )
                                                        }
                                                    </strong>

                                                </td>

                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={getStatusClass(
                                                            request.status
                                                        )}
                                                    >
                                                        {
                                                            request.status
                                                        }
                                                    </span>

                                                </td>

                                                {/* REQUESTED */}

                                                <td>

                                                    <span className="admin-leave-created">
                                                        {
                                                            formatDateTime(
                                                                request.created_at
                                                            )
                                                        }
                                                    </span>

                                                </td>

                                                {/* ACTION */}

                                                <td>

                                                    <button
                                                        type="button"
                                                        className="admin-leave-view"
                                                        onClick={() =>
                                                            openRequest(
                                                                request
                                                            )
                                                        }
                                                    >
                                                        VIEW
                                                        <span>
                                                            →
                                                        </span>
                                                    </button>

                                                </td>

                                            </tr>
                                        );
                                    }
                                )
                            )}

                        </tbody>

                    </table>

                </div>

            </section>

            {/* =================================================
                DETAILS / REVIEW MODAL
            ================================================= */}

            {selectedRequest && (
                <div
                    className="admin-leave-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeModal();
                        }
                    }}
                >

                    <div className="admin-leave-modal">

                        {/* MODAL HEADER */}

                        <div className="admin-leave-modal-header">

                            <div>

                                <span>
                                    LEAVE REQUEST
                                </span>

                                <h2>
                                    Request Details
                                </h2>

                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeModal
                                }
                                disabled={
                                    reviewing
                                }
                            >
                                ×
                            </button>

                        </div>

                        {/* EMPLOYEE */}

                        <div className="admin-leave-modal-employee">

                            {selectedRequest
                                .employees
                                ?.profile_image ? (

                                <img
                                    src={
                                        selectedRequest
                                            .employees
                                            .profile_image
                                    }
                                    alt={
                                        selectedRequest
                                            .employees
                                            .name
                                    }
                                />

                            ) : (

                                <div className="admin-leave-modal-avatar">
                                    {selectedRequest
                                        .employees
                                        ?.name
                                        ?.charAt(
                                            0
                                        )
                                        .toUpperCase() ||
                                        "?"}
                                </div>

                            )}

                            <div>

                                <strong>
                                    {
                                        selectedRequest
                                            .employees
                                            ?.name ||
                                        "Unknown Employee"
                                    }
                                </strong>

                                <span>
                                    {
                                        selectedRequest
                                            .employees
                                            ?.employee_id ||
                                        "—"
                                    }
                                </span>

                                <small>
                                    {
                                        selectedRequest
                                            .employees
                                            ?.email ||
                                        "—"
                                    }
                                </small>

                            </div>

                        </div>

                        {/* DETAILS GRID */}

                        <div className="admin-leave-details-grid">

                            <div>

                                <span>
                                    DEPARTMENT
                                </span>

                                <strong>
                                    {
                                        selectedRequest
                                            .employees
                                            ?.department ||
                                        "Not specified"
                                    }
                                </strong>

                            </div>

                            <div>

                                <span>
                                    LEAVE TYPE
                                </span>

                                <strong>
                                    {
                                        selectedRequest.leave_type
                                    }
                                </strong>

                            </div>

                            <div>

                                <span>
                                    START DATE
                                </span>

                                <strong>
                                    {
                                        formatDate(
                                            selectedRequest.start_date
                                        )
                                    }
                                </strong>

                            </div>

                            <div>

                                <span>
                                    END DATE
                                </span>

                                <strong>
                                    {
                                        formatDate(
                                            selectedRequest.end_date
                                        )
                                    }
                                </strong>

                            </div>

                            <div>

                                <span>
                                    DURATION
                                </span>

                                <strong>
                                    {
                                        getDays(
                                            selectedRequest.start_date,
                                            selectedRequest.end_date
                                        )
                                    }{" "}
                                    day
                                    {getDays(
                                        selectedRequest.start_date,
                                        selectedRequest.end_date
                                    ) !== 1
                                        ? "s"
                                        : ""}
                                </strong>

                            </div>

                            <div>

                                <span>
                                    STATUS
                                </span>

                                <strong>
                                    <span
                                        className={getStatusClass(
                                            selectedRequest.status
                                        )}
                                    >
                                        {
                                            selectedRequest.status
                                        }
                                    </span>
                                </strong>

                            </div>

                        </div>

                        {/* REASON */}

                        <div className="admin-leave-reason-box">

                            <span>
                                EMPLOYEE REASON
                            </span>

                            <p>
                                {
                                    selectedRequest.reason ||
                                    "No reason provided."
                                }
                            </p>

                        </div>

                        {/* REVIEWED INFO */}

                        {selectedRequest.status !==
                            "Pending" && (
                            <div className="admin-leave-reviewed-box">

                                <div>

                                    <span>
                                        REVIEWED
                                    </span>

                                    <strong>
                                        {
                                            formatDateTime(
                                                selectedRequest.reviewed_at
                                            )
                                        }
                                    </strong>

                                </div>

                                {selectedRequest.admin_comment && (
                                    <div>

                                        <span>
                                            ADMIN COMMENT
                                        </span>

                                        <p>
                                            {
                                                selectedRequest.admin_comment
                                            }
                                        </p>

                                    </div>
                                )}

                            </div>
                        )}

                        {/* PENDING REVIEW */}

                        {selectedRequest.status ===
                            "Pending" && (

                            <div className="admin-leave-review">

                                <label>
                                    ADMIN COMMENT
                                </label>

                                <textarea
                                    value={
                                        adminComment
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setAdminComment(
                                            event.target
                                                .value
                                        )
                                    }
                                    placeholder="Optional comment for the employee..."
                                    rows={4}
                                    disabled={
                                        reviewing
                                    }
                                />

                                <div className="admin-leave-review-actions">

                                    <button
                                        type="button"
                                        className="admin-leave-reject"
                                        onClick={() =>
                                            reviewRequest(
                                                "Rejected"
                                            )
                                        }
                                        disabled={
                                            reviewing
                                        }
                                    >
                                        {reviewing
                                            ? "PROCESSING..."
                                            : "REJECT"}
                                    </button>

                                    <button
                                        type="button"
                                        className="admin-leave-approve"
                                        onClick={() =>
                                            reviewRequest(
                                                "Approved"
                                            )
                                        }
                                        disabled={
                                            reviewing
                                        }
                                    >
                                        {reviewing
                                            ? "PROCESSING..."
                                            : "APPROVE"}
                                    </button>

                                </div>

                            </div>

                        )}

                        {/* CLOSE */}

                        {selectedRequest.status !==
                            "Pending" && (

                            <div className="admin-leave-modal-footer">

                                <button
                                    type="button"
                                    onClick={
                                        closeModal
                                    }
                                >
                                    CLOSE
                                </button>

                            </div>

                        )}

                    </div>

                </div>
            )}

        </main>
    );
};

export default LeaveRequests;