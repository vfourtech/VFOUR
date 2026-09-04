import { useState } from "react";
import type { KeyboardEvent } from "react";
import { useForm } from "@formspree/react";
import SEO from "../../components/SEO/SEO";
import "./Contact.css";

const Contact = () => {
    const [state, handleSubmit] = useForm("meajzrwg");

    const [step, setStep] = useState(1);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [organisation, setOrganisation] = useState("");
    const [project, setProject] = useState("");
    const [details, setDetails] = useState("");


    /* =====================================================
       VALIDATION
    ===================================================== */

    const canContinue = () => {

        if (step === 1) {
            return name.trim().length > 0;
        }

        if (step === 2) {

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            return emailPattern.test(
                email.trim()
            );
        }

        if (step === 3) {
            return organisation.trim().length > 0;
        }

        if (step === 4) {
            return project.trim().length > 0;
        }

        return true;
    };


    /* =====================================================
       NEXT QUESTION
    ===================================================== */

    const nextStep = () => {

        if (!canContinue()) {
            return;
        }

        if (step >= 5) {
            return;
        }

        /*
         * Change the question immediately.
         *
         * The new step uses key={step}, so React
         * mounts it again and the CSS entrance
         * animation starts automatically.
         */
        setStep((current) => current + 1);
    };


    /* =====================================================
       ENTER KEY
    ===================================================== */

    const handleEnter = (
        event: KeyboardEvent<HTMLInputElement>
    ) => {

        if (event.key !== "Enter") {
            return;
        }

        event.preventDefault();

        nextStep();
    };


    /* =====================================================
       SUCCESS SCREEN
    ===================================================== */

    if (state.succeeded) {

        return (
            <section className="contact-section">

                <div className="contact-success">

                    <span className="contact-success-label">
                        MESSAGE RECEIVED
                    </span>

                    <h2>
                        THANK YOU.
                    </h2>

                    <p>
                        Thanks, {name}.
                        <br />
                        We'll be in touch soon.
                    </p>

                    <div className="contact-success-line" />

                </div>

            </section>
        );
    }


    return (
        <>
           <SEO
            title="Contact VFOUR Technologies | IT & Software Solutions"
            description="Contact VFOUR Technologies for web development, AI solutions, software development, data analytics, cloud computing and technology services."
            path="/contact"
        />
        <section className="contact-section">

            {/* =================================================
                BACKGROUND
            ================================================= */}

            <div className="contact-background">

                <div className="contact-grid" />

                <div className="contact-blue-glow" />

            </div>


            <div className="contact-container">


                {/* =================================================
                    LEFT SIDE
                ================================================= */}

                <div className="contact-brand">

                    <div className="contact-brand-content">

                        <span className="contact-eyebrow">
                            LET'S TALK
                        </span>


                        <h1 className="contact-main-heading">

                            Hey, let's start

                            <br />

                            with

                            <br />

                            <span>
                                something simple.
                            </span>

                        </h1>


                        <p>
                            Have a project in mind?
                            <br />
                            We'd love to hear from you.
                        </p>

                    </div>


                    {/* =================================================
                        PROGRESS
                    ================================================= */}

                    <div className="contact-progress">

                        {[1, 2, 3, 4, 5].map(
                            (item) => (

                                <span
                                    key={item}
                                    className={
                                        item <= step
                                            ? "progress-item active"
                                            : "progress-item"
                                    }
                                />

                            )
                        )}

                    </div>

                </div>


                {/* =================================================
                    RIGHT SIDE
                ================================================= */}

                <form
                    className="contact-conversation"
                    onSubmit={handleSubmit}
                >

                    {/* Form source */}

                    <input
                        type="hidden"
                        name="form_source"
                        value="VFOUR Website"
                    />


                    {/* =================================================
                        CONVERSATION
                    ================================================= */}

                    <div
                        key={step}
                        className="conversation-step"
                    >


                        {/* =================================================
                            STEP 1 — NAME
                        ================================================= */}

                        {step === 1 && (

                            <>
                                <span className="conversation-message">
                                    Hey, let's start with
                                    something simple.
                                </span>


                                <label htmlFor="name">
                                    What's your name?
                                </label>


                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={name}
                                    onChange={(event) =>
                                        setName(
                                            event.target.value
                                        )
                                    }
                                    onKeyDown={handleEnter}
                                    placeholder="Your name"
                                    autoComplete="name"
                                    autoFocus
                                    required
                                />


                                <button
                                    type="button"
                                    className="conversation-button"
                                    onClick={nextStep}
                                    disabled={
                                        !name.trim()
                                    }
                                >
                                    <span>
                                        CONTINUE
                                    </span>
                                </button>
                            </>

                        )}


                        {/* =================================================
                            STEP 2 — EMAIL
                        ================================================= */}

                        {step === 2 && (

                            <>
                                <span className="conversation-message">
                                    Nice to meet you.
                                </span>


                                <label htmlFor="email">
                                    What's your email?
                                </label>


                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(
                                            event.target.value
                                        )
                                    }
                                    onKeyDown={handleEnter}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    autoFocus
                                    required
                                />


                                <button
                                    type="button"
                                    className="conversation-button"
                                    onClick={nextStep}
                                    disabled={
                                        !canContinue()
                                    }
                                >
                                    <span>
                                        CONTINUE
                                    </span>
                                </button>
                            </>

                        )}


                        {/* =================================================
                            STEP 3 — ORGANISATION
                        ================================================= */}

                        {step === 3 && (

                            <>
                                <span className="conversation-message">
                                    Great. Who are we
                                    working with?
                                </span>


                                <label htmlFor="organisation">
                                    Organisation / Institution
                                </label>


                                <input
                                    id="organisation"
                                    type="text"
                                    name="organisation"
                                    value={organisation}
                                    onChange={(event) =>
                                        setOrganisation(
                                            event.target.value
                                        )
                                    }
                                    onKeyDown={handleEnter}
                                    placeholder="Organisation name"
                                    autoComplete="organization"
                                    autoFocus
                                    required
                                />


                                <button
                                    type="button"
                                    className="conversation-button"
                                    onClick={nextStep}
                                    disabled={
                                        !organisation.trim()
                                    }
                                >
                                    <span>
                                        CONTINUE
                                    </span>
                                </button>
                            </>

                        )}


                        {/* =================================================
                            STEP 4 — PROJECT TYPE
                        ================================================= */}

                        {step === 4 && (

                            <>
                                <span className="conversation-message">
                                    Now, what are we
                                    building?
                                </span>


                                <label htmlFor="project">
                                    Project type
                                </label>


                                <input
                                    id="project"
                                    type="text"
                                    name="project"
                                    value={project}
                                    onChange={(event) =>
                                        setProject(
                                            event.target.value
                                        )
                                    }
                                    onKeyDown={handleEnter}
                                    placeholder="Website, app, AI solution..."
                                    autoFocus
                                    required
                                />


                                <button
                                    type="button"
                                    className="conversation-button"
                                    onClick={nextStep}
                                    disabled={
                                        !project.trim()
                                    }
                                >
                                    <span>
                                        CONTINUE
                                    </span>
                                </button>
                            </>

                        )}


                        {/* =================================================
                            STEP 5 — MESSAGE
                        ================================================= */}

                        {step === 5 && (

                            <>
                                <span className="conversation-message">
                                    Tell us about the
                                    project.
                                </span>


                                <label htmlFor="details">
                                    Your message
                                </label>


                                <textarea
                                    id="details"
                                    name="details"
                                    value={details}
                                    onChange={(event) =>
                                        setDetails(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Tell us about your project..."
                                    autoFocus
                                    rows={6}
                                    required
                                />


                                <button
                                    type="submit"
                                    className="conversation-button contact-submit"
                                    disabled={
                                        state.submitting ||
                                        !details.trim()
                                    }
                                >
                                    <span>
                                        {state.submitting
                                            ? "SENDING..."
                                            : "SEND MESSAGE"}
                                    </span>
                                </button>


                                {state.errors && (

                                    <div className="contact-form-error">
                                        Something went wrong.
                                        Please try again.
                                    </div>

                                )}

                            </>

                        )}

                    </div>

                </form>

            </div>

        </section>
        </>
    );
};

export default Contact;