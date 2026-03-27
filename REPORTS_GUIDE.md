# Tabbed Reports Interface - Implementation Guide

## 🎯 Overview

Based on your Dashboard & Reports access matrix, I've created a comprehensive **Tabbed Reports Interface** with role-based access control and extensive filtering capabilities.

## ✅ Features Implemented

### 1. **Multiple Report Tabs**

#### Tab Structure (Role-Based Access):

| Tab Name | Available For | Description |
|----------|--------------|-------------|
| **Overview** | SuperAdmin, Admin, Supervisor | High-level statistics and KPIs |
| **Lead Reports** | SuperAdmin, Admin, Supervisor | Detailed lead-level data |
| **Agent Performance** | SuperAdmin, Admin, Supervisor | Agent-wise performance metrics |
| **Disposition Wise** | SuperAdmin, Admin, Supervisor | Breakdown by disposition types |
| **Campaign Wise** | SuperAdmin, Admin | Campaign performance analysis |
| **ASC Wise** | SuperAdmin only | ASC center-wise breakdown |

### 2. **Comprehensive Filters**

Based on the access matrix, filters are role-specific:

#### SuperAdmin Filters:
- ✅ Calendar (From Date - To Date)
- ✅ ASC Code (Multi-Select)
- ✅ ASC Name (Multi-Select)
- ✅ ASC Location (Multi-Select)
- ✅ Services (Multi-Select)
- ✅ Campaign (Multi-Select)
- ✅ Supervisor (Multi-Select)
- ✅ Agent (Multi-Select)
- ✅ Disposition (Multi-Select)

#### Admin/Supervisor Filters:
- ✅ Calendar (From Date - To Date)
- ✅ Services (Multi-Select)
- ✅ Campaign (Multi-Select)
- ✅ Supervisor (Multi-Select - Admin only)
- ✅ Agent (Multi-Select)
- ✅ Disposition (Multi-Select)

### 3. **Report Types**

#### Overview Tab
- Total Leads
- Assigned Leads
- Completed Leads
- Deal Won
- Deal Lost
- In Progress

#### Lead Reports Tab
- Lead ID
- Name
- Company
- Status
- Assigned Agent

#### Agent Performance Tab
- Agent Name
- Assigned Count
- Completed Count
- Deal Won Count
- Conversion Rate

#### Disposition Wise Tab
- Disposition Type
- Count
- Percentage
- Visual Progress Bar

#### Campaign Wise Tab
- Campaign Name
- Total Leads
- Deal Won
- ROI Percentage

#### ASC Wise Tab
- ASC Code
- ASC Name
- Location
- Total Leads
- Deal Won

## 📁 Files Created

1. **`src/components/ReportsTabbed.jsx`** - Main tabbed reports component
2. **`src/styles/ReportsTabbed.css`** - Comprehensive styling

## 📝 Files Modified

1. **`src/App.jsx`** - Updated `/reports` route to use ReportsTabbed

## 🎨 UI Features

### Tab Navigation
- Horizontal tab bar with active state highlighting
- Smooth transitions between tabs
- Responsive design (scrollable on mobile)

### Filters
- Collapsible filter section
- Multi-select dropdowns with search
- Date range pickers
- Clear and Apply buttons

### Data Display
- Clean, professional tables
- Color-coded status badges
- Progress bars for percentages
- Hover effects for better UX

### Export
- Export button in header (ready for implementation)

## 🔧 API Integration

### Expected API Endpoint

```
GET /crm/reports/
```

### Query Parameters:
```javascript
{
  start_date: "2026-01-01",
  end_date: "2026-02-02",
  report_type: "overview|lead-reports|agent-performance|disposition-wise|campaign-wise|asc-wise",
  asc_codes: ["ASC001", "ASC002"],
  asc_names: ["Mumbai Center"],
  locations: ["Mumbai", "Delhi"],
  services: ["Service1", "Service2"],
  campaigns: ["Campaign1"],
  supervisors: [1, 2],
  agents: [5, 6, 7],
  dispositions: ["Interested", "Not Interested"]
}
```

### Expected Response Format:

#### Overview Tab:
```json
{
  "total_leads": 1250,
  "assigned": 450,
  "completed": 320,
  "deal_won": 180,
  "deal_lost": 95,
  "in_progress": 205
}
```

#### Lead Reports Tab:
```json
{
  "leads": [
    {
      "id": 1,
      "name": "John Doe",
      "company": "ABC Corp",
      "status": "Deal Won",
      "agent": "Agent 1"
    }
  ]
}
```

#### Agent Performance Tab:
```json
{
  "agents": [
    {
      "name": "Agent 1",
      "assigned": 45,
      "completed": 32,
      "deal_won": 18,
      "conversion_rate": "40%"
    }
  ]
}
```

#### Disposition Wise Tab:
```json
{
  "dispositions": [
    {
      "disposition": "Interested",
      "count": 120,
      "percentage": "35%"
    }
  ]
}
```

#### Campaign Wise Tab:
```json
{
  "campaigns": [
    {
      "name": "Summer Campaign",
      "leads": 250,
      "deal_won": 85,
      "roi": "34%"
    }
  ]
}
```

#### ASC Wise Tab:
```json
{
  "ascs": [
    {
      "code": "ASC001",
      "name": "Mumbai Center",
      "location": "Mumbai",
      "leads": 450,
      "deal_won": 180
    }
  ]
}
```

### Filter Options Endpoint

```
GET /crm/filter-options/
```

Response:
```json
{
  "asc_codes": ["ASC001", "ASC002", "ASC003"],
  "asc_names": ["Mumbai Center", "Delhi Center"],
  "locations": ["Mumbai", "Delhi", "Bangalore"],
  "services": ["Service A", "Service B"],
  "campaigns": ["Campaign 1", "Campaign 2"],
  "supervisors": [
    { "id": 1, "name": "Supervisor 1" },
    { "id": 2, "name": "Supervisor 2" }
  ],
  "agents": [
    { "id": 5, "name": "Agent 1" },
    { "id": 6, "name": "Agent 2" }
  ],
  "dispositions": ["Interested", "Not Interested", "Call Back", "Wrong Number"]
}
```

## 🚀 How to Use

### 1. Access Reports
- Navigate to `/reports` in your application
- The interface will show tabs based on your role

### 2. Select a Tab
- Click on any tab to view that report type
- Data will load automatically

### 3. Apply Filters
- Select date range using calendar pickers
- Choose options from multi-select dropdowns
- Click "Apply Filters" to refresh data
- Click "Clear Filters" to reset all selections

### 4. Export Data
- Click "Export Report" button (implementation pending)

## 🎨 Role-Based Access

The component automatically shows/hides tabs based on user role:

```javascript
// SuperAdmin sees all 6 tabs
// Admin sees 5 tabs (no ASC Wise)
// Supervisor sees 4 tabs (no Campaign Wise, no ASC Wise)
```

Filters are also role-specific:
- SuperAdmin: All filters including ASC-related
- Admin: All except ASC-related
- Supervisor: Limited to agent and disposition filters

## 📱 Responsive Design

- **Desktop**: Full tab bar, side-by-side filters
- **Tablet**: Scrollable tabs, stacked filters
- **Mobile**: 
  - Hamburger menu for sidebar
  - Vertical tab list
  - Single column filters
  - Stacked table rows with labels

## 🎯 Current Status

- ✅ UI fully functional
- ✅ Tab navigation working
- ✅ Filters implemented
- ✅ Role-based access control
- ✅ Mock data for demonstration
- ⏳ Backend API integration needed

## 🔄 Next Steps

### Backend Integration:
1. Implement `/crm/reports/` endpoint
2. Implement `/crm/filter-options/` endpoint
3. Remove mock data from component

### Enhancements:
- Add export to PDF functionality
- Add export to Excel functionality
- Add date range presets (Last 7 days, Last 30 days, etc.)
- Add real-time data refresh
- Add pagination for large datasets
- Add sorting on table columns
- Add search within tables

## 🐛 Troubleshooting

### Tabs not showing?
- Check user role in localStorage
- Verify role matches expected values (SUPERADMIN, ADMIN, SUPERVISOR)

### Filters not working?
- Check browser console for errors
- Verify react-select is installed
- Check API endpoint responses

### Data not loading?
- Currently using mock data
- Check console for API errors
- Verify authentication token

## 📊 Access Matrix Compliance

This implementation follows the access matrix from your image:

| Feature | MediaMatic Studio | ASC Management | Supervisor |
|---------|------------------|----------------|------------|
| Calendar | ✅ YES | ✅ YES | ✅ YES |
| ASC Code | ✅ YES | Auto-populate | Auto-populate |
| ASC Name | ✅ YES | Auto-populate | Auto-populate |
| ASC Location | ✅ YES | Auto-populate | Auto-populate |
| Services | ✅ YES | Auto-populate | Auto-populate |
| Campaign | ✅ YES | Auto-populate | Auto-populate |
| Supervisor | ✅ YES | Auto-populate | Auto-populate |
| Agent | Auto-populate | ✅ YES | ✅ YES |
| Disposition | Auto-populate | Auto-populate | Auto-populate |

## 💡 Tips

1. **Performance**: Use pagination for large datasets
2. **UX**: Add loading states for better feedback
3. **Export**: Implement server-side export for large reports
4. **Caching**: Cache filter options to reduce API calls
5. **Validation**: Add date range validation (max 1 year, etc.)

---

**Your tabbed reports interface is ready to use! 📊✨**
