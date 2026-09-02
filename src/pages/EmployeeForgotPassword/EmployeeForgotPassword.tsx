import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import "./EmployeeForgotPassword.css";

const EmployeeForgotPassword = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleResetPassword = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setMessage("");
        setError("");

        const cleanEmail = email.trim();

        if (!cleanEmail) {
            setError("Please enter your email address.");
            return;
        }

        try {
            setLoading(true);

            const { error: resetError } =
                await supabase.auth.resetPasswordForEmail(
                    cleanEmail,
                    {
                        redirectTo:
                            `${window.location.origin}/employee/reset-password`,
                    }
                );

            if (resetError) {
                console.error(
                    "Password reset error:",
                    resetError
                );

                setError(
                    "Unable to send the reset link. Please try again."
                );

                return;
            }

            setMessage(
                "If an account exists with this email, a password reset link has been sent."
            );

            setEmail("");

        } catch (error) {

            console.error(
                "Forgot password error:",
                error
            );

            setError(
                "Something went wrong. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="employee-forgot-page">

            <div className="employee-forgot-container">

                {/* =================================================
                    LEFT PANEL
                ================================================= */}

                <section className="employee-forgot-left">

                    <div className="employee-forgot-brand">
                        VFOUR
                    </div>

                    <div className="employee-forgot-intro">

                        <span className="employee-forgot-eyebrow">
                            EMPLOYEE PORTAL
                        </span>

                        <h1>
                            RESET
                            <br />
                            PASSWORD.
                        </h1>

                        <p>
                            Enter your registered employee
                            email address and we'll send you
                            a secure password reset link.
                        </p>

                    </div>

                    <div className="employee-forgot-footer">
                        VFOUR / SECURE ACCESS
                    </div>

                </section>


                {/* =================================================
                    RIGHT PANEL
                ================================================= */}

                <section className="employee-forgot-right">

                    <div className="employee-forgot-form-wrapper">

                        <div className="employee-forgot-heading">

                            <span>
                                ACCOUNT RECOVERY
                            </span>

                            <h2>
                                FORGOT PASSWORD?
                            </h2>

                        </div>


                        <form
                            className="employee-forgot-form"
                            onSubmit={
                                handleResetPassword
                            }
                        >

                            {/* EMAIL */}

                            <div className="employee-forgot-field">

                                <label htmlFor="reset-email">
                                    EMAIL ADDRESS
                                </label>

                                <input
                                    id="reset-email"
                                    type="email"
                                    placeholder="employee@vfour.in"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(
                                            event.target.value
                                        )
                                    }
                                    autoComplete="email"
                                    disabled={loading}
                                />

                            </div>


                            {/* ERROR */}

                            {error && (
                                <div
                                    className="employee-forgot-error"
                                    role="alert"
                                >
                                    {error}
                                </div>
                            )}


                            {/* SUCCESS */}

                            {message && (
                                <div
                                    className="employee-forgot-message"
                                    role="status"
                                >
                                    {message}
                                </div>
                            )}


                            {/* SEND BUTTON */}

                            <button
                                type="submit"
                                className="employee-forgot-submit"
                                disabled={loading}
                            >

                                <span>
                                    {loading
                                        ? "SENDING..."
                                        : "SEND RESET LINK"}
                                </span>

                                <span>
                                    →
                                </span>

                            </button>

                        </form>


                        {/* BACK TO LOGIN */}

                        <button
                            type="button"
                            className="employee-back-login"
                            onClick={() =>
                                navigate(
                                    "/employee/login"
                                )
                            }
                            disabled={loading}
                        >
                            ← BACK TO LOGIN
                        </button>

                    </div>

                </section>

            </div>

        </main>
    );
};

export default EmployeeForgotPassword;