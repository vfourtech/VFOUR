import { useEffect, useState } from "react";

import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import LoadingScreen from "./components/LoadingScreen/LoadingScreen";
import Navbar from "./components/Navbar/Navbar";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";

import Home from "./pages/Home/Home";
import Works from "./pages/Works/Works";
import Testimonials from "./pages/Testimonials/Testimonials";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import LeaveRequests from "./pages/admin/LeaveRequests";
import AdminLogin from "./pages/admin/AdminLogin";
import ProtectedRoute from "./pages/admin/ProtectedRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import Attendance from "./pages/admin/Attendance";
import Projects from "./pages/admin/Projects/Projects";
import Dashboard from "./pages/admin/Dashboard/Dashboard";
import TestimonialsAdmin from "./pages/admin/Testimonials/Testimonials";
import WorksAdmin from "./pages/admin/Works/Works";
import EmployeeAttendance from "./pages/EmployeeAttendance/EmployeeAttendance";
import EmployeeLeave from "./pages/EmployeeLeave/EmployeeLeave";
import EmployeeProfile from "./pages/EmployeeProfile/EmployeeProfile";
import Footer from "./components/Footer/Footer";


/* =================================================
   EMPLOYEE
================================================= */

import EmployeeLogin from "./pages/EmployeeLogin/EmployeeLogin";
import EmployeeForgotPassword from "./pages/EmployeeForgotPassword/EmployeeForgotPassword";
import EmployeeResetPassword from "./pages/EmployeeResetPassword/EmployeeResetPassword";
import EmployeeDashboard from "./pages/EmployeeDashboard/EmployeeDashboard";
import EmployeeProtectedRoute from "./pages/employee/EmployeeProtectedRoute";
import Employees from "./pages/admin/Employees/Employees";

const App = () => {

    const [isLoading, setIsLoading] = useState(true);


    /* =================================================
       INITIAL LOADING
       Shows only once per browser session
    ================================================= */

    useEffect(() => {

        const hasLoaded =
            sessionStorage.getItem(
                "vfour_initial_loader"
            );

        if (hasLoaded === "true") {

            setIsLoading(false);

        }

    }, []);


    /* =================================================
       LOADING COMPLETE
    ================================================= */

    const handleLoadingComplete = () => {

        sessionStorage.setItem(
            "vfour_initial_loader",
            "true"
        );

        setIsLoading(false);
    };


    return (
        <BrowserRouter>

            {/* =================================================
                SCROLL TO TOP
            ================================================= */}

            <ScrollToTop />


            {/* =================================================
                INITIAL LOADING SCREEN

                Routes are always rendered underneath.
            ================================================= */}

            {isLoading && (
                <LoadingScreen
                    onComplete={
                        handleLoadingComplete
                    }
                />
            )}


            {/* =================================================
                APPLICATION ROUTES
            ================================================= */}

            <Routes>


                {/* =================================================
                    PUBLIC WEBSITE
                ================================================= */}

                <Route
                    path="/"
                    element={
                        <>
                            <Navbar />
                            <Home />
                            <Footer />
                        </>
                    }
                />


                <Route
                    path="/works"
                    element={
                        <>
                            <Navbar />
                            <Works />
                        </>
                    }
                />


                <Route
                    path="/testimonials"
                    element={
                        <>
                            <Navbar />
                            <Testimonials />
                        </>
                    }
                />


                <Route
                    path="/about"
                    element={
                        <>
                            <Navbar />
                            <About />
                        </>
                    }
                />


                <Route
                    path="/contact"
                    element={
                        <>
                            <Navbar />
                            <Contact />
                        </>
                    }
                />


                {/* =================================================
                    ADMIN LOGIN
                ================================================= */}

                <Route
                    path="/admin/login"
                    element={
                        <AdminLogin />
                    }
                />


                {/* =================================================
                    PROTECTED ADMIN AREA
                ================================================= */}

                <Route
                    element={
                        <ProtectedRoute />
                    }
                >

                    <Route
                        element={
                            <AdminLayout />
                        }
                    >


                        {/* =========================================
                            ADMIN DASHBOARD
                        ========================================= */}

                        <Route
                            path="/admin"
                            element={
                                <Dashboard />
                            }
                        />


                        {/* =========================================
                            ADMIN PROJECTS
                        ========================================= */}

                        <Route
                            path="/admin/projects"
                            element={
                                <Projects />
                            }
                        />


                        {/* =========================================
                            ADMIN WORKS
                        ========================================= */}

                        <Route
                            path="/admin/works"
                            element={
                                <WorksAdmin />
                            }
                        />


                        {/* =========================================
                            ADMIN TESTIMONIALS
                        ========================================= */}

                        <Route
                            path="/admin/testimonials"
                            element={
                                <TestimonialsAdmin />
                            }
                        />
                         <Route
        path="/admin/employees"
        element={
            <Employees />
        }
    />
    <Route 
    path="/admin/attendance"
    element={
        <Attendance/>
    }/>
    <Route 
    path="/admin/leaverequest"
    element={<LeaveRequests/>}/>

                    </Route>

                </Route>


                {/* =================================================
                    EMPLOYEE LOGIN
                ================================================= */}

                <Route
                    path="/employee"
                    element={
                        <EmployeeLogin />
                    }
                />


                {/* =================================================
                    EMPLOYEE FORGOT PASSWORD
                ================================================= */}

                <Route
                    path="/employee/forgot-password"
                    element={
                        <EmployeeForgotPassword />
                    }
                />


                {/* =================================================
                    EMPLOYEE RESET PASSWORD
                ================================================= */}

                <Route
                    path="/employee/reset-password"
                    element={
                        <EmployeeResetPassword />
                    }
                />


                {/* =================================================
                    PROTECTED EMPLOYEE AREA
                ================================================= */}

                <Route
                    element={
                        <EmployeeProtectedRoute />
                    }
                >

                    {/* =============================================
                        EMPLOYEE DASHBOARD
                    ============================================= */}

                    <Route
                        path="/employee/dashboard"
                        element={
                            <EmployeeDashboard />
                        }
                    />
                     <Route
        path="/employee/attendance"
        element={
            <EmployeeAttendance />
        }
    />
<Route
                        path="/employee/leave"
                        element={
                            <EmployeeLeave />
                        }
                    />

    <Route
        path="/employee/profile"
        element={
            <EmployeeProfile />
        }
    />

                </Route>


            </Routes>

        </BrowserRouter>
    );
};


export default App;