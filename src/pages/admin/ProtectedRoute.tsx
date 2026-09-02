import { useEffect, useState } from "react";
import {
    Navigate,
    Outlet,
} from "react-router-dom";

import { supabase } from "../../lib/supabase";

import "./ProtectedRoute.css";


const ProtectedRoute = () => {

    const [checking, setChecking] =
        useState(true);

    const [authenticated, setAuthenticated] =
        useState(false);


    useEffect(() => {

        let mounted = true;


        const checkAdminAccess = async () => {

            try {

                /* =================================================
                   GET CURRENT AUTH SESSION
                ================================================= */

                const {
                    data,
                    error: sessionError,
                } =
                    await supabase.auth.getSession();


                if (
                    sessionError ||
                    !data.session
                ) {

                    if (mounted) {
                        setAuthenticated(false);
                        setChecking(false);
                    }

                    return;
                }


                const user =
                    data.session.user;


                /* =================================================
                   CHECK USER PROFILE
                ================================================= */

                const {
                    data: profile,
                    error: profileError,
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
                            user.id
                        )
                        .eq(
                            "role",
                            "admin"
                        )
                        .eq(
                            "is_active",
                            true
                        )
                        .maybeSingle();


                /* =================================================
                   INVALID ADMIN
                ================================================= */

                if (
                    profileError ||
                    !profile
                ) {

                    await supabase.auth.signOut();

                    if (mounted) {
                        setAuthenticated(false);
                        setChecking(false);
                    }

                    return;
                }


                /* =================================================
                   ADMIN AUTHORIZED
                ================================================= */

                if (mounted) {
                    setAuthenticated(true);
                    setChecking(false);
                }

            } catch (error) {

                console.error(
                    "Admin authorization error:",
                    error
                );

                await supabase.auth.signOut();

                if (mounted) {
                    setAuthenticated(false);
                    setChecking(false);
                }
            }
        };


        checkAdminAccess();


        /* =================================================
           AUTH STATE LISTENER
        ================================================= */

        const {
            data: authListener,
        } =
            supabase.auth.onAuthStateChange(
                async (_event, session) => {

                    if (!session) {

                        if (mounted) {
                            setAuthenticated(false);
                            setChecking(false);
                        }

                        return;
                    }


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
                                    "admin"
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
                                setAuthenticated(false);
                                setChecking(false);
                            }

                            return;
                        }


                        if (mounted) {
                            setAuthenticated(true);
                            setChecking(false);
                        }

                    } catch (error) {

                        console.error(
                            "Admin auth listener error:",
                            error
                        );

                        if (mounted) {
                            setAuthenticated(false);
                            setChecking(false);
                        }
                    }
                }
            );


        return () => {

            mounted = false;

            authListener.subscription.unsubscribe();

        };

    }, []);


    /* =================================================
       CHECKING
    ================================================= */

    if (checking) {

        return (
            <div className="admin-auth-check">

                <div className="admin-auth-content">

                    <div className="admin-auth-logo">
                        VFOUR
                    </div>

                    <div className="admin-auth-spinner" />

                    <span>
                        VERIFYING ACCESS
                    </span>

                </div>

            </div>
        );
    }


    /* =================================================
       NOT AUTHORIZED
    ================================================= */

    if (!authenticated) {

        return (
            <Navigate
                to="/admin/login"
                replace
            />
        );
    }


    /* =================================================
       AUTHORIZED
    ================================================= */

    return <Outlet />;
};


export default ProtectedRoute;