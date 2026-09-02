import "./AboutFinal.css";

const AboutFinal = () => {
    return (
        <section className="about-final">

            <div className="about-final-content">

                <h2>
                    We&apos;re Building for
                    <br />
                    Everywhere.
                </h2>


                <a
                    href="/contact"
                    className="about-final-button"
                >
                    LET&apos;S BUILD TOGETHER

                    <span>
                        ↗
                    </span>
                </a>

            </div>


            <div className="about-final-visual">

                <img
                    src="/everywhere.png"
                    alt="Abstract architectural composition"
                    className="about-final-image"
                />

            </div>

        </section>
    );
};

export default AboutFinal;