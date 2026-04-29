import { formatTime } from "../utils/simulation";

export default function MetricsPanel({ metrics, events }) {
  return (
    <section className="panel">
      <h2>Architecture + Flow</h2>
      <div className="metrics">
        <div className="metricCard">
          <small>Current Throughput</small>
          <strong>{metrics.totalRps} RPS</strong>
        </div>
        <div className="metricCard">
          <small>Path Latency (avg)</small>
          <strong>{metrics.averageLatency} ms</strong>
        </div>
        <div className="metricCard">
          <small>Unhealthy Blocks</small>
          <strong>{metrics.failedCount}</strong>
        </div>
        <div className="metricCard">
          <small>Stability Score</small>
          <strong>{metrics.resilienceScore}/100</strong>
        </div>
      </div>
      <h3>Build / Flow Events</h3>
      <div className="events">
        {events.map((event) => (
          <p key={event.id}>
            <span>{formatTime(event.at)}</span> {event.message}
          </p>
        ))}
      </div>
    </section>
  );
}
