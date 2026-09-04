import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import "./Testimonials.css";
import SEO from "../../components/SEO/SEO";
interface Testimonial {
    id: string;
    image_url: string;
    display_order: number;
    is_active: boolean;
}

const Testimonials = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTestimonials = async () => {
            const { data, error } = await supabase
                .from("testimonials")
                .select(
                    "id, image_url, display_order, is_active"
                )
                .eq("is_active", true)
                .order("display_order", {
                    ascending: true,
                });

            if (error) {
                console.error(
                    "Error fetching testimonials:",
                    error.message
                );

                setLoading(false);
                return;
            }

            setTestimonials(data ?? []);
            setLoading(false);
        };

        fetchTestimonials();
    }, []);

    return (
        <>
<SEO
    title="Client Testimonials | VFOUR Technologies"
    description="See what clients say about VFOUR Technologies and our web development, AI, software, data, cloud and digital solutions."
    path="/testimonials"
/>
        <section className="testimonials-section">

            <div className="testimonials-container">

                {/* Heading */}

                <div className="testimonials-heading">

                    <h2>
                        WHAT OUR CLIENTS SAY
                    </h2>

                </div>


                {/* Loading */}

                {loading && (
                    <div className="testimonials-loading">
                        <span />
                    </div>
                )}


                {/* Testimonials */}

                {!loading &&
                    testimonials.length > 0 && (

                        <>
                            <div className="testimonials-grid">

                                {testimonials.map(
                                    (
                                        testimonial,
                                        index
                                    ) => (

                                        <article
                                            className={`testimonial-card testimonial-card-${index % 6}`}
                                            key={
                                                testimonial.id
                                            }
                                        >

                                            <img
                                                src={
                                                    testimonial.image_url
                                                }
                                                alt="Client feedback"
                                                loading="lazy"
                                            />

                                        </article>

                                    )
                                )}

                            </div>


                            {/* Explore Works Button */}

                           <div className="testimonials-works">
    <Link
        to="/works"
        className="testimonials-works-button"
    >
        <span>EXPLORE OUR WORKS</span>
        <span className="works-arrow">↗</span>
    </Link>
</div>
                        </>

                    )}


                {/* Empty state */}

                {!loading &&
                    testimonials.length === 0 && (

                        <div className="testimonials-empty">
                            Client feedback will appear here.
                        </div>

                    )}

            </div>
        
        </section>
        
       </>
    );
   
};

export default Testimonials;