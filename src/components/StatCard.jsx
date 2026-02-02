export default function StatCard({ title, value = 0, icon, onClick }) {
  return (
    <div className="stat-card" onClick={onClick}>
      <div className="stat-icon">{icon}</div>
      <div>
        <h4>{title}</h4>
        <span>{value}</span>
      </div>
    </div>
  );
}
