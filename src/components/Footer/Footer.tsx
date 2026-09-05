import {
    FaInstagram,
    FaLinkedinIn,
    FaWhatsapp,
} from "react-icons/fa";

import { Link } from "react-router-dom";

import logo from "../../assets/logo1.png";

import "./Footer.css";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">

            <div className="footer-container">

                {/* =========================
                    TOP
                ========================= */}

                <div className="footer-top">

                    {/* BRAND */}

                    <div className="footer-brand">

                        <img
                            src={logo}
                            alt="VFOUR"
                            className="footer-logo"
                        />

                        <p>
                            Digital experiences built
                            <br />
                            with purpose.
                        </p>

                    </div>


                    {/* NAVIGATION */}

                    <div className="footer-navigation">

                        <div className="footer-group">

                            <span className="footer-label">
                                EXPLORE
                            </span>

                            <div className="footer-links">

                                <Link to="/">
                                    Home
                                </Link>

                                <Link to="/works">
                                    Works
                                </Link>

                                <Link to="/about">
                                    About
                                </Link>

                                <Link to="/contact">
                                    Contact
                                </Link>

                            </div>

                        </div>


                        {/* SOCIAL */}

                        <div className="footer-group footer-connect">

                            <span className="footer-label">
                                CONNECT
                            </span>

                            <div className="footer-social">

                                <a
                                    href="https://www.instagram.com/vfour_tech/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Instagram"
                                >
                                    <FaInstagram />
                                </a>

                                <a
                                    href="https://www.linkedin.com/company/vfour-technologies/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="LinkedIn"
                                >
                                    <FaLinkedinIn />
                                </a>

                                <a
    href="https://wa.me/918248917988?text=Hello%20VFOUR%20Technologies%2C%20I%20would%20like%20to%20know%20more%20about%20your%20services."
    target="_blank"
    rel="noopener noreferrer"
    aria-label="WhatsApp"
>
    <FaWhatsapp />
</a>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =========================
                    STATEMENT
                ========================= */}

                <div className="footer-statement">

                    <span>
                        WE TURN IDEAS
                    </span>

                    <span>
                        INTO EXPERIENCES.
                    </span>

                </div>


                {/* =========================
                    DIVIDER
                ========================= */}

                <div className="footer-divider" />


                {/* =========================
                    BOTTOM
                ========================= */}

                <div className="footer-bottom">

                    <span>
                        © {currentYear} VFOUR
                    </span>

                    <span className="footer-built">
                        Built with intention.
                    </span>

                    <div className="footer-legal">

                        <a href="#">
                            Privacy
                        </a>

                        <span>•</span>

                        <a href="#">
                            Terms
                        </a>

                    </div>

                </div>

            </div>

        </footer>
    );
};

export default Footer;