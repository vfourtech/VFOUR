import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import "./EmployeeResetPassword.css";

const EmployeeResetPassword = () => {
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [loading, setLoading] = useState(false);
    const [checkingSession, setCheckingSession] =
        useState(true);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    /* =================================================
       CHECK RESET SESSION
    ================================================= */

    useEffect(() => {
        let mounted = true;

        const checkSession = async () => {
            try {
                const {
                    data,
                    error: sessionError,
                } = await supabase.auth.getSession();

                if (!mounted) return;

                if (sessionError || !data.session) {
                    setError(
                        "This password reset link is invalid or has expired."
                    );
                }
            } catch (error) {
                console.error(
                    "Reset session error:",
                    error
                );

                if (mounted) {
                    setError(
                        "Unable to verify the password reset link."
                    );
                }
            } finally {
                if (mounted) {
                    setCheckingSession(false);
                }
            }
        };

        checkSession();

        return () => {
            mounted = false;
        };
    }, []);

    /* =================================================
       PASSWORD VALIDATION
    ================================================= */

    const validatePassword = () => {
        if (!password) {
            return "Please enter a new password.";
        }

        if (password.length < 8) {
            return "Password must be at least 8 characters.";
        }

        if (!confirmPassword) {
            return "Please confirm your new password.";
        }

        if (password !== confirmPassword) {
            return "Passwords do not match.";
        }

        return "";
    };

    /* =================================================
       UPDATE PASSWORD
    ================================================= */

    const handleResetPassword = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const validationError =
            validatePassword();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setLoading(true);

            const {
                error: updateError,
            } = await supabase.auth.updateUser({
                password,
            });

            if (updateError) {
                console.error(
                    "Password update error:",
                    updateError
                );

                setError(
                    "Unable to update your password. Please try again."
                );

                return;
            }

            setPassword("");
            setConfirmPassword("");

            setSuccess(
                "Your password has been updated successfully."
            );
        } catch (error) {
            console.error(
                "Reset password error:",
                error
            );

            setError(
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    /* =================================================
       LOADING
    ================================================= */

    if (checkingSession) {
        return (
            <main className="employee-reset-page">

                <div className="employee-reset-loading">

                    <div className="employee-reset-brand">
                        VFOUR
                    </div>

                    <span>
                        VERIFYING RESET LINK...
                    </span>

                </div>

            </main>
        );
    }

    /* =================================================
       RESET PAGE
    ================================================= */

    return (
        <main className="employee-reset-page">

            <div className="employee-reset-container">

                {/* =================================================
                    LEFT PANEL
                ================================================= */}

                <section className="employee-reset-left">

                    <div className="employee-reset-brand">
                        VFOUR
                    </div>

                    <div className="employee-reset-intro">

                        <span className="employee-reset-eyebrow">
                            EMPLOYEE PORTAL
                        </span>

                        <h1>
                            NEW
                            <br />
                            PASSWORD.
                        </h1>

                        <p>
                            Create a new password for your
                            VFOUR employee account.
                        </p>

                    </div>

                    <div className="employee-reset-footer">
                        VFOUR / SECURE ACCESS
                    </div>

                </section>


                {/* =================================================
                    RIGHT PANEL
                ================================================= */}

                <section className="employee-reset-right">

                    <div className="employee-reset-form-wrapper">

                        <div className="employee-reset-heading">

                            <span>
                                ACCOUNT SECURITY
                            </span>

                            <h2>
                                RESET PASSWORD
                            </h2>

                        </div>


                        {error &&
                            !success && (
                                <div
                                    className="employee-reset-error"
                                    role="alert"
                                >
                                    {error}
                                </div>
                            )}


                        {success ? (

                            /* =========================================
                               SUCCESS STATE
                            ========================================= */

                            <div className="employee-reset-success-state">

                                <div className="employee-reset-success-icon">
                                    ✓
                                </div>

                                <h3>
                                    PASSWORD UPDATED
                                </h3>

                                <p>
                                    Your password has been
                                    changed successfully.
                                    You can now sign in using
                                    your new password.
                                </p>

                                <button
                                    type="button"
                                    className="employee-reset-login-button"
                                    onClick={() =>
                                        navigate(
                                            "/employee/login",
                                            {
                                                replace: true,
                                            }
                                        )
                                    }
                                >
                                    GO TO LOGIN
                                    <span>→</span>
                                </button>

                            </div>

                        ) : (

                            /* =========================================
                               RESET FORM
                            ========================================= */

                            <form
                                className="employee-reset-form"
                                onSubmit={
                                    handleResetPassword
                                }
                            >

                                {/* NEW PASSWORD */}

                                <div className="employee-reset-field">

                                    <label htmlFor="new-password">
                                        NEW PASSWORD
                                    </label>

                                    <div className="employee-reset-password-wrapper">

                                        <input
                                            id="new-password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="Enter new password"
                                            value={
                                                password
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setPassword(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            autoComplete="new-password"
                                            disabled={
                                                loading
                                            }
                                        />

                                        <button
                                            type="button"
                                            className="employee-reset-password-toggle"
                                            onClick={() =>
                                                setShowPassword(
                                                    (
                                                        previous
                                                    ) =>
                                                        !previous
                                                )
                                            }
                                            disabled={
                                                loading
                                            }
                                        >
                                            {showPassword
                                                ? "HIDE"
                                                : "SHOW"}
                                        </button>

                                    </div>

                                    <span className="employee-reset-hint">
                                        MINIMUM 8 CHARACTERS
                                    </span>

                                </div>


                                {/* CONFIRM PASSWORD */}

                                <div className="employee-reset-field">

                                    <label htmlFor="confirm-password">
                                        CONFIRM PASSWORD
                                    </label>

                                    <div className="employee-reset-password-wrapper">

                                        <input
                                            id="confirm-password"
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="Confirm new password"
                                            value={
                                                confirmPassword
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setConfirmPassword(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            autoComplete="new-password"
                                            disabled={
                                                loading
                                            }
                                        />

                                        <button
                                            type="button"
                                            className="employee-reset-password-toggle"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    (
                                                        previous
                                                    ) =>
                                                        !previous
                                                )
                                            }
                                            disabled={
                                                loading
                                            }
                                        >
                                            {showConfirmPassword
                                                ? "HIDE"
                                                : "SHOW"}
                                        </button>

                                    </div>

                                </div>


                                {/* ERROR */}

                                {error && (
                                    <div
                                        className="employee-reset-error"
                                        role="alert"
                                    >
                                        {error}
                                    </div>
                                )}


                                {/* SUBMIT */}

                                <button
                                    type="submit"
                                    className="employee-reset-submit"
                                    disabled={loading}
                                >

                                    <span>
                                        {loading
                                            ? "UPDATING..."
                                            : "UPDATE PASSWORD"}
                                    </span>

                                    <span>
                                        →
                                    </span>

                                </button>


                                {/* BACK */}

                                <button
                                    type="button"
                                    className="employee-reset-back"
                                    onClick={() =>
                                        navigate(
                                            "/employee/login"
                                        )
                                    }
                                    disabled={loading}
                                >
                                    ← BACK TO LOGIN
                                </button>

                            </form>
                        )}

                    </div>

                </section>

            </div>

        </main>
    );
};

export default EmployeeResetPassword;