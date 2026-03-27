# Analytics Dashboard - Implementation Guide

## Overview
The new Analytics Dashboard provides comprehensive lead analytics with bucket-level graphs, date range filtering, and multiple time period views.

## Features Implemented

### 1. **Bucket-Level Graphs**
- **Doughnut Chart**: Shows distribution of leads across all status buckets
- **Bar Chart**: Compares lead counts across different statuses
- All 10 lead statuses are tracked:
  - Unassigned
  - Assigned
  - Second Attempt
  - Third Attempt
  - Completed
  - Follow Up
  - Prospect
  - Deal Won
  - Deal Lost
  - DND

### 2. **Date Range Calendar**
- **From Date**: Start date for analytics period
- **To Date**: End date for analytics period
- Uses React DatePicker for intuitive date selection
- Validates date ranges (end date cannot be before start date)
- Maximum end date is today

### 3. **Time Period Views**
- **Daily View**: Shows daily lead trends
- **Weekly View**: Aggregates data by week
- **Yearly View**: Shows monthly breakdown for the year

### 4. **Interactive Charts**
- **Trend Line Chart**: Visualizes lead generation trends over time
- **Summary Cards**: Quick stats for Total Leads, Deal Won, and In Progress
- **Detailed Table**: Bucket-wise statistics with percentages and progress bars

## API Endpoints Required

The dashboard expects the following API endpoints (currently using mock data if unavailable):

### 1. Bucket Analytics
```
GET /crm/analytics/buckets/
Parameters:
  - start_date: YYYY-MM-DD
  - end_date: YYYY-MM-DD
  - period: daily|weekly|yearly

Response:
{
  "bucket_counts": {
    "unassigned": 45,
    "assigned": 120,
    "second-attempt": 32,
    ...
  },
  "total": 496
}
```

### 2. Trend Analytics
```
GET /crm/analytics/trends/
Parameters:
  - start_date: YYYY-MM-DD
  - end_date: YYYY-MM-DD
  - period: daily|weekly|yearly

Response:
{
  "trends": [
    { "date": "2026-01-01", "count": 45 },
    { "date": "2026-01-02", "count": 52 },
    ...
  ]
}
```

## Usage

### Accessing the Dashboard
Navigate to `/dashboard` route. The analytics dashboard is now the default dashboard view.

### Filtering Data
1. Select **From Date** using the calendar picker
2. Select **To Date** using the calendar picker
3. Choose **Time Period** from dropdown (Daily/Weekly/Yearly)
4. Click **Refresh Data** to update charts

### Understanding the Charts

#### Summary Cards
- **Total Leads**: All leads in the selected period
- **Deal Won**: Successfully converted leads
- **In Progress**: Sum of Assigned, Follow Up, and Prospect leads

#### Trend Chart
- Line chart showing lead generation over time
- X-axis: Time periods based on selected view
- Y-axis: Number of leads

#### Distribution Charts
- **Doughnut**: Visual percentage breakdown
- **Bar Chart**: Side-by-side comparison

#### Details Table
- Complete breakdown with exact counts
- Percentage of total
- Visual progress bars

## Customization

### Colors
Each bucket has a unique color defined in `BUCKET_STATUSES`:
```javascript
{ value: "deal-won", label: "Deal Won", color: "#059669" }
```

### Chart Options
Modify chart appearance in the component:
- `chartOptions`: For Bar and Line charts
- `doughnutOptions`: For Doughnut chart

## Responsive Design
- **Desktop**: Full grid layout with all charts visible
- **Tablet**: Single column layout
- **Mobile**: Optimized for small screens with stacked cards

## Dependencies
- `react-chartjs-2`: Chart rendering
- `chart.js`: Chart library
- `react-datepicker`: Date selection
- `axios`: API calls
- `react-icons`: Icons

## File Structure
```
src/
├── components/
│   └── AnalyticsDashboard.jsx    # Main dashboard component
├── styles/
│   └── AnalyticsDashboard.css    # Dashboard styles
└── App.jsx                        # Route configuration
```

## Next Steps

### Backend Integration
1. Implement the two API endpoints mentioned above
2. Update API_BASE_URL in config.jsx
3. Remove mock data fallback from AnalyticsDashboard.jsx

### Enhancements
- Add export functionality (PDF/Excel)
- Add real-time updates
- Add comparison with previous periods
- Add agent-wise performance metrics
- Add custom date presets (Last 7 days, Last 30 days, etc.)
