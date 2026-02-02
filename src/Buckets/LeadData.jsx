import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/LeadData.css";
import { toast } from "react-toastify";
import { FiEye } from "react-icons/fi";
import { API_BASE_URL } from "../config.jsx";
import LeadTracking from "./LeadTracking";
import {
  FiChevronRight
} from "react-icons/fi";

export const LeadData = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

  const [emails, setEmails] = useState([]);
  const [phones, setPhones] = useState([]);

  const [relatedLeads, setRelatedLeads] = useState([]);
  const [visitedLeads, setVisitedLeads] = useState([]);
  const maskPhone = (phone) => {
    if (!phone) return "";
    const visibleDigits = 6;
    return phone.slice(-visibleDigits).padStart(phone.length, "*");
  };

  const remainingRelatedLeads = relatedLeads.filter(
    rid => !visitedLeads.includes(rid)
  );


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
      setPhones(data.lead_phones || []);

      setRelatedLeads(related);
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


  const handleNext = () => {
    if (!remainingRelatedLeads.length) {
      toast.info("No more related leads");
      return;
    }

    navigate(`/leads/${remainingRelatedLeads[0]}`);
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
      !["callback", "interested"].includes(value)
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

    // VALIDATION START
    for (let i = 0; i < phones.length; i++) {
      const phone = phones[i];

      if (
        ["callback", "interested"].includes(phone.status) &&
        !phone.followup_date
      ) {
        toast.error(
          "Follow-up date & time is mandatory"
        );
        return; //  STOP saving
      }
      if (
        ["callback", "interested"].includes(phone.status) &&
        !phone.remarks
      ) {
        toast.error(
          "remarks is mandatory"
        );
        return; //  STOP saving
      }
    }
    //  VALIDATION END

    try {
      const res = await axios.put(
        `${API_BASE_URL}/crm/leads/${id}/`,
        {
          lead_emails: emails,
          lead_phones: phones,
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
      }));

      navigate(`/leads/${id}`);
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

  const { street, city, state, pincode } = lead.lead_address || {};

  return (
    <section className="lead-detail">
      <div className="btn">
        <button
          className="back-btn"
          onClick={() => {
            setVisitedLeads(prev =>
              prev.filter(v => v !== Number(id))
            );
            navigate(-1);
          }}
        >
          ← Back
        </button>

        <button
          className="back-btn"
          onClick={handleNext}
          disabled={loading || relatedLeads.length === 0}
          title={relatedLeads.length === 0 ? "No more related leads" : "Next lead"}
          style={{
            cursor: loading || relatedLeads.length === 0 ? "not-allowed" : "pointer",
            opacity: loading || relatedLeads.length === 0 ? 0.5 : 1
          }}
        >
          <FiChevronRight size={16} />
        </button>



      </div>


      <div className="lead-grid">
        {/* LEFT */}
        <div className="lead-left">
          <div className="left-top">
            <div className="address">
              <div><p><strong>Name:</strong> {lead.lead_name}</p>
                <p><strong>Company:</strong> {lead.lead_company || "-"}</p>
                <p><strong>Region:</strong> {lead.lead_region || "-"}</p></div>
              <div><strong>Address:</strong>
                <p>{street || "-"}</p>
                <p>{city || "-"}, {state || "-"}</p>
                <p>{pincode || "-"}</p></div>
            </div></div>

          {/* EMAILS */}
          <div className="contact-box">
            <h4>Emails</h4>

            {emails.map((item, index) => (
              <div key={index} className="contact-row">
                <input
                  type="email"
                  value={item.email}
                  placeholder="Enter email"
                  onChange={(e) =>
                    handleEmailChange(index, "email", e.target.value)
                  }
                />
                <button className="connect-btn" onClick={() => handleRemoveEmail(index)}>
                  Remove
                </button>
              </div>
            ))}

            <button className="connect-btn" onClick={handleAddEmail}>
              + Add Email
            </button>
          </div>
          {/* <div><LeadTracking/></div> */}
        </div>

        {/* RIGHT */}
        <div className="lead-right">
          {/* PHONES */}
          <div className="contact-box">
            <div className="view-icon"><h4>Phone Numbers </h4><FiEye
              size={18}
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/leads/${id}/tracking`)}
              title="View Lead"
            /></div>

            {phones.map((item, index) => (
              <div key={index} className="contact-row column">
                <div className="row">
                  <select
                    value={item.type}
                    onChange={(e) =>
                      handlePhoneChange(index, "type", e.target.value)
                    }
                  >
                    <option value="mobile">Mobile</option>
                    <option value="office">Office</option>
                    <option value="home">Home</option>
                  </select>

                  <input
                    type="text"
                    value={item.status === "dnd" ? maskPhone(item.phone) : item.phone}
                    placeholder="Enter phone"
                    disabled={item.status === "dnd"}
                    onChange={(e) =>
                      handlePhoneChange(index, "phone", e.target.value)
                    }
                  />

                </div>

                <select
                  value={item.status}
                  onChange={(e) =>
                    handlePhoneChange(index, "status", e.target.value)
                  }
                >
                  <option value="">New</option>
                  <option value="voicemail">No Contact</option>
                  <option value="callback">Callback Requested</option>
                  <option value="interested">Interested</option>
                  <option value="prospect">Prospect</option>
                  <option value="not-interested">Not Interested</option>
                  <option value="dnd">Do Not Distrub</option>
                </select>

                {/* FOLLOW-UP DATE */}
                {["callback", "interested"].includes(item.status) && (
                  <input
                    type="datetime-local"
                    className="crm-datetime"
                    value={item.followup_date || ""}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) =>
                      handlePhoneChange(index, "followup_date", e.target.value)
                    }
                  />

                )}

                {/* REMARKS */}
                <textarea
                  placeholder="Remarks"
                  required
                  value={item.remarks || ""}
                  onChange={(e) =>
                    handlePhoneChange(index, "remarks", e.target.value)
                  }
                />

                <button className="connect-btn" onClick={() => handleRemovePhone(index)}>
                  Remove
                </button>
              </div>
            ))}

            <button className="connect-btn" onClick={handleAddPhone}>
              + Add Phone
            </button>
          </div>

          <button className="save-btn" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>

    </section>
  );
};
