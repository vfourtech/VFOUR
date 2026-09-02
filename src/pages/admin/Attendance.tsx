import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./Attendance.css";

interface Employee {
    id: string;
    employee_id: string;
    name: string;
    email: string;
    department: string | null;
    profile_image: string | null;
    is_active: boolean;
}

interface AttendanceRecord {
    id: string;
    employee_id: string;
    date: string;
    check_in: string | null;
    check_out: string | null;
    working_hours: string | null;
    status: string;
}

interface AttendanceRow {
    employee: Employee;
    attendance: AttendanceRecord | null;
}

const Attendance = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split("T")[0]
    );

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const getAttendance = async () => {
        try {
            setLoading(true);
            setError("");

            const {
                data: employeeData,
                error: employeeError,
            } = await supabase
                .from("employees")
                .select(`
                    id,
                    employee_id,
                    name,
                    email,
                    department,
                    profile_image,
                    is_active
                `)
                .eq("role", "employee")
                .order("name", {
                    ascending: true,
                });

            if (employeeError) {
                throw employeeError;
            }

            const {
                data: attendanceData,
                error: attendanceError,
            } = await supabase
                .from("attendance")
                .select(`
                    id,
                    employee_id,
                    date,
                    check_in,
                    check_out,
                    working_hours,
                    status
                `)
                .eq("date", selectedDate);

            if (attendanceError) {
                throw attendanceError;
            }

            setEmployees(employeeData || []);
            setAttendance(attendanceData || []);
        } catch (err) {
            console.error("Attendance loading error:", err);

            setError(
                "Unable to load attendance records."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAttendance();
    }, [selectedDate]);

    const rows = useMemo<AttendanceRow[]>(() => {
        return employees.map((employee) => ({
            employee,
            attendance:
                attendance.find(
                    (record) =>
                        record.employee_id === employee.id
                ) || null,
        }));
    }, [employees, attendance]);

    const filteredRows = useMemo(() => {
        return rows.filter((row) => {
            const employee = row.employee;
            const record = row.attendance;

            const searchText = search
                .toLowerCase()
                .trim();

            const matchesSearch =
                !searchText ||
                employee.name
                    .toLowerCase()
                    .includes(searchText) ||
                employee.employee_id
                    .toLowerCase()
                    .includes(searchText) ||
                (employee.department || "")
                    .toLowerCase()
                    .includes(searchText);

            let currentStatus = record?.status || "Not Marked";

            const matchesStatus =
                statusFilter === "All" ||
                currentStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [
        rows,
        search,
        statusFilter,
    ]);

    const presentCount = rows.filter(
        (row) =>
            row.attendance?.status === "Present"
    ).length;

    const halfDayCount = rows.filter(
        (row) =>
            row.attendance?.status === "Half Day"
    ).length;

    const absentCount = rows.filter(
        (row) =>
            row.attendance?.status === "Absent"
    ).length;

    const leaveCount = rows.filter(
        (row) =>
            row.attendance?.status === "Leave"
    ).length;

    const notMarkedCount = rows.filter(
        (row) => !row.attendance
    ).length;

    const formatTime = (
        value: string | null
    ) => {
        if (!value) return "--";

        return new Date(value).toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    const formatDate = (
        value: string
    ) => {
        return new Date(
            `${value}T00:00:00`
        ).toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
            }
        );
    };

    const getInitials = (
        name: string
    ) => {
        return name
            .split(" ")
            .map((part) => part.charAt(0))
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    const getStatusClass = (
        status: string
    ) => {
        switch (status) {
            case "Present":
                return "status-present";

            case "Half Day":
                return "status-half";

            case "Absent":
                return "status-absent";

            case "Leave":
                return "status-leave";

            default:
                return "status-not-marked";
        }
    };

    return (
        <main className="admin-attendance">
            <div className="attendance-container">

                {/* HEADER */}
                <header className="attendance-header">
                    <div>
                        <span className="attendance-eyebrow">
                            VFOUR / ADMIN
                        </span>

                        <h1>
                            Attendance
                        </h1>

                        <p>
                            Monitor employee attendance,
                            working hours and daily status.
                        </p>
                    </div>

                    <div className="attendance-date-display">
                        <span>
                            SELECTED DATE
                        </span>

                        <strong>
                            {formatDate(selectedDate)}
                        </strong>
                    </div>
                </header>


                {/* SUMMARY */}
                <section className="attendance-summary">

                    <div className="attendance-summary-card">
                        <span>
                            TOTAL EMPLOYEES
                        </span>

                        <strong>
                            {employees.length}
                        </strong>
                    </div>

                    <div className="attendance-summary-card">
                        <span>
                            PRESENT
                        </span>

                        <strong>
                            {presentCount}
                        </strong>
                    </div>

                    <div className="attendance-summary-card">
                        <span>
                            HALF DAY
                        </span>

                        <strong>
                            {halfDayCount}
                        </strong>
                    </div>

                    <div className="attendance-summary-card">
                        <span>
                            ABSENT
                        </span>

                        <strong>
                            {absentCount}
                        </strong>
                    </div>

                    <div className="attendance-summary-card">
                        <span>
                            LEAVE
                        </span>

                        <strong>
                            {leaveCount}
                        </strong>
                    </div>

                    <div className="attendance-summary-card">
                        <span>
                            NOT MARKED
                        </span>

                        <strong>
                            {notMarkedCount}
                        </strong>
                    </div>

                </section>


                {/* TOOLBAR */}
                <section className="attendance-toolbar">

                    <div className="attendance-search">
                        <input
                            type="text"
                            placeholder="Search employee, ID or department..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />
                    </div>

                    <div className="attendance-filter">
                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                        >
                            <option value="All">
                                All Status
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

                            <option value="Not Marked">
                                Not Marked
                            </option>
                        </select>
                    </div>

                    <div className="attendance-date-input">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(event) =>
                                setSelectedDate(
                                    event.target.value
                                )
                            }
                        />
                    </div>

                    <button
                        className="attendance-refresh"
                        onClick={getAttendance}
                    >
                        REFRESH
                    </button>

                </section>


                {/* ERROR */}
                {error && (
                    <div className="attendance-error">
                        {error}
                    </div>
                )}


                {/* TABLE */}
                <section className="attendance-table-section">

                    <div className="attendance-table-heading">
                        <div>
                            <span>
                                DAILY RECORD
                            </span>

                            <h2>
                                Employee Attendance
                            </h2>
                        </div>

                        <small>
                            {filteredRows.length} employees
                        </small>
                    </div>


                    {loading ? (
                        <div className="attendance-loading">
                            LOADING ATTENDANCE...
                        </div>
                    ) : (
                        <div className="attendance-table-wrapper">
                            <table className="attendance-table">

                                <thead>
                                    <tr>
                                        <th>EMPLOYEE</th>
                                        <th>ID</th>
                                        <th>DEPARTMENT</th>
                                        <th>CHECK IN</th>
                                        <th>CHECK OUT</th>
                                        <th>WORKING HOURS</th>
                                        <th>STATUS</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {filteredRows.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="attendance-empty"
                                            >
                                                NO EMPLOYEES FOUND.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRows.map(
                                            ({
                                                employee,
                                                attendance,
                                            }) => {

                                                const status =
                                                    attendance?.status ||
                                                    "Not Marked";

                                                return (
                                                    <tr
                                                        key={
                                                            employee.id
                                                        }
                                                    >

                                                        <td>
                                                            <div className="attendance-employee">

                                                                <div className="attendance-avatar">
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
                                                                        getInitials(
                                                                            employee.name
                                                                        )
                                                                    )}
                                                                </div>

                                                                <div>
                                                                    <strong>
                                                                        {
                                                                            employee.name
                                                                        }
                                                                    </strong>

                                                                    <span>
                                                                        {
                                                                            employee.email
                                                                        }
                                                                    </span>
                                                                </div>

                                                            </div>
                                                        </td>


                                                        <td>
                                                            <span className="attendance-id">
                                                                {
                                                                    employee.employee_id
                                                                }
                                                            </span>
                                                        </td>


                                                        <td>
                                                            {
                                                                employee.department ||
                                                                "—"
                                                            }
                                                        </td>


                                                        <td>
                                                            {attendance
                                                                ? formatTime(
                                                                    attendance.check_in
                                                                )
                                                                : "--"}
                                                        </td>


                                                        <td>
                                                            {attendance
                                                                ? formatTime(
                                                                    attendance.check_out
                                                                )
                                                                : "--"}
                                                        </td>


                                                        <td>
                                                            {
                                                                attendance?.working_hours ||
                                                                "--"
                                                            }
                                                        </td>


                                                        <td>
                                                            <span
                                                                className={`attendance-status ${getStatusClass(
                                                                    status
                                                                )}`}
                                                            >
                                                                <i />

                                                                {
                                                                    status
                                                                }
                                                            </span>
                                                        </td>

                                                    </tr>
                                                );
                                            }
                                        )
                                    )}

                                </tbody>

                            </table>
                        </div>
                    )}

                </section>

            </div>
        </main>
    );
};

export default Attendance;