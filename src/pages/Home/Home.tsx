import Hero from "./components/Hero/Hero";
import ServicesPreview from "./components/ServicesPreview/ServicesPreview";
import Testimonials from "../Testimonials/Testimonials";
import ServicesStrip from "./components/ServicesStrip/ServicesStrip";
import Contact from "../Contact/Contact";
const Home = () => {
    return (
        <>
            <Hero />
            <ServicesStrip/>
            <ServicesPreview />
            <Testimonials/>
            <Contact/>
        </>
    );
};

export default Home;