import "./AboutQuality.css";

const AboutQuality = () => {
    return (
        <section className="about-quality">

            <div className="about-quality-visual">

                <img
                    src="/Quality.png"
                    alt="Architectural composition"
                    className="about-quality-image"
                />

            </div>


            <div className="about-quality-content">

                <h2>
                    Quality shouldn&apos;t
                    <br />
                    be a luxury.
                </h2>


                <div className="about-quality-line" />


                <p>
                    WE BELIEVE THOUGHTFUL WORK
                    <br />
                    SHOULD FEEL ACCESSIBLE,
                    <br />
                    INTENTIONAL AND TIMELESS.
                </p>

            </div>

        </section>
    );
};

export default AboutQuality;