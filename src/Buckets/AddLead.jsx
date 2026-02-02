import { useState } from "react";
import axios from "axios";
import "../styles/AddLead.css";
import { API_BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";


export default function AddLead() {
  const navigate = useNavigate();  
  const [form, setForm] = useState({
    lead_name: "",
    lead_company: "",
    lead_region: "",
    lead_emails: "",
    lead_phones: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    status: "assigned",
    remarks: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      lead_emails: form.lead_emails
        ? form.lead_emails.split(",").map((e) => e.trim())
        : [],
      lead_phones: form.lead_phones
        ? form.lead_phones.split(",").map((p) => p.trim())
        : [],
    lead_address: {
        street: form.street,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
    },
    status: form.status,
    remarks: form.remarks,
    };

    try {
      await axios.post(`${API_BASE_URL}/leads/create/`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
          "Content-Type": "application/json",
        },
      });

      alert("Lead created successfully");
      setForm({
        lead_name: "",
        lead_company: "",
        lead_region: "",
        lead_emails: "",
        lead_phones: "",
        status: "unassigned",
        remarks: "",
      });
    } catch (err) {
      alert("Error creating lead", err);
    }
  };

  return (
    <div className="lead-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
                  <FiArrowLeft className="back-icon" />
                  <span>Back</span>
                </button>
      <h2>Add New Lead</h2>

      <form className="lead-form" onSubmit={handleSubmit}>
        <div className="left-form">
            <input
          name="lead_name"
          placeholder="Lead Name"
          value={form.lead_name}
          onChange={handleChange}
          required
        />

        <input
          name="lead_company"
          placeholder="Company"
          value={form.lead_company}
          onChange={handleChange}
        />

        <input
          name="lead_region"
          placeholder="Region"
          value={form.lead_region}
          onChange={handleChange}
        />

        <input
          name="lead_emails"
          placeholder="Emails (comma separated)"
          value={form.lead_emails}
          onChange={handleChange}
        />

        <input
          name="lead_phones"
          placeholder="Phones (comma separated)"
          value={form.lead_phones}
          onChange={handleChange}
        />
        </div>
        <div className="right-form">
        {/* <h4 className="section-title">Address</h4> */}
                 <div className="address-row">
                     <input
                name="street"
                placeholder="Street / Area"
                value={form.street}
                onChange={handleChange}
                />

                <input
                name="pincode"
                placeholder="Pincode"
                value={form.pincode}
                onChange={handleChange}
                /></div>     
               
                <div className="address-row">
                <input
                    name="city"
                    placeholder="City"
                    value={form.city}
                    onChange={handleChange}
                />

                <input
                    name="state"
                    placeholder="State"
                    value={form.state}
                    onChange={handleChange}
                />
                </div>
              
             <textarea
          name="remarks"
          placeholder="Remarks"
          value={form.remarks}
          onChange={handleChange}
        />

        

        <button type="submit">Create Lead</button></div>
      </form>
    </div>
  );
}
