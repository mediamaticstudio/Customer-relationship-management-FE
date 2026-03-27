import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiSave } from "react-icons/fi";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config.jsx";

const SECTION_COLORS = ["#5B0F1B", "#4e94ff", "#ed4b82", "#8e44ad", "#f39c12", "#95a5a6"];

const WebsiteRequirementForm = ({ leadId, packageId, onClose, lead }) => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    business_name: lead?.lead_company_name || "",
    contact_person: lead?.lead_name || "",
    email: lead?.lead_emails?.[0]?.email || "",
    phone: lead?.lead_phones?.[0]?.phone || "",
    business_desc: "",
    target_audience: "",
    purpose: [],
    competitors: "",
    deadline: "",
    content_ready: "no",
    pages: [],
    provide_media: "no",
    content_writing: "no",
    color_theme: "",
    ref_websites: "",
    preferred_style: "Modern",
    logo_available: "no",
    need_logo: "no",
    design_instructions: "",
    features: [],
    social_media: "no",
    newsletter: "no",
    domain_available: "no",
    hosting_available: "no",
    technology: "WordPress",
    seo_required: "no",
    maintenance: "no",
    frequency: "Monthly",
    budget: "",
    extra_notes: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/configurations/requirements/?lead_id=${leadId}&package_id=${packageId}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
        );
        if (res.data?.status === "success" && res.data.data) setFormData(res.data.data.form_data);
      } catch (_) {}
      setLoading(false);
    })();
  }, [leadId, packageId]);

  const save = async () => {
    try {
      await axios.post(`${API_BASE_URL}/configurations/requirements/`,
        { lead: leadId, package: packageId, form_data: formData },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      toast.success("Website Requirements saved!");
      onClose();
    } catch (_) { toast.error("Failed to save website requirements"); }
  };

  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }));
  const toggle = (k, v) => setFormData(p => ({
    ...p, [k]: (p[k] || []).includes(v) ? p[k].filter(i => i !== v) : [...(p[k] || []), v]
  }));

  const Radio = ({ name, field, options }) => (
    <div className="radio-group">
      {options.map(o => (
        <label key={o} className="checkbox-item">
          <input type="radio" name={name} checked={formData[field] === o} onChange={() => set(field, o)} />
          <span>{o}</span>
        </label>
      ))}
    </div>
  );

  const Check = ({ field, options }) => (
    <div className="checkbox-group">
      {options.map(o => (
        <label key={o} className="checkbox-item">
          <input type="checkbox" className="ui-custom-checkbox mini"
            checked={(formData[field] || []).includes(o)} onChange={() => toggle(field, o)} />
          <span>{o}</span>
        </label>
      ))}
    </div>
  );

  if (loading) return <div className="req-loading">Loading...</div>;

  return (
    <div>
      {/* Section 1 */}
      <div className="form-section">
        <div className="section-head">
          <div className="section-icon-dot" style={{ background: SECTION_COLORS[0] }}></div>
          <h4>Section 1: Business Requirements</h4>
        </div>
        <div className="requirement-grid">
          <div className="field-group"><span className="req-field-label">Company / Business Name *</span>
            <input className="req-input" value={formData.business_name} onChange={e => set("business_name", e.target.value)} placeholder="Business name" /></div>
          <div className="field-group"><span className="req-field-label">Contact Person Name *</span>
            <input className="req-input" value={formData.contact_person} onChange={e => set("contact_person", e.target.value)} placeholder="Contact name" /></div>
          <div className="field-group"><span className="req-field-label">Email Address *</span>
            <input className="req-input" value={formData.email} onChange={e => set("email", e.target.value)} placeholder="email@example.com" /></div>
          <div className="field-group"><span className="req-field-label">Phone Number *</span>
            <input className="req-input" value={formData.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 9876543210" /></div>
          <div className="field-group full-width"><span className="req-field-label">Business Description</span>
            <textarea className="req-textarea" rows="3" value={formData.business_desc} onChange={e => set("business_desc", e.target.value)} placeholder="What does your company do?" /></div>
          <div className="field-group full-width"><span className="req-field-label">Target Audience</span>
            <input className="req-input" value={formData.target_audience} onChange={e => set("target_audience", e.target.value)} placeholder="Who are your customers?" /></div>
          <div className="field-group full-width"><span className="req-field-label">Purpose of Website</span>
            <Check field="purpose" options={["Lead Generation", "E-commerce", "Portfolio", "Informational", "Other"]} /></div>
        </div>
      </div>

      {/* Section 2 */}
      <div className="form-section">
        <div className="section-head">
          <div className="section-icon-dot" style={{ background: SECTION_COLORS[1] }}></div>
          <h4>Section 2: Content Requirements</h4>
        </div>
        <div className="requirement-grid">
          <div className="field-group full-width"><span className="req-field-label">Do you have content ready?</span>
            <Radio name="cr" field="content_ready" options={["yes", "no"]} /></div>
          <div className="field-group full-width"><span className="req-field-label">Pages Required</span>
            <Check field="pages" options={["Home", "About Us", "Services", "Products", "Blog", "Contact", "Other"]} /></div>
          <div className="field-group"><span className="req-field-label">Will you provide images/videos?</span>
            <Radio name="pm" field="provide_media" options={["yes", "no"]} /></div>
          <div className="field-group"><span className="req-field-label">Need content writing services?</span>
            <Radio name="cw" field="content_writing" options={["yes", "no"]} /></div>
        </div>
      </div>

      {/* Section 3 */}
      <div className="form-section">
        <div className="section-head">
          <div className="section-icon-dot" style={{ background: SECTION_COLORS[2] }}></div>
          <h4>Section 3: Design Requirements</h4>
        </div>
        <div className="requirement-grid">
          <div className="field-group"><span className="req-field-label">Preferred Color Theme</span>
            <input className="req-input" value={formData.color_theme} onChange={e => set("color_theme", e.target.value)} placeholder="e.g. Maroon & Gold" /></div>
          <div className="field-group"><span className="req-field-label">Preferred Style</span>
            <select className="req-select" value={formData.preferred_style} onChange={e => set("preferred_style", e.target.value)}>
              {["Modern", "Minimal", "Corporate", "Creative"].map(o => <option key={o}>{o}</option>)}
            </select></div>
          <div className="field-group"><span className="req-field-label">Logo Availability</span>
            <Radio name="la" field="logo_available" options={["yes", "no"]} /></div>
          <div className="field-group"><span className="req-field-label">Need logo design?</span>
            <Radio name="nl" field="need_logo" options={["yes", "no"]} /></div>
          <div className="field-group full-width"><span className="req-field-label">Reference Websites / Design Instructions</span>
            <textarea className="req-textarea" rows="2" value={formData.design_instructions} onChange={e => set("design_instructions", e.target.value)} placeholder="Any specific design notes" /></div>
        </div>
      </div>

      {/* Section 4 */}
      <div className="form-section">
        <div className="section-head">
          <div className="section-icon-dot" style={{ background: SECTION_COLORS[3] }}></div>
          <h4>Section 4: Functional Requirements</h4>
        </div>
        <div className="requirement-grid">
          <div className="field-group full-width"><span className="req-field-label">Required Features</span>
            <Check field="features" options={["Contact Form", "Login/Signup", "Payment Gateway", "Booking System", "Chat Integration", "Admin Panel", "Other"]} /></div>
          <div className="field-group"><span className="req-field-label">Social Media Integration?</span>
            <Radio name="sm" field="social_media" options={["yes", "no"]} /></div>
          <div className="field-group"><span className="req-field-label">Newsletter Subscription?</span>
            <Radio name="nl2" field="newsletter" options={["yes", "no"]} /></div>
        </div>
      </div>

      {/* Section 5 */}
      <div className="form-section">
        <div className="section-head">
          <div className="section-icon-dot" style={{ background: SECTION_COLORS[4] }}></div>
          <h4>Section 5: Technical Requirements</h4>
        </div>
        <div className="requirement-grid">
          <div className="field-group"><span className="req-field-label">Domain Name Available?</span>
            <Radio name="da" field="domain_available" options={["yes", "no"]} /></div>
          <div className="field-group"><span className="req-field-label">Hosting Available?</span>
            <Radio name="ha" field="hosting_available" options={["yes", "no"]} /></div>
          <div className="field-group"><span className="req-field-label">Preferred Technology</span>
            <select className="req-select" value={formData.technology} onChange={e => set("technology", e.target.value)}>
              {["WordPress", "React / Next.js", "Laravel", "Not Sure"].map(o => <option key={o}>{o}</option>)}
            </select></div>
          <div className="field-group"><span className="req-field-label">SEO Required?</span>
            <Radio name="seo" field="seo_required" options={["yes", "no"]} /></div>
        </div>
      </div>

      {/* Section 6 */}
      <div className="form-section" style={{ marginBottom: 0 }}>
        <div className="section-head">
          <div className="section-icon-dot" style={{ background: SECTION_COLORS[5] }}></div>
          <h4>Section 6: Deployment & Budget</h4>
        </div>
        <div className="requirement-grid">
          <div className="field-group"><span className="req-field-label">Need Website Maintenance?</span>
            <Radio name="mn" field="maintenance" options={["yes", "no"]} /></div>
          <div className="field-group"><span className="req-field-label">Frequency</span>
            <select className="req-select" value={formData.frequency} onChange={e => set("frequency", e.target.value)}>
              {["Monthly", "Yearly"].map(o => <option key={o}>{o}</option>)}
            </select></div>
          <div className="field-group full-width"><span className="req-field-label">Budget Range</span>
            <input className="req-input" value={formData.budget} onChange={e => set("budget", e.target.value)} placeholder="e.g. ₹50,000 - ₹1,00,000" /></div>
          <div className="field-group full-width"><span className="req-field-label">Additional Notes</span>
            <textarea className="req-textarea" rows="2" value={formData.extra_notes} onChange={e => set("extra_notes", e.target.value)} /></div>
        </div>
      </div>

      <div className="modal-footer" style={{ padding: "20px 0 0 0", marginTop: "20px", borderTop: "1px solid #eee" }}>
        <button className="btn-add-mini" style={{ height: "42px", padding: "0 24px", opacity: 0.7 }} onClick={onClose}>Cancel</button>
        <button className="btn-primary-full" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 28px", height: "42px", borderRadius: "8px" }} onClick={save}>
          <FiSave /> Save Website Requirements
        </button>
      </div>
    </div>
  );
};

export default WebsiteRequirementForm;
