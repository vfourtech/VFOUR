import { useEffect, useState } from "react";
import { FaLinkedinIn } from "react-icons/fa";

import "./AboutTeam.css";

interface Founder {
    name: string;
    role: string;
    image: string;
    description: string;
    linkedin: string;
}


/* =========================================================
   FOUNDERS DATA
========================================================= */

const founders: Founder[] = [
    {
        name: "Abarna",
        role: "FULL STACK DEVELOPER | DATA ANALYST",
        image: "/abarna.png",
        description:
            "Technology becomes more powerful when software and data work together. I specialize in Full Stack Development and Data Analytics, with experience in Python, databases, data processing, and visualization. I enjoy building complete web applications while transforming data into meaningful insights and practical, data-driven solutions.",
        linkedin:
            "https://www.linkedin.com/in/abarna--s/",
    },

    {
        name: "Dhinesh Kumar",
        role: "PYTHON DEVELOPER | ML ENGINEER",
        image: "/dhinesh-kumar.jpg",
        description:
            "Building intelligent solutions is more than just writing code—it’s about transforming complex problems into practical and reliable systems. I specialize in Python development and Machine Learning, building data-driven applications and AI solutions that address real-world challenges. With strong communication and problem-solving skills, I enjoy translating technical ideas into clear, effective solutions and creating intelligent systems that deliver meaningful results.",
        linkedin:
            "https://www.linkedin.com/in/dhinesh1804/",
    },

    {
        name: "Malolan",
        role: "SOFTWARE ENGINEER | CLOUD SPECIALIST",
        image: "/malolan.jpeg",
        description:
        "I focus on building reliable software systems that perform efficiently in production. My expertise includes software engineering, AWS, cloud infrastructure, deployment, databases, and scalable application architecture. I am passionate about designing secure, optimized, and production-ready cloud solutions.",
        linkedin:
            "https://www.linkedin.com/in/malolan-s/",
    },

    {
        name: "Mahavarshini",
        role: "SOFTWARE DEVELOPER | AI ENGINEER",
        image: "/mahavarshini.jpeg",
        description:
"I build intelligent applications by combining software engineering with modern AI technologies. My expertise includes Python, Machine Learning, LLMs, RAG, React, and databases, with a focus on developing practical AI solutions and intelligent systems that solve real-world problems.",       
 linkedin:
            "https://www.linkedin.com/in/mahavarshini--ms/",
    },
];


const AboutTeam = () => {

    const [selectedFounder, setSelectedFounder] =
        useState<Founder | null>(null);


    /* =====================================================
       ESC KEY
    ===================================================== */

    useEffect(() => {

        const handleEscape = (
            event: KeyboardEvent
        ) => {

            if (event.key === "Escape") {

                setSelectedFounder(null);

            }

        };


        window.addEventListener(
            "keydown",
            handleEscape
        );


        return () => {

            window.removeEventListener(
                "keydown",
                handleEscape
            );

        };

    }, []);


    /* =====================================================
       LOCK BODY SCROLL
    ===================================================== */

    useEffect(() => {

        if (selectedFounder) {

            document.body.style.overflow =
                "hidden";

        } else {

            document.body.style.overflow =
                "";

        }


        return () => {

            document.body.style.overflow =
                "";

        };

    }, [selectedFounder]);


    return (
        <>
            {/* =================================================
                TEAM SECTION
            ================================================= */}

            <section className="about-team">


                {/* =================================================
                    SECTION HEADING
                ================================================= */}

                <div className="about-team-heading">

                    <span className="about-team-label">
                        THE PEOPLE BEHIND VFOUR
                    </span>


                    <h2>
                        Meet Our Team
                    </h2>

                </div>


                {/* =================================================
                    FOUNDERS
                ================================================= */}

                <div className="about-founders-grid">

                    {founders.map((founder) => (

                        <button
                            key={founder.name}
                            type="button"
                            className="about-founder-card"
                            onClick={() =>
                                setSelectedFounder(founder)
                            }
                            aria-label={
                                `View ${founder.name} profile`
                            }
                        >

                            {/* =====================================
                                ROUND PROFILE IMAGE
                            ===================================== */}

                            <div className="about-founder-image">

                                <img
                                    src={founder.image}
                                    alt={founder.name}
                                />


                                <div className="about-founder-image-overlay">

                                    <span>
                                        VIEW PROFILE
                                    </span>

                                </div>

                            </div>


                            {/* =====================================
                                FOUNDER NAME
                            ===================================== */}

                            <div className="about-founder-name">
                                {founder.name}
                            </div>

                        </button>

                    ))}

                </div>

            </section>


            {/* =================================================
                PROFILE MODAL
            ================================================= */}

            {selectedFounder && (

                <div
                    className="founder-modal-overlay"
                    onClick={() =>
                        setSelectedFounder(null)
                    }
                >

                    <div
                        className="founder-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >


                        {/* =====================================
                            CLOSE BUTTON
                        ===================================== */}

                        <button
                            type="button"
                            className="founder-modal-close"
                            onClick={() =>
                                setSelectedFounder(null)
                            }
                            aria-label="Close profile"
                        >
                            ×
                        </button>


                        {/* =====================================
                            PROFILE IMAGE
                        ===================================== */}

                        <div className="founder-modal-image">

                            <img
                                src={selectedFounder.image}
                                alt={
                                    selectedFounder.name
                                }
                            />

                        </div>


                        {/* =====================================
                            PROFILE INFORMATION
                        ===================================== */}

                        <div className="founder-modal-content">


                            {/* ROLE */}

                            <span className="founder-modal-role">
                                {selectedFounder.role}
                            </span>


                            {/* NAME */}

                            <h3 className="founder-modal-name">
                                {selectedFounder.name}
                            </h3>


                            {/* DIVIDER */}

                            <div className="founder-modal-line" />


                            {/* DESCRIPTION */}

                            <p className="founder-modal-description">
                                {selectedFounder.description}
                            </p>


                            {/* LINKEDIN */}

                            <a
                                href={
                                    selectedFounder.linkedin
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="founder-linkedin"
                                aria-label={
                                    `${selectedFounder.name} LinkedIn`
                                }
                                title="LinkedIn"
                            >
                                <FaLinkedinIn />
                            </a>

                        </div>

                    </div>

                </div>

            )}
        </>
    );
};

export default AboutTeam;