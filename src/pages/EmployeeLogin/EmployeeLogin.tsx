import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../lib/supabase";

import "./EmployeeLogin.css";


const EmployeeLogin = () => {

    const navigate = useNavigate();


    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [isDesktop, setIsDesktop] =
        useState(true);


    /* =================================================
       DESKTOP / MOBILE CHECK
    ================================================= */

    useEffect(() => {

        const checkDevice = () => {

            const mobileTablet =
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                    navigator.userAgent
                );

            const desktop =
                window.innerWidth >= 1024 &&
                !mobileTablet;

            setIsDesktop(desktop);
        };


        checkDevice();

        window.addEventListener(
            "resize",
            checkDevice
        );


        return () => {

            window.removeEventListener(
                "resize",
                checkDevice
            );

        };

    }, []);


    /* =================================================
       LOGIN
    ================================================= */

    const handleLogin = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();

        setError("");


        /* ---------------------------------------------
           VALIDATION
        --------------------------------------------- */

        if (!email.trim()) {

            setError(
                "Please enter your email address."
            );

            return;
        }


        if (!password) {

            setError(
                "Please enter your password."
            );

            return;
        }


        try {

            setLoading(true);


            /* =========================================
               SUPABASE AUTH
            ========================================= */

            const {
                data: authData,
                error: authError,
            } =
                await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password,
                });


            /* =========================================
               AUTH FAILED
            ========================================= */

            if (
                authError ||
                !authData.user
            ) {

                setError(
                    "Invalid email or password."
                );

                return;
            }


            const userId =
                authData.user.id;


            /* =========================================
               CHECK PROFILE ROLE
            ========================================= */

            const {
                data: profile,
                error: profileError,
            } =
                await supabase
                    .from("profiles")
                    .select(`
                        user_id,
                        name,
                        role,
                        is_active
                    `)
                    .eq(
                        "user_id",
                        userId
                    )
                    .maybeSingle();


            /* =========================================
               PROFILE ERROR
            ========================================= */

            if (profileError) {

                console.error(
                    "Profile verification error:",
                    profileError
                );

                await supabase.auth.signOut();

                setError(
                    "Unable to verify your employee account."
                );

                return;
            }


            /* =========================================
               NO PROFILE
            ========================================= */

            if (!profile) {

                await supabase.auth.signOut();

                setError(
                    "This account does not have portal access."
                );

                return;
            }


            /* =========================================
               ROLE CHECK
            ========================================= */

            if (
                profile.role !== "employee"
            ) {

                await supabase.auth.signOut();

                setError(
                    "You do not have employee portal access."
                );

                return;
            }


            /* =========================================
               ACTIVE CHECK
            ========================================= */

            if (
                profile.is_active !== true
            ) {

                await supabase.auth.signOut();

                setError(
                    "Your employee account is currently inactive."
                );

                return;
            }


            /* =========================================
               VERIFY EMPLOYEE RECORD
            ========================================= */

            const {
                data: employee,
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
                        userId
                    )
                    .maybeSingle();


            /* =========================================
               EMPLOYEE ERROR
            ========================================= */

            if (employeeError) {

                console.error(
                    "Employee verification error:",
                    employeeError
                );

                await supabase.auth.signOut();

                setError(
                    "Unable to verify your employee record."
                );

                return;
            }


            /* =========================================
               EMPLOYEE RECORD NOT FOUND
            ========================================= */

            if (!employee) {

                await supabase.auth.signOut();

                setError(
                    "Employee record not found."
                );

                return;
            }


            /* =========================================
               EMPLOYEE ROLE CHECK
            ========================================= */

            if (
                employee.role !== "employee"
            ) {

                await supabase.auth.signOut();

                setError(
                    "This account is not configured as an employee."
                );

                return;
            }


            /* =========================================
               EMPLOYEE ACTIVE CHECK
            ========================================= */

            if (
                employee.is_active !== true
            ) {

                await supabase.auth.signOut();

                setError(
                    "Your employee account is currently inactive."
                );

                return;
            }


            /* =========================================
               LOGIN SUCCESS
            ========================================= */

            navigate(
                "/employee/dashboard",
                {
                    replace: true,
                }
            );

        } catch (error) {

            console.error(
                "Employee login error:",
                error
            );

            await supabase.auth.signOut();

            setError(
                "Something went wrong. Please try again."
            );

        } finally {

            setLoading(false);

        }

    };


    /* =================================================
       DESKTOP ONLY
    ================================================= */

    if (!isDesktop) {

        return (
            <main className="employee-login-page">

                <div className="employee-login-blocked">


                    <div className="employee-login-brand">
                        VFOUR
                    </div>


                    <div className="employee-login-blocked-content">

                        <span className="employee-login-eyebrow">
                            EMPLOYEE PORTAL
                        </span>


                        <h1>
                            DESKTOP
                            <br />
                            ACCESS ONLY.
                        </h1>


                        <p>
                            The VFOUR employee attendance
                            portal is available only on
                            desktop and laptop devices.
                        </p>


                        <span className="employee-login-small-note">
                            PLEASE ACCESS THIS PORTAL FROM
                            A DESKTOP COMPUTER.
                        </span>

                    </div>

                </div>

            </main>
        );

    }


    /* =================================================
       LOGIN PAGE
    ================================================= */

    return (
        <main className="employee-login-page">

            <div className="employee-login-container">


                {/* =================================================
                   LEFT PANEL
                ================================================= */}

                <section className="employee-login-left">


                    <div className="employee-login-brand">
                        VFOUR
                    </div>


                    <div className="employee-login-intro">

                        <span className="employee-login-eyebrow">
                            INTERNAL SYSTEM
                        </span>


                        <h1>
                            EMPLOYEE
                            <br />
                            ATTENDANCE.
                        </h1>


                        <p>
                            Access your employee account
                            and manage your daily
                            attendance.
                        </p>

                    </div>


                    <div className="employee-login-footer-text">
                        VFOUR / EMPLOYEE PORTAL
                    </div>

                </section>


                {/* =================================================
                   RIGHT PANEL
                ================================================= */}

                <section className="employee-login-right">

                    <div className="employee-login-form-wrapper">


                        <div className="employee-login-form-heading">

                            <span>
                                WELCOME BACK
                            </span>

                            <h2>
                                SIGN IN
                            </h2>

                        </div>


                        {/* =================================================
                           FORM
                        ================================================= */}

                        <form
                            className="employee-login-form"
                            onSubmit={handleLogin}
                        >


                            {/* EMAIL */}

                            <div className="employee-login-field">

                                <label htmlFor="employee-email">
                                    EMAIL ADDRESS
                                </label>


                                <input
                                    id="employee-email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(
                                            event.target.value
                                        )
                                    }
                                    placeholder="employee@vfour.in"
                                    autoComplete="username"
                                    disabled={loading}
                                    required
                                />

                            </div>


                            {/* PASSWORD */}

                            <div className="employee-login-field">

                                <div className="employee-password-label-row">

                                    <label htmlFor="employee-password">
                                        PASSWORD
                                    </label>


                                    <button
                                        type="button"
                                        className="employee-forgot-password"
                                        onClick={() =>
                                            navigate(
                                                "/employee/forgot-password"
                                            )
                                        }
                                        disabled={loading}
                                    >
                                        FORGOT PASSWORD?
                                    </button>

                                </div>


                                <div className="employee-password-wrapper">

                                    <input
                                        id="employee-password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        disabled={loading}
                                        required
                                    />


                                    <button
                                        type="button"
                                        className="employee-password-toggle"
                                        onClick={() =>
                                            setShowPassword(
                                                (current) =>
                                                    !current
                                            )
                                        }
                                        disabled={loading}
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {
                                            showPassword
                                                ? "HIDE"
                                                : "SHOW"
                                        }
                                    </button>

                                </div>

                            </div>


                            {/* ERROR */}

                            {error && (

                                <div
                                    className="employee-login-error"
                                    role="alert"
                                >
                                    {error}
                                </div>

                            )}


                            {/* LOGIN */}

                            <button
                                type="submit"
                                className="employee-login-submit"
                                disabled={loading}
                            >

                                <span>
                                    {
                                        loading
                                            ? "SIGNING IN..."
                                            : "SIGN IN"
                                    }
                                </span>


                                <span className="employee-login-submit-arrow">
                                    →
                                </span>

                            </button>

                        </form>


                        {/* SECURITY */}

                        <div className="employee-login-security">

                            <span>
                                SECURE EMPLOYEE ACCESS
                            </span>

                            <span>
                                VFOUR INTERNAL PORTAL
                            </span>

                        </div>

                    </div>

                </section>

            </div>

        </main>
    );
};


export default EmployeeLogin;