import { useState } from "react";
import "./ServicesPreview.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
    faGlobe,
    faBrain,
    faChartLine,
    faCloud,
    faCode,
    faLightbulb,
    faImage,
    faFilm,
} from "@fortawesome/free-solid-svg-icons";

const services = [
    {
        title: "WEB DEVELOPMENT",
        description:
            "We design and develop modern, responsive websites that are built around your goals. From a strong digital presence to a complete business website, we focus on clean design, smooth user experiences, performance, responsiveness and a structure that helps your audience understand what you offer.",
        icon: faGlobe,
    },

    {
        title: "AI SOLUTIONS",
        description:
            "We develop practical AI solutions that help simplify processes, solve complex problems and create smarter digital experiences. Our approach focuses on using artificial intelligence where it genuinely adds value, while keeping the solution useful, understandable and aligned with real-world requirements.",
        icon: faBrain,
    },

    {
        title: "DATA ANALYTICS",
        description:
            "We transform raw and complex data into useful information that supports better decision-making. Our solutions focus on organizing data, identifying patterns, presenting meaningful insights and helping businesses understand what their data is actually saying.",
        icon: faChartLine,
    },

    {
        title: "CLOUD COMPUTING",
        description:
            "We help businesses move toward reliable and scalable cloud-based solutions. From cloud infrastructure to application deployment and digital scalability, we focus on building technology environments that are flexible, dependable and prepared to support future growth.",
        icon: faCloud,
    },

    {
        title: "SOFTWARE DEVELOPMENT",
        description:
            "We build software around specific requirements rather than forcing your needs into a predefined system. From planning and interface design to development and refinement, we create software that is practical, maintainable and designed to solve real problems.",
        icon: faCode,
    },

    {
        title: "TECH CONSULTING",
        description:
            "We provide technology guidance for businesses that need clarity before making important technical decisions. We help identify the right direction, evaluate possibilities, understand technical requirements and turn ideas into practical technology plans.",
        icon: faLightbulb,
    },

    {
        title: "POSTER DESIGN",
        description:
            "We create posters that communicate a message quickly while maintaining a strong visual identity. From promotional graphics to event and campaign designs, we combine typography, layout and visual elements to create designs that are clear, memorable and purpose-driven.",
        icon: faImage,
    },

    {
        title: "VIDEO EDITING",
        description:
            "We turn raw footage into engaging visual content through thoughtful editing, pacing, transitions, typography and storytelling. Whether the goal is promotion, communication or creative presentation, we focus on producing videos that feel polished and purposeful.",
        icon: faFilm,
    },
];

const ServicesPreview = () => {
    const [active, setActive] = useState(0);

    const total = services.length;

    const previousService = () => {
        setActive((current) =>
            current === 0
                ? total - 1
                : current - 1
        );
    };

    const nextService = () => {
        setActive((current) =>
            (current + 1) % total
        );
    };

    const getPosition = (index: number) => {
        let position = index - active;

        if (position > total / 2) {
            position -= total;
        }

        if (position < -total / 2) {
            position += total;
        }

        return position;
    };

    return (
        <section className="services-preview">

            {/* =================================================
                HEADING
            ================================================= */}

            <div className="services-heading">

                <h2>
                    Our Services
                </h2>

                <p>
                    Technology and creative solutions
                    built around real needs.
                </p>

            </div>


            {/* =================================================
                CAROUSEL
            ================================================= */}

            <div className="services-carousel">

                {/* LEFT ARROW */}

                <button
                    type="button"
                    className="
                        service-slide-arrow
                        service-slide-arrow-left
                    "
                    onClick={previousService}
                    aria-label="Previous service"
                >
                    <span>
                        ←
                    </span>
                </button>


                {/* CARDS */}

                <div className="services-track">

                    {services.map(
                        (service, index) => {

                            const position =
                                getPosition(index);

                            return (
                                <article
                                    key={service.title}
                                    className={`
                                        service-card
                                        position-${position}
                                        ${
                                            position === 0
                                                ? "active"
                                                : ""
                                        }
                                    `}
                                    onClick={() =>
                                        setActive(index)
                                    }
                                >

                                    {/* ICON */}

                                    <div className="service-icon">

                                        <FontAwesomeIcon
                                            icon={service.icon}
                                        />

                                    </div>


                                    {/* CONTENT */}

                                    <div className="service-content">

                                        <span className="service-category">
                                            DIGITAL TECHNOLOGY
                                        </span>


                                        <h3>
                                            {service.title}
                                        </h3>


                                        <p>
                                            {service.description}
                                        </p>

                                    </div>


                                    {/* FOOTER */}

                                    <div className="service-footer">

                                        <span>
                                            VFOUR
                                        </span>

                                        <span>
                                            EXPLORE
                                        </span>

                                    </div>

                                </article>
                            );
                        }
                    )}

                </div>


                {/* RIGHT ARROW */}

                <button
                    type="button"
                    className="
                        service-slide-arrow
                        service-slide-arrow-right
                    "
                    onClick={nextService}
                    aria-label="Next service"
                >
                    <span>
                        →
                    </span>
                </button>

            </div>


            {/* =================================================
                DOT NAVIGATION
            ================================================= */}

            <div className="services-pagination">

                {services.map(
                    (service, index) => (
                        <button
                            key={service.title}
                            type="button"
                            className={`
                                pagination-dot
                                ${
                                    index === active
                                        ? "active"
                                        : ""
                                }
                            `}
                            onClick={() =>
                                setActive(index)
                            }
                            aria-label={`Show ${service.title}`}
                        />
                    )
                )}

            </div>

        </section>
    );
};

export default ServicesPreview;