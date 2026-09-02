import { useState } from "react";
import type { FormEvent } from "react";

import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

import "./AdminLogin.css";


import vfourLogo from "../../assets/logo.png";


const AdminLogin = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    const handleLogin = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        const {
            error: loginError,
        } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        });

        setLoading(false);

        if (loginError) {
            setError(
                "Unable to sign in. Please check your credentials."
            );

            return;
        }

        navigate("/admin");
    };


    return (
        <main className="admin-login-page">

            {/* =================================================
                ANIMATED BACKGROUND
            ================================================= */}

            <div className="admin-login-background">

                <div className="admin-grid" />

                <div className="admin-glow glow-one" />
                <div className="admin-glow glow-two" />

                {/* Network */}

                <div className="admin-network">

                    <span className="network-node node-one" />
                    <span className="network-node node-two" />
                    <span className="network-node node-three" />
                    <span className="network-node node-four" />
                    <span className="network-node node-five" />
                    <span className="network-node node-six" />
                    <span className="network-node node-seven" />

                    <span className="network-line network-line-one" />
                    <span className="network-line network-line-two" />
                    <span className="network-line network-line-three" />
                    <span className="network-line network-line-four" />
                    <span className="network-line network-line-five" />

                </div>


                {/* Orbit */}

                <div className="admin-orbit orbit-one">
                    <span />
                </div>

                <div className="admin-orbit orbit-two">
                    <span />
                </div>

            </div>


            {/* =================================================
                LOGIN CONTENT
            ================================================= */}

            <div className="admin-login-container">

                {/* Logo */}

                <div className="admin-brand">

                    <div className="admin-logo-wrapper">

                        <img
                            src={vfourLogo}
                            alt="VFOUR"
                            className="admin-logo"
                        />

                    </div>

                    <div className="admin-brand-line">
                        <span />
                        <p>
                            CONTROL CENTER
                        </p>
                        <span />
                    </div>

                </div>


                {/* =================================================
                    LOGIN CARD
                ================================================= */}

                <div className="admin-login-card">

                    {/* Card glow */}

                    <div className="login-card-glow" />


                    <div className="admin-login-content">

                        {/* Header */}

                        <div className="admin-login-header">

                            <div className="secure-badge">

                                <span className="secure-dot" />

                                SECURE ACCESS

                            </div>


                            <h1>
                                Welcome to VFOUR
                            </h1>


                            <p>
                                Sign in to access your
                                website control center.
                            </p>

                        </div>


                        {/* =================================================
                            FORM
                        ================================================= */}

                        <form
                            onSubmit={handleLogin}
                            className="admin-login-form"
                        >

                            {/* Email */}

                            <div className="admin-field">

                                <label htmlFor="admin-email">
                                    EMAIL ADDRESS
                                </label>

                                <div className="input-wrapper">

                                    <span className="input-icon">
                                        @
                                    </span>

                                    <input
                                        id="admin-email"
                                        type="email"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter your email"
                                        autoComplete="email"
                                        required
                                    />

                                </div>

                            </div>


                            {/* Password */}

                            <div className="admin-field">

                                <label htmlFor="admin-password">
                                    PASSWORD
                                </label>

                                <div className="input-wrapper">

                                    <span className="input-icon">
                                        •
                                    </span>

                                    <input
                                        id="admin-password"
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
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() =>
                                            setShowPassword(
                                                (current) =>
                                                    !current
                                            )
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showPassword
                                            ? "◉"
                                            : "◌"}
                                    </button>

                                </div>

                            </div>


                            {/* Error */}

                            {error && (
                                <div className="admin-login-error">

                                    <span>
                                        !
                                    </span>

                                    {error}

                                </div>
                            )}


                            {/* Login */}

                            <button
                                type="submit"
                                className="admin-login-button"
                                disabled={loading}
                            >

                                <span className="button-text">
                                    {loading
                                        ? "AUTHENTICATING..."
                                        : "ENTER CONTROL CENTER"}
                                </span>


                                {!loading && (
                                    <span className="button-arrow">
                                        ↗
                                    </span>
                                )}


                                {loading && (
                                    <span className="login-loader" />
                                )}

                            </button>

                        </form>

                    </div>

                </div>


                {/* Bottom text */}

                <div className="admin-login-bottom">

                    <span>
                        VFOUR
                    </span>

                    <span>
                        DIGITAL INNOVATION STUDIO
                    </span>

                </div>

            </div>

        </main>
    );
};


export default AdminLogin;