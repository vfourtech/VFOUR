import {
    useEffect,
    useMemo,
    useState,
} from "react";

import * as XLSX from "xlsx";

import {
    supabase,
} from "../../../lib/supabase";

import "./Projects.css";


type ProjectStatus =
    | "pending"
    | "in_progress"
    | "completed";


interface Project {
    id: string;

    project_name: string;
    project_type: string | null;
    description: string | null;

    client_name: string;
    company_name: string | null;
    client_email: string | null;
    client_phone: string | null;
    client_address: string | null;

    status: ProjectStatus;

    project_amount: number;
    amount_paid: number;

    start_date: string | null;
    expected_completion: string | null;
    completed_date: string | null;

    notes: string | null;

    created_at: string;
    updated_at: string;
}


interface ProjectForm {
    project_name: string;
    project_type: string;
    description: string;

    client_name: string;
    company_name: string;
    client_email: string;
    client_phone: string;
    client_address: string;

    status: ProjectStatus;

    project_amount: string;
    amount_paid: string;

    start_date: string;
    expected_completion: string;
    completed_date: string;

    notes: string;
}


const initialForm: ProjectForm = {
    project_name: "",
    project_type: "",
    description: "",

    client_name: "",
    company_name: "",
    client_email: "",
    client_phone: "",
    client_address: "",

    status: "pending",

    project_amount: "",
    amount_paid: "",

    start_date: "",
    expected_completion: "",
    completed_date: "",

    notes: "",
};


const Projects = () => {

    const [projects, setProjects] =
        useState<Project[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState<"all" | ProjectStatus>("all");

    const [showForm, setShowForm] =
        useState(false);

    const [editingProject, setEditingProject] =
        useState<Project | null>(null);

    const [form, setForm] =
        useState<ProjectForm>(initialForm);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    /* =====================================================
       FETCH PROJECTS
    ===================================================== */

    const fetchProjects = async () => {

        setLoading(true);
        setError("");

        const {
            data,
            error: fetchError,
        } = await supabase
            .from("projects")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false,
                }
            );

        if (fetchError) {

            setError(
                fetchError.message
            );

            setLoading(false);

            return;
        }

        setProjects(
            (data ?? []) as Project[]
        );

        setLoading(false);
    };


    useEffect(() => {
        fetchProjects();
    }, []);


    /* =====================================================
       FILTER PROJECTS
    ===================================================== */

    const filteredProjects =
        useMemo(() => {

            const searchValue =
                search
                    .trim()
                    .toLowerCase();

            return projects.filter(
                (project) => {

                    const matchesSearch =
                        !searchValue ||
                        project.project_name
                            .toLowerCase()
                            .includes(searchValue) ||
                        project.client_name
                            .toLowerCase()
                            .includes(searchValue) ||
                        (
                            project.company_name ??
                            ""
                        )
                            .toLowerCase()
                            .includes(searchValue);

                    const matchesStatus =
                        statusFilter === "all" ||
                        project.status ===
                            statusFilter;

                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );

        }, [
            projects,
            search,
            statusFilter,
        ]);


    /* =====================================================
       FORM HANDLERS
    ===================================================== */

    const updateForm = (
        field: keyof ProjectForm,
        value: string
    ) => {

        setForm(
            (current) => ({
                ...current,
                [field]: value,
            })
        );
    };


    const openAddForm = () => {

        setEditingProject(null);

        setForm(initialForm);

        setError("");

        setSuccess("");

        setShowForm(true);
    };


    const openEditForm = (
        project: Project
    ) => {

        setEditingProject(project);

        setForm({
            project_name:
                project.project_name,

            project_type:
                project.project_type ?? "",

            description:
                project.description ?? "",

            client_name:
                project.client_name,

            company_name:
                project.company_name ?? "",

            client_email:
                project.client_email ?? "",

            client_phone:
                project.client_phone ?? "",

            client_address:
                project.client_address ?? "",

            status:
                project.status,

            project_amount:
                String(
                    project.project_amount
                ),

            amount_paid:
                String(
                    project.amount_paid
                ),

            start_date:
                project.start_date ?? "",

            expected_completion:
                project.expected_completion ??
                "",

            completed_date:
                project.completed_date ?? "",

            notes:
                project.notes ?? "",
        });

        setError("");

        setSuccess("");

        setShowForm(true);
    };


    const closeForm = () => {

        if (saving) return;

        setShowForm(false);

        setEditingProject(null);

        setForm(initialForm);

        setError("");
    };


    /* =====================================================
       SAVE PROJECT
    ===================================================== */

    const saveProject = async () => {

        setError("");
        setSuccess("");

        if (!form.project_name.trim()) {

            setError(
                "Project name is required."
            );

            return;
        }

        if (!form.client_name.trim()) {

            setError(
                "Client name is required."
            );

            return;
        }


        const projectAmount =
            Number(
                form.project_amount || 0
            );

        const amountPaid =
            Number(
                form.amount_paid || 0
            );


        if (
            projectAmount < 0 ||
            amountPaid < 0
        ) {

            setError(
                "Amounts cannot be negative."
            );

            return;
        }


        if (
            amountPaid >
            projectAmount
        ) {

            setError(
                "Amount paid cannot exceed the project amount."
            );

            return;
        }


        setSaving(true);


        const payload = {
            project_name:
                form.project_name.trim(),

            project_type:
                form.project_type.trim() ||
                null,

            description:
                form.description.trim() ||
                null,

            client_name:
                form.client_name.trim(),

            company_name:
                form.company_name.trim() ||
                null,

            client_email:
                form.client_email.trim() ||
                null,

            client_phone:
                form.client_phone.trim() ||
                null,

            client_address:
                form.client_address.trim() ||
                null,

            status:
                form.status,

            project_amount:
                projectAmount,

            amount_paid:
                amountPaid,

            start_date:
                form.start_date ||
                null,

            expected_completion:
                form.expected_completion ||
                null,

            completed_date:
                form.completed_date ||
                null,

            notes:
                form.notes.trim() ||
                null,

            updated_at:
                new Date().toISOString(),
        };


        let saveError;


        if (editingProject) {

            const result =
                await supabase
                    .from("projects")
                    .update(payload)
                    .eq(
                        "id",
                        editingProject.id
                    );

            saveError =
                result.error;

        } else {

            const result =
                await supabase
                    .from("projects")
                    .insert(
                        payload
                    );

            saveError =
                result.error;
        }


        if (saveError) {

            setError(
                saveError.message
            );

            setSaving(false);

            return;
        }


        setSaving(false);

        setSuccess(
            editingProject
                ? "Project updated successfully."
                : "Project added successfully."
        );

        await fetchProjects();

        setTimeout(() => {
            setShowForm(false);
            setEditingProject(null);
            setForm(initialForm);
            setSuccess("");
        }, 700);
    };


    /* =====================================================
       DELETE PROJECT
    ===================================================== */

    const deleteProject = async (
        id: string
    ) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this project?"
            );

        if (!confirmed) return;


        const {
            error: deleteError,
        } = await supabase
            .from("projects")
            .delete()
            .eq("id", id);


        if (deleteError) {

            setError(
                deleteError.message
            );

            return;
        }


        setProjects(
            (current) =>
                current.filter(
                    (project) =>
                        project.id !== id
                )
        );
    };


    /* =====================================================
       EXPORT EXCEL
    ===================================================== */

    const exportExcel = () => {

        if (
            filteredProjects.length === 0
        ) {

            setError(
                "There are no projects to export."
            );

            return;
        }


        const exportData =
            filteredProjects.map(
                (project) => {

                    const pending =
                        Number(
                            project.project_amount
                        ) -
                        Number(
                            project.amount_paid
                        );

                    return {
                        "Project Name":
                            project.project_name,

                        "Project Type":
                            project.project_type ??
                            "",

                        "Client Name":
                            project.client_name,

                        "Company":
                            project.company_name ??
                            "",

                        "Email":
                            project.client_email ??
                            "",

                        "Phone":
                            project.client_phone ??
                            "",

                        "Status":
                            formatStatus(
                                project.status
                            ),

                        "Project Amount":
                            project.project_amount,

                        "Amount Paid":
                            project.amount_paid,

                        "Amount Pending":
                            pending,

                        "Start Date":
                            project.start_date ??
                            "",

                        "Expected Completion":
                            project.expected_completion ??
                            "",

                        "Completed Date":
                            project.completed_date ??
                            "",

                        "Notes":
                            project.notes ??
                            "",
                    };
                }
            );


        const worksheet =
            XLSX.utils.json_to_sheet(
                exportData
            );


        const workbook =
            XLSX.utils.book_new();


        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Projects"
        );


        XLSX.writeFile(
            workbook,
            "VFOUR-Projects.xlsx"
        );
    };


    /* =====================================================
       FORMATTERS
    ===================================================== */

    const formatStatus = (
        status: ProjectStatus
    ) => {

        switch (status) {

            case "in_progress":
                return "In Progress";

            case "completed":
                return "Completed";

            default:
                return "Pending";
        }
    };


    const formatCurrency = (
        amount: number
    ) => {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
            }
        ).format(amount);
    };


    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <main className="projects-page">

            {/* Background */}

            <div className="projects-background">

                <div className="projects-grid" />

                <div className="projects-glow glow-a" />
                <div className="projects-glow glow-b" />

            </div>


            <div className="projects-container">

                {/* =================================================
                   HEADER
                ================================================= */}

                <header className="projects-header">

                    <div>

                        <span className="projects-eyebrow">
                            VFOUR / ADMIN
                        </span>

                        <h1>
                            Projects
                        </h1>

                        <p>
                            Manage client projects,
                            financials and progress.
                        </p>

                    </div>


                    <button
                        className="add-project-button"
                        onClick={openAddForm}
                    >
                        <span>
                            +
                        </span>

                        ADD PROJECT
                    </button>

                </header>


                {/* =================================================
                   TOOLBAR
                ================================================= */}

                <section className="projects-toolbar">

                    <div className="project-search">

                        <span>
                            /
                        </span>

                        <input
                            type="text"
                            placeholder="Search projects or clients..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />

                    </div>


                    <div className="project-actions">

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value as
                                        | "all"
                                        | ProjectStatus
                                )
                            }
                            className="status-filter"
                        >

                            <option value="all">
                                All Status
                            </option>

                            <option value="pending">
                                Pending
                            </option>

                            <option value="in_progress">
                                In Progress
                            </option>

                            <option value="completed">
                                Completed
                            </option>

                        </select>


                        <button
                            className="export-button"
                            onClick={exportExcel}
                        >
                            EXPORT EXCEL
                            <span>
                                ↗
                            </span>
                        </button>

                    </div>

                </section>


                {/* =================================================
                   MESSAGES
                ================================================= */}

                {error && (
                    <div className="projects-message error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="projects-message success">
                        {success}
                    </div>
                )}


                {/* =================================================
                   PROJECT TABLE
                ================================================= */}

                <section className="projects-table-card">

                    {loading ? (

                        <div className="projects-loading">

                            <span className="loading-spinner" />

                            Loading projects...

                        </div>

                    ) : filteredProjects.length === 0 ? (

                        <div className="projects-empty">

                            <div className="empty-icon">
                                +
                            </div>

                            <h2>
                                No projects yet
                            </h2>

                            <p>
                                Add your first project
                                to start managing
                                your client records.
                            </p>

                            <button
                                onClick={openAddForm}
                            >
                                ADD FIRST PROJECT
                                <span>
                                    ↗
                                </span>
                            </button>

                        </div>

                    ) : (

                        <div className="projects-table-wrapper">

                            <table className="projects-table">

                                <thead>

                                    <tr>

                                        <th>
                                            PROJECT
                                        </th>

                                        <th>
                                            CLIENT
                                        </th>

                                        <th>
                                            STATUS
                                        </th>

                                        <th>
                                            VALUE
                                        </th>

                                        <th>
                                            PAID
                                        </th>

                                        <th>
                                            PENDING
                                        </th>

                                        <th>
                                            ACTIONS
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredProjects.map(
                                        (project) => {

                                            const pending =
                                                Number(
                                                    project.project_amount
                                                ) -
                                                Number(
                                                    project.amount_paid
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        project.id
                                                    }
                                                >

                                                    <td>

                                                        <div className="project-name-cell">

                                                            <strong>
                                                                {
                                                                    project.project_name
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    project.project_type ||
                                                                    "Project"
                                                                }
                                                            </span>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <div className="client-cell">

                                                            <strong>
                                                                {
                                                                    project.client_name
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    project.company_name ||
                                                                    "Individual"
                                                                }
                                                            </span>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={`status-badge status-${project.status}`}
                                                        >

                                                            <i />

                                                            {
                                                                formatStatus(
                                                                    project.status
                                                                )
                                                            }

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <strong className="amount-value">
                                                            {
                                                                formatCurrency(
                                                                    Number(
                                                                        project.project_amount
                                                                    )
                                                                )
                                                            }
                                                        </strong>

                                                    </td>


                                                    <td>

                                                        <span className="paid-value">
                                                            {
                                                                formatCurrency(
                                                                    Number(
                                                                        project.amount_paid
                                                                    )
                                                                )
                                                            }
                                                        </span>

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={
                                                                pending >
                                                                0
                                                                    ? "pending-value"
                                                                    : "paid-value"
                                                            }
                                                        >
                                                            {
                                                                formatCurrency(
                                                                    pending
                                                                )
                                                            }
                                                        </span>

                                                    </td>


                                                    <td>

                                                        <div className="table-actions">

                                                            <button
                                                                onClick={() =>
                                                                    openEditForm(
                                                                        project
                                                                    )
                                                                }
                                                                title="Edit project"
                                                            >
                                                                EDIT
                                                            </button>

                                                            <button
                                                                className="delete-action"
                                                                onClick={() =>
                                                                    deleteProject(
                                                                        project.id
                                                                    )
                                                                }
                                                                title="Delete project"
                                                            >
                                                                DELETE
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>
                    )}

                </section>

            </div>


            {/* =================================================
               PROJECT FORM MODAL
            ================================================= */}

            {showForm && (

                <div
                    className="project-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeForm();
                        }

                    }}
                >

                    <div className="project-modal">

                        <div className="project-modal-header">

                            <div>

                                <span>
                                    PROJECT MANAGEMENT
                                </span>

                                <h2>
                                    {editingProject
                                        ? "Edit Project"
                                        : "Add Project"}
                                </h2>

                            </div>


                            <button
                                className="modal-close"
                                onClick={closeForm}
                            >
                                ×
                            </button>

                        </div>


                        <div className="project-form">

                            {/* PROJECT */}

                            <div className="form-section">

                                <div className="form-section-title">
                                    PROJECT DETAILS
                                </div>


                                <div className="form-grid two">

                                    <FormField
                                        label="Project Name"
                                        value={
                                            form.project_name
                                        }
                                        onChange={(value) =>
                                            updateForm(
                                                "project_name",
                                                value
                                            )
                                        }
                                        required
                                    />


                                    <FormField
                                        label="Project Type"
                                        value={
                                            form.project_type
                                        }
                                        onChange={(value) =>
                                            updateForm(
                                                "project_type",
                                                value
                                            )
                                        }
                                    />

                                </div>


                                <FormTextarea
                                    label="Description"
                                    value={
                                        form.description
                                    }
                                    onChange={(value) =>
                                        updateForm(
                                            "description",
                                            value
                                        )
                                    }
                                />

                            </div>


                            {/* CLIENT */}

                            <div className="form-section">

                                <div className="form-section-title">
                                    CLIENT DETAILS
                                </div>


                                <div className="form-grid two">

                                    <FormField
                                        label="Client Name"
                                        value={
                                            form.client_name
                                        }
                                        onChange={(value) =>
                                            updateForm(
                                                "client_name",
                                                value
                                            )
                                        }
                                        required
                                    />


                                    <FormField
                                        label="Company"
                                        value={
                                            form.company_name
                                        }
                                        onChange={(value) =>
                                            updateForm(
                                                "company_name",
                                                value
                                            )
                                        }
                                    />


                                    <FormField
                                        label="Email"
                                        type="email"
                                        value={
                                            form.client_email
                                        }
                                        onChange={(value) =>
                                            updateForm(
                                                "client_email",
                                                value
                                            )
                                        }
                                    />


                                    <FormField
                                        label="Phone"
                                        value={
                                            form.client_phone
                                        }
                                        onChange={(value) =>
                                            updateForm(
                                                "client_phone",
                                                value
                                            )
                                        }
                                    />

                                </div>


                                <FormTextarea
                                    label="Address"
                                    value={
                                        form.client_address
                                    }
                                    onChange={(value) =>
                                        updateForm(
                                            "client_address",
                                            value
                                        )
                                    }
                                />

                            </div>


                            {/* STATUS & FINANCE */}

                            <div className="form-section">

                                <div className="form-section-title">
                                    STATUS & FINANCE
                                </div>


                                <div className="form-grid three">

                                    <div className="form-field">

                                        <label>
                                            STATUS
                                        </label>

                                        <select
                                            value={
                                                form.status
                                            }
                                            onChange={(event) =>
                                                updateForm(
                                                    "status",
                                                    event.target
                                                        .value
                                                )
                                            }
                                        >

                                            <option value="pending">
                                                Pending
                                            </option>

                                            <option value="in_progress">
                                                In Progress
                                            </option>

                                            <option value="completed">
                                                Completed
                                            </option>

                                        </select>

                                    </div>


                                    <FormField
                                        label="Project Amount"
                                        type="number"
                                        value={
                                            form.project_amount
                                        }
                                        onChange={(value) =>
                                            updateForm(
                                                "project_amount",
                                                value
                                            )
                                        }
                                    />


                                    <FormField
                                        label="Amount Paid"
                                        type="number"
                                        value={
                                            form.amount_paid
                                        }
                                        onChange={(value) =>
                                            updateForm(
                                                "amount_paid",
                                                value
                                            )
                                        }
                                    />

                                </div>


                                <div className="pending-preview">

                                    <span>
                                        PENDING AMOUNT
                                    </span>

                                    <strong>
                                        {
                                            formatCurrency(
                                                Math.max(
                                                    0,
                                                    Number(
                                                        form.project_amount ||
                                                            0
                                                    ) -
                                                    Number(
                                                        form.amount_paid ||
                                                            0
                                                    )
                                                )
                                            )
                                        }
                                    </strong>

                                </div>

                            </div>


                            {/* TIMELINE */}

                            <div className="form-section">

                                <div className="form-section-title">
                                    PROJECT TIMELINE
                                </div>


                                <div className="form-grid three">

                                    <FormField
                                        label="Start Date"
                                        type="date"
                                        value={
                                            form.start_date
                                        }
                                        onChange={(value) =>
                                            updateForm(
                                                "start_date",
                                                value
                                            )
                                        }
                                    />


                                    <FormField
                                        label="Expected Completion"
                                        type="date"
                                        value={
                                            form.expected_completion
                                        }
                                        onChange={(value) =>
                                            updateForm(
                                                "expected_completion",
                                                value
                                            )
                                        }
                                    />


                                    <FormField
                                        label="Completed Date"
                                        type="date"
                                        value={
                                            form.completed_date
                                        }
                                        onChange={(value) =>
                                            updateForm(
                                                "completed_date",
                                                value
                                            )
                                        }
                                    />

                                </div>

                            </div>


                            {/* NOTES */}

                            <div className="form-section">

                                <div className="form-section-title">
                                    NOTES
                                </div>

                                <FormTextarea
                                    label="Additional Notes"
                                    value={
                                        form.notes
                                    }
                                    onChange={(value) =>
                                        updateForm(
                                            "notes",
                                            value
                                        )
                                    }
                                />

                            </div>

                        </div>


                        {/* MODAL FOOTER */}

                        <div className="project-modal-footer">

                            <button
                                className="cancel-button"
                                onClick={closeForm}
                                disabled={saving}
                            >
                                CANCEL
                            </button>


                            <button
                                className="save-project-button"
                                onClick={saveProject}
                                disabled={saving}
                            >

                                {saving
                                    ? "SAVING..."
                                    : editingProject
                                        ? "UPDATE PROJECT"
                                        : "SAVE PROJECT"}

                                {!saving && (
                                    <span>
                                        ↗
                                    </span>
                                )}

                            </button>

                        </div>

                    </div>

                </div>
            )}

        </main>
    );
};


/* =========================================================
   FORM FIELD
========================================================= */

interface FormFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    required?: boolean;
}


const FormField = ({
    label,
    value,
    onChange,
    type = "text",
    required = false,
}: FormFieldProps) => {

    return (
        <div className="form-field">

            <label>
                {label.toUpperCase()}

                {required && (
                    <span>
                        *
                    </span>
                )}
            </label>

            <input
                type={type}
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value
                    )
                }
                required={required}
            />

        </div>
    );
};


/* =========================================================
   FORM TEXTAREA
========================================================= */

interface FormTextareaProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}


const FormTextarea = ({
    label,
    value,
    onChange,
}: FormTextareaProps) => {

    return (
        <div className="form-field">

            <label>
                {label.toUpperCase()}
            </label>

            <textarea
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value
                    )
                }
                rows={4}
            />

        </div>
    );
};


export default Projects;