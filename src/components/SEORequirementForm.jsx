import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiSave } from "react-icons/fi";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config.jsx";

const SECTION_COLORS = ["#5B0F1B", "#4e94ff", "#27ae60", "#ed4b82", "#8e44ad", "#f39c12", "#95a5a6"];

const SEORequirementForm = ({ leadId, packageId, onClose, lead }) => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    // Business Information
    company_name: lead?.lead_company_name || "",
    contact_person: lead?.lead_name || "",
    email: lead?.lead_emails?.[0]?.email || "",
    phone: lead?.lead_phones?.[0]?.phone || "",
    business_description: "",
    website_url: "",
    target_audience: "",
    target_locations: "",
    // Current SEO Status
    done_seo_before: "No",
    google_analytics_access: "No",
    google_search_console_access: "No",
    current_seo_challenges: "",
    // SEO Goals
    seo_goals: [],
    primary_keywords: "",
    competitor_websites: "",
    target_timeline: "1-3 Months",
    // On-Page SEO
    keyword_research_needed: "No",
    content_optimization_needed: "No",
    meta_tags_optimization_needed: "No",
    blog_content_creation_needed: "No",
    // Technical SEO
    mobile_friendly: "Not Sure",
    loading_speed: "Not Sure",
    ssl_certificate: "Not Sure",
    technical_audit_needed: "No",
    // Off-Page SEO
    backlink_building_needed: "No",
    local_seo_needed: "No",
    social_media_integration_needed: "No",
    // Budget & Timeline
    monthly_budget: "",
    project_start_date: "",
    project_duration: "6 Months",
    additional_notes: "",
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
      toast.success("SEO Requirements saved!");
      onClose();
    } catch (_) { toast.error("Failed to save SEO requirements"); }
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
          <h4>Section 1: Business Information</h4>
        </div>
        <div className="requirement-grid">
          <div className="field-group"><span className="req-field-label">Company / Business Name *</span>
            <input className="req-input" value={formData.company_name} onChange={e => set("company_name", e.target.value)} placeholder="Business name" /></div>
          <div className="field-group"><span className="req-field-label">Contact Person Name *</span>
            <input className="req-input" value={formData.contact_person} onChange={e => set("contact_person", e.target.value)} placeholder="Contact name" /></div>
          <div className="field-group"><span className="req-field-label">Email Address *</span>
            <input className="req-input" value={formData.email} onChange={e => set("email", e.target.value)} placeholder="email@example.com" /></div>
          <div className="field-group"><span className="req-field-label">Phone Number *</span>
            <input className="req-input" value={formData.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 9876543210" /></div>
          <div className="field-group full-width"><span className="req-field-label">Business Description *</span>
            <textarea className="req-textarea" rows="3" value={formData.business_description} onChange={e => set("business_description", e.target.value)} placeholder="Describe your business" /></div>
          <div className="field-group full-width"><span className="req-field-label">Website URL *</span>
            <input className="req-input" value={formData.website_url} onChange={e => set("website_url", e.target.value)} placeholder="https://example.com" /></div>
          <div className="field-group full-width"><span className="req-field-label">Target Audience</span>
            <textarea className="req-textarea" rows="2" value={formData.target_audience} onChange={e => set("target_audience", e.target.value)} placeholder="Who are your ideal customers?" /></div>
          <div className="field-group full-width"><span className="req-field-label">Target Locations (City/Country)</span>
            <textarea className="req-textarea" rows="2" value={formData.target_locations} onChange={e => set("target_locations", e.target.value)} placeholder="e.g. Chennai, Bangalore, Global" /></div>
        </div>
      </div>

      {/* Section 2 */}
      <div className="form-section">
        <div className="section-head">
          <div className="section-icon-dot" style={{ background: SECTION_COLORS[1] }}></div>
          <h4>Section 2: Current SEO Status</h4>
        </div>
        <div className="requirement-grid">
          <div className="field-group"><span className="req-field-label">Have you done SEO before?</span>
            <Radio name="seo_before" field="done_seo_before" options={["Yes", "No"]} /></div>
          <div className="field-group"><span className="req-field-label">Access to Google Analytics?</span>
            <Radio name="ga" field="google_analytics_access" options={["Yes", "No"]} /></div>
          <div className="field-group"><span className="req-field-label">Access to Google Search Console?</span>
            <Radio name="gsc" field="google_search_console_access" options={["Yes", "No"]} /></div>
          <div className="field-group full-width"><span className="req-field-label">Current SEO Challenges</span>
            <textarea className="req-textarea" rows="2" value={formData.current_seo_challenges} onChange={e => set("current_seo_challenges", e.target.value)} placeholder="What problems are you facing?" /></div>
        </div>
      </div>

      {/* Section 3 */}
      <div className="form-section">
        <div className="section-head">
          <div className="section-icon-dot" style={{ background: SECTION_COLORS[2] }}></div>
          <h4>Section 3: SEO Goals</h4>
        </div>
        <div className="requirement-grid">
          <div className="field-group full-width"><span className="req-field-label">What are your main SEO goals?</span>
            <Check field="seo_goals" options={["Increase Website Traffic", "Generate Leads", "Improve Keyword Rankings", "Increase Sales", "Brand Awareness"]} /></div>
          <div className="field-group full-width"><span className="req-field-label">Primary Keywords (if known)</span>
            <textarea className="req-textarea" rows="2" value={formData.primary_keywords} onChange={e => set("primary_keywords", e.target.value)} placeholder="e.g. digital marketing agency chennai" /></div>
          <div className="field-group full-width"><span className="req-field-label">Competitor Websites</span>
            <textarea className="req-textarea" rows="2" value={formData.competitor_websites} onChange={e => set("competitor_websites", e.target.value)} placeholder="List your main competitors" /></div>
          <div className="field-group"><span className="req-field-label">Target Timeline</span>
            <select className="req-select" value={formData.target_timeline} onChange={e => set("target_timeline", e.target.value)}>
              {["1-3 Months", "3-6 Months", "6-12 Months"].map(o => <option key={o}>{o}</option>)}
            </select></div>
        </div>
      </div>

      {/* Section 4 */}
      <div className="form-section">
        <div className="section-head">
          <div className="section-icon-dot" style={{ background: SECTION_COLORS[3] }}></div>
          <h4>Section 4: On-Page SEO Requirements</h4>
        </div>
        <div className="requirement-grid">
          <div className="field-group"><span className="req-field-label">Need keyword research?</span>
            <Radio name="kw" field="keyword_research_needed" options={["Yes", "No"]} /></div>
          <div className="field-group"><span className="req-field-label">Need content optimization?</span>
            <Radio name="co" field="content_optimization_needed" options={["Yes", "No"]} /></div>
          <div className="field-group"><span className="req-field-label">Need meta tags optimization?</span>
            <Radio name="mt" field="meta_tags_optimization_needed" options={["Yes", "No"]} /></div>
          <div className="field-group"><span className="req-field-label">Need blog/content creation?</span>
            <Radio name="bc" field="blog_content_creation_needed" options={["Yes", "No"]} /></div>
        </div>
      </div>

      {/* Section 5 */}
      <div className="form-section">
        <div className="section-head">
          <div className="section-icon-dot" style={{ background: SECTION_COLORS[4] }}></div>
          <h4>Section 5: Technical SEO</h4>
        </div>
        <div className="requirement-grid">
          <div className="field-group"><span className="req-field-label">Is your website mobile-friendly?</span>
            <Radio name="mf" field="mobile_friendly" options={["Yes", "No", "Not Sure"]} /></div>
          <div className="field-group"><span className="req-field-label">Website loading speed</span>
            <Radio name="ls" field="loading_speed" options={["Fast", "Average", "Slow", "Not Sure"]} /></div>
          <div className="field-group"><span className="req-field-label">SSL certificate (HTTPS)?</span>
            <Radio name="ssl" field="ssl_certificate" options={["Yes", "No", "Not Sure"]} /></div>
          <div className="field-group"><span className="req-field-label">Need technical SEO audit?</span>
            <Radio name="ta" field="technical_audit_needed" options={["Yes", "No"]} /></div>
        </div>
      </div>

      {/* Section 6 */}
      <div className="form-section">
        <div className="section-head">
          <div className="section-icon-dot" style={{ background: SECTION_COLORS[5] }}></div>
          <h4>Section 6: Off-Page SEO</h4>
        </div>
        <div className="requirement-grid">
          <div className="field-group"><span className="req-field-label">Need backlink building?</span>
            <Radio name="bb" field="backlink_building_needed" options={["Yes", "No"]} /></div>
          <div className="field-group"><span className="req-field-label">Need local SEO (Google My Business)?</span>
            <Radio name="ls2" field="local_seo_needed" options={["Yes", "No"]} /></div>
          <div className="field-group"><span className="req-field-label">Social media integration needed?</span>
            <Radio name="smi" field="social_media_integration_needed" options={["Yes", "No"]} /></div>
        </div>
      </div>

      {/* Section 7 */}
      <div className="form-section" style={{ marginBottom: 0 }}>
        <div className="section-head">
          <div className="section-icon-dot" style={{ background: SECTION_COLORS[6] }}></div>
          <h4>Section 7: Budget & Timeline</h4>
        </div>
        <div className="requirement-grid">
          <div className="field-group"><span className="req-field-label">Monthly SEO Budget</span>
            <input className="req-input" value={formData.monthly_budget} onChange={e => set("monthly_budget", e.target.value)} placeholder="e.g. ₹10,000/month" /></div>
          <div className="field-group"><span className="req-field-label">Project Start Date</span>
            <input type="date" className="req-input" value={formData.project_start_date} onChange={e => set("project_start_date", e.target.value)} /></div>
          <div className="field-group"><span className="req-field-label">Project Duration</span>
            <select className="req-select" value={formData.project_duration} onChange={e => set("project_duration", e.target.value)}>
              {["3 Months", "6 Months", "12 Months"].map(o => <option key={o}>{o}</option>)}
            </select></div>
          <div className="field-group full-width"><span className="req-field-label">Additional Notes / Requirements</span>
            <textarea className="req-textarea" rows="2" value={formData.additional_notes} onChange={e => set("additional_notes", e.target.value)} placeholder="Any other requirements?" /></div>
        </div>
      </div>

      <div className="modal-footer" style={{ padding: "20px 0 0 0", marginTop: "20px", borderTop: "1px solid #eee" }}>
        <button className="btn-add-mini" style={{ height: "42px", padding: "0 24px", opacity: 0.7 }} onClick={onClose}>Cancel</button>
        <button className="btn-primary-full" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 28px", height: "42px", borderRadius: "8px" }} onClick={save}>
          <FiSave /> Save SEO Requirements
        </button>
      </div>
    </div>
  );
};

export default SEORequirementForm;
