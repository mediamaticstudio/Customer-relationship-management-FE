import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/LeadTracking.css";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config.jsx";


const LeadTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tracking, setTracking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTracking();
  }, [id]);

  const fetchTracking = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/crm/leads/${id}/tracking/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      setTracking(res.data.tracking || []);
      console.log(res.data.tracking)
    } catch (err) {
      navigate(-1);
      toast.error(err.message)
    } finally {
      setLoading(false);
    }
  };


  if (loading) return <p>Loading tracking...</p>;

  return (
    <section className="tracking-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h3>Lead Status Tracking</h3>

      <table className="tracking-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Date</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {tracking.map((item, index) => (
            <tr key={`${item.status}-${index}`}>
              <td data-label="Status">{item.label}</td>
              <td data-label="Date">{item.date || "-"}</td>
              <td data-label="Remarks">{item.remarks || "-"}</td>
            </tr>
          ))}
        </tbody>

      </table>
    </section>
  );
};

export default LeadTracking;
