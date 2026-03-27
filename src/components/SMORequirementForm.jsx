import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiSave } from "react-icons/fi";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config.jsx";

const SECTION_COLORS = ["#5B0F1B", "#4e94ff", "#27ae60", "#ed4b82", "#8e44ad", "#f39c12", "#95a5a6"];

const SMORequirementForm = ({ leadId, packageId, onClose, lead }) => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    // Business Information
    company_name: lead?.lead_company_name || "",
    contact_person: lead?.lead_name || "",
    email: lead?.lead_emails?.[0]?.email || "",
    phone: lead?.lead_phones?.[0]?.phone || "",
    business_description: "",
    target_audience: "",
    target_locations: "",
    // Current Social Media Presence
    active_platforms: [],
    social_media_links: "",
    actively_posts: "No",
    runs_paid_ads: "No",
    current_challenges: "",
    // SMO Goals
    smo_goals: [],
    target_timeline: "1-3 Months",
    competitor_social_links: "",
    // Content Strategy
    content_types: [],
    need_content_creation: "No",
    has_brand_guidelines: "No",
    posting_frequency: "",
    // Platform Management
    platforms_to_manage: [],
    need_community_management: "No",
    need_influencer_marketing: "No",
    // Advertising
    want_paid_ads: "No",
    monthly_ad_budget: "",
    ad_platforms: [],
    // Reporting & Budget
    reporting_frequency: "Monthly",
    monthly_smo_budget: "",
    project_start_date: "",
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
      toast.success("SMO Requirements saved!");
      onClose();
    } catch (_) { toast.error("Failed to save SMO requirements"); }
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
          <div className="field-group full-width"><span className="req-field-label">Target Audience</span>
            <textarea className="req-textarea" rows="2" value={formData.target_audience} onChange={e => set("target_audience", e.target.value)} placeholder="Who are your customers?" /></div>
          <div className="field-group full-width"><span className="req-field-label">Target Locations (City/Country)</span>
            <textarea className="req-textarea" rows="2" value={formData.target_locations} onChange={e => set("target_locations", e.target.value)} placeholder="e.g. Chennai, Pan India" /></div>
        </div>
      </div>

      {/* Section 2 */}
      <div className="form-section">
        <div className="section-head">
          <div className="section-icon-dot" style={{ background: SECTION_COLORS[1] }}></div>
          <h4>Section 2: Current Social Media Presence</h4>
        </div>
        <div className="requirement-grid">
          <div className="field-group full-width"><span className="req-field-label">Which platforms are you currently using?</span>
            <Check field="active_platforms" options={["Facebook", "Instagram", "LinkedIn", "Twitter (X)", "YouTube", "Other"]} /></div>
          <div className="field-group full-width"><span className="req-field-label">Social Media Profile Links</span>
            <textarea className="req-textarea" rows="2" value={formData.social_media_links} onChange={e => set("social_media_links", e.target.value)} placeholder="Paste your profile links" /></div>
          <div className="field-group"><span className="req-field-label">Do you actively post content?</span>
            <Radio name="act_post" field="actively_posts" options={["Yes", "No"]} /></div>
          <div className="field-group"><span className="req-field-label">Do you run paid ads?</span>
            <Radio name="run_ads" field="runs_paid_ads" options={["Yes", "No"]} /></div>
          <div className="field-group full-width"><span className="req-field-label">Current Challenges</span>
            <textarea className="req-textarea" rows="2" value={formData.current_challenges} onChange={e => set("current_challenges", e.target.value)} placeholder="What challenges are you facing?" /></div>
        </div>
      </div>

      {/* Section 3 */}
      <div className="form-section">
        <div className="section-head">
          <div className="section-icon-dot" style={{ background: SECTION_COLORS[2] }}></div>
          <h4>Section 3: SMO Goals</h4>
        </div>
        <div className="requirement-grid">
          <div className="field-group full-width"><span className="req-field-label">What are your main goals?</span>
            <Check field="smo_goals" options={["Increase Followers", "Increase Engagement", "Generate Leads", "Brand Awareness", "Website Traffic"]} /></div>
          <div className="field-group"><span className="req-field-label">Target Timeline</span>
            <select className="req-select" value={formData.target_timeline} onChange={e => set("target_timeline", e.target.value)}>
              {["1-3 Months", "3-6 Months", "6-12 Months"].map(o => <option key={o}>{o}</option>)}
            </select></div>
          <div className="field-group full-width"><span className="req-field-label">Competitor Social Media Links</span>
            <textarea className="req-textarea" rows="2" value={formData.competitor_social_links} onChange={e => set("competitor_social_links", e.target.value)} placeholder="Add competitor profiles" /></div>
        </div>
      </div>

      {/* Section 4 */}
      <div className="form-section">
        <div className="section-head">
          <div className="section-icon-dot" style={{ background: SECTION_COLORS[3] }}></div>
          <h4>Section 4: Content Strategy</h4>
        </div>
        <div className="requirement-grid">
          <div className="field-group full-width"><span className="req-field-label">Content Types Required</span>
            <Check field="content_types" options={["Image Posts", "Reels / Short Videos", "Stories", "Carousels", "Blog Promotion", "Infographics"]} /></div>
          <div className="field-group"><span className="req-field-label">Do you need content creation?</span>
            <Radio name="need_cc" field="need_content_creation" options={["Yes", "No"]} /></div>
          <div className="field-group"><span className="req-field-label">Do you have brand guidelines?</span>
            <Radio name="brand_g" field="has_brand_guidelines" options={["Yes", "No"]} /></div>
          <div className="field-group full-width"><span className="req-field-label">Preferred Posting Frequency</span>
            <input className="req-input" value={formData.posting_frequency} onChange={e => set("posting_frequency", e.target.value)} placeholder="e.g. Daily, 3x per week" /></div>
        </div>
      </div>

      {/* Section 5 */}
      <div className="form-section">
        <div className="section-head">
          <div className="section-icon-dot" style={{ background: SECTION_COLORS[4] }}></div>
          <h4>Section 5: Platform Management</h4>
        </div>
        <div className="requirement-grid">
          <div className="field-group full-width"><span className="req-field-label">Platforms to manage</span>
            <Check field="platforms_to_manage" options={["Facebook", "Instagram", "LinkedIn", "Twitter (X)", "YouTube"]} /></div>
          <div className="field-group"><span className="req-field-label">Need community management (reply to comments/messages)?</span>
            <Radio name="comm_mgmt" field="need_community_management" options={["Yes", "No"]} /></div>
          <div className="field-group"><span className="req-field-label">Need influencer marketing?</span>
            <Radio name="infl" field="need_influencer_marketing" options={["Yes", "No"]} /></div>
        </div>
      </div>

      {/* Section 6 */}
      <div className="form-section">
        <div className="section-head">
          <div className="section-icon-dot" style={{ background: SECTION_COLORS[5] }}></div>
          <h4>Section 6: Advertising (Optional)</h4>
        </div>
        <div className="requirement-grid">
          <div className="field-group"><span className="req-field-label">Do you want paid social media ads?</span>
            <Radio name="paid_ads" field="want_paid_ads" options={["Yes", "No"]} /></div>
          <div className="field-group"><span className="req-field-label">Monthly Ad Budget</span>
            <input className="req-input" value={formData.monthly_ad_budget} onChange={e => set("monthly_ad_budget", e.target.value)} placeholder="e.g. ₹5,000/month" /></div>
          <div className="field-group full-width"><span className="req-field-label">Ad Platforms</span>
            <Check field="ad_platforms" options={["Facebook Ads", "Instagram Ads", "LinkedIn Ads", "YouTube Ads"]} /></div>
        </div>
      </div>

      {/* Section 7 */}
      <div className="form-section" style={{ marginBottom: 0 }}>
        <div className="section-head">
          <div className="section-icon-dot" style={{ background: SECTION_COLORS[6] }}></div>
          <h4>Section 7: Reporting & Budget</h4>
        </div>
        <div className="requirement-grid">
          <div className="field-group"><span className="req-field-label">Reporting Frequency</span>
            <select className="req-select" value={formData.reporting_frequency} onChange={e => set("reporting_frequency", e.target.value)}>
              {["Weekly", "Monthly"].map(o => <option key={o}>{o}</option>)}
            </select></div>
          <div className="field-group"><span className="req-field-label">Monthly SMO Budget</span>
            <input className="req-input" value={formData.monthly_smo_budget} onChange={e => set("monthly_smo_budget", e.target.value)} placeholder="e.g. ₹15,000/month" /></div>
          <div className="field-group"><span className="req-field-label">Project Start Date</span>
            <input type="date" className="req-input" value={formData.project_start_date} onChange={e => set("project_start_date", e.target.value)} /></div>
          <div className="field-group full-width"><span className="req-field-label">Additional Notes / Requirements</span>
            <textarea className="req-textarea" rows="2" value={formData.additional_notes} onChange={e => set("additional_notes", e.target.value)} placeholder="Any other requirements?" /></div>
        </div>
      </div>

      <div className="modal-footer" style={{ padding: "20px 0 0 0", marginTop: "20px", borderTop: "1px solid #eee" }}>
        <button className="btn-add-mini" style={{ height: "42px", padding: "0 24px", opacity: 0.7 }} onClick={onClose}>Cancel</button>
        <button className="btn-primary-full" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 28px", height: "42px", borderRadius: "8px" }} onClick={save}>
          <FiSave /> Save SMO Requirements
        </button>
      </div>
    </div>
  );
};

export default SMORequirementForm;
