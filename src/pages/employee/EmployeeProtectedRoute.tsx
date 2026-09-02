import { useEffect, useState } from "react";
import {
    Navigate,
    Outlet,
} from "react-router-dom";

import { supabase } from "../../lib/supabase";
import "./EmployeeProtectedRoute.css";

const EmployeeProtectedRoute = () => {

    const [loading, setLoading] =
        useState(true);

    const [authorized, setAuthorized] =
        useState(false);


    /* =================================================
       VERIFY EMPLOYEE ACCESS
    ================================================= */

    useEffect(() => {

        let mounted = true;


        const verifyEmployee = async () => {

            try {

                /* =========================================
                   GET CURRENT SESSION
                ========================================= */

                const {
                    data: sessionData,
                    error: sessionError,
                } =
                    await supabase.auth.getSession();


                if (
                    sessionError ||
                    !sessionData.session
                ) {

                    if (mounted) {

                        setAuthorized(false);
                        setLoading(false);

                    }

                    return;
                }


                const user =
                    sessionData.session.user;


                /* =========================================
                   CHECK EMPLOYEE PROFILE
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
                            user.id
                        )
                        .eq(
                            "role",
                            "employee"
                        )
                        .eq(
                            "is_active",
                            true
                        )
                        .maybeSingle();


                /* =========================================
                   PROFILE INVALID
                ========================================= */

                if (
                    profileError ||
                    !profile
                ) {

                    console.error(
                        "Employee profile verification failed:",
                        profileError
                    );


                    await supabase.auth.signOut();


                    if (mounted) {

                        setAuthorized(false);
                        setLoading(false);

                    }

                    return;
                }


                /* =========================================
                   EMPLOYEE AUTHORIZED
                ========================================= */

                if (mounted) {

                    setAuthorized(true);
                    setLoading(false);

                }

            } catch (error) {

                console.error(
                    "Employee authorization error:",
                    error
                );


                await supabase.auth.signOut();


                if (mounted) {

                    setAuthorized(false);
                    setLoading(false);

                }
            }
        };


        verifyEmployee();


        /* =================================================
           AUTH STATE LISTENER
        ================================================= */

        const {
            data: authListener,
        } =
            supabase.auth.onAuthStateChange(
                (_event, session) => {

                    /*
                     * No active session
                     */

                    if (!session) {

                        if (mounted) {

                            setAuthorized(false);
                            setLoading(false);

                        }

                        return;
                    }


                    /*
                     * A session exists.
                     *
                     * We verify the profile separately
                     * so the route does not trust the
                     * authentication session alone.
                     */

                    const verifyCurrentUser = async () => {

                        try {

                            const {
                                data: profile,
                                error,
                            } =
                                await supabase
                                    .from("profiles")
                                    .select(`
                                        user_id,
                                        role,
                                        is_active
                                    `)
                                    .eq(
                                        "user_id",
                                        session.user.id
                                    )
                                    .eq(
                                        "role",
                                        "employee"
                                    )
                                    .eq(
                                        "is_active",
                                        true
                                    )
                                    .maybeSingle();


                            if (
                                error ||
                                !profile
                            ) {

                                await supabase.auth.signOut();


                                if (mounted) {

                                    setAuthorized(false);
                                    setLoading(false);

                                }

                                return;
                            }


                            if (mounted) {

                                setAuthorized(true);
                                setLoading(false);

                            }

                        } catch (error) {

                            console.error(
                                "Employee profile verification error:",
                                error
                            );


                            if (mounted) {

                                setAuthorized(false);
                                setLoading(false);

                            }

                        }

                    };


                    verifyCurrentUser();

                }
            );


        /* =================================================
           CLEANUP
        ================================================= */

        return () => {

            mounted = false;

            authListener.subscription.unsubscribe();

        };

    }, []);


    /* =================================================
       LOADING SCREEN
    ================================================= */

    if (loading) {

        return (
            <div className="employee-route-loading">

                <div className="employee-route-loading-content">

                    <div className="employee-route-loading-logo">
                        VFOUR
                    </div>

                    <span>
                        VERIFYING ACCESS...
                    </span>

                </div>

            </div>
        );
    }


    /* =================================================
       NOT AUTHORIZED
    ================================================= */

    if (!authorized) {

        return (
            <Navigate
                to="/employee"
                replace
            />
        );
    }


    /* =================================================
       AUTHORIZED
    ================================================= */

    return <Outlet />;
};


export default EmployeeProtectedRoute;