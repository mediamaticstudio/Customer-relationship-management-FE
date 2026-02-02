import { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

const getColors = () => {
  const css = getComputedStyle(document.documentElement);
  return {
    dark: css.getPropertyValue("--primary-dark").trim(),
    mid: css.getPropertyValue("--primary-mid").trim(),
    light: css.getPropertyValue("--primary-light").trim(),
    textDark: css.getPropertyValue("--text-dark").trim(),
    border: css.getPropertyValue("--border-soft").trim(),
  };
};

const chartDataMap = {
  daily: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    data: [5, 9, 6, 12, 8, 4, 10],
  },
  weekly: {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    data: [45, 52, 39, 60],
  },
  monthly: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    data: [120, 98, 135, 160, 145, 170, 20, 80, 120, 160, 200, 60],
  },
};

export default function BarChart() {
  const [view, setView] = useState("daily");
  const COLORS = getColors();

  const chartData = {
    labels: chartDataMap[view].labels,
    datasets: [
      {
        label: "Leads",
        data: chartDataMap[view].data,
        backgroundColor: COLORS.mid,
        borderColor: COLORS.dark,
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: COLORS.light,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: COLORS.textDark },
      },
    },
    scales: {
      x: {
        ticks: { color: COLORS.textDark },
        grid: { color: COLORS.border },
      },
      y: {
        ticks: { color: COLORS.textDark },
        grid: { color: COLORS.border },
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "100%", display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-dark)', margin: 0 }}>Performance Overview</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-dark)', opacity: 0.6, margin: '4px 0 0 0' }}>
            Tracking {view} lead generation trends
          </p>
        </div>

        <select
          value={view}
          onChange={(e) => setView(e.target.value)}
          style={{
            padding: "10px 16px",
            borderRadius: "12px",
            background: "var(--card-bg)",
            color: "var(--text-dark)",
            border: "2px solid var(--border-soft)",
            fontWeight: "600",
            cursor: "pointer",
            outline: "none",
            boxShadow: "var(--shadow-soft)",
            transition: "all 0.3s ease"
          }}
        >
          <option value="daily">Daily View</option>
          <option value="weekly">Weekly View</option>
          <option value="monthly">Monthly View</option>
        </select>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <Bar data={chartData} options={{ ...options, maintainAspectRatio: false }} />
      </div>
    </div>
  );
}
