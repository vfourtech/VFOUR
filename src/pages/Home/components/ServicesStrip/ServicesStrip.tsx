import "./ServicesStrip.css";

const services = [
    "WEB DEVELOPMENT",
    "AI SOLUTIONS",
    "SOFTWARE DEVELOPMENT",
    "DATA ANALYTICS",
    "CLOUD COMPUTING",
    "TECHNOLOGY CONSULTING",
    "POSTER DESIGN",
    "VIDEO EDITING",
];

const ServicesStrip = () => {
    return (
        <section className="services-strip">

            <div className="services-strip-window">

                <div className="services-strip-track">

                    {[
                        ...services,
                        ...services,
                    ].map((service, index) => (
                        <span
                            className="services-strip-item"
                            key={`${service}-${index}`}
                        >
                            {service}
                        </span>
                    ))}

                </div>

            </div>

        </section>
    );
};

export default ServicesStrip;