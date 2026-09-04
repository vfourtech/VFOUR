import SEO from "../../components/SEO/SEO";

import Hero from "./components/Hero/Hero";
import ServicesPreview from "./components/ServicesPreview/ServicesPreview";
import Testimonials from "../Testimonials/Testimonials";
import ServicesStrip from "./components/ServicesStrip/ServicesStrip";
import Contact from "../Contact/Contact";

const Home = () => {
    return (
        <>
            <SEO
                title="VFOUR Technologies | IT, AI, Software & Web Development"
                description="VFOUR Technologies provides web development, AI solutions, software development, data analytics, cloud computing, technology consulting, poster design and video editing services."
                path="/"
            />

            <Hero />
            <ServicesStrip />
            <ServicesPreview />
            <Testimonials />
            <Contact />
        </>
    );
};

export default Home;