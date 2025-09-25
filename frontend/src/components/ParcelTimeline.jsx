import  formatDateTime  from "../utils/format";


export default function ParcelTimeline({ history = [] }) {
  if (!history || history.length === 0) {
    return <div className="text-sm text-gray-500">No timeline available.</div>;
  }

  return (
    <ol className="border-l-2 border-gray-200 pl-4">
      {history.map((ev, idx) => (
        <li key={idx} className="mb-4">
          <div className="text-xs text-gray-500">{formatDateTime(ev.occurred_at)}</div>
          <div className="font-medium">{ev.status}</div>
          {ev.message && <div className="text-sm text-gray-700">{ev.message}</div>}
        </li>
      ))}
    </ol>
  );
}


