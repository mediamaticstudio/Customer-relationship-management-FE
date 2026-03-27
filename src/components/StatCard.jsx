export default function StatCard({ title, value = 0, icon, onClick }) {
  return (
    <div className="stat-card" onClick={onClick}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", width: "100%", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", minWidth: 0, flex: 1 }}>
          <div className="stat-icon" style={{ marginBottom: 0, flexShrink: 0 }}>{icon}</div>
          <h4 style={{ margin: 0, padding: 0, whiteSpace: "normal", lineHeight: 1.2, textAlign: "left", flex: 1, overflowWrap: "break-word", fontSize: "0.6rem" }}>{title}</h4>
        </div>
        <span style={{ margin: 0, padding: 0, flexShrink: 0 }}>{value}</span>
      </div>
    </div>
  );
}
