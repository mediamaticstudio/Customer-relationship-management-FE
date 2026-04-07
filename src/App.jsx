import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";

import { Assigned } from "./Buckets/Assigned";
import Dashboard from "./components/Dashboard";
import { Login } from "./components/Login";
import { LeadData } from "./Buckets/LeadData";
import { ClientPortal } from "./Buckets/ClientPortal";

import { ForgotPassword } from "./components/ForgotPassword";
import { ResetPassword } from "./components/ResetPassword";

import { Settings } from "./configuration/Settings";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddUser from "./configuration/AddUser";
import LeadStatusTracking from "./Buckets/LeadTracking";
import Reports from "./reports/Reports";
import LeadsReports from "./reports/LeadsReports"
import AddLead from "./Buckets/AddLead";
import ASCPerformance from "./reports/ASCPerformance";
import { ContactSupport } from "./components/ContactSupport";
import UserManagement from "./components/UserManagement";
import { ASCLogin } from "./components/ASCLogin";
import ASCCredentialsManager from "./components/ASCCredentialsManager";
import NotFound from "./components/NotFound";
import DynamicRequirementForm from "./components/DynamicRequirementForm";


import { useEffect } from "react";

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/asc-login" element={<ASCLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/user" element={<UserManagement />} />
        <Route path="/assigned" element={<Assigned />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/leads/:id" element={<LeadData />} />
        <Route path="/leads/:id/tracking" element={<LeadStatusTracking />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/adduser" element={<AddUser />} />
        <Route path="/create" element={<AddLead />} />
        <Route path="/client-portal" element={<ClientPortal />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/leadreports" element={<LeadsReports />} />
        <Route path="/reports/asc-performance" element={<ASCPerformance />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/support" element={<ContactSupport />} />
        <Route path="/requirements/:serviceId/:leadId" element={<DynamicRequirementForm />} />
        <Route path="/asc-credentials" element={<ASCCredentialsManager />} />
        {/* Catch-all route for 404 Not Found Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
