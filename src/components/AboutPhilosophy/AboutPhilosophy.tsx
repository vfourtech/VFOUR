import "./AboutPhilosophy.css";

const philosophyItems = [
    {
        title: "IDEAS.",
        description:
            "Every meaningful creation starts with an idea.",
        icon: "/ideas.svg",
    },
    {
        title: "GROWTH.",
        description:
            "Ideas become stronger when they are given room to evolve.",
        icon: "/growth.png",
    },
    {
        title: "POSSIBILITY.",
        description:
            "The right idea can become something bigger than imagined.",
        icon: "/possibility.png",
    },
];

const AboutPhilosophy = () => {
    return (
        <section className="about-philosophy">

            <div className="about-philosophy-intro">

                <p>
                    We believe every great journey begins
                    with an <em>idea</em>, grows through{" "}
                    <em>purpose</em>, and becomes{" "}
                    <em>possibility</em> when the right
                    people come together.
                </p>

            </div>


            <div className="about-philosophy-grid">

                {philosophyItems.map((item) => (

                    <article
                        className="about-philosophy-item"
                        key={item.title}
                    >

                        <div className="about-philosophy-icon">

                            <img
                                src={item.icon}
                                alt=""
                            />

                        </div>


                        <h3>
                            {item.title}
                        </h3>


                        <p>
                            {item.description}
                        </p>

                    </article>

                ))}

            </div>

        </section>
    );
};

export default AboutPhilosophy;