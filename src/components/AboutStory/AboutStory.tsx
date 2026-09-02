import { useEffect, useState } from "react";
import "./AboutStory.css";

interface Question {
    question: string;
    answer: string;
}

const questions: Question[] = [
    {
        question: "WHY DID WE START VFOUR?",
        answer:
            "VFOUR began with a simple belief — quality shouldn't be a luxury. We wanted to create meaningful digital experiences and creative solutions where careful thinking, strong design and good execution are treated as essential rather than optional. The goal was to build work that feels considered, useful and lasting, while keeping the experience accessible to the people and businesses who need it.",
    },
    {
        question: "WHAT DO WE BELIEVE IN?",
        answer:
            "We believe in ideas, growth and possibility. Every idea deserves the opportunity to be understood properly, developed with purpose and transformed into something meaningful. We believe good work comes from curiosity, collaboration, attention to detail and the willingness to keep improving rather than settling for what is simply acceptable.",
    },
    {
        question: "WHERE ARE WE GOING?",
        answer:
            "We are building VFOUR with a wider vision — creating thoughtful work that can move beyond limitations and reach different people, ideas and opportunities. We want to continue growing our capabilities, exploring new possibilities and building experiences that remain relevant, useful and meaningful as the world around us changes.",
    },
];

const AboutStory = () => {
    const [selectedQuestion, setSelectedQuestion] =
        useState<Question | null>(null);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setSelectedQuestion(null);
            }
        };

        window.addEventListener("keydown", handleEscape);

        return () => {
            window.removeEventListener("keydown", handleEscape);
        };
    }, []);

    useEffect(() => {
        document.body.style.overflow =
            selectedQuestion ? "hidden" : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [selectedQuestion]);

    return (
        <>
            <section className="about-story">

                <div className="about-story-inner">

                    <h1 className="about-story-title">
                        The Story Behind VFOUR
                    </h1>

                    <div className="about-story-grid">

                        {questions.map((item) => (
                            <button
                                key={item.question}
                                type="button"
                                className="about-story-card"
                                onClick={() =>
                                    setSelectedQuestion(item)
                                }
                            >
                                <span className="about-story-question">
                                    {item.question}
                                </span>

                                <span className="about-story-arrow">
                                    ↗
                                </span>
                            </button>
                        ))}

                    </div>

                </div>

            </section>


            {selectedQuestion && (
                <div
                    className="about-answer-overlay"
                    onClick={() =>
                        setSelectedQuestion(null)
                    }
                >
                    <div
                        className="about-answer-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <button
                            type="button"
                            className="about-answer-close"
                            onClick={() =>
                                setSelectedQuestion(null)
                            }
                            aria-label="Close answer"
                        >
                            ×
                        </button>

                        <p className="about-answer-text">
                            {selectedQuestion.answer}
                        </p>

                    </div>
                </div>
            )}
        </>
    );
};

export default AboutStory;