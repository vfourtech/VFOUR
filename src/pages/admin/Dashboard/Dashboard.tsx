import { useEffect, useState } from "react";

import { supabase } from "../../../lib/supabase";

import "./Dashboard.css";


type ProjectStatus =
    | "pending"
    | "in_progress"
    | "completed";


interface Project {
    id: string;
    project_name: string;
    project_type: string | null;
    client_name: string;
    company_name: string | null;
    status: ProjectStatus;
    project_amount: number;
    amount_paid: number;
    created_at: string;
}


interface DashboardStats {
    totalProjects: number;
    inProgress: number;
    completed: number;
    pending: number;
    revenue: number;
    pendingRevenue: number;
}


const Dashboard = () => {

    const [stats, setStats] =
        useState<DashboardStats>({
            totalProjects: 0,
            inProgress: 0,
            completed: 0,
            pending: 0,
            revenue: 0,
            pendingRevenue: 0,
        });


    const [recentProjects, setRecentProjects] =
        useState<Project[]>([]);


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState("");


    const fetchDashboard = async () => {

        setLoading(true);
        setError("");


        const {
            data,
            error: fetchError,
        } = await supabase
            .from("projects")
            .select(`
                id,
                project_name,
                project_type,
                client_name,
                company_name,
                status,
                project_amount,
                amount_paid,
                created_at
            `)
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


        const projects =
            (data ?? []) as Project[];


        const totalProjects =
            projects.length;


        const inProgress =
            projects.filter(
                (project) =>
                    project.status ===
                    "in_progress"
            ).length;


        const completed =
            projects.filter(
                (project) =>
                    project.status ===
                    "completed"
            ).length;


        const pending =
            projects.filter(
                (project) =>
                    project.status ===
                    "pending"
            ).length;


        const revenue =
            projects.reduce(
                (
                    total,
                    project
                ) =>
                    total +
                    Number(
                        project.amount_paid || 0
                    ),
                0
            );


        const pendingRevenue =
            projects.reduce(
                (
                    total,
                    project
                ) =>
                    total +
                    Math.max(
                        0,
                        Number(
                            project.project_amount || 0
                        ) -
                        Number(
                            project.amount_paid || 0
                        )
                    ),
                0
            );


        setStats({
            totalProjects,
            inProgress,
            completed,
            pending,
            revenue,
            pendingRevenue,
        });


        setRecentProjects(
            projects.slice(0, 6)
        );


        setLoading(false);
    };


    useEffect(() => {

        fetchDashboard();

    }, []);


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


    const formatDate = (
        date: string
    ) => {

        return new Intl.DateTimeFormat(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        ).format(
            new Date(date)
        );
    };


    return (
        <main className="admin-dashboard">

            {/* =================================================
                BACKGROUND
            ================================================= */}

            <div className="dashboard-background">

                <div className="dashboard-grid" />

                <div className="dashboard-glow dashboard-glow-a" />

                <div className="dashboard-glow dashboard-glow-b" />

            </div>


            <div className="dashboard-container">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="dashboard-header">

                    <div>

                        <span className="dashboard-eyebrow">
                            VFOUR / ADMIN
                        </span>

                        <h1>
                            Dashboard
                        </h1>

                        <p>
                            Overview of your projects,
                            clients and revenue.
                        </p>

                    </div>


                    <div className="dashboard-live">

                        <span />

                        SYSTEM ONLINE

                    </div>

                </header>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="dashboard-error">
                        {error}
                    </div>

                )}


                {/* =================================================
                    MAIN STATISTICS
                ================================================= */}

                <section className="dashboard-stats">

                    {/* Total Projects */}

                    <div className="dashboard-stat-card">

                        <div className="stat-card-top">

                            <span>
                                TOTAL PROJECTS
                            </span>

                            <div className="stat-icon">
                                ◇
                            </div>

                        </div>


                        <strong>

                            {loading
                                ? "—"
                                : stats.totalProjects}

                        </strong>


                        <p>
                            All client projects
                        </p>

                    </div>


                    {/* In Progress */}

                    <div className="dashboard-stat-card">

                        <div className="stat-card-top">

                            <span>
                                IN PROGRESS
                            </span>

                            <div className="stat-icon">
                                ◌
                            </div>

                        </div>


                        <strong>

                            {loading
                                ? "—"
                                : stats.inProgress}

                        </strong>


                        <p>
                            Currently active
                        </p>

                    </div>


                    {/* Completed */}

                    <div className="dashboard-stat-card">

                        <div className="stat-card-top">

                            <span>
                                COMPLETED
                            </span>

                            <div className="stat-icon">
                                ✓
                            </div>

                        </div>


                        <strong>

                            {loading
                                ? "—"
                                : stats.completed}

                        </strong>


                        <p>
                            Successfully delivered
                        </p>

                    </div>


                    {/* Pending */}

                    <div className="dashboard-stat-card">

                        <div className="stat-card-top">

                            <span>
                                PENDING
                            </span>

                            <div className="stat-icon">
                                !
                            </div>

                        </div>


                        <strong>

                            {loading
                                ? "—"
                                : stats.pending}

                        </strong>


                        <p>
                            Awaiting project start
                        </p>

                    </div>

                </section>


                {/* =================================================
                    FINANCIAL CARDS
                ================================================= */}

                <section className="dashboard-financial">

                    {/* Revenue */}

                    <div className="revenue-card revenue-primary">

                        <div className="revenue-content">

                            <span className="revenue-label">
                                TOTAL REVENUE
                            </span>

                            <strong>

                                {loading
                                    ? "—"
                                    : formatCurrency(
                                        stats.revenue
                                    )}

                            </strong>

                            <p>
                                Total amount collected
                                from all projects.
                            </p>

                        </div>


                        <div className="revenue-orbit">

                            <div className="revenue-orbit-ring" />

                            <div className="revenue-orbit-dot" />

                        </div>

                    </div>


                    {/* Pending Revenue */}

                    <div className="revenue-card revenue-pending">

                        <div className="revenue-content">

                            <span className="revenue-label">
                                PENDING REVENUE
                            </span>

                            <strong>

                                {loading
                                    ? "—"
                                    : formatCurrency(
                                        stats.pendingRevenue
                                    )}

                            </strong>

                            <p>
                                Amount remaining
                                across all projects.
                            </p>

                        </div>


                        <div className="pending-indicator">

                            <span />

                            COLLECTION PENDING

                        </div>

                    </div>

                </section>


                {/* =================================================
                    RECENT PROJECTS
                ================================================= */}

                <section className="recent-projects">

                    <div className="recent-header">

                        <div>

                            <span>
                                PROJECT ACTIVITY
                            </span>

                            <h2>
                                Recent Projects
                            </h2>

                        </div>


                        <a
                            href="/admin/projects"
                            className="view-projects"
                        >
                            VIEW ALL
                            <span>
                                ↗
                            </span>
                        </a>

                    </div>


                    <div className="recent-table-card">

                        {loading ? (

                            <div className="dashboard-loading">

                                <div />

                                Loading projects...

                            </div>

                        ) : recentProjects.length === 0 ? (

                            <div className="dashboard-empty">

                                <div className="dashboard-empty-icon">
                                    +
                                </div>

                                <h3>
                                    No projects yet
                                </h3>

                                <p>
                                    Your recent projects
                                    will appear here.
                                </p>

                            </div>

                        ) : (

                            <div className="recent-table-wrapper">

                                <table className="recent-table">

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
                                                DATE
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {recentProjects.map(
                                            (project) => (

                                                <tr
                                                    key={
                                                        project.id
                                                    }
                                                >

                                                    <td>

                                                        <div className="recent-project-name">

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

                                                        <div className="recent-client">

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
                                                            className={`dashboard-status dashboard-status-${project.status}`}
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

                                                        <strong className="recent-value">

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

                                                        <span className="recent-date">

                                                            {
                                                                formatDate(
                                                                    project.created_at
                                                                )
                                                            }

                                                        </span>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                </section>

            </div>

        </main>
    );
};


export default Dashboard;