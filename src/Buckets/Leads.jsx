import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiMenu, FiX, FiRotateCcw } from "react-icons/fi";
import { Sidebar } from "../components/Sidebar";
import { API_BASE_URL } from "../config.jsx";


const API_URL = `${API_BASE_URL}/crm/get/lead/`; // change if needed

export const Leads = () => {
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user_role = localStorage.getItem("role");
  console.log(user_role)
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFromUrl = searchParams.get("status") || "assigned";
  const [selectedStatus, setSelectedStatus] = useState(statusFromUrl);
  useEffect(() => {
    setSearchParams({ status: selectedStatus });
  }, [selectedStatus, setSearchParams]);

  // const token = localStorage.getItem("token"); 

  /* ===============================
     GET LEAD
  =============================== */
  const fetchLead = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });

      setLead(res.data.data);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.info("No leads available");
      } else {
        toast.error("Something went wrong");
      }
      setLead(null);
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     ASSIGN LEAD
  =============================== */
  const assignLead = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        API_URL,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      if (res.data.already_assigned) {
        toast.warning(res.data.message || "You already have a lead");
      } else if (res.data.status === "Fail") {
        toast.warning(res.data.message || "Limit reached");
      } else {
        toast.success(res.data.message || "Lead assigned successfully");
        fetchLead(); // refresh lead data
      }
    } catch (error) {
      toast.error("Unable to assign lead", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, []);

  return (
    <section className="assigned-leads">
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <FiX /> : <FiMenu />}
      </button>
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <Sidebar
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />
      </aside>

      <main className="main">
        <div className="content">
          <div>
            {loading && <p>Loading...</p>}

            {!loading && !lead && (
              <p style={{ color: "gray" }}>No lead available</p>
            )}

            {lead && (
              <div>
                <div onClick={() => navigate(`/leads/${lead.lead_id}`)}>
                  <p><b>Name:</b> {lead.lead_name}</p>
                  <p><b>Company:</b> {lead.lead_company}</p>
                  <p><b>Designation:</b> {lead.lead_designation}</p>
                </div>
                <button
                  onClick={assignLead}
                  disabled={loading}
                >
                  Get Lead
                </button>
              </div>

            )}

          </div>
        </div>
      </main>
    </section>

  );
};

// export default Leads;

