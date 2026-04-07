import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiX, FiSave, FiInfo, FiCheckSquare, FiBriefcase, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import '../styles/DynamicForm.css';

const DynamicRequirementForm = ({ serviceId: propServiceId, leadId: propLeadId, onClose, onSuccess }) => {
    const { serviceId: paramServiceId, leadId: paramLeadId } = useParams();
    const navigate = useNavigate();

    const serviceId = propServiceId || paramServiceId;
    const leadId = propLeadId || paramLeadId;
    const isFullPage = !!paramServiceId;

    const [service, setService] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (serviceId) {
            fetchServiceDetails();
        }
    }, [serviceId]);

    const fetchServiceDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8000/api/requirements/services/${serviceId}/`);
            if (response.data?.status === "success") {
                const serviceData = response.data.data;
                setService(serviceData);

                // Initialize form data
                const initialData = {};
                serviceData.questions?.forEach(q => {
                    if (q.answer_type === 'checkbox') {
                        initialData[q.id] = [];
                    } else if (q.answer_type === 'file' || q.answer_type === 'image' || q.answer_type === 'video') {
                        initialData[q.id] = [null]; // start with one empty slot
                    } else {
                        initialData[q.id] = '';
                    }
                });
                setFormData(initialData);
            }
        } catch (err) {
            setError('Failed to load form structure');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (questionId, value, type) => {
        if (type === 'checkbox') {
            const currentValues = formData[questionId] || [];
            if (currentValues.includes(value)) {
                setFormData({ ...formData, [questionId]: currentValues.filter(v => v !== value) });
            } else {
                setFormData({ ...formData, [questionId]: [...currentValues, value] });
            }
        } else {
            setFormData({ ...formData, [questionId]: value });
        }
    };

    const handleFileChange = (questionId, index, file) => {
        const current = Array.isArray(formData[questionId]) ? [...formData[questionId]] : [null];
        current[index] = file;
        setFormData({ ...formData, [questionId]: current });
    };

    const handleAddFileSlot = (questionId) => {
        const current = Array.isArray(formData[questionId]) ? formData[questionId] : [null];
        if (current.length < 10) {
            setFormData({ ...formData, [questionId]: [...current, null] });
        }
    };

    const handleRemoveFile = (questionId, index) => {
        const current = Array.isArray(formData[questionId]) ? [...formData[questionId]] : [null];
        if (current.length === 1) {
            current[0] = null; // keep at least one slot
        } else {
            current.splice(index, 1);
        }
        setFormData({ ...formData, [questionId]: current });
    };

    const handleClose = () => {
        if (isFullPage) {
            navigate(`/leads/${leadId}`);
        } else {
            onClose?.();
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setSubmitting(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('lead', parseInt(leadId));
            formDataToSend.append('service', parseInt(serviceId));

            const answers_text_data = [];
            let hasFiles = false;

            Object.entries(formData).forEach(([questionId, value]) => {
                if (Array.isArray(value) && value.some(v => v instanceof File)) {
                    // multi-file question
                    hasFiles = true;
                    const names = [];
                    value.forEach((file, idx) => {
                        if (file instanceof File) {
                            formDataToSend.append(`file_${questionId}_${idx}`, file);
                            names.push(file.name);
                        }
                    });
                    answers_text_data.push({
                        question: parseInt(questionId),
                        answer_text: names.join(', ')
                    });
                } else if (value instanceof File) {
                    hasFiles = true;
                    formDataToSend.append(`file_${questionId}`, value);
                    answers_text_data.push({
                        question: parseInt(questionId),
                        answer_text: value.name
                    });
                } else {
                    answers_text_data.push({
                        question: parseInt(questionId),
                        answer_text: Array.isArray(value) ? JSON.stringify(value) : String(value)
                    });
                }
            });

            formDataToSend.append('answers_data', JSON.stringify(answers_text_data));

            await axios.post('http://localhost:8000/api/requirements/responses/',
                hasFiles ? formDataToSend : {
                    lead: parseInt(leadId),
                    service: parseInt(serviceId),
                    answers: answers_text_data
                },
                hasFiles ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
            );

            if (isFullPage) {
                alert('Requirements submitted successfully!');
                navigate(`/leads/${leadId}`);
            } else {
                onSuccess?.();
                onClose();
            }
        } catch (err) {
            setError('Failed to submit requirements');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const [currentStep, setCurrentStep] = useState(0);

    // Group questions logically to match the requested design layout
    const sectionList = [];
    const sectionMap = {};

    // Collect raw sections first from db
    service?.questions?.forEach(q => {
        const sName = q.section || "General Details";
        if (!sectionMap[sName]) {
            sectionMap[sName] = [];
            sectionList.push(sName);
        }
        sectionMap[sName].push(q);
    });

    const totalSteps = sectionList.length;
    const currentSectionName = sectionList[currentStep];
    const rawQuestions = sectionMap[currentSectionName] || [];

    // Intelligently group the rawQuestions into smart cards (Company Identity, Strategy, etc.)
    const getSmartGroups = (questions) => {
        const identity = [];
        const strategy = [];
        const timeline = [];
        const media = [];
        const other = [];

        questions.forEach(q => {
            const lbl = q.label.toLowerCase();
            // Always put file-type questions in their own media card
            if (['file', 'image', 'video'].includes(q.answer_type)) {
                media.push(q);
            } else if (['company', 'business name', 'contact person', 'email', 'phone', 'logo', 'brand'].some(k => lbl.includes(k))) {
                // Logo Availability + brand questions belong in Business Requirements Details
                identity.push(q);
            } else if (['description', 'audience', 'purpose', 'goal', 'strategy'].some(k => lbl.includes(k))) {
                strategy.push(q);
            } else if (['competitor', 'timeline', 'deadline', 'date', 'duration'].some(k => lbl.includes(k))) {
                timeline.push(q);
            } else {
                other.push(q);
            }
        });

        // If it cleanly mapped into these buckets (like Business Requirements), use them
        if (identity.length > 0 || strategy.length > 0) {
            return [
                { title: 'Business Requirements Details', questions: identity },
                { title: 'Project Strategy', questions: strategy },
                { title: 'Timeline & Context', questions: timeline },
                { title: 'Additional Details', questions: other },
                { title: 'Media Uploads', questions: media }
            ].filter(g => g.questions.length > 0);
        }

        // Fallback for other purely dynamic forms: separate files first, then group rest by 4
        const fileQuestions = questions.filter(q => ['file', 'image', 'video'].includes(q.answer_type));
        const nonFileQuestions = questions.filter(q => !['file', 'image', 'video'].includes(q.answer_type));

        const fallbackGroups = [];
        const chunkSize = 4;
        for (let i = 0; i < nonFileQuestions.length; i += chunkSize) {
            fallbackGroups.push({
                title: i === 0 ? 'General Details' : 'Further Requirements',
                questions: nonFileQuestions.slice(i, i + chunkSize)
            });
        }
        if (fileQuestions.length > 0) {
            fallbackGroups.push({ title: 'Media Uploads', questions: fileQuestions });
        }
        return fallbackGroups;
    };

    const currentGroups = getSmartGroups(rawQuestions);

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
            window.scrollTo(0, 0);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            window.scrollTo(0, 0);
        } else {
            handleClose();
        }
    };

    if (loading) return <div className="loading-spinner">Loading form...</div>;

    if (error || !service) {
        return (
            <div className={`dynamic-form-overlay ${isFullPage ? 'full-page' : ''}`}>
                <div style={{ textAlign: 'center', padding: '40px', background: 'white', maxWidth: '500px', margin: '100px auto', borderRadius: '16px' }}>
                    <FiInfo size={48} color="#800000" style={{ marginBottom: '20px' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111' }}>Form Not Found</h2>
                    <p style={{ margin: '15px 0', color: '#666' }}>
                        {error || "The requested requirement form could not be found. Please refresh the dashboard and try again."}
                    </p>
                    <button className="btn-continue-sleek" style={{ margin: '20px auto 0' }} onClick={handleClose}>
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const renderField = (question) => {
        const { id, label, answer_type, options } = question;

        switch (answer_type) {
            case 'text':
                return (
                    <input
                        className="sleek-input"
                        type="text"
                        value={formData[id] || ''}
                        onChange={(e) => handleChange(id, e.target.value)}
                        placeholder={label.toLowerCase().includes('date') ? 'mm/dd/yyyy' : (label.toLowerCase().includes('competitor') ? 'Separate URLs with commas' : `e.g. ${label}`)}
                    />
                );
            case 'textarea':
                return (
                    <textarea
                        className="sleek-input"
                        rows="2"
                        value={formData[id] || ''}
                        onChange={(e) => handleChange(id, e.target.value)}
                        placeholder={label.toLowerCase().includes('description') ? 'Briefly describe what your business does...' : `e.g. ${label}`}
                    />
                );
            case 'dropdown':
                return (
                    <select className="sleek-input" value={formData[id] || ''} onChange={(e) => handleChange(id, e.target.value)}>
                        <option value="">Select option</option>
                        {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                );
            case 'radio':
                return (
                    <div className="sleek-pill-group">
                        {options?.map(opt => {
                            const isActive = formData[id] === opt;
                            return (
                                <label key={opt} className={`sleek-pill ${isActive ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name={`q-${id}`}
                                        value={opt}
                                        checked={isActive}
                                        onChange={(e) => handleChange(id, e.target.value)}
                                    />
                                    <span className={`pill-circle`}></span>
                                    {opt}
                                </label>
                            );
                        })}
                    </div>
                );
            case 'checkbox':
                return (
                    <div className="sleek-pill-group">
                        {options?.map(opt => {
                            const isActive = formData[id]?.includes(opt);
                            return (
                                <label key={opt} className={`sleek-pill ${isActive ? 'active' : ''}`}>
                                    <input
                                        type="checkbox"
                                        value={opt}
                                        checked={isActive}
                                        onChange={() => handleChange(id, opt, 'checkbox')}
                                    />
                                    <span className={`pill-circle`}></span>
                                    {opt}
                                </label>
                            );
                        })}
                    </div>
                );
            case 'file':
            case 'image':
            case 'video': {
                const slots = Array.isArray(formData[id]) ? formData[id] : [null];
                const accept = answer_type === 'image' ? 'image/*' : answer_type === 'video' ? 'video/*' : '*/*';
                return (
                    <div className="file-upload-wrapper">
                        {slots.map((fileVal, idx) => (
                            <div key={idx} className="file-slot-row">
                                <div className="file-slot-input-wrap">
                                    <input
                                        className="file-input"
                                        type="file"
                                        accept={accept}
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                handleFileChange(id, idx, e.target.files[0]);
                                            }
                                        }}
                                    />
                                    {fileVal instanceof File && (
                                        <span className="file-selected-text">{fileVal.name}</span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className="file-slot-remove"
                                    onClick={() => handleRemoveFile(id, idx)}
                                    title="Remove"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        {slots.length < 10 && (
                            <button
                                type="button"
                                className="file-add-btn"
                                onClick={() => handleAddFileSlot(id)}
                            >
                                <span>+</span> Add another file
                            </button>
                        )}
                    </div>
                );
            }
            default:
                return null;
        }
    };

    const progressPercentage = Math.round(((currentStep + 1) / totalSteps) * 100);

    return (
        <div className={`dynamic-form-overlay ${isFullPage ? 'full-page' : ''}`}>

            {/* Top Navbar */}
            <nav className="sleek-navbar">
                <div className="navbar-logo">
                    <FiCheckSquare size={20} />
                    <span>Requirement Form</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', letterSpacing: '1px' }}>
                    <span style={{ textTransform: 'uppercase' }}>{service.name || "Business Requirements"}</span>
                    <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#111827', display: 'flex', alignItems: 'center' }}>
                        <FiX size={20} />
                    </button>
                </div>
            </nav>

            {/* Main Form Area */}
            <div className="main-form-container">

                {/* Progress Header */}
                <div className="progress-section">
                    <div className="progress-subtitle">Onboarding Progress</div>
                    <div className="progress-header-row">
                        <h1>Step {currentStep + 1}: {currentSectionName.replace(/Section \d+:\s*/, '')}</h1>
                        <div className="progress-stats">
                            <div className="percent">{progressPercentage}%</div>
                            <div className="desc">Completed</div>
                        </div>
                    </div>
                    <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </div>

                {/* Form Split Layout */}
                <div className="form-split-layout">

                    {/* Left Sticky/Static Sidebar */}
                    <div className="form-sidebar">
                        <div className="info-card-light">
                            <FiBriefcase size={28} color="#652b32" style={{ marginBottom: '16px' }} />
                            <h3>Foundation</h3>
                            <p>
                                Defining your business goals and identity is the first step toward a bespoke digital presence. This information allows us to tailor the editorial aesthetic to your brand's unique voice.
                            </p>
                        </div>

                        <div className="info-card-dark">
                            <div className="eyebrow">Design Insight</div>
                            <h4>"Clarity in requirements breeds elegance in execution."</h4>
                        </div>
                    </div>

                    {/* Right Form Content */}
                    <div className="form-content-area">
                        {currentGroups.map((group, gIdx) => {
                            const isMediaGroup = group.title === 'Media Uploads';

                            return (
                                <div key={gIdx} className="sleek-form-card">
                                    <div className="card-title-row">
                                        <div className="card-title-indicator"></div>
                                        <h2>{group.title}</h2>
                                    </div>

                                    {isMediaGroup ? (
                                        /* ── Side-by-side two-column layout for file uploads ── */
                                        <div className="media-uploads-grid">
                                            {group.questions.map(question => (
                                                <div key={question.id} className="media-upload-col">
                                                    <div className="media-upload-label">
                                                        {question.label}
                                                        {question.is_required && <span style={{ color: '#800000', marginLeft: '4px' }}>*</span>}
                                                    </div>
                                                    {renderField(question)}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        /* ── Standard 12-col grid for all other cards ── */
                                        <div className="custom-form-grid">
                                            {group.questions.map(question => {
                                                const labelLower = question.label.toLowerCase().trim();

                                                let colSpanClass = 'col-span-6';
                                                if (question.answer_type === 'textarea' || question.answer_type === 'checkbox' || question.answer_type === 'radio' || question.answer_type === 'file') {
                                                    colSpanClass = 'col-span-12';
                                                }

                                                const isLogoAvailability = labelLower.includes('logo') && labelLower.includes('availab');
                                                const logoAnsweredYes = isLogoAvailability && formData[question.id] === 'Yes';

                                                // Logo Availability sits left (col-6), Upload sits right (col-6)
                                                if (isLogoAvailability) colSpanClass = 'col-span-6';

                                                return (
                                                    <React.Fragment key={question.id}>
                                                        <div className={`form-group ${colSpanClass}`}>
                                                            <label>
                                                                {question.label}
                                                                {question.is_required && <span style={{ color: '#800000', marginLeft: '4px' }}>*</span>}
                                                            </label>
                                                            {renderField(question)}
                                                        </div>
                                                        {logoAnsweredYes && (
                                                            <div className="form-group col-span-6">
                                                                <label>Upload Your Logo File</label>
                                                                <div className="file-upload-wrapper">
                                                                    <div className="file-slot-row">
                                                                        <div className="file-slot-input-wrap">
                                                                            <input
                                                                                className="file-input"
                                                                                type="file"
                                                                                accept="image/*,.svg,.ai,.eps,.pdf"
                                                                                onChange={(e) => {
                                                                                    if (e.target.files && e.target.files.length > 0) {
                                                                                        setFormData(prev => ({
                                                                                            ...prev,
                                                                                            [`logo_file_${question.id}`]: e.target.files[0]
                                                                                        }));
                                                                                    }
                                                                                }}
                                                                            />
                                                                            {formData[`logo_file_${question.id}`] instanceof File && (
                                                                                <span className="file-selected-text">
                                                                                    {formData[`logo_file_${question.id}`].name}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Bottom Actions */}
                        <div className="form-actions-bottom">
                            <button className="btn-back-sleek" onClick={handleBack}>
                                <FiArrowLeft /> {currentStep === 0 ? 'Cancel' : 'Back'}
                            </button>

                            {currentStep < totalSteps - 1 ? (
                                <button className="btn-continue-sleek" onClick={handleNext}>
                                    Continue to Step {currentStep + 2} <FiArrowRight />
                                </button>
                            ) : (
                                <button className="btn-continue-sleek" onClick={handleSubmit} disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Complete Form'} <FiSave />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DynamicRequirementForm;
