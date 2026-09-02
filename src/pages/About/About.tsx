import Footer from "../../components/Footer/Footer";

import AboutStory from "../../components/AboutStory/AboutStory";
import AboutQuality from "../../components/AboutQuality/AboutQuality";
import AboutTeam from "../../components/AboutTeam/AboutTeam";
import AboutPhilosophy from "../../components/AboutPhilosophy/AboutPhilosophy";
import AboutFinal from "../../components/AboutFinal/AboutFinal";

import "./About.css";

const About = () => {
    return (
        <>
            <main className="vfour-about">

                {/* Story + Questions */}
                <AboutStory />

                {/* Quality Section */}
                <AboutQuality />

                {/* Founders / Team */}
                <AboutTeam />

                {/* Philosophy */}
                <AboutPhilosophy />

                {/* Final CTA */}
                <AboutFinal />

            </main>

            <Footer />
        </>
    );
};

export default About;