import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

import "./Testimonials.css";

interface Testimonial {
    id: string;
    image_url: string;
    display_order: number;
    is_active: boolean;
    created_at: string;
}

const Testimonials = () => {
    const [testimonials, setTestimonials] =
        useState<Testimonial[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [showModal, setShowModal] =
        useState(false);

    const [editingId, setEditingId] =
        useState<string | null>(null);

    const [image, setImage] =
        useState<File | null>(null);

    const [imagePreview, setImagePreview] =
        useState("");

    const [displayOrder, setDisplayOrder] =
        useState(1);

    const [isActive, setIsActive] =
        useState(true);

    const [error, setError] =
        useState("");


    /* =====================================================
       FETCH TESTIMONIALS
    ===================================================== */

    const fetchTestimonials = async () => {
        setLoading(true);
        setError("");

        const {
            data,
            error: fetchError,
        } = await supabase
            .from("testimonials")
            .select("*")
            .order("display_order", {
                ascending: true,
            });

        if (fetchError) {
            setError(fetchError.message);
            setLoading(false);
            return;
        }

        setTestimonials(data ?? []);
        setLoading(false);
    };


    useEffect(() => {
        fetchTestimonials();
    }, []);


    /* =====================================================
       RESET FORM
    ===================================================== */

    const resetForm = () => {
        setEditingId(null);
        setImage(null);
        setImagePreview("");

        setDisplayOrder(
            testimonials.length + 1
        );

        setIsActive(true);
        setError("");
    };


    /* =====================================================
       ADD
    ===================================================== */

    const handleAdd = () => {
        resetForm();
        setShowModal(true);
    };


    /* =====================================================
       EDIT
    ===================================================== */

    const handleEdit = (
        testimonial: Testimonial
    ) => {
        setEditingId(testimonial.id);

        setImage(null);

        setImagePreview(
            testimonial.image_url
        );

        setDisplayOrder(
            testimonial.display_order
        );

        setIsActive(
            testimonial.is_active
        );

        setError("");
        setShowModal(true);
    };


    /* =====================================================
       IMAGE SELECT
    ===================================================== */

    const handleImageChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file =
            event.target.files?.[0];

        if (!file) return;

        setImage(file);

        setImagePreview(
            URL.createObjectURL(file)
        );
    };


    /* =====================================================
       UPLOAD IMAGE
    ===================================================== */

    const uploadImage = async (
        file: File
    ) => {
        const extension =
            file.name
                .split(".")
                .pop();

        const fileName =
            `${crypto.randomUUID()}.${extension}`;

        const {
            error: uploadError,
        } =
            await supabase.storage
                .from("testimonial-images")
                .upload(
                    fileName,
                    file,
                    {
                        cacheControl: "3600",
                        upsert: false,
                    }
                );

        if (uploadError) {
            throw uploadError;
        }

        const {
            data,
        } =
            supabase.storage
                .from("testimonial-images")
                .getPublicUrl(fileName);

        return data.publicUrl;
    };


    /* =====================================================
       SAVE
    ===================================================== */

    const handleSave = async () => {
        setError("");

        if (!editingId && !image) {
            setError(
                "Please upload a feedback image."
            );

            return;
        }

        setSaving(true);

        try {
            let imageUrl = imagePreview;


            /* Upload new image */

            if (image) {
                imageUrl =
                    await uploadImage(image);
            }


            /* =============================================
               EDIT
            ============================================= */

            if (editingId) {
                const {
                    error: updateError,
                } =
                    await supabase
                        .from("testimonials")
                        .update({
                            image_url:
                                imageUrl,

                            display_order:
                                displayOrder,

                            is_active:
                                isActive,

                            updated_at:
                                new Date()
                                    .toISOString(),
                        })
                        .eq(
                            "id",
                            editingId
                        );

                if (updateError) {
                    throw updateError;
                }
            }


            /* =============================================
               ADD
            ============================================= */

            else {
                const {
                    error: insertError,
                } =
                    await supabase
                        .from("testimonials")
                        .insert({
                            image_url:
                                imageUrl,

                            display_order:
                                displayOrder,

                            is_active:
                                isActive,
                        });

                if (insertError) {
                    throw insertError;
                }
            }


            setShowModal(false);

            resetForm();

            await fetchTestimonials();

        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong."
            );
        } finally {
            setSaving(false);
        }
    };


    /* =====================================================
       DELETE
    ===================================================== */

    const handleDelete = async (
        testimonial: Testimonial
    ) => {
        const confirmed =
            window.confirm(
                "Delete this feedback?"
            );

        if (!confirmed) return;

        const {
            error: deleteError,
        } =
            await supabase
                .from("testimonials")
                .delete()
                .eq(
                    "id",
                    testimonial.id
                );

        if (deleteError) {
            setError(
                deleteError.message
            );

            return;
        }

        await fetchTestimonials();
    };


    /* =====================================================
       TOGGLE ACTIVE
    ===================================================== */

    const handleToggleStatus = async (
        testimonial: Testimonial
    ) => {
        const {
            error: updateError,
        } =
            await supabase
                .from("testimonials")
                .update({
                    is_active:
                        !testimonial.is_active,

                    updated_at:
                        new Date()
                            .toISOString(),
                })
                .eq(
                    "id",
                    testimonial.id
                );

        if (updateError) {
            setError(
                updateError.message
            );

            return;
        }

        await fetchTestimonials();
    };


    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <main className="admin-testimonials">

            <div className="testimonials-background">

                <div className="testimonials-grid" />

                <div className="testimonials-glow" />

            </div>


            <div className="testimonials-container">

                {/* HEADER */}

                <header className="testimonials-header">

                    <div>

                        <span className="testimonials-eyebrow">
                            VFOUR / ADMIN
                        </span>

                        <h1>
                            Testimonials
                        </h1>

                        <p>
                            Manage client feedback
                            displayed on the website.
                        </p>

                    </div>


                    <button
                        className="add-testimonial-button"
                        onClick={handleAdd}
                    >
                        <span>+</span>

                        ADD FEEDBACK
                    </button>

                </header>


                {/* ERROR */}

                {error && (
                    <div className="testimonials-error">
                        {error}
                    </div>
                )}


                {/* TABLE */}

                <section className="testimonials-table-card">

                    {loading ? (

                        <div className="testimonials-loading">

                            <div className="testimonial-spinner" />

                            Loading testimonials...

                        </div>

                    ) : testimonials.length === 0 ? (

                        <div className="testimonials-empty">

                            <div className="empty-icon">
                                +
                            </div>

                            <h2>
                                No feedback yet
                            </h2>

                            <p>
                                Add your first client
                                feedback.
                            </p>

                            <button
                                onClick={handleAdd}
                            >
                                ADD FEEDBACK
                            </button>

                        </div>

                    ) : (

                        <div className="testimonials-table-wrapper">

                            <table>

                                <thead>

                                    <tr>

                                        <th>
                                            PREVIEW
                                        </th>

                                        <th>
                                            ORDER
                                        </th>

                                        <th>
                                            STATUS
                                        </th>

                                        <th>
                                            ACTIONS
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {testimonials.map(
                                        (testimonial) => (

                                            <tr
                                                key={
                                                    testimonial.id
                                                }
                                            >

                                                <td>

                                                    <img
                                                        src={
                                                            testimonial.image_url
                                                        }
                                                        alt="Client feedback"
                                                        className="feedback-preview"
                                                    />

                                                </td>


                                                <td>

                                                    <span className="order-number">

                                                        {String(
                                                            testimonial.display_order
                                                        ).padStart(
                                                            2,
                                                            "0"
                                                        )}

                                                    </span>

                                                </td>


                                                <td>

                                                    <button
                                                        className={`status-toggle ${
                                                            testimonial.is_active
                                                                ? "active"
                                                                : "inactive"
                                                        }`}
                                                        onClick={() =>
                                                            handleToggleStatus(
                                                                testimonial
                                                            )
                                                        }
                                                    >

                                                        <span />

                                                        {testimonial.is_active
                                                            ? "ACTIVE"
                                                            : "HIDDEN"}

                                                    </button>

                                                </td>


                                                <td>

                                                    <div className="testimonial-actions">

                                                        <button
                                                            className="edit-button"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    testimonial
                                                                )
                                                            }
                                                        >
                                                            EDIT
                                                        </button>


                                                        <button
                                                            className="delete-button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    testimonial
                                                                )
                                                            }
                                                        >
                                                            DELETE
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            </div>


            {/* =================================================
                ADD / EDIT MODAL
            ================================================= */}

            {showModal && (

                <div
                    className="testimonial-modal-overlay"
                    onClick={() =>
                        setShowModal(false)
                    }
                >

                    <div
                        className="testimonial-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="testimonial-modal-header">

                            <div>

                                <span>
                                    VFOUR / TESTIMONIAL
                                </span>

                                <h2>
                                    {editingId
                                        ? "Edit Feedback"
                                        : "Add Feedback"}
                                </h2>

                            </div>


                            <button
                                className="modal-close"
                                onClick={() =>
                                    setShowModal(false)
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="testimonial-form">

                            {/* IMAGE */}

                            <div className="image-upload-section">

                                <label>
                                    FEEDBACK IMAGE
                                </label>


                                <label className="feedback-upload-box">

                                    {imagePreview ? (

                                        <img
                                            src={
                                                imagePreview
                                            }
                                            alt="Feedback preview"
                                        />

                                    ) : (

                                        <div className="upload-placeholder">

                                            <span>
                                                +
                                            </span>

                                            <small>
                                                UPLOAD FEEDBACK
                                            </small>

                                        </div>

                                    )}


                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={
                                            handleImageChange
                                        }
                                    />

                                </label>

                            </div>


                            {/* ORDER + STATUS */}

                            <div className="testimonial-form-row">

                                <div className="testimonial-field">

                                    <label>
                                        DISPLAY ORDER
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        value={
                                            displayOrder
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setDisplayOrder(
                                                Number(
                                                    event.target.value
                                                )
                                            )
                                        }
                                    />

                                </div>


                                <div className="testimonial-field">

                                    <label>
                                        STATUS
                                    </label>

                                    <button
                                        type="button"
                                        className={`modal-status-toggle ${
                                            isActive
                                                ? "active"
                                                : "inactive"
                                        }`}
                                        onClick={() =>
                                            setIsActive(
                                                (current) =>
                                                    !current
                                            )
                                        }
                                    >

                                        <span />

                                        {isActive
                                            ? "ACTIVE"
                                            : "HIDDEN"}

                                    </button>

                                </div>

                            </div>


                            {/* ERROR */}

                            {error && (
                                <div className="modal-error">
                                    {error}
                                </div>
                            )}


                            {/* ACTIONS */}

                            <div className="testimonial-modal-actions">

                                <button
                                    className="modal-cancel"
                                    onClick={() =>
                                        setShowModal(false)
                                    }
                                >
                                    CANCEL
                                </button>


                                <button
                                    className="modal-save"
                                    onClick={handleSave}
                                    disabled={saving}
                                >

                                    {saving
                                        ? "SAVING..."
                                        : editingId
                                            ? "UPDATE FEEDBACK ↗"
                                            : "SAVE FEEDBACK ↗"}

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </main>
    );
};

export default Testimonials;