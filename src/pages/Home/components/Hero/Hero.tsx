import "./Hero.css";

const Hero = () => {
    return (
        <section className="vfour-hero">

            {/* =================================================
                VIDEO BACKGROUND
            ================================================= */}

            <video
                className="vfour-hero-video"
                autoPlay
                muted
                playsInline
                preload="auto"
                onEnded={(event) => {
                    const video =
                        event.currentTarget;

                    video.style.opacity = "0";
                }}
            >
                <source
                    src="/hero3.mp4"
                    type="video/mp4"
                />
            </video>


            {/* =================================================
                DARK OVERLAY
            ================================================= */}

            <div className="vfour-hero-overlay" />


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <div className="vfour-hero-content">

                <h1 className="vfour-hero-title">
                    WE CREATE
                    <br />
                    DIGITAL EXPERIENCES
                    <br />
                    THAT MATTER.
                </h1>


                <p className="vfour-hero-description">
                    Technology, creativity and practical
                    solutions built for businesses and students.
                </p>


                <div className="vfour-hero-actions">

                    <a
                        href="/contact"
                        className="vfour-hero-primary"
                    >
                        START A PROJECT
                        <span>↗</span>
                    </a>


                    <a
                        href="/works"
                        className="vfour-hero-secondary"
                    >
                        VIEW OUR WORK
                    </a>

                </div>

            </div>


            {/* =================================================
                BOTTOM META
            ================================================= */}

            <div className="vfour-hero-bottom">

                <span>
                    DIGITAL EXPERIENCES
                </span>

                <span className="vfour-hero-bottom-line" />

                <span>
                    SCROLL TO EXPLORE
                </span>

            </div>

        </section>
    );
};

export default Hero;