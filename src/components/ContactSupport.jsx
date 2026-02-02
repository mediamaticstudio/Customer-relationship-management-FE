import React, { useState } from "react";
import { FiMail, FiPhone, FiMessageSquare, FiUser, FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/ContactSupport.css";

export const ContactSupport = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "General Inquiry",
        message: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate API call
        toast.success("Message sent! Our support team will contact you soon.");
        setFormData({ name: "", email: "", subject: "General Inquiry", message: "" });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="support-container">
            <div className="support-card">
                {/* Left Side: Info */}
                <div className="support-info">
                    <div>
                        <h2>Contact Us</h2>
                        <p>
                            Have questions about our CRM solution? Our technical support team is
                            available 24/7 to help you optimize your workflow.
                        </p>
                    </div>

                    <div className="contact-details">
                        <div className="contact-item">
                            <div className="contact-icon">
                                <FiPhone />
                            </div>
                            <div className="contact-text">
                                <h4>Call Support</h4>
                                <p>+91 98765 43210</p>
                            </div>
                        </div>

                        <div className="contact-item">
                            <div className="contact-icon">
                                <FiMail />
                            </div>
                            <div className="contact-text">
                                <h4>Email Hub</h4>
                                <p>support@mediamaticstudio.com</p>
                            </div>
                        </div>

                        <div className="contact-item">
                            <div className="contact-icon">
                                <FiMessageSquare />
                            </div>
                            <div className="contact-text">
                                <h4>Live Chat</h4>
                                <p>Available on Dashboard</p>
                            </div>
                        </div>
                    </div>

                    <Link to="/login" className="back-link" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                        <FiArrowLeft /> Back to Login
                    </Link>
                </div>

                {/* Right Side: Form */}
                <div className="support-form-container">
                    <h3>Send a Message</h3>
                    <form className="support-form" onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="john@company.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Subject</label>
                            <select name="subject" value={formData.subject} onChange={handleChange}>
                                <option>General Inquiry</option>
                                <option>Technical Issue</option>
                                <option>Billing Question</option>
                                <option>Feature Request</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Message</label>
                            <textarea
                                name="message"
                                rows="5"
                                placeholder="How can we help you today?"
                                value={formData.message}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>

                        <button type="submit" className="submit-btn">
                            Send Message
                        </button>
                    </form>

                    <Link to="/login" className="back-to-login">
                        Return to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ContactSupport;
