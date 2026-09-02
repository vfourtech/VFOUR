import {
    useEffect,
    useState,
    type FormEvent,
} from "react";
import { supabase } from "../../../lib/supabase";
import "./Employees.css";

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
    created_at: string;
}

interface EmployeeForm {
    name: string;
    employee_id: string;
    department: string;
    profile_image: string;
}

const emptyForm: EmployeeForm = {
    name: "",
    employee_id: "",
    department: "",
    profile_image: "",
};

const Employees = () => {
    const [employees, setEmployees] =
        useState<Employee[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState<
            "all" | "active" | "inactive"
        >("all");

    const [selectedEmployee, setSelectedEmployee] =
        useState<Employee | null>(null);

    /* =========================================================
       ADD EMPLOYEE
    ========================================================= */

    const [showAddEmployee, setShowAddEmployee] =
        useState(false);

    const [addingEmployee, setAddingEmployee] =
        useState(false);

    const [addEmployeeError, setAddEmployeeError] =
        useState("");

    const [addEmployeeSuccess, setAddEmployeeSuccess] =
        useState("");

    const [employeeForm, setEmployeeForm] =
        useState({
            name: "",
            email: "",
            password: "",
            employee_id: "",
            department: "",
        });

    /* =========================================================
       EDIT EMPLOYEE
    ========================================================= */

    const [showEditEmployee, setShowEditEmployee] =
        useState(false);

    const [editingEmployee, setEditingEmployee] =
        useState(false);

    const [editEmployeeError, setEditEmployeeError] =
        useState("");

    const [editEmployeeSuccess, setEditEmployeeSuccess] =
        useState("");

    const [editForm, setEditForm] =
        useState<EmployeeForm>(emptyForm);

    /* =========================================================
       DEACTIVATE CONFIRMATION
    ========================================================= */

    const [showDeactivateConfirm, setShowDeactivateConfirm] =
        useState(false);

    const [changingStatus, setChangingStatus] =
        useState(false);

    /* =========================================================
       FETCH EMPLOYEES
    ========================================================= */

    const fetchEmployees = async () => {
        setLoading(true);
        setError("");

        try {
            const { data, error } =
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
                        is_active,
                        created_at
                    `)
                    .order("created_at", {
                        ascending: false,
                    });

            if (error) {
                throw error;
            }

            setEmployees(
                (data || []) as Employee[]
            );
        } catch (err: any) {
            console.error(
                "Fetch employees error:",
                err
            );

            setError(
                err?.message ||
                    "Unable to load employees."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    /* =========================================================
       FILTER
    ========================================================= */

    const filteredEmployees =
        employees.filter((employee) => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            const matchesSearch =
                !query ||
                employee.name
                    .toLowerCase()
                    .includes(query) ||
                employee.employee_id
                    .toLowerCase()
                    .includes(query) ||
                employee.email
                    .toLowerCase()
                    .includes(query) ||
                (
                    employee.department || ""
                )
                    .toLowerCase()
                    .includes(query);

            const matchesStatus =
                statusFilter === "all" ||
                (
                    statusFilter === "active" &&
                    employee.is_active
                ) ||
                (
                    statusFilter === "inactive" &&
                    !employee.is_active
                );

            return (
                matchesSearch &&
                matchesStatus
            );
        });

    /* =========================================================
       COUNTS
    ========================================================= */

    const totalEmployees =
        employees.length;

    const activeEmployees =
        employees.filter(
            (employee) =>
                employee.is_active
        ).length;

    const inactiveEmployees =
        employees.filter(
            (employee) =>
                !employee.is_active
        ).length;

    /* =========================================================
       INITIALS
    ========================================================= */

    const getInitials = (
        name: string
    ) => {
        const parts =
            name.trim().split(/\s+/);

        if (parts.length === 1) {
            return parts[0]
                .substring(0, 2)
                .toUpperCase();
        }

        return (
            parts[0][0] +
            parts[parts.length - 1][0]
        ).toUpperCase();
    };

    /* =========================================================
       FORMAT DATE
    ========================================================= */

    const formatDate = (
        dateString: string
    ) => {
        const date = new Date(
            dateString
        );

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    /* =========================================================
       OPEN EDIT
    ========================================================= */

    const openEditEmployee = (
        employee: Employee
    ) => {
        setEditEmployeeError("");
        setEditEmployeeSuccess("");

        setEditForm({
            name: employee.name || "",
            employee_id:
                employee.employee_id || "",
            department:
                employee.department || "",
            profile_image:
                employee.profile_image || "",
        });

        setShowEditEmployee(true);
    };

    /* =========================================================
       CLOSE EDIT
    ========================================================= */

    const closeEditEmployee = () => {
        if (editingEmployee) {
            return;
        }

        setShowEditEmployee(false);

        setEditEmployeeError("");
        setEditEmployeeSuccess("");

        setEditForm(emptyForm);
    };

    /* =========================================================
       SAVE EDITED EMPLOYEE
    ========================================================= */

    const handleSaveEmployee = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!selectedEmployee) {
            return;
        }

        setEditEmployeeError("");
        setEditEmployeeSuccess("");
        setEditingEmployee(true);

        const name =
            editForm.name.trim();

        const employeeId =
            editForm.employee_id
                .trim()
                .toUpperCase();

        const department =
            editForm.department.trim();

        const profileImage =
            editForm.profile_image.trim();

        if (!name) {
            setEditEmployeeError(
                "Please enter the employee name."
            );

            setEditingEmployee(false);
            return;
        }

        if (!employeeId) {
            setEditEmployeeError(
                "Please enter the employee ID."
            );

            setEditingEmployee(false);
            return;
        }

        try {
            const { data, error } =
                await supabase
                    .from("employees")
                    .update({
                        name,
                        employee_id:
                            employeeId,
                        department:
                            department || null,
                        profile_image:
                            profileImage || null,
                    })
                    .eq(
                        "id",
                        selectedEmployee.id
                    )
                    .select(`
                        id,
                        user_id,
                        employee_id,
                        name,
                        email,
                        role,
                        department,
                        profile_image,
                        is_active,
                        created_at
                    `)
                    .single();

            if (error) {
                throw error;
            }

            const updatedEmployee =
                data as Employee;

            setEmployees((current) =>
                current.map((employee) =>
                    employee.id ===
                    updatedEmployee.id
                        ? updatedEmployee
                        : employee
                )
            );

            setSelectedEmployee(
                updatedEmployee
            );

            setEditEmployeeSuccess(
                "Employee details updated successfully."
            );

            setTimeout(() => {
                setShowEditEmployee(false);
                setEditEmployeeSuccess("");
            }, 1000);
        } catch (err: any) {
            console.error(
                "Update employee error:",
                err
            );

            let message =
                err?.message ||
                "Unable to update employee.";

            if (
                err?.code === "23505"
            ) {
                message =
                    "Employee ID already exists. Please use a different ID.";
            }

            setEditEmployeeError(
                message
            );
        } finally {
            setEditingEmployee(false);
        }
    };

    /* =========================================================
       TOGGLE EMPLOYEE STATUS
    ========================================================= */

    const toggleEmployeeStatus =
        async () => {
            if (!selectedEmployee) {
                return;
            }

            const employee =
                selectedEmployee;

            const newStatus =
                !employee.is_active;

            setChangingStatus(true);
            setError("");

            try {
                const {
                    error:
                        employeeError,
                } = await supabase
                    .from("employees")
                    .update({
                        is_active:
                            newStatus,
                    })
                    .eq(
                        "id",
                        employee.id
                    );

                if (employeeError) {
                    throw employeeError;
                }

                /*
                 * Keep profiles.is_active synchronized
                 * with employees.is_active.
                 */

                const {
                    error:
                        profileError,
                } = await supabase
                    .from("profiles")
                    .update({
                        is_active:
                            newStatus,
                    })
                    .eq(
                        "user_id",
                        employee.user_id
                    )
                    .eq(
                        "role",
                        "employee"
                    );

                if (profileError) {
                    throw profileError;
                }

                const updatedEmployee = {
                    ...employee,
                    is_active:
                        newStatus,
                };

                setEmployees((current) =>
                    current.map(
                        (item) =>
                            item.id ===
                            employee.id
                                ? updatedEmployee
                                : item
                    )
                );

                setSelectedEmployee(
                    updatedEmployee
                );

                setShowDeactivateConfirm(
                    false
                );
            } catch (err: any) {
                console.error(
                    "Toggle employee status error:",
                    err
                );

                setError(
                    err?.message ||
                        "Unable to update employee status."
                );
            } finally {
                setChangingStatus(false);
            }
        };

    /* =========================================================
       OPEN STATUS CONFIRMATION
    ========================================================= */

    const handleStatusButton = () => {
        if (!selectedEmployee) {
            return;
        }

        /*
         * Activation does not need a destructive
         * confirmation.
         */

        if (
            !selectedEmployee.is_active
        ) {
            toggleEmployeeStatus();
            return;
        }

        setShowDeactivateConfirm(
            true
        );
    };

    /* =========================================================
       ADD EMPLOYEE
    ========================================================= */

    const handleAddEmployee = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setAddEmployeeError("");
        setAddEmployeeSuccess("");
        setAddingEmployee(true);

        const name =
            employeeForm.name.trim();

        const email =
            employeeForm.email
                .trim()
                .toLowerCase();

        const password =
            employeeForm.password;

        const employeeId =
            employeeForm.employee_id
                .trim()
                .toUpperCase();

        const department =
            employeeForm.department.trim();

        if (!name) {
            setAddEmployeeError(
                "Please enter the employee name."
            );

            setAddingEmployee(false);
            return;
        }

        if (!email) {
            setAddEmployeeError(
                "Please enter the employee email."
            );

            setAddingEmployee(false);
            return;
        }

        if (password.length < 8) {
            setAddEmployeeError(
                "Password must contain at least 8 characters."
            );

            setAddingEmployee(false);
            return;
        }

        if (!employeeId) {
            setAddEmployeeError(
                "Please enter the employee ID."
            );

            setAddingEmployee(false);
            return;
        }

        try {
            const {
                data,
                error,
            } =
                await supabase.functions.invoke(
                    "create-employee",
                    {
                        body: {
                            name,
                            email,
                            password,
                            employee_id:
                                employeeId,
                            department:
                                department ||
                                null,
                        },
                    }
                );

            if (error) {
                throw error;
            }

            if (
                !data ||
                data.success !== true
            ) {
                throw new Error(
                    data?.error ||
                        "Unable to create employee."
                );
            }

            setAddEmployeeSuccess(
                "Employee created successfully."
            );

            setEmployeeForm({
                name: "",
                email: "",
                password: "",
                employee_id: "",
                department: "",
            });

            await fetchEmployees();

            setTimeout(() => {
                setShowAddEmployee(false);
                setAddEmployeeSuccess("");
            }, 1200);
        } catch (err: any) {
            console.error(
                "Add employee error:",
                err
            );

            let message =
                err?.message ||
                "Unable to create employee.";

            if (
                err?.context &&
                typeof err.context
                    .json === "function"
            ) {
                try {
                    const body =
                        await err.context.json();

                    if (body?.error) {
                        message =
                            body.error;
                    }
                } catch {
                    // Keep original error.
                }
            }

            setAddEmployeeError(
                message
            );
        } finally {
            setAddingEmployee(false);
        }
    };

    /* =========================================================
       CLOSE ADD MODAL
    ========================================================= */

    const closeAddEmployeeModal =
        () => {
            if (addingEmployee) {
                return;
            }

            setShowAddEmployee(false);

            setAddEmployeeError("");
            setAddEmployeeSuccess("");

            setEmployeeForm({
                name: "",
                email: "",
                password: "",
                employee_id: "",
                department: "",
            });
        };

    /* =========================================================
       CLOSE DETAILS
    ========================================================= */

    const closeEmployeeDetails = () => {
        if (
            changingStatus ||
            editingEmployee
        ) {
            return;
        }

        setSelectedEmployee(null);
    };

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <main className="admin-employees">

            <div className="employees-container">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="employees-header">

                    <div>
                        <span className="employees-eyebrow">
                            PEOPLE / MANAGEMENT
                        </span>

                        <h1>
                            Employees
                        </h1>

                        <p>
                            Manage employee accounts,
                            profiles and access.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="employees-add-button"
                        onClick={() => {
                            setAddEmployeeError("");
                            setAddEmployeeSuccess("");
                            setShowAddEmployee(true);
                        }}
                    >
                        <span>+</span>
                        ADD EMPLOYEE
                    </button>

                </header>


                {/* =================================================
                    SUMMARY
                ================================================= */}

                <section className="employees-summary">

                    <div className="employee-summary-card">

                        <span>
                            TOTAL EMPLOYEES
                        </span>

                        <strong>
                            {totalEmployees}
                        </strong>

                    </div>


                    <div className="employee-summary-card">

                        <span>
                            ACTIVE
                        </span>

                        <strong>
                            {activeEmployees}
                        </strong>

                    </div>


                    <div className="employee-summary-card">

                        <span>
                            INACTIVE
                        </span>

                        <strong>
                            {inactiveEmployees}
                        </strong>

                    </div>

                </section>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div className="employees-error">
                        {error}
                    </div>
                )}


                {/* =================================================
                    TOOLBAR
                ================================================= */}

                <section className="employees-toolbar">

                    <div className="employees-search">

                        <span className="employees-search-icon">
                            ⌕
                        </span>

                        <input
                            type="text"
                            placeholder="Search name, ID, email or department..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />

                        {search && (
                            <button
                                type="button"
                                className="employees-search-clear"
                                onClick={() =>
                                    setSearch("")
                                }
                                aria-label="Clear search"
                            >
                                ×
                            </button>
                        )}

                    </div>


                    <div className="employees-filters">

                        <button
                            type="button"
                            className={
                                statusFilter ===
                                "all"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setStatusFilter(
                                    "all"
                                )
                            }
                        >
                            ALL
                        </button>

                        <button
                            type="button"
                            className={
                                statusFilter ===
                                "active"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setStatusFilter(
                                    "active"
                                )
                            }
                        >
                            ACTIVE
                        </button>

                        <button
                            type="button"
                            className={
                                statusFilter ===
                                "inactive"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setStatusFilter(
                                    "inactive"
                                )
                            }
                        >
                            INACTIVE
                        </button>

                    </div>

                </section>


                {/* =================================================
                    TABLE
                ================================================= */}

                <section className="employees-table-card">

                    <div className="employees-table-header">

                        <div>

                            <span>
                                EMPLOYEE DIRECTORY
                            </span>

                            <strong>
                                {
                                    filteredEmployees.length
                                }{" "}
                                employee
                                {filteredEmployees.length !==
                                1
                                    ? "s"
                                    : ""}
                            </strong>

                        </div>

                    </div>


                    {loading ? (

                        <div className="employees-loading">

                            <div className="employees-loader" />

                            <span>
                                Loading employees...
                            </span>

                        </div>

                    ) : filteredEmployees.length ===
                      0 ? (

                        <div className="employees-empty">

                            <div className="employees-empty-icon">
                                ○
                            </div>

                            <h3>
                                No employees found
                            </h3>

                            <p>
                                {search ||
                                statusFilter !==
                                    "all"
                                    ? "Try changing your search or filter."
                                    : "No employees have been added yet."}
                            </p>

                        </div>

                    ) : (

                        <div className="employees-table-wrapper">

                            <table className="employees-table">

                                <thead>

                                    <tr>

                                        <th>
                                            EMPLOYEE
                                        </th>

                                        <th>
                                            ID
                                        </th>

                                        <th>
                                            DEPARTMENT
                                        </th>

                                        <th>
                                            STATUS
                                        </th>

                                        <th>
                                            JOINED
                                        </th>

                                        <th>
                                            ACTION
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredEmployees.map(
                                        (
                                            employee
                                        ) => (

                                            <tr
                                                key={
                                                    employee.id
                                                }
                                            >

                                                <td>

                                                    <div className="employee-info">

                                                        {employee.profile_image ? (

                                                            <img
                                                                src={
                                                                    employee.profile_image
                                                                }
                                                                alt={
                                                                    employee.name
                                                                }
                                                                className="employee-avatar"
                                                            />

                                                        ) : (

                                                            <div className="employee-avatar employee-avatar-placeholder">
                                                                {getInitials(
                                                                    employee.name
                                                                )}
                                                            </div>

                                                        )}

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

                                                    <span className="employee-id">
                                                        {
                                                            employee.employee_id
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <span className="employee-department">
                                                        {
                                                            employee.department ||
                                                            "—"
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            employee.is_active
                                                                ? "employee-status active"
                                                                : "employee-status inactive"
                                                        }
                                                    >

                                                        <i />

                                                        {employee.is_active
                                                            ? "ACTIVE"
                                                            : "INACTIVE"}

                                                    </span>

                                                </td>


                                                <td>

                                                    <span className="employee-date">
                                                        {formatDate(
                                                            employee.created_at
                                                        )}
                                                    </span>

                                                </td>


                                                <td>

                                                    <button
                                                        type="button"
                                                        className="employee-view-button"
                                                        onClick={() =>
                                                            setSelectedEmployee(
                                                                employee
                                                            )
                                                        }
                                                    >
                                                        VIEW
                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            </div>


            {/* =====================================================
                EMPLOYEE DETAILS MODAL
            ===================================================== */}

            {selectedEmployee &&
                !showEditEmployee && (

                    <div
                        className="employee-modal-overlay"
                        onClick={
                            closeEmployeeDetails
                        }
                    >

                        <div
                            className="employee-modal"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >

                            <button
                                type="button"
                                className="employee-modal-close"
                                onClick={
                                    closeEmployeeDetails
                                }
                                aria-label="Close"
                            >
                                ×
                            </button>


                            <span className="employee-modal-eyebrow">
                                EMPLOYEE PROFILE
                            </span>


                            <div className="employee-modal-profile">

                                {selectedEmployee.profile_image ? (

                                    <img
                                        src={
                                            selectedEmployee.profile_image
                                        }
                                        alt={
                                            selectedEmployee.name
                                        }
                                        className="employee-modal-avatar"
                                    />

                                ) : (

                                    <div className="employee-modal-avatar employee-avatar-placeholder">
                                        {getInitials(
                                            selectedEmployee.name
                                        )}
                                    </div>

                                )}


                                <div>

                                    <h2>
                                        {
                                            selectedEmployee.name
                                        }
                                    </h2>

                                    <p>
                                        {
                                            selectedEmployee.email
                                        }
                                    </p>

                                </div>

                            </div>


                            <div className="employee-details-grid">

                                <div className="employee-detail">

                                    <span>
                                        EMPLOYEE ID
                                    </span>

                                    <strong>
                                        {
                                            selectedEmployee.employee_id
                                        }
                                    </strong>

                                </div>


                                <div className="employee-detail">

                                    <span>
                                        ROLE
                                    </span>

                                    <strong>
                                        {
                                            selectedEmployee.role
                                        }
                                    </strong>

                                </div>


                                <div className="employee-detail">

                                    <span>
                                        DEPARTMENT
                                    </span>

                                    <strong>
                                        {
                                            selectedEmployee.department ||
                                            "Not assigned"
                                        }
                                    </strong>

                                </div>


                                <div className="employee-detail">

                                    <span>
                                        EMAIL
                                    </span>

                                    <strong>
                                        {
                                            selectedEmployee.email
                                        }
                                    </strong>

                                </div>


                                <div className="employee-detail">

                                    <span>
                                        STATUS
                                    </span>

                                    <strong
                                        className={
                                            selectedEmployee.is_active
                                                ? "detail-status-active"
                                                : "detail-status-inactive"
                                        }
                                    >
                                        {
                                            selectedEmployee.is_active
                                                ? "Active"
                                                : "Inactive"
                                        }
                                    </strong>

                                </div>


                                <div className="employee-detail">

                                    <span>
                                        JOINED
                                    </span>

                                    <strong>
                                        {formatDate(
                                            selectedEmployee.created_at
                                        )}
                                    </strong>

                                </div>

                            </div>


                            {/* MODAL ACTIONS */}

                            <div className="employee-modal-actions">

                                <button
                                    type="button"
                                    className="employee-edit-button"
                                    onClick={() =>
                                        openEditEmployee(
                                            selectedEmployee
                                        )
                                    }
                                >
                                    EDIT DETAILS
                                </button>


                                <button
                                    type="button"
                                    className={
                                        selectedEmployee.is_active
                                            ? "employee-deactivate-button"
                                            : "employee-activate-button"
                                    }
                                    onClick={
                                        handleStatusButton
                                    }
                                    disabled={
                                        changingStatus
                                    }
                                >
                                    {selectedEmployee.is_active
                                        ? "DEACTIVATE EMPLOYEE"
                                        : "ACTIVATE EMPLOYEE"}
                                </button>

                            </div>

                        </div>

                    </div>

                )}


            {/* =====================================================
                EDIT EMPLOYEE MODAL
            ===================================================== */}

            {showEditEmployee &&
                selectedEmployee && (

                    <div
                        className="employee-modal-overlay"
                        onClick={closeEditEmployee}
                    >

                        <div
                            className="employee-modal employee-edit-modal"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >

                            <button
                                type="button"
                                className="employee-modal-close"
                                disabled={
                                    editingEmployee
                                }
                                onClick={
                                    closeEditEmployee
                                }
                                aria-label="Close"
                            >
                                ×
                            </button>


                            <span className="employee-modal-eyebrow">
                                EMPLOYEE MANAGEMENT
                            </span>


                            <div className="employee-edit-heading">

                                <h2>
                                    Edit Details
                                </h2>

                                <p>
                                    Update this employee's
                                    profile information.
                                </p>

                            </div>


                            <form
                                className="employee-edit-form"
                                onSubmit={
                                    handleSaveEmployee
                                }
                            >

                                {/* NAME */}

                                <div className="employee-form-field">

                                    <label htmlFor="edit-employee-name">
                                        FULL NAME
                                    </label>

                                    <input
                                        id="edit-employee-name"
                                        type="text"
                                        value={
                                            editForm.name
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setEditForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    name: event
                                                        .target
                                                        .value,
                                                })
                                            )
                                        }
                                        disabled={
                                            editingEmployee
                                        }
                                        required
                                    />

                                </div>


                                {/* EMAIL */}

                                <div className="employee-form-field">

                                    <label htmlFor="edit-employee-email">
                                        EMAIL ADDRESS
                                    </label>

                                    <input
                                        id="edit-employee-email"
                                        type="email"
                                        value={
                                            selectedEmployee.email
                                        }
                                        disabled
                                        readOnly
                                    />

                                    <small className="employee-field-note">
                                        Email is linked to the
                                        authentication account.
                                    </small>

                                </div>


                                {/* EMPLOYEE ID */}

                                <div className="employee-form-field">

                                    <label htmlFor="edit-employee-id">
                                        EMPLOYEE ID
                                    </label>

                                    <input
                                        id="edit-employee-id"
                                        type="text"
                                        value={
                                            editForm.employee_id
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setEditForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    employee_id:
                                                        event
                                                            .target
                                                            .value
                                                            .toUpperCase(),
                                                })
                                            )
                                        }
                                        disabled={
                                            editingEmployee
                                        }
                                        required
                                    />

                                </div>


                                {/* DEPARTMENT */}

                                <div className="employee-form-field">

                                    <label htmlFor="edit-employee-department">
                                        DEPARTMENT
                                    </label>

                                    <input
                                        id="edit-employee-department"
                                        type="text"
                                        placeholder="Development"
                                        value={
                                            editForm.department
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setEditForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    department:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                        disabled={
                                            editingEmployee
                                        }
                                    />

                                </div>


                                {/* PROFILE IMAGE */}

                                <div className="employee-form-field">

                                    <label htmlFor="edit-employee-image">
                                        PROFILE IMAGE URL
                                    </label>

                                    <input
                                        id="edit-employee-image"
                                        type="url"
                                        placeholder="https://..."
                                        value={
                                            editForm.profile_image
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setEditForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    profile_image:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                        disabled={
                                            editingEmployee
                                        }
                                    />

                                </div>


                                {/* ERROR */}

                                {editEmployeeError && (

                                    <div className="employee-form-error">

                                        <span>
                                            !
                                        </span>

                                        {
                                            editEmployeeError
                                        }

                                    </div>

                                )}


                                {/* SUCCESS */}

                                {editEmployeeSuccess && (

                                    <div className="employee-form-success">

                                        <span>
                                            ✓
                                        </span>

                                        {
                                            editEmployeeSuccess
                                        }

                                    </div>

                                )}


                                {/* ACTIONS */}

                                <div className="employee-form-actions">

                                    <button
                                        type="button"
                                        className="employee-cancel-button"
                                        disabled={
                                            editingEmployee
                                        }
                                        onClick={
                                            closeEditEmployee
                                        }
                                    >
                                        CANCEL
                                    </button>


                                    <button
                                        type="submit"
                                        className="employee-create-button"
                                        disabled={
                                            editingEmployee
                                        }
                                    >
                                        {editingEmployee
                                            ? "SAVING..."
                                            : "SAVE CHANGES"}
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}


            {/* =====================================================
                DEACTIVATE CONFIRMATION
            ===================================================== */}

            {showDeactivateConfirm &&
                selectedEmployee && (

                    <div
                        className="employee-confirm-overlay"
                        onClick={() =>
                            !changingStatus &&
                            setShowDeactivateConfirm(
                                false
                            )
                        }
                    >

                        <div
                            className="employee-confirm-modal"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >

                            <div className="employee-confirm-icon">
                                !
                            </div>


                            <span className="employee-modal-eyebrow">
                                ACCOUNT ACCESS
                            </span>


                            <h3>
                                Deactivate{" "}
                                {
                                    selectedEmployee.name
                                }?
                            </h3>


                            <p>
                                This will prevent the
                                employee from logging
                                into the employee portal.
                                Their account, attendance
                                and leave records will be
                                preserved.
                            </p>


                            <div className="employee-confirm-actions">

                                <button
                                    type="button"
                                    className="employee-cancel-button"
                                    disabled={
                                        changingStatus
                                    }
                                    onClick={() =>
                                        setShowDeactivateConfirm(
                                            false
                                        )
                                    }
                                >
                                    CANCEL
                                </button>


                                <button
                                    type="button"
                                    className="employee-confirm-deactivate"
                                    disabled={
                                        changingStatus
                                    }
                                    onClick={
                                        toggleEmployeeStatus
                                    }
                                >
                                    {changingStatus
                                        ? "DEACTIVATING..."
                                        : "DEACTIVATE"}
                                </button>

                            </div>

                        </div>

                    </div>

                )}


            {/* =====================================================
                ADD EMPLOYEE
            ===================================================== */}

            {showAddEmployee && (

                <div
                    className="employee-modal-overlay"
                    onClick={
                        closeAddEmployeeModal
                    }
                >

                    <div
                        className="employee-modal employee-add-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <button
                            type="button"
                            className="employee-modal-close"
                            disabled={
                                addingEmployee
                            }
                            onClick={
                                closeAddEmployeeModal
                            }
                            aria-label="Close"
                        >
                            ×
                        </button>


                        <span className="employee-modal-eyebrow">
                            EMPLOYEE MANAGEMENT
                        </span>


                        <div className="employee-add-heading">

                            <h2>
                                Add Employee
                            </h2>

                            <p>
                                Create a new employee
                                account and profile.
                            </p>

                        </div>


                        <form
                            className="employee-add-form"
                            onSubmit={
                                handleAddEmployee
                            }
                        >

                            {/* NAME */}

                            <div className="employee-form-field">

                                <label htmlFor="employee-name">
                                    FULL NAME
                                </label>

                                <input
                                    id="employee-name"
                                    type="text"
                                    placeholder="Enter employee name"
                                    value={
                                        employeeForm.name
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setEmployeeForm(
                                            (
                                                current
                                            ) => ({
                                                ...current,
                                                name: event
                                                    .target
                                                    .value,
                                            })
                                        )
                                    }
                                    disabled={
                                        addingEmployee
                                    }
                                    required
                                />

                            </div>


                            {/* EMAIL */}

                            <div className="employee-form-field">

                                <label htmlFor="employee-email">
                                    EMAIL ADDRESS
                                </label>

                                <input
                                    id="employee-email"
                                    type="email"
                                    placeholder="employee@vfour.in"
                                    value={
                                        employeeForm.email
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setEmployeeForm(
                                            (
                                                current
                                            ) => ({
                                                ...current,
                                                email: event
                                                    .target
                                                    .value,
                                            })
                                        )
                                    }
                                    disabled={
                                        addingEmployee
                                    }
                                    autoComplete="off"
                                    required
                                />

                            </div>


                            {/* PASSWORD */}

                            <div className="employee-form-field">

                                <label htmlFor="employee-password">
                                    INITIAL PASSWORD
                                </label>

                                <input
                                    id="employee-password"
                                    type="password"
                                    placeholder="Minimum 8 characters"
                                    value={
                                        employeeForm.password
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setEmployeeForm(
                                            (
                                                current
                                            ) => ({
                                                ...current,
                                                password:
                                                    event
                                                        .target
                                                        .value,
                                            })
                                        )
                                    }
                                    disabled={
                                        addingEmployee
                                    }
                                    autoComplete="new-password"
                                    minLength={8}
                                    required
                                />

                            </div>


                            {/* EMPLOYEE ID */}

                            <div className="employee-form-field">

                                <label htmlFor="employee-id">
                                    EMPLOYEE ID
                                </label>

                                <input
                                    id="employee-id"
                                    type="text"
                                    placeholder="VF002"
                                    value={
                                        employeeForm.employee_id
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setEmployeeForm(
                                            (
                                                current
                                            ) => ({
                                                ...current,
                                                employee_id:
                                                    event
                                                        .target
                                                        .value
                                                        .toUpperCase(),
                                            })
                                        )
                                    }
                                    disabled={
                                        addingEmployee
                                    }
                                    required
                                />

                            </div>


                            {/* DEPARTMENT */}

                            <div className="employee-form-field">

                                <label htmlFor="employee-department">
                                    DEPARTMENT
                                </label>

                                <input
                                    id="employee-department"
                                    type="text"
                                    placeholder="Development"
                                    value={
                                        employeeForm.department
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setEmployeeForm(
                                            (
                                                current
                                            ) => ({
                                                ...current,
                                                department:
                                                    event
                                                        .target
                                                        .value,
                                            })
                                        )
                                    }
                                    disabled={
                                        addingEmployee
                                    }
                                />

                            </div>


                            {/* ERROR */}

                            {addEmployeeError && (

                                <div className="employee-form-error">

                                    <span>
                                        !
                                    </span>

                                    {
                                        addEmployeeError
                                    }

                                </div>

                            )}


                            {/* SUCCESS */}

                            {addEmployeeSuccess && (

                                <div className="employee-form-success">

                                    <span>
                                        ✓
                                    </span>

                                    {
                                        addEmployeeSuccess
                                    }

                                </div>

                            )}


                            {/* ACTIONS */}

                            <div className="employee-form-actions">

                                <button
                                    type="button"
                                    className="employee-cancel-button"
                                    disabled={
                                        addingEmployee
                                    }
                                    onClick={
                                        closeAddEmployeeModal
                                    }
                                >
                                    CANCEL
                                </button>


                                <button
                                    type="submit"
                                    className="employee-create-button"
                                    disabled={
                                        addingEmployee
                                    }
                                >
                                    {addingEmployee
                                        ? "CREATING..."
                                        : "CREATE EMPLOYEE"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </main>
    );
};

export default Employees;