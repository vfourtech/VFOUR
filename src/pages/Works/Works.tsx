import { useEffect, useState } from "react";

import { supabase } from "../../lib/supabase";

import Footer from "../../components/Footer/Footer";
import SEO from "../../components/SEO/SEO";
import "./Works.css";


/* =========================================================
   TYPES
========================================================= */

interface WorkTag {
    id: string;
    work_id: string;
    tag: string;
}


interface Work {
    id: string;

    title: string;

    description: string | null;

    image_url: string | null;

    project_url: string | null;

    is_published: boolean;

    tags: string[];
}


/* =========================================================
   COMPONENT
========================================================= */

const Works = () => {

    const [works, setWorks] =
        useState<Work[]>([]);

    const [loading, setLoading] =
        useState(true);


    /* =====================================================
       FETCH WORKS
    ===================================================== */

    useEffect(() => {

        fetchWorks();

    }, []);


    const fetchWorks = async () => {

        try {

            setLoading(true);


            /* =============================================
               FETCH PUBLISHED WORKS
            ============================================= */

            const {
                data: worksData,
                error: worksError,
            } = await supabase

                .from("works")

                .select(`
                    id,
                    title,
                    description,
                    image_url,
                    project_url,
                    is_published
                `)

                .eq(
                    "is_published",
                    true
                );


            /* =============================================
               WORKS ERROR
            ============================================= */

            if (worksError) {

                console.error(
                    "Error fetching works:",
                    worksError
                );

                setWorks([]);

                return;
            }


            /* =============================================
               FETCH WORK TAGS
            ============================================= */

            const {
                data: tagsData,
                error: tagsError,
            } = await supabase

                .from("work_tags")

                .select(`
                    id,
                    work_id,
                    tag
                `);


            /* =============================================
               TAG ERROR
            ============================================= */

            if (tagsError) {

                console.error(
                    "Error fetching work tags:",
                    tagsError
                );

            }


            /* =============================================
               MAP TAGS TO WORKS
            ============================================= */

            const formattedWorks: Work[] =
                (worksData || []).map(
                    (work) => {

                        const workTags =
                            (tagsData || [])
                                .filter(
                                    (
                                        tag: WorkTag
                                    ) =>
                                        tag.work_id ===
                                        work.id
                                )
                                .map(
                                    (
                                        tag: WorkTag
                                    ) =>
                                        tag.tag
                                )
                                .filter(
                                    Boolean
                                );


                        return {

                            ...work,

                            tags: workTags,

                        };

                    }
                );


            console.log(
                "Published Works:",
                formattedWorks
            );


            setWorks(
                formattedWorks
            );


        } catch (error) {

            console.error(
                "Unexpected error fetching works:",
                error
            );

            setWorks([]);

        } finally {

            setLoading(false);

        }

    };


    /* =====================================================
       LOADING STATE
    ===================================================== */

    if (loading) {

        return (
             
            <section
                className="vfour-works-section"
                id="our-works"
            >

                <div
                    className="vfour-works-container"
                >

                    <div
                        className="vfour-works-heading"
                    >

                        <span
                            className="vfour-works-title"
                        >
                            OUR WORKS
                        </span>

                    </div>


                    <div
                        className="vfour-works-loading"
                    >

                        <span />

                    </div>

                </div>

            </section>

        );

    }


    /* =====================================================
       FRONTEND
    ===================================================== */

    return (

        <>
        <SEO
            title="Our Works | VFOUR Technologies"
            description="Explore websites, software applications, AI solutions, data projects and creative digital solutions built by VFOUR Technologies."
            path="/works"
        />
        
            <section
                className="vfour-works-section"
                id="our-works"
            >

                <div
                    className="vfour-works-container"
                >


                    {/* =================================================
                        HEADING
                    ================================================= */}

                    <div
                        className="vfour-works-heading"
                    >

                        <span
                            className="vfour-works-title"
                        >
                            OUR WORKS
                        </span>


                        <p
                            className="vfour-works-description"
                        >
                            A selection of digital
                            experiences, products and
                            creative solutions we have
                            built.
                        </p>

                    </div>


                    {/* =================================================
                        WORKS GRID
                    ================================================= */}

                    {works.length > 0 ? (

                        <div
                            className="vfour-works-grid"
                        >

                            {works.map(
                                (work) => (

                                    <article
                                        className="vfour-works-card"
                                        key={work.id}
                                    >


                                        {/* =================================
                                            IMAGE
                                        ================================= */}

                                        <div
                                            className="vfour-works-image-wrapper"
                                        >

                                            {work.image_url ? (

                                                <img
                                                    src={
                                                        work.image_url
                                                    }

                                                    alt={
                                                        work.title
                                                    }

                                                    className="vfour-works-image"

                                                    loading="lazy"
                                                />

                                            ) : (

                                                <div
                                                    className="vfour-works-image-placeholder"
                                                >

                                                    <span>
                                                        VFOUR
                                                    </span>

                                                </div>

                                            )}

                                        </div>


                                        {/* =================================
                                            CONTENT
                                        ================================= */}

                                        <div
                                            className="vfour-works-card-content"
                                        >


                                            {/* TITLE */}

                                            <h3
                                                className="vfour-works-card-title"
                                            >
                                                {
                                                    work.title
                                                }
                                            </h3>


                                            {/* DESCRIPTION */}

                                            {work.description && (

                                                <p
                                                    className="vfour-works-card-description"
                                                >
                                                    {
                                                        work.description
                                                    }
                                                </p>

                                            )}


                                            {/* =================================
                                                TAGS
                                            ================================= */}

                                            {work.tags.length > 0 && (

                                                <div
                                                    className="vfour-works-tags"
                                                >

                                                    {work.tags.map(
                                                        (
                                                            tag,
                                                            index
                                                        ) => (

                                                            <span
                                                                key={
                                                                    `${work.id}-${tag}-${index}`
                                                                }

                                                                className="vfour-works-tag"
                                                            >
                                                                {
                                                                    tag
                                                                }
                                                            </span>

                                                        )
                                                    )}

                                                </div>

                                            )}


                                            {/* =================================
                                                OPTIONAL PROJECT URL
                                            ================================= */}

                                            {work.project_url && (

                                                <a
                                                    href={
                                                        work.project_url
                                                    }

                                                    target="_blank"

                                                    rel="noopener noreferrer"

                                                    className="vfour-works-project-link"
                                                >

                                                    VIEW PROJECT

                                                    <span>
                                                        ↗
                                                    </span>

                                                </a>

                                            )}

                                        </div>

                                    </article>

                                )
                            )}

                        </div>

                    ) : (

                        <div
                            className="vfour-works-empty"
                        >

                            <span>
                                NO WORKS AVAILABLE
                            </span>

                        </div>

                    )}

                </div>

            </section>


            {/* =====================================================
                FOOTER
            ===================================================== */}

            <Footer />

        </>

    );

};


export default Works;