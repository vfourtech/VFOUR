import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import logo from "../../assets/logo.png";

import "./LoadingScreen.css";

interface LoadingScreenProps {
    onComplete: () => void;
}

const LoadingScreen = ({
    onComplete,
}: LoadingScreenProps) => {
    const [isVisible, setIsVisible] =
        useState(true);

    const [progress, setProgress] =
        useState(0);

    useEffect(() => {
        const duration = 2800;
        const intervalTime = 20;

        const interval = setInterval(() => {
            setProgress((previous) => {
                const next =
                    previous +
                    100 /
                        (duration /
                            intervalTime);

                if (next >= 100) {
                    clearInterval(interval);

                    return 100;
                }

                return next;
            });
        }, intervalTime);

        const timer = setTimeout(() => {
            setIsVisible(false);
        }, duration);

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, []);

    return (
        <AnimatePresence
            onExitComplete={onComplete}
        >
            {isVisible && (
                <motion.div
                    className="loading-screen"

                    initial={{
                        opacity: 1,
                    }}

                    exit={{
                        opacity: 0,
                        scale: 1.02,
                        filter: "blur(8px)",

                        transition: {
                            duration: 0.9,
                            ease: "easeInOut",
                        },
                    }}
                >

                    {/* =========================================
                        BACKGROUND GRID
                    ========================================= */}

                    <div className="loading-grid" />


                    {/* =========================================
                        CENTRAL GLOW
                    ========================================= */}

                    <div className="loading-glow" />


                    {/* =========================================
                        ORBIT RINGS
                    ========================================= */}

                    <div
                        className="
                            loading-orbit
                            loading-orbit-one
                        "
                    />

                    <div
                        className="
                            loading-orbit
                            loading-orbit-two
                        "
                    />


                    {/* =========================================
                        FLOATING PARTICLES
                    ========================================= */}

                    <div className="loading-particles">

                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />

                    </div>


                    {/* =========================================
                        MAIN CONTENT
                    ========================================= */}

                    <div className="loading-content">


                        {/* =====================================
                            EYEBROW
                        ===================================== */}

                        <motion.div
                            className="loading-eyebrow"

                            initial={{
                                opacity: 0,
                                y: -15,
                            }}

                            animate={{
                                opacity: 1,
                                y: 0,
                            }}

                            transition={{
                                duration: 0.7,
                            }}
                        >
                            VFOUR TECHNOLOGIES
                        </motion.div>


                        {/* =====================================
                            LOGO
                        ===================================== */}

                        <motion.div
                            className="loading-logo-wrapper"

                            initial={{
                                opacity: 0,
                                scale: 0.75,
                                filter: "blur(12px)",
                            }}

                            animate={{
                                opacity: 1,
                                scale: 1,
                                filter: "blur(0px)",
                            }}

                            transition={{
                                duration: 1.1,
                                ease: [
                                    0.16,
                                    1,
                                    0.3,
                                    1,
                                ],
                            }}
                        >
                            <img
                                src={logo}
                                alt="VFOUR"
                                className="loading-logo"
                            />
                        </motion.div>


                        {/* =====================================
                            MAIN TITLE
                        ===================================== */}

                        <motion.h1
                            className="loading-title"

                            initial={{
                                opacity: 0,
                                y: 20,
                            }}

                            animate={{
                                opacity: 1,
                                y: 0,
                            }}

                            transition={{
                                delay: 0.45,
                                duration: 0.8,
                                ease: "easeOut",
                            }}
                        >
                            IDEAS INTO
                            <span>
                                DIGITAL FORM
                            </span>
                        </motion.h1>


                        {/* =====================================
                            DESCRIPTION
                        ===================================== */}

                        <motion.p
                            className="loading-description"

                            initial={{
                                opacity: 0,
                                y: 10,
                            }}

                            animate={{
                                opacity: 1,
                                y: 0,
                            }}

                            transition={{
                                delay: 0.7,
                                duration: 0.7,
                            }}
                        >
                            DESIGN
                            <span>•</span>
                            CODE
                            <span>•</span>
                            INTELLIGENCE
                        </motion.p>


                        {/* =====================================
                            STATUS
                        ===================================== */}

                        <motion.div
                            className="loading-status"

                            initial={{
                                opacity: 0,
                                y: 10,
                            }}

                            animate={{
                                opacity: 1,
                                y: 0,
                            }}

                            transition={{
                                delay: 0.9,
                                duration: 0.6,
                            }}
                        >
                            <span className="loading-status-dot" />

                            <span>
                                PREPARING YOUR EXPERIENCE
                            </span>
                        </motion.div>


                        {/* =====================================
                            PROGRESS
                        ===================================== */}

                        <motion.div
                            className="loading-progress-area"

                            initial={{
                                opacity: 0,
                            }}

                            animate={{
                                opacity: 1,
                            }}

                            transition={{
                                delay: 1,
                                duration: 0.5,
                            }}
                        >

                            <div className="loading-progress-header">

                                <span className="loading-progress-label">
                                    VFOUR / 072
                                </span>

                                <span className="loading-progress-number">
                                    {Math.round(
                                        progress
                                    )
                                        .toString()
                                        .padStart(
                                            3,
                                            "0"
                                        )}
                                    %
                                </span>

                            </div>


                            <div className="loading-progress-track">

                                <motion.div
                                    className="loading-progress"

                                    style={{
                                        width:
                                            `${progress}%`,
                                    }}
                                />

                            </div>

                        </motion.div>


                        {/* =====================================
                            FOOTER
                        ===================================== */}

                        <motion.div
                            className="loading-footer"

                            initial={{
                                opacity: 0,
                            }}

                            animate={{
                                opacity: 1,
                            }}

                            transition={{
                                delay: 1.25,
                                duration: 0.6,
                            }}
                        >
                            DIGITAL EXPERIENCES,
                            BUILT DIFFERENTLY
                        </motion.div>


                    </div>

                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoadingScreen;