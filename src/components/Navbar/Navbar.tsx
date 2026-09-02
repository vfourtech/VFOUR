import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";

import logo from "../../assets/logo.png";
import "./Navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">

          {/* Logo */}
          <Link
            to="/"
            className="navbar-logo-link"
            onClick={closeMenu}
          >
            <img
              src={logo}
              alt="VFour"
              className="navbar-logo"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="navbar-links">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/works"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              Our Works
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              About Us
            </NavLink>
          </nav>

          {/* Desktop CTA */}
          <Link
            to="/contact"
            className="navbar-cta"
          >
            Let's Talk
            <span>↗</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className={`mobile-menu-button ${
              menuOpen ? "open" : ""
            }`}
            onClick={toggleMenu}
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
          >
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`mobile-menu-overlay ${
          menuOpen ? "show" : ""
        }`}
        onClick={closeMenu}
      >
        <div
          className="mobile-menu"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mobile-menu-top">
            <span className="mobile-menu-label">
              MENU
            </span>
          </div>

          <nav className="mobile-menu-links">
            <NavLink
              to="/"
              end
              onClick={closeMenu}
              className={({ isActive }) =>
                `mobile-nav-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              <span>Home</span>
            </NavLink>

            <NavLink
              to="/works"
              onClick={closeMenu}
              className={({ isActive }) =>
                `mobile-nav-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              <span>Our Works</span>
            </NavLink>

            <NavLink
              to="/about"
              onClick={closeMenu}
              className={({ isActive }) =>
                `mobile-nav-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              <span>About Us</span>
            </NavLink>
          </nav>

          <Link
            to="/contact"
            className="mobile-menu-cta"
            onClick={closeMenu}
          >
            <span>LET'S TALK</span>
            <span>↗</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;