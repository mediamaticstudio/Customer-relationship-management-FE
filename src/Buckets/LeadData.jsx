import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import WebsiteRequirementForm from "../components/WebsiteRequirementForm";
import SEORequirementForm from "../components/SEORequirementForm";
import SMORequirementForm from "../components/SMORequirementForm";
import "../styles/LeadData.css";
import { toast } from "react-toastify";
import {
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiMessageSquare,
  FiMapPin,
  FiPackage,
  FiExternalLink,
  FiPlus,
  FiTrash2,
  FiCreditCard,
  FiPocket,
  FiMenu,
  FiMail,
  FiPhone,
  FiEdit2,
  FiFileText
} from "react-icons/fi";
import { API_BASE_URL } from "../config.jsx";
const STATUS_OPTIONS = [
  // CONNECT
  { value: "email-request", label: "Email Request" },
  { value: "not-interested", label: "Not Interested" },
  { value: "callback", label: "Call Back" },
  { value: "interested", label: "Interested" },
  { value: "hung-up", label: "Hung Up" },
  { value: "followup", label: "Follow Up" },
  { value: "Callback-Voicemail", label: "Callback - Voicemail" },
  { value: "converted", label: "Sale Won" },

  // NON-CONNECT
  { value: "fax-tone", label: "Fax Tone" },
  { value: "direct-voicemail", label: "Direct Voice mail" },
  { value: "general-voicemail", label: "General Voicemail" },
  { value: "not-in-service", label: "Not In Service" },
  { value: "disconnected", label: "Disconnected Number" },
  { value: "receptionist", label: "Receptionist / Operator" },
  { value: "unanswered", label: "Unanswered" },
  { value: "call-failed", label: "Call Cannot Be Completed" },
  { value: "spam-blocked", label: "Call Blocked as Spam" },
  { value: "not-accepting", label: "Not Accepting Call" },
  { value: "dnd", label: "Do Not Call (DND)" },
  { value: "duplicate", label: "Duplicate" },
  { value: "invalid", label: "Invalid Number" },
  { value: "language-barrier", label: "Language Barrier" },
  { value: "wrong-number", label: "Wrong Number" },
];
const CONNECT_TYPE_MAP = {
  // CONNECT
  "email-request": "connect",
  "not-interested": "connect",
  "callback": "connect",
  "interested": "connect",
  "hung-up": "connect",
  "followup": "connect",
  "Callback-Voicemail": "connect",
  "converted": "connect",

  // NON-CONNECT
  "fax-tone": "non-connect",
  "direct-voicemail": "non-connect",
  "general-voicemail": "non-connect",
  "not-in-service": "non-connect",
  "disconnected": "non-connect",
  "receptionist": "non-connect",
  "unanswered": "non-connect",
  "call-failed": "non-connect",
  "spam-blocked": "non-connect",
  "not-accepting": "non-connect",
  "dnd": "non-connect",
  "duplicate": "non-connect",
  "invalid": "non-connect",
  "language-barrier": "non-connect",
  "wrong-number": "non-connect",
};

export const LeadData = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

  const [emails, setEmails] = useState([]);
  const [phones, setPhones] = useState([]);

  const [relatedLeads, setRelatedLeads] = useState([]);
  const [visitedLeads, setVisitedLeads] = useState([]);
  const [duplicateRecords, setDuplicateRecords] = useState([]);

  // Package Form State
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [packages, setPackages] = useState([]);
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [taxPercentage, setTaxPercentage] = useState(18);
  const [discount, setDiscount] = useState(0);
  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
  const [activeRequirementPkg, setActiveRequirementPkg] = useState(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/configurations/packages/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      if (res.data?.status === "success") {
        setPackages(res.data.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch packages", e);
    }
  };


  const maskPhone = (phone) => {
    if (!phone) return "";
    const visibleDigits = 6;
    return phone.slice(-visibleDigits).padStart(phone.length, "*");
  };

  // Requirement form handlers moved to sub-components


  useEffect(() => {
    fetchLead();
  }, [id]);

  // ================= FETCH LEAD =================
  const fetchLead = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/crm/leads/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      const data = res.data.data;
      const related = res.data.related_leads || [];

      setLead(data);
      setEmails(data.lead_emails || []);
      setPhones(res.data.data.lead_phones || []);

      // Initialize existing selected packages and billing
      const otherInfo = res.data.data.other_lead_info || {};
      if (otherInfo.selected_packages && Array.isArray(otherInfo.selected_packages)) {
        // Migration: ensure IDs are strings with the right prefix
        const uniqueSelected = otherInfo.selected_packages.map(id => {
          if (typeof id === 'string' && (id.startsWith('pkg_') || id.startsWith('sub_'))) return id;
          // Heuristic: check if ID belongs to a package or sub-package if possible
          // For now, assume it's a main package if no prefix exists
          return `pkg_${id}`;
        });
        setSelectedPackages(uniqueSelected);
      }
      if (otherInfo.package_billing) {
        setTaxPercentage(otherInfo.package_billing.tax_percentage ?? 18);
        setDiscount(otherInfo.package_billing.discount_percentage ?? 0);
      }

      // Check if we should automatically open the package form
      if (
        data.status === "deal-won" ||
        data.status === "converted" ||
        (res.data.data.lead_phones || []).some(p => p.status === "converted") ||
        (otherInfo.selected_packages && otherInfo.selected_packages.length > 0)
      ) {
        setShowPackageForm(true);
      }

      if (res.data.related_leads) { setRelatedLeads(related); }
      setDuplicateRecords(res.data.duplicate_records || []);
      setVisitedLeads(prev => {
        const numId = Number(id);
        return prev.includes(numId) ? prev : [...prev, numId];
      });
      // current id position
      // const index = related.indexOf(Number(id));
      // setCurrentIndex(index);

    } catch (error) {
      navigate("/assigned");
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };


  const currentIndex = relatedLeads.indexOf(Number(id));

  const handleNext = () => {
    if (currentIndex >= 0 && currentIndex < relatedLeads.length - 1) {
      const nextId = relatedLeads[currentIndex + 1];
      const nextUrl = `/leads/${nextId}?${searchParams.toString()}`;
      navigate(nextUrl);
    } else {
      toast.info("No more leads in this group");
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevId = relatedLeads[currentIndex - 1];
      const nextUrl = `/leads/${prevId}?${searchParams.toString()}`;
      navigate(nextUrl);
    } else {
      toast.info("This is the first lead in this group");
    }
  };



  // ================= EMAIL =================
  const handleAddEmail = () => {
    if (emails.length >= 10) return;
    setEmails([...emails, { type: "office", email: "" }]);
  };

  const handleEmailChange = (index, field, value) => {
    const updated = [...emails];
    updated[index][field] = value;
    setEmails(updated);
  };

  const handleRemoveEmail = (index) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  // ================= PHONE =================
  const handleAddPhone = () => {
    if (phones.length >= 6) return;
    setPhones([
      ...phones,
      {
        type: "mobile",
        phone: "",
        status: "",
        followup_date: "",
        remarks: "",
      },
    ]);
  };

  const handlePhoneChange = (index, field, value) => {
    const updated = [...phones];
    updated[index][field] = value;

    // Clear follow-up date if not callback/no-contact
    if (
      field === "status" &&
      !["callback", "interested", "followup"].includes(value)
    ) {
      updated[index].followup_date = "";
    }

    setPhones(updated);
  };

  const handleRemovePhone = (index) => {
    setPhones(phones.filter((_, i) => i !== index));
  };

  // ================= SAVE =================
  const handleSave = async () => {
    const validStatusValues = STATUS_OPTIONS.map(opt => opt.value);

    // 1. Check if ANY phone number is missing a valid status (is empty or "New")
    const missingStatus = phones.find(p => !p.status || p.status.trim() === "" || !validStatusValues.includes(p.status));

    if (missingStatus) {
      if (phones.length > 1) {
        toast.error("You have another phone number. Please update the status for all numbers.");
      } else {
        toast.error("Please update the status for the phone number.");
      }
      return;
    }

    // 2. Check if ALL updated phone numbers have remarks
    const missingRemarks = phones.find(p => !p.remarks || p.remarks.trim() === "");
    if (missingRemarks) {
      toast.error("Remarks are mandatory for all phone statuses.");
      return;
    }

    // 3. Specific validation for follow-up dates
    for (let i = 0; i < phones.length; i++) {
      const phone = phones[i];
      if (
        ["callback", "interested", "followup"].includes(phone.status) &&
        !phone.followup_date
      ) {
        const phoneNumber = phone.phone || `at position ${i + 1}`;
        toast.error(`Follow-up date & time is mandatory for ${phoneNumber}.`);
        return;
      }
    }
    // VALIDATION END

    try {
      const res = await axios.put(
        `${API_BASE_URL}/crm/leads/${id}/`,
        {
          lead_emails: emails,
          lead_phones: phones,
          lead_website: lead.lead_website,
          lead_designation: lead.lead_designation,
          lead_address: lead.lead_address,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      toast.success(res.data.message || "Lead updated successfully");

      setLead((prev) => ({
        ...prev,
        lead_emails: emails,
        lead_phones: phones,
        status: res.data.lead_status || prev.status,
      }));

      if (res.data.lead_status === "deal-won" || res.data.lead_status === "converted" || phones.some(p => p.status === "converted")) {
        setShowPackageForm(true);
      } else {
        // Redirect after successful save
        setTimeout(() => {
          navigate(`/assigned?${searchParams.toString() || "status=assigned"}`);
        }, 1000);
      }

    } catch (error) {
      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Something went wrong";

      toast.error(backendMessage);
    }
  };


  if (loading) return <p>Loading...</p>;
  if (!lead) return <p>No lead found</p>;

  const isUnassigned = lead.status === "unassigned";
  const { street, city, state, pincode } = lead.lead_address || {};

  return (
    <div className="lead-detail-container">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      </aside>

      <main className="main">
        <Navbar
          pageTitle="Lead Details"
          subTitle={`Managing data for ${lead.lead_name}`}
        />

        <div className="content">
          <div className="lead-main-grid">
            <div className="col-left">
              {isUnassigned && (
                <div style={{ background: "#fff3cd", color: "#856404", padding: "16px", borderRadius: "12px", fontWeight: "700", marginBottom: "10px" }}>
                  ⚠️ This lead is currently Unassigned. Please assign it to an agent before making changes.
                </div>
              )}

              {/* PROFILE CARD */}
              <div className="ui-card">
                <div className="profile-row">
                  <div className="avatar-placeholder">
                    <FiUser />
                  </div>
                  <div className="profile-info">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <h2 style={{ margin: 0 }}>{lead.lead_name}</h2>
                      <button
                        className="btn-edit-inline"
                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                        title={isEditingProfile ? "Close Edit" : "Edit Name & Designation"}
                        style={{ background: "none", border: "none", color: "#5B0F1B", cursor: "pointer", display: "flex", alignItems: "center", padding: "4px", borderRadius: "4px", transition: "background 0.2s" }}
                        onMouseOver={(e) => e.currentTarget.style.background = "rgba(91, 15, 27, 0.05)"}
                        onMouseOut={(e) => e.currentTarget.style.background = "none"}
                      >
                        <FiEdit2 size={16} />
                      </button>
                    </div>
                    <p>{lead.lead_designation} • {lead.lead_company}</p>
                  </div>
                  <span className="status-badge">
                    {lead.status.replace(/-/g, " ")}
                  </span>
                </div>

                {isEditingProfile && (
                  <div className="form-grid" style={{ marginTop: "20px", borderTop: "1px solid #f0f0f0", paddingTop: "20px" }}>
                    <div className="field-group">
                      <span className="field-label">Full Name</span>
                      <input
                        className="ui-input"
                        value={lead.lead_name || ""}
                        onChange={(e) => setLead({ ...lead, lead_name: e.target.value })}
                        disabled={isUnassigned}
                      />
                    </div>
                    <div className="field-group">
                      <span className="field-label">Designation</span>
                      <input
                        className="ui-input"
                        value={lead.lead_designation || ""}
                        onChange={(e) => setLead({ ...lead, lead_designation: e.target.value })}
                        disabled={isUnassigned}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* LOCATION CARD (Moved back to left as requested) */}
              <div className="ui-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ margin: 0 }}><FiMapPin /> Location & Web</h3>
                  <button
                    className="btn-edit-inline"
                    onClick={() => setIsEditingLocation(!isEditingLocation)}
                    title={isEditingLocation ? "Close Edit" : "Edit Location & Web"}
                    style={{ background: "none", border: "none", color: "#5B0F1B", cursor: "pointer", display: "flex", alignItems: "center", padding: "4px", borderRadius: "4px", transition: "background 0.2s" }}
                    onMouseOver={(e) => e.currentTarget.style.background = "rgba(91, 15, 27, 0.05)"}
                    onMouseOut={(e) => e.currentTarget.style.background = "none"}
                  >
                    <FiEdit2 size={16} />
                  </button>
                </div>

                {!isEditingLocation && (lead.lead_address?.street || lead.lead_address?.city || lead.lead_address?.state || lead.lead_address?.pincode) ? (
                  <div style={{ marginBottom: "20px", marginTop: "10px" }}>
                    {lead.lead_address?.street && <p style={{ margin: "0 0 4px 0", fontSize: "0.95rem", fontWeight: "600", color: "#43121A" }}>{lead.lead_address.street}</p>}
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#665255", fontWeight: "500" }}>
                      {[lead.lead_address?.city, lead.lead_address?.state, lead.lead_address?.pincode].filter(Boolean).join(", ")}
                    </p>
                  </div>
                ) : null}

                {isEditingLocation && (
                  <div style={{ marginTop: "10px", borderTop: "1px solid #f0f0f0", paddingTop: "20px", marginBottom: "20px" }}>
                    <div className="field-group" style={{ marginBottom: "16px" }}>
                      <span className="field-label">Street Address</span>
                      <input
                        className="ui-input"
                        value={lead.lead_address?.street || ""}
                        onChange={(e) => setLead({ ...lead, lead_address: { ...(lead.lead_address || {}), street: e.target.value } })}
                        disabled={isUnassigned}
                      />
                    </div>
                    <div className="form-grid">
                      <div className="field-group">
                        <span className="field-label">City</span>
                        <input
                          className="ui-input"
                          value={lead.lead_address?.city || ""}
                          onChange={(e) => setLead({ ...lead, lead_address: { ...(lead.lead_address || {}), city: e.target.value } })}
                          disabled={isUnassigned}
                        />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <div>
                          <span className="field-label">State</span>
                          <input
                            className="ui-input"
                            value={lead.lead_address?.state || ""}
                            onChange={(e) => setLead({ ...lead, lead_address: { ...(lead.lead_address || {}), state: e.target.value } })}
                            disabled={isUnassigned}
                          />
                        </div>
                        <div>
                          <span className="field-label">Pincode</span>
                          <input
                            className="ui-input"
                            value={lead.lead_address?.pincode || ""}
                            onChange={(e) => setLead({ ...lead, lead_address: { ...(lead.lead_address || {}), pincode: e.target.value } })}
                            disabled={isUnassigned}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="field-group" style={{ marginTop: isEditingLocation ? "16px" : "0px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span className="field-label">Website</span>
                    {lead.lead_website && lead.lead_website.trim() && (
                      <a
                        href={lead.lead_website.startsWith('http') ? lead.lead_website : `https://${lead.lead_website}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ color: "#5B0F1B", fontSize: "0.75rem", fontWeight: "700", textDecoration: "none" }}
                      >
                        Visit <FiExternalLink />
                      </a>
                    )}
                  </div>
                  <input
                    className="ui-input"
                    value={lead.lead_website || ""}
                    onChange={(e) => setLead({ ...lead, lead_website: e.target.value })}
                    disabled={isUnassigned}
                  />
                </div>
              </div>

              {/* CONVERTED SECTION (Moved into Left Column as requested) */}
              {/* SERVICE TYPE CARD - Always visible */}
              <div className="ui-card" style={{ padding: "16px" }}>
                <div style={{ marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "0.95rem", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}><FiPackage /> Service Type</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {packages.length > 0 ? (
                    packages.map((pkg) => (
                      <div key={pkg.id}>
                        <div className="package-item" style={{ marginBottom: "2px", padding: "4px 8px" }} onClick={() => {
                          const isChecked = selectedPackages.includes(`pkg_${pkg.id}`);
                          if (!isChecked) {
                            setSelectedPackages([...selectedPackages, `pkg_${pkg.id}`]);
                          } else {
                            const subIds = pkg.sub_packages ? pkg.sub_packages.map(s => `sub_${s.id}`) : [];
                            setSelectedPackages(selectedPackages.filter(id => id !== `pkg_${pkg.id}` && !subIds.includes(id)));
                          }
                        }}>
                          <input type="checkbox" className="ui-custom-checkbox" checked={selectedPackages.includes(`pkg_${pkg.id}`)} readOnly />
                          <span className="package-name" style={{ fontSize: "0.85rem", color: selectedPackages.includes(`pkg_${pkg.id}`) ? "#5B0F1B" : "#333", fontWeight: selectedPackages.includes(`pkg_${pkg.id}`) ? "700" : "500" }}>{pkg.package_name}</span>
                        </div>
                        {pkg.sub_packages && pkg.sub_packages.length > 0 && selectedPackages.includes(`pkg_${pkg.id}`) && (
                          <div style={{ marginLeft: "28px", borderLeft: "2px solid #f5f0e8", paddingLeft: "12px", marginTop: "4px", marginBottom: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                            {pkg.sub_packages.map(sub => (
                              <div key={sub.id} className="package-item" style={{ marginBottom: 0, padding: "3px 8px", borderRadius: "6px", background: selectedPackages.includes(`sub_${sub.id}`) ? "rgba(91, 15, 27, 0.03)" : "transparent" }} onClick={(e) => {
                                e.stopPropagation();
                                const isChecked = selectedPackages.includes(`sub_${sub.id}`);
                                if (!isChecked) {
                                  setSelectedPackages([...selectedPackages, `sub_${sub.id}`]);
                                } else {
                                  setSelectedPackages(selectedPackages.filter(id => id !== `sub_${sub.id}`));
                                }
                              }}>
                                <input type="checkbox" className="ui-custom-checkbox mini" checked={selectedPackages.includes(`sub_${sub.id}`)} readOnly />
                                <span className="package-name" style={{ fontSize: "0.8rem", color: selectedPackages.includes(`sub_${sub.id}`) ? "#5B0F1B" : "#666", fontWeight: selectedPackages.includes(`sub_${sub.id}`) ? "650" : "400" }}>{sub.sub_package_name} - ${sub.amount}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: "0.8rem" }}>No packages found.</p>
                  )}
                </div>

                {/* Requirement Form Buttons - one per selected package with a form type */}
                {(() => {
                  const pkgsWithForms = selectedPackages
                    .filter(id => id.startsWith("pkg_"))
                    .map(id => packages.find(p => p.id === parseInt(id.replace("pkg_", ""))))
                    .filter(p => p?.requirement_form_type);
                  if (pkgsWithForms.length === 0) return null;
                  return (
                    <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "8px", borderTop: "1px solid #f5eee0", paddingTop: "12px" }}>
                      {pkgsWithForms.map(pkg => (
                        <button key={pkg.id} className="btn-requirement" onClick={() => {
                          setActiveRequirementPkg(pkg);
                          setIsRequirementModalOpen(true);
                        }}>
                          <FiFileText /> {pkg.package_name} Form
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
            <div className="col-right">
              {/* COMMUNICATION CARD (Switched position for balance) */}
              <div className="ui-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h3 style={{ margin: 0 }}><FiMessageSquare /> Communication</h3>

                  <div className="lead-navigation-sleek">
                    <span className="lead-count-badge">
                      {currentIndex + 1} / {relatedLeads.length}
                    </span>
                    <div className="nav-btn-group">
                      <button
                        className="nav-btn-sleek"
                        onClick={handlePrev}
                        disabled={currentIndex <= 0}
                        title="Previous Lead"
                      >
                        <FiChevronLeft size={16} />
                      </button>
                      <button
                        className="nav-btn-sleek"
                        onClick={handleNext}
                        disabled={currentIndex >= relatedLeads.length - 1 || relatedLeads.length === 0}
                        title="Next Lead"
                      >
                        <FiChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span className="field-label" style={{ marginBottom: 0 }}>Email Addresses</span>
                  <button
                    className="btn-add-mini"
                    onClick={() => setEmails([...emails, { email: "" }])}
                    title="Add Email Address"
                    disabled={isUnassigned}
                  >
                    <FiMail size={14} style={{ marginRight: "4px" }} /> Add Email
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {emails.map((item, index) => (
                    <div key={index} className="channel-item" style={{ marginBottom: 0 }}>
                      <input
                        className="ui-input"
                        style={{ padding: "8px 14px", fontSize: "0.9rem" }}
                        value={item.email}
                        placeholder="email@example.com"
                        onChange={(e) => handleEmailChange(index, "email", e.target.value)}
                        disabled={isUnassigned}
                      />
                      {emails.length > 1 && (
                        <button className="icon-btn-remove" onClick={() => handleRemoveEmail(index)} disabled={isUnassigned}><FiTrash2 /></button>
                      )}
                    </div>
                  ))}
                </div>

                <hr style={{ border: "none", borderTop: "1px solid #f0f0f0", margin: "16px 0" }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span className="field-label" style={{ marginBottom: 0 }}>Phone Numbers</span>
                  <button
                    className="btn-add-mini"
                    onClick={() => setPhones([...phones, { phone: "", type: "mobile", status: "new", remarks: "", followup_date: "" }])}
                    title="Add Phone Number"
                    disabled={isUnassigned}
                  >
                    <FiPhone size={14} style={{ marginRight: "4px" }} /> Add Phone
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {phones.map((item, index) => (
                    <div key={index} style={{ background: "#fcfbfa", padding: "12px", borderRadius: "12px", border: "1px solid #f5f0e8" }}>
                      <div className="channel-item" style={{ marginBottom: "8px" }}>
                        <select
                          className="ui-select"
                          style={{ width: "95px", flexShrink: 0, padding: "8px 10px" }}
                          value={item.type || "mobile"}
                          onChange={(e) => handlePhoneChange(index, "type", e.target.value)}
                          disabled={isUnassigned}
                        >
                          <option value="mobile">Mobile</option>
                          <option value="office">Work</option>
                          <option value="home">Home</option>
                        </select>
                        <input
                          className="ui-input"
                          style={{ padding: "8px 14px", fontSize: "0.9rem" }}
                          value={item.status === "dnd" ? maskPhone(item.phone) : item.phone}
                          placeholder="Phone Number"
                          onChange={(e) => handlePhoneChange(index, "phone", e.target.value)}
                          disabled={isUnassigned || item.status === "dnd"}
                        />
                        {phones.length > 1 && (
                          <button className="icon-btn-remove" onClick={() => handleRemovePhone(index)} disabled={isUnassigned}><FiTrash2 /></button>
                        )}
                      </div>

                      <div className="form-grid" style={{ gap: "10px" }}>
                        <div className="field-group" style={{ gap: "6px" }}>
                          <span className="field-label" style={{ fontSize: "0.65rem" }}>Status</span>
                          <select
                            className="ui-select"
                            style={{ padding: "8px 10px", fontSize: "0.85rem" }}
                            value={item.status || ""}
                            onChange={(e) => handlePhoneChange(index, "status", e.target.value)}
                            disabled={isUnassigned}
                          >
                            <option value="">Select Status</option>
                            {STATUS_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>

                        {["callback", "interested", "followup"].includes(item.status) && (
                          <div className="field-group" style={{ gap: "6px" }}>
                            <span className="field-label" style={{ fontSize: "0.65rem" }}>Follow-up</span>
                            <input
                              type="datetime-local"
                              className="ui-input"
                              style={{ padding: "8px 10px", fontSize: "0.80rem" }}
                              value={item.followup_date || ""}
                              onChange={(e) => handlePhoneChange(index, "followup_date", e.target.value)}
                              disabled={isUnassigned}
                              min={new Date().toISOString().slice(0, 10) + "T00:00"}
                            />
                          </div>
                        )}
                      </div>

                      <div className="field-group" style={{ marginTop: "8px", gap: "6px" }}>
                        <span className="field-label" style={{ fontSize: "0.65rem" }}>Remarks</span>
                        <textarea
                          className="ui-input"
                          style={{ minHeight: "45px", padding: "8px 10px", fontSize: "0.85rem" }}
                          value={item.remarks || ""}
                          onChange={(e) => handlePhoneChange(index, "remarks", e.target.value)}
                          disabled={isUnassigned}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* LEDGER COMPONENT (Moved to Right Column above Save Changes) */}
              {phones.some(p => p.status === "converted") && (
                <div className="ledger-card" style={{ padding: "12px 16px", marginTop: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", borderBottom: "1px solid #f2f2f2", paddingBottom: "6px" }}>
                    <h3 style={{ margin: 0, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "8px" }}><FiCreditCard /> Billing Details</h3>
                    <span style={{ fontSize: "0.6rem", fontWeight: "800", color: "#666", textTransform: "uppercase", letterSpacing: "1px" }}>Summary</span>
                  </div>

                  <div className="ledger-content">
                    {(() => {
                      const subTotalValue = selectedPackages.reduce((acc, entry) => {
                        const [type, idStr] = entry.split('_');
                        const targetId = parseInt(idStr);
                        let foundPkg = null;
                        if (type === 'pkg') foundPkg = packages.find(p => p.id === targetId);
                        else if (type === 'sub') foundPkg = packages.flatMap(p => p.sub_packages || []).find(s => s.id === targetId);
                        return acc + (foundPkg ? parseFloat(foundPkg.amount) || 0 : 0);
                      }, 0);

                      const discVal = (subTotalValue * (parseFloat(discount) || 0)) / 100;
                      const preTax = subTotalValue - discVal;
                      const taxVal = (preTax * (parseFloat(taxPercentage) || 0)) / 100;
                      const totalVal = preTax + taxVal;

                      return (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fcfbfa", padding: "6px 12px", borderRadius: "8px", border: "1px solid #f5f0e8" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "#666" }}>Subtotal</span>
                            <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "#2D0A0E" }}>$ {subTotalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <span style={{ fontSize: "0.65rem", fontWeight: "800", color: "#666", textTransform: "uppercase" }}>Tax (%)</span>
                              <input
                                type="number"
                                className="ui-input"
                                style={{ padding: "6px 10px", fontSize: "0.85rem", fontWeight: "700" }}
                                value={taxPercentage}
                                onChange={(e) => setTaxPercentage(e.target.value)}
                                disabled={isUnassigned}
                              />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <span style={{ fontSize: "0.65rem", fontWeight: "800", color: "#666", textTransform: "uppercase" }}>Disc (%)</span>
                              <input
                                type="number"
                                className="ui-input"
                                style={{ padding: "6px 10px", fontSize: "0.85rem", fontWeight: "700" }}
                                value={discount}
                                onChange={(e) => setDiscount(e.target.value)}
                                disabled={isUnassigned}
                              />
                            </div>
                          </div>

                          <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "#5B0F1B",
                            padding: "6px 10px",
                            borderRadius: "8px",
                            marginTop: "6px"
                          }}>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.55rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Est. Total</span>
                              <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", fontWeight: "800" }}>$</span>
                                <span style={{ color: "white", fontSize: "1.05rem", fontWeight: "900" }}>{totalVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                              </div>
                            </div>

                            <button
                              className="btn-primary-full"
                              style={{
                                background: "white",
                                color: "#5B0F1B",
                                padding: "6px 12px",
                                fontSize: "0.7rem",
                                fontWeight: "850",
                                borderRadius: "6px",
                                height: "fit-content",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                              }}
                              disabled={isUnassigned}
                              onClick={async () => {
                                const subTotalValue = selectedPackages.reduce((acc, entry) => {
                                  const [type, idStr] = entry.split('_');
                                  const targetId = parseInt(idStr);
                                  let foundPkg = null;
                                  if (type === 'pkg') foundPkg = packages.find(p => p.id === targetId);
                                  else if (type === 'sub') foundPkg = packages.flatMap(p => p.sub_packages || []).find(s => s.id === targetId);
                                  return acc + (foundPkg ? parseFloat(foundPkg.amount) || 0 : 0);
                                }, 0);
                                const discVal = (subTotalValue * (parseFloat(discount) || 0)) / 100;
                                const preTax = subTotalValue - discVal;
                                const taxVal = (preTax * (parseFloat(taxPercentage) || 0)) / 100;
                                const totalVal = preTax + taxVal;

                                try {
                                  await axios.put(`${API_BASE_URL}/crm/leads/${id}/`, {
                                    lead_emails: emails,
                                    lead_phones: phones,
                                    lead_website: lead.lead_website,
                                    lead_designation: lead.lead_designation,
                                    lead_address: lead.lead_address,
                                    selected_packages: selectedPackages,
                                    package_billing: {
                                      subtotal: subTotalValue,
                                      tax_percentage: taxPercentage,
                                      tax_amount: taxVal,
                                      discount_percentage: discount,
                                      discount_amount: discVal,
                                      total_amount: totalVal
                                    }
                                  }, { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } });
                                  toast.success("Packages submitted successfully");
                                } catch (e) { toast.error("Failed to save packages"); }
                              }}
                            >
                              Submit Packages
                            </button>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              )}

              <button className="btn-secondary-full" disabled={isUnassigned} onClick={handleSave} style={{ marginTop: "10px" }}>
                <FiPocket /> Save Changes
              </button>
            </div>
          </div>
        </div>
        {/* REQUIREMENT MODAL */}
        {isRequirementModalOpen && activeRequirementPkg && (
          <div className="modal-overlay" onClick={() => setIsRequirementModalOpen(false)}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2><FiFileText /> {activeRequirementPkg.package_name} Requirements</h2>
                <button className="close-modal-btn" onClick={() => setIsRequirementModalOpen(false)}>
                  <FiPlus style={{ transform: "rotate(45deg)" }} />
                </button>
              </div>
              <div className="modal-body">
                {activeRequirementPkg.requirement_form_type === "website" ? (
                  <WebsiteRequirementForm
                    leadId={id}
                    packageId={activeRequirementPkg.id}
                    lead={lead}
                    onClose={() => setIsRequirementModalOpen(false)}
                  />
                ) : activeRequirementPkg.requirement_form_type === "seo" ? (
                  <SEORequirementForm
                    leadId={id}
                    packageId={activeRequirementPkg.id}
                    lead={lead}
                    onClose={() => setIsRequirementModalOpen(false)}
                  />
                ) : activeRequirementPkg.requirement_form_type === "smo" ? (
                  <SMORequirementForm
                    leadId={id}
                    packageId={activeRequirementPkg.id}
                    lead={lead}
                    onClose={() => setIsRequirementModalOpen(false)}
                  />
                ) : (
                  <div style={{ padding: "40px", textAlign: "center" }}>
                    <FiFileText size={48} style={{ opacity: 0.2, marginBottom: "20px" }} />
                    <h3>Coming Soon</h3>
                    <p>The requirement form for {activeRequirementPkg.package_name} is under development.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LeadData;

          <div className="modal-overlay" onClick={() => setIsRequirementModalOpen(false)}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2><FiFileText /> Requirement Form</h2>
                <button className="close-modal-btn" onClick={() => setIsRequirementModalOpen(false)}>
                  <FiPlus style={{ transform: "rotate(45deg)" }} />
                </button>
              </div>

              <div className="modal-body">
                {/* SECTION 1: BUSINESS REQUIREMENTS */}
                <div className="form-section">
                  <div className="section-head">
                    <div className="section-icon-dot"></div>
                    <h4>Section 1: Business Requirements</h4>
                  </div>
                  <div className="requirement-grid">
                    <div className="field-group">
                      <span className="req-field-label">Company / Business Name</span>
                      <input className="req-input" value={requirementForm.business_name} onChange={e => updateReq("business_name", e.target.value)} placeholder="Enter company name" />
                    </div>
                    <div className="field-group">
                      <span className="req-field-label">Contact Person Name</span>
                      <input className="req-input" value={requirementForm.contact_person} onChange={e => updateReq("contact_person", e.target.value)} placeholder="Enter contact name" />
                    </div>
                    <div className="field-group">
                      <span className="req-field-label">Email Address</span>
                      <input className="req-input" value={requirementForm.email} onChange={e => updateReq("email", e.target.value)} placeholder="email@example.com" />
                    </div>
                    <div className="field-group">
                      <span className="req-field-label">Phone Number</span>
                      <input className="req-input" value={requirementForm.phone} onChange={e => updateReq("phone", e.target.value)} placeholder="+1 234 567 890" />
                    </div>
                    <div className="field-group full-width">
                      <span className="req-field-label">Business Description</span>
                      <textarea className="req-textarea" rows="3" value={requirementForm.business_desc} onChange={e => updateReq("business_desc", e.target.value)} placeholder="What does your company do?" />
                    </div>
                    <div className="field-group full-width">
                      <span className="req-field-label">Target Audience</span>
                      <input className="req-input" value={requirementForm.target_audience} onChange={e => updateReq("target_audience", e.target.value)} placeholder="Who are your customers?" />
                    </div>
                    <div className="field-group full-width">
                      <span className="req-field-label">Purpose of Website</span>
                      <div className="checkbox-group">
                        {["Lead Generation", "E-commerce", "Portfolio", "Informational", "Other"].map(p => (
                          <label key={p} className="checkbox-item">
                            <input type="checkbox" className="ui-custom-checkbox mini" checked={requirementForm.purpose.includes(p)} onChange={() => togglePurpose(p)} />
                            <span>{p}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: CONTENT REQUIREMENTS */}
                <div className="form-section">
                  <div className="section-head">
                    <div className="section-icon-dot" style={{ background: "#4e94ff" }}></div>
                    <h4>Section 2: Content Requirements</h4>
                  </div>
                  <div className="requirement-grid">
                    <div className="field-group full-width">
                      <span className="req-field-label">Do you have content ready?</span>
                      <div className="radio-group">
                        <label className="checkbox-item"><input type="radio" name="content_ready" checked={requirementForm.content_ready === "yes"} onChange={() => updateReq("content_ready", "yes")} /> <span>Yes</span></label>
                        <label className="checkbox-item"><input type="radio" name="content_ready" checked={requirementForm.content_ready === "no"} onChange={() => updateReq("content_ready", "no")} /> <span>No</span></label>
                      </div>
                    </div>
                    <div className="field-group full-width">
                      <span className="req-field-label">Pages Required</span>
                      <div className="checkbox-group">
                        {["Home", "About Us", "Services", "Products", "Blog", "Contact", "Other"].map(page => (
                          <label key={page} className="checkbox-item">
                            <input type="checkbox" className="ui-custom-checkbox mini" checked={requirementForm.pages.includes(page)} onChange={() => togglePage(page)} />
                            <span>{page}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="field-group">
                      <span className="req-field-label">Will you provide images/videos?</span>
                      <div className="radio-group">
                        <label className="checkbox-item"><input type="radio" name="provide_media" checked={requirementForm.provide_media === "yes"} onChange={() => updateReq("provide_media", "yes")} /> <span>Yes</span></label>
                        <label className="checkbox-item"><input type="radio" name="provide_media" checked={requirementForm.provide_media === "no"} onChange={() => updateReq("provide_media", "no")} /> <span>No</span></label>
                      </div>
                    </div>
                    <div className="field-group">
                      <span className="req-field-label">Need content writing services?</span>
                      <div className="radio-group">
                        <label className="checkbox-item"><input type="radio" name="content_writing" checked={requirementForm.content_writing === "yes"} onChange={() => updateReq("content_writing", "yes")} /> <span>Yes</span></label>
                        <label className="checkbox-item"><input type="radio" name="content_writing" checked={requirementForm.content_writing === "no"} onChange={() => updateReq("content_writing", "no")} /> <span>No</span></label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: DESIGN REQUIREMENTS */}
                <div className="form-section">
                  <div className="section-head">
                    <div className="section-icon-dot" style={{ background: "#ed4b82" }}></div>
                    <h4>Section 3: Design Requirements</h4>
                  </div>
                  <div className="requirement-grid">
                    <div className="field-group">
                      <span className="req-field-label">Preferred Color Theme</span>
                      <input className="req-input" value={requirementForm.color_theme} onChange={e => updateReq("color_theme", e.target.value)} placeholder="e.g. Maroon & Gold" />
                    </div>
                    <div className="field-group">
                      <span className="req-field-label">Preferred Style</span>
                      <select className="req-select" value={requirementForm.preferred_style} onChange={e => updateReq("preferred_style", e.target.value)}>
                        <option>Modern</option>
                        <option>Minimal</option>
                        <option>Corporate</option>
                        <option>Creative</option>
                      </select>
                    </div>
                    <div className="field-group">
                      <span className="req-field-label">Logo Availability</span>
                      <div className="radio-group">
                        <label className="checkbox-item"><input type="radio" name="logo_avail" checked={requirementForm.logo_available === "yes"} onChange={() => updateReq("logo_available", "yes")} /> <span>Yes</span></label>
                        <label className="checkbox-item"><input type="radio" name="logo_avail" checked={requirementForm.logo_available === "no"} onChange={() => updateReq("logo_available", "no")} /> <span>No</span></label>
                      </div>
                    </div>
                    <div className="field-group">
                      <span className="req-field-label">Need logo design?</span>
                      <div className="radio-group">
                        <label className="checkbox-item"><input type="radio" name="need_logo" checked={requirementForm.need_logo === "yes"} onChange={() => updateReq("need_logo", "yes")} /> <span>Yes</span></label>
                        <label className="checkbox-item"><input type="radio" name="need_logo" checked={requirementForm.need_logo === "no"} onChange={() => updateReq("need_logo", "no")} /> <span>No</span></label>
                      </div>
                    </div>
                    <div className="field-group full-width">
                      <span className="req-field-label">Any specific design instructions</span>
                      <textarea className="req-textarea" rows="2" value={requirementForm.design_instructions} onChange={e => updateReq("design_instructions", e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* SECTION 4: FUNCTIONAL REQUIREMENTS */}
                <div className="form-section">
                  <div className="section-head">
                    <div className="section-icon-dot" style={{ background: "#8e44ad" }}></div>
                    <h4>Section 4: Functional Requirements</h4>
                  </div>
                  <div className="requirement-grid">
                    <div className="field-group full-width">
                      <span className="req-field-label">Required Features</span>
                      <div className="checkbox-group">
                        {["Contact Form", "Login/Signup", "Payment Gateway", "Booking System", "Chat Integration", "Admin Panel", "Other"].map(f => (
                          <label key={f} className="checkbox-item">
                            <input type="checkbox" className="ui-custom-checkbox mini" checked={requirementForm.features.includes(f)} onChange={() => toggleFeature(f)} />
                            <span>{f}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="field-group">
                      <span className="req-field-label">Social Media Integration?</span>
                      <div className="radio-group">
                        <label className="checkbox-item"><input type="radio" name="sm_int" checked={requirementForm.social_media === "yes"} onChange={() => updateReq("social_media", "yes")} /> <span>Yes</span></label>
                        <label className="checkbox-item"><input type="radio" name="sm_int" checked={requirementForm.social_media === "no"} onChange={() => updateReq("social_media", "no")} /> <span>No</span></label>
                      </div>
                    </div>
                    <div className="field-group">
                      <span className="req-field-label">Newsletter Subscription?</span>
                      <div className="radio-group">
                        <label className="checkbox-item"><input type="radio" name="news_sub" checked={requirementForm.newsletter === "yes"} onChange={() => updateReq("newsletter", "yes")} /> <span>Yes</span></label>
                        <label className="checkbox-item"><input type="radio" name="news_sub" checked={requirementForm.newsletter === "no"} onChange={() => updateReq("newsletter", "no")} /> <span>No</span></label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 5: TECHNICAL REQUIREMENTS */}
                <div className="form-section">
                  <div className="section-head">
                    <div className="section-icon-dot" style={{ background: "#f39c12" }}></div>
                    <h4>Section 5: Technical Requirements</h4>
                  </div>
                  <div className="requirement-grid">
                    <div className="field-group">
                      <span className="req-field-label">Domain Name Available?</span>
                      <div className="radio-group">
                        <label className="checkbox-item"><input type="radio" name="dom_avail" checked={requirementForm.domain_available === "yes"} onChange={() => updateReq("domain_available", "yes")} /> <span>Yes</span></label>
                        <label className="checkbox-item"><input type="radio" name="dom_avail" checked={requirementForm.domain_available === "no"} onChange={() => updateReq("domain_available", "no")} /> <span>No</span></label>
                      </div>
                    </div>
                    <div className="field-group">
                      <span className="req-field-label">Hosting Available?</span>
                      <div className="radio-group">
                        <label className="checkbox-item"><input type="radio" name="host_avail" checked={requirementForm.hosting_available === "yes"} onChange={() => updateReq("hosting_available", "yes")} /> <span>Yes</span></label>
                        <label className="checkbox-item"><input type="radio" name="host_avail" checked={requirementForm.hosting_available === "no"} onChange={() => updateReq("hosting_available", "no")} /> <span>No</span></label>
                      </div>
                    </div>
                    <div className="field-group">
                      <span className="req-field-label">Preferred Technology</span>
                      <select className="req-select" value={requirementForm.technology} onChange={e => updateReq("technology", e.target.value)}>
        {isRequirementModalOpen && activeRequirementPkg && (
          <div className="modal-overlay" onClick={() => setIsRequirementModalOpen(false)}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2><FiFileText /> {activeRequirementPkg.package_name} Requirements</h2>
                <button className="close-modal-btn" onClick={() => setIsRequirementModalOpen(false)}>
                  <FiPlus style={{ transform: "rotate(45deg)" }} />
                </button>
              </div>
              <div className="modal-body">
                {activeRequirementPkg.requirement_form_type === "website" ? (
                  <WebsiteRequirementForm
                    leadId={id}
                    packageId={activeRequirementPkg.id}
                    lead={lead}
                    onClose={() => setIsRequirementModalOpen(false)}
                  />
                ) : activeRequirementPkg.requirement_form_type === "seo" ? (
                  <SEORequirementForm
                    leadId={id}
                    packageId={activeRequirementPkg.id}
                    lead={lead}
                    onClose={() => setIsRequirementModalOpen(false)}
                  />
                ) : activeRequirementPkg.requirement_form_type === "smo" ? (
                  <SMORequirementForm
                    leadId={id}
                    packageId={activeRequirementPkg.id}
                    lead={lead}
                    onClose={() => setIsRequirementModalOpen(false)}
                  />
                ) : (
                  <div style={{ padding: "40px", textAlign: "center" }}>
                    <FiFileText size={48} style={{ opacity: 0.2, marginBottom: "20px" }} />
                    <h3>Coming Soon</h3>
                    <p>The requirement form for {activeRequirementPkg.package_name} is under development.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LeadData;
