import Footer from "../../components/Footer/Footer";

import AboutStory from "../../components/AboutStory/AboutStory";
import AboutQuality from "../../components/AboutQuality/AboutQuality";
import AboutTeam from "../../components/AboutTeam/AboutTeam";
import AboutPhilosophy from "../../components/AboutPhilosophy/AboutPhilosophy";
import AboutFinal from "../../components/AboutFinal/AboutFinal";
import SEO from "../../components/SEO/SEO";

import "./About.css";

const About = () => {
    return (
        <>
        <SEO
    title="Client Testimonials | VFOUR Technologies"
    description="See what clients say about VFOUR Technologies and our web development, AI, software, data, cloud and digital solutions."
    path="/testimonials"
/>
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