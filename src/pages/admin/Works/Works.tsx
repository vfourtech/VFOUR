import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

import "./Works.css";


interface Work {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    project_url: string | null;
    is_published: boolean;
    created_at: string;
    updated_at: string;
    work_tags?: WorkTag[];
}

interface WorkTag {
    id: string;
    work_id: string;
    tag: string;
}

interface WorkForm {
    title: string;
    description: string;
    project_url: string;
    tags: string;
    is_published: boolean;
}

const emptyForm: WorkForm = {
    title: "",
    description: "",
    project_url: "",
    tags: "",
    is_published: true,
};


const WorksAdmin = () => {

    const [works, setWorks] = useState<Work[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [showModal, setShowModal] =
        useState(false);

    const [editingWork, setEditingWork] =
        useState<Work | null>(null);

    const [form, setForm] =
        useState<WorkForm>(emptyForm);

    const [imageFile, setImageFile] =
        useState<File | null>(null);

    const [imagePreview, setImagePreview] =
        useState("");


    /* =====================================================
       FETCH WORKS
    ===================================================== */

    const fetchWorks = async () => {

        try {

            setLoading(true);
            setError("");

            const {
                data,
                error: fetchError,
            } = await supabase
                .from("works")
                .select(`
                    *,
                    work_tags (
                        id,
                        work_id,
                        tag
                    )
                `)
                .order(
                    "created_at",
                    {
                        ascending: false,
                    }
                );


            if (fetchError) {
                throw fetchError;
            }


            setWorks(
                (data || []) as Work[]
            );

        } catch (err: any) {

            console.error(
                "Fetch works error:",
                err
            );

            setError(
                err.message ||
                "Failed to load works."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchWorks();

    }, []);


    /* =====================================================
       FORM HANDLERS
    ===================================================== */

    const handleChange = (
        e:
            React.ChangeEvent<
                HTMLInputElement |
                HTMLTextAreaElement
            >
    ) => {

        const {
            name,
            value,
        } = e.target;


        setForm(
            (current) => ({
                ...current,
                [name]: value,
            })
        );
    };


    const handlePublishedChange = (
        e:
            React.ChangeEvent<HTMLInputElement>
    ) => {

        setForm(
            (current) => ({
                ...current,
                is_published:
                    e.target.checked,
            })
        );
    };


    /* =====================================================
       IMAGE SELECT
    ===================================================== */

    const handleImageChange = (
        e:
            React.ChangeEvent<HTMLInputElement>
    ) => {

        const file =
            e.target.files?.[0];

        if (!file) {
            return;
        }


        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/jpg",
        ];


        if (
            !allowedTypes.includes(
                file.type
            )
        ) {

            setError(
                "Please select a JPG, PNG or WebP image."
            );

            return;
        }


        if (
            file.size >
            5 * 1024 * 1024
        ) {

            setError(
                "Image size must be less than 5MB."
            );

            return;
        }


        setImageFile(file);

        setImagePreview(
            URL.createObjectURL(file)
        );

        setError("");

    };


    /* =====================================================
       OPEN ADD MODAL
    ===================================================== */

    const openAddModal = () => {

        setEditingWork(null);

        setForm(emptyForm);

        setImageFile(null);

        setImagePreview("");

        setError("");

        setSuccess("");

        setShowModal(true);
    };


    /* =====================================================
       OPEN EDIT MODAL
    ===================================================== */

    const openEditModal = (
        work: Work
    ) => {

        setEditingWork(work);

        setForm({
            title:
                work.title || "",

            description:
                work.description || "",

            project_url:
                work.project_url || "",

            tags:
                work.work_tags
                    ?.map(
                        (item) =>
                            item.tag
                    )
                    .join(", ") || "",

            is_published:
                work.is_published,
        });

        setImageFile(null);

        setImagePreview(
            work.image_url || ""
        );

        setError("");

        setSuccess("");

        setShowModal(true);
    };


    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    const closeModal = () => {

        if (saving) {
            return;
        }

        setShowModal(false);

        setEditingWork(null);

        setForm(emptyForm);

        setImageFile(null);

        setImagePreview("");

        setError("");
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
                .pop()
                ?.toLowerCase() ||
            "jpg";


        const fileName =
            `${crypto.randomUUID()}.${extension}`;


        const filePath =
            `works/${fileName}`;


        const {
            error: uploadError,
        } =
            await supabase
                .storage
                .from("work-images")
                .upload(
                    filePath,
                    file,
                    {
                        cacheControl:
                            "3600",

                        upsert: false,
                    }
                );


        if (uploadError) {
            throw uploadError;
        }


        const {
            data,
        } =
            supabase
                .storage
                .from(
                    "work-images"
                )
                .getPublicUrl(
                    filePath
                );


        return data.publicUrl;
    };


    /* =====================================================
       SAVE WORK
    ===================================================== */

    const handleSubmit = async (
        e:
            React.FormEvent
    ) => {

        e.preventDefault();

        setError("");

        setSuccess("");


        if (
            !form.title.trim()
        ) {

            setError(
                "Work title is required."
            );

            return;
        }


        try {

            setSaving(true);


            let imageUrl =
                editingWork?.image_url ||
                null;


            /* ---------------------------------------------
               Upload new image
            --------------------------------------------- */

            if (imageFile) {

                imageUrl =
                    await uploadImage(
                        imageFile
                    );
            }


            /* ---------------------------------------------
               Create / Update work
            --------------------------------------------- */

            let workId =
                editingWork?.id ||
                "";


            if (editingWork) {

                const {
                    error:
                        updateError,
                } =
                    await supabase
                        .from("works")
                        .update({
                            title:
                                form.title.trim(),

                            description:
                                form.description.trim() ||
                                null,

                            image_url:
                                imageUrl,

                            project_url:
                                form.project_url.trim() ||
                                null,

                            is_published:
                                form.is_published,

                            updated_at:
                                new Date().toISOString(),
                        })
                        .eq(
                            "id",
                            editingWork.id
                        );


                if (updateError) {
                    throw updateError;
                }

            } else {

                const {
                    data,
                    error:
                        insertError,
                } =
                    await supabase
                        .from("works")
                        .insert({
                            title:
                                form.title.trim(),

                            description:
                                form.description.trim() ||
                                null,

                            image_url:
                                imageUrl,

                            project_url:
                                form.project_url.trim() ||
                                null,

                            is_published:
                                form.is_published,
                        })
                        .select()
                        .single();


                if (insertError) {
                    throw insertError;
                }


                workId =
                    data.id;
            }


            /* ---------------------------------------------
               Remove old tags
            --------------------------------------------- */

            const {
                error:
                    deleteTagsError,
            } =
                await supabase
                    .from("work_tags")
                    .delete()
                    .eq(
                        "work_id",
                        workId
                    );


            if (deleteTagsError) {
                throw deleteTagsError;
            }


            /* ---------------------------------------------
               Add new tags
            --------------------------------------------- */

            const tags =
                form.tags
                    .split(",")
                    .map(
                        (tag) =>
                            tag.trim()
                    )
                    .filter(
                        (tag) =>
                            tag.length > 0
                    );


            if (tags.length > 0) {

                const tagRows =
                    tags.map(
                        (tag) => ({
                            work_id:
                                workId,

                            tag,
                        })
                    );


                const {
                    error:
                        insertTagsError,
                } =
                    await supabase
                        .from("work_tags")
                        .insert(
                            tagRows
                        );


                if (
                    insertTagsError
                ) {
                    throw insertTagsError;
                }
            }


            setSuccess(
                editingWork
                    ? "Work updated successfully."
                    : "Work added successfully."
            );


            await fetchWorks();


            setTimeout(() => {

                closeModal();

            }, 700);


        } catch (err: any) {

            console.error(
                "Save work error:",
                err
            );

            setError(
                err.message ||
                "Failed to save work."
            );

        } finally {

            setSaving(false);

        }
    };


    /* =====================================================
       DELETE WORK
    ===================================================== */

    const handleDelete = async (
        work: Work
    ) => {

        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${work.title}"?`
            );


        if (!confirmed) {
            return;
        }


        try {

            setError("");

            setSuccess("");


            const {
                error:
                    deleteError,
            } =
                await supabase
                    .from("works")
                    .delete()
                    .eq(
                        "id",
                        work.id
                    );


            if (deleteError) {
                throw deleteError;
            }


            setWorks(
                (current) =>
                    current.filter(
                        (item) =>
                            item.id !==
                            work.id
                    )
            );


            setSuccess(
                "Work deleted successfully."
            );


        } catch (err: any) {

            console.error(
                "Delete work error:",
                err
            );

            setError(
                err.message ||
                "Failed to delete work."
            );
        }
    };


    /* =====================================================
       TOGGLE PUBLISHED
    ===================================================== */

    const togglePublished = async (
        work: Work
    ) => {

        try {

            setError("");

            const newValue =
                !work.is_published;


            const {
                error:
                    updateError,
            } =
                await supabase
                    .from("works")
                    .update({
                        is_published:
                            newValue,

                        updated_at:
                            new Date().toISOString(),
                    })
                    .eq(
                        "id",
                        work.id
                    );


            if (updateError) {
                throw updateError;
            }


            setWorks(
                (current) =>
                    current.map(
                        (item) =>
                            item.id ===
                            work.id
                                ? {
                                    ...item,
                                    is_published:
                                        newValue,
                                }
                                : item
                    )
            );


        } catch (err: any) {

            console.error(
                "Publish toggle error:",
                err
            );

            setError(
                err.message ||
                "Failed to update publishing status."
            );
        }
    };


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (
            <section className="works-admin">

                <div className="works-admin-loading">

                    <div className="works-loading-spinner" />

                    <span>
                        LOADING OUR WORKS
                    </span>

                </div>

            </section>
        );
    }


    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <section className="works-admin">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="works-admin-header">

                <div>

                    <span className="works-admin-eyebrow">
                        CONTENT MANAGEMENT
                    </span>

                    <h1>
                        OUR WORKS
                    </h1>

                    <p>
                        Manage the projects displayed
                        in the public Our Works section.
                    </p>

                </div>


                <button
                    type="button"
                    className="works-add-button"
                    onClick={openAddModal}
                >
                    <span>
                        +
                    </span>

                    ADD WORK
                </button>

            </header>


            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            {error && (

                <div className="works-message works-error">
                    {error}
                </div>

            )}


            {success && (

                <div className="works-message works-success">
                    {success}
                </div>

            )}


            {/* =================================================
                EMPTY
            ================================================= */}

            {works.length === 0 ? (

                <div className="works-empty">

                    <div className="works-empty-icon">
                        ◫
                    </div>

                    <h2>
                        NO WORKS YET
                    </h2>

                    <p>
                        Add your first work to display
                        it on the website.
                    </p>

                    <button
                        type="button"
                        onClick={openAddModal}
                    >
                        ADD FIRST WORK
                    </button>

                </div>

            ) : (

                /* =============================================
                   WORKS TABLE
                ============================================= */

                <div className="works-table-wrapper">

                    <table className="works-table">

                        <thead>

                            <tr>

                                <th>
                                    WORK
                                </th>

                                <th>
                                    TAGS
                                </th>

                                <th>
                                    STATUS
                                </th>

                                <th>
                                    CREATED
                                </th>

                                <th>
                                    ACTIONS
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {works.map(
                                (work) => (

                                    <tr
                                        key={
                                            work.id
                                        }
                                    >

                                        {/* WORK */}

                                        <td>

                                            <div className="works-project-cell">

                                                <div className="works-project-image">

                                                    {work.image_url ? (

                                                        <img
                                                            src={
                                                                work.image_url
                                                            }
                                                            alt={
                                                                work.title
                                                            }
                                                        />

                                                    ) : (

                                                        <span>
                                                            —
                                                        </span>

                                                    )}

                                                </div>


                                                <div className="works-project-info">

                                                    <strong>
                                                        {
                                                            work.title
                                                        }
                                                    </strong>

                                                    {work.description && (

                                                        <span>
                                                            {
                                                                work.description
                                                            }
                                                        </span>

                                                    )}

                                                </div>

                                            </div>

                                        </td>


                                        {/* TAGS */}

                                        <td>

                                            <div className="works-tags">

                                                {work.work_tags &&
                                                work.work_tags.length >
                                                    0 ? (

                                                    work.work_tags
                                                        .slice(
                                                            0,
                                                            4
                                                        )
                                                        .map(
                                                            (
                                                                tag
                                                            ) => (

                                                                <span
                                                                    key={
                                                                        tag.id
                                                                    }
                                                                >
                                                                    {
                                                                        tag.tag
                                                                    }
                                                                </span>

                                                            )
                                                        )

                                                ) : (

                                                    <em>
                                                        No tags
                                                    </em>

                                                )}

                                            </div>

                                        </td>


                                        {/* STATUS */}

                                        <td>

                                            <button
                                                type="button"
                                                className={`works-status ${
                                                    work.is_published
                                                        ? "published"
                                                        : "draft"
                                                }`}
                                                onClick={() =>
                                                    togglePublished(
                                                        work
                                                    )
                                                }
                                            >

                                                <span />

                                                {work.is_published
                                                    ? "PUBLISHED"
                                                    : "DRAFT"}

                                            </button>

                                        </td>


                                        {/* DATE */}

                                        <td>

                                            <span className="works-date">

                                                {new Date(
                                                    work.created_at
                                                ).toLocaleDateString(
                                                    "en-IN",
                                                    {
                                                        day:
                                                            "2-digit",

                                                        month:
                                                            "short",

                                                        year:
                                                            "numeric",
                                                    }
                                                )}

                                            </span>

                                        </td>


                                        {/* ACTIONS */}

                                        <td>

                                            <div className="works-actions">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditModal(
                                                            work
                                                        )
                                                    }
                                                    className="works-edit-button"
                                                >
                                                    EDIT
                                                </button>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            work
                                                        )
                                                    }
                                                    className="works-delete-button"
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


            {/* =================================================
                MODAL
            ================================================= */}

            {showModal && (

                <div
                    className="works-modal-overlay"
                    onMouseDown={(
                        e
                    ) => {

                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            closeModal();
                        }

                    }}
                >

                    <div className="works-modal">

                        {/* MODAL HEADER */}

                        <div className="works-modal-header">

                            <div>

                                <span>
                                    {
                                        editingWork
                                            ? "EDIT WORK"
                                            : "NEW WORK"
                                    }
                                </span>

                                <h2>
                                    {
                                        editingWork
                                            ? "Update Work"
                                            : "Add Work"
                                    }
                                </h2>

                            </div>


                            <button
                                type="button"
                                className="works-modal-close"
                                onClick={
                                    closeModal
                                }
                            >
                                ×
                            </button>

                        </div>


                        {/* FORM */}

                        <form
                            className="works-form"
                            onSubmit={
                                handleSubmit
                            }
                        >

                            {/* TITLE */}

                            <div className="works-form-group">

                                <label>
                                    WORK TITLE
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    value={
                                        form.title
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter work title"
                                    required
                                />

                            </div>


                            {/* DESCRIPTION */}

                            <div className="works-form-group">

                                <label>
                                    DESCRIPTION
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        form.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Describe the work..."
                                    rows={4}
                                />

                            </div>


                            {/* PROJECT URL */}

                            <div className="works-form-group">

                                <label>
                                    PROJECT URL
                                </label>

                                <input
                                    type="url"
                                    name="project_url"
                                    value={
                                        form.project_url
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="https://example.com"
                                />

                            </div>


                            {/* TAGS */}

                            <div className="works-form-group">

                                <label>
                                    TAGS
                                </label>

                                <input
                                    type="text"
                                    name="tags"
                                    value={
                                        form.tags
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="React, Node.js, MongoDB"
                                />

                                <small>
                                    Separate each tag
                                    with a comma.
                                </small>

                            </div>


                            {/* IMAGE */}

                            <div className="works-form-group">

                                <label>
                                    PROJECT IMAGE
                                </label>


                                <div className="works-upload">

                                    {imagePreview ? (

                                        <div className="works-image-preview">

                                            <img
                                                src={
                                                    imagePreview
                                                }
                                                alt="Preview"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => {

                                                    setImageFile(
                                                        null
                                                    );

                                                    setImagePreview(
                                                        editingWork?.image_url ||
                                                        ""
                                                    );

                                                }}
                                            >
                                                REMOVE
                                            </button>

                                        </div>

                                    ) : (

                                        <label
                                            htmlFor="work-image"
                                            className="works-upload-box"
                                        >

                                            <span>
                                                +
                                            </span>

                                            <strong>
                                                UPLOAD IMAGE
                                            </strong>

                                            <small>
                                                JPG, PNG or WebP ·
                                                Max 5MB
                                            </small>

                                        </label>

                                    )}


                                    <input
                                        id="work-image"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/jpg"
                                        onChange={
                                            handleImageChange
                                        }
                                        hidden
                                    />

                                </div>

                            </div>


                            {/* PUBLISHED */}

                            <label className="works-publish-toggle">

                                <input
                                    type="checkbox"
                                    checked={
                                        form.is_published
                                    }
                                    onChange={
                                        handlePublishedChange
                                    }
                                />

                                <span className="works-toggle-ui">
                                    <span />
                                </span>

                                <span className="works-publish-text">

                                    <strong>
                                        PUBLISH WORK
                                    </strong>

                                    <small>
                                        Make this work
                                        visible on
                                        the public website.
                                    </small>

                                </span>

                            </label>


                            {/* FORM ACTIONS */}

                            <div className="works-form-actions">

                                <button
                                    type="button"
                                    className="works-cancel-button"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    CANCEL
                                </button>


                                <button
                                    type="submit"
                                    className="works-save-button"
                                    disabled={
                                        saving
                                    }
                                >

                                    {saving
                                        ? "SAVING..."
                                        : editingWork
                                            ? "UPDATE WORK"
                                            : "SAVE WORK"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </section>
    );
};


export default WorksAdmin;