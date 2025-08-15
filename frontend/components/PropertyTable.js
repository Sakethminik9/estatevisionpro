export default function PropertyTable({ rows }) {
  return (
    <div className="card p-5 overflow-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Address</th><th>City</th><th>State</th><th>Price</th>
            <th>NOI</th><th>Cap %</th><th>CoC %</th><th>RRR %</th>
            <th>Risk</th><th>AI Score</th><th>Timeline</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.address}</td>
              <td>{r.city}</td>
              <td>{r.state}</td>
              <td>${Number(r.price || 0).toLocaleString()}</td>
              <td>{r.noi ?? "-"}</td>
              <td>{r.cap_rate ?? "-"}</td>
              <td>{r.coc ?? "-"}</td>
              <td>{r.rrr ?? "-"}</td>
              <td>{r.risk_score ?? "-"}</td>
              <td>{r.ai_score ?? "-"}</td>
              <td>{r.timeline_months ? r.timeline_months + " mo" : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
