export default function ResultsPanel({ loading, error, data, type }) {
  if (loading) {
    return (
      <div className="mt-4 rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
        Loading query results…
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mt-4 rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
        No query has been run yet.
      </div>
    );
  }

  const results = Array.isArray(data.results) ? data.results : [];

  if (results.length === 0) {
    return (
      <div className="mt-4 rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
        {data.message || "No results found for this query."}
      </div>
    );
  }

  if (type === "path") {
    return (
      <div className="mt-4">
        <ul className="space-y-3">
          {results.map((item, index) => (
            <li
              key={`${item.sequence?.join("-") || index}-${index}`}
              className="rounded-2xl border border-slate-700/80 bg-slate-950/70 p-3"
            >
              <strong className="mb-1 block text-sm font-semibold text-white">
                Path {index + 1}
              </strong>
              <span className="block text-sm text-emerald-300">
                {Array.isArray(item.sequence)
                  ? item.sequence.join(" → ")
                  : "No path data"}
              </span>
              <small className="mt-1 block text-xs text-slate-400">
                {item.hops ?? 0} hops
              </small>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (type === "indirect") {
    return (
      <div className="mt-4">
        <ul className="space-y-3">
          {results.map((item, index) => (
            <li
              key={`${item.distant_player}-${item.connector}-${index}`}
              className="rounded-2xl border border-slate-700/80 bg-slate-950/70 p-3"
            >
              <strong className="block text-sm font-semibold text-white">
                {item.distant_player}
              </strong>
              <span className="mt-1 block text-sm text-slate-300">
                Connected by {item.connector}
              </span>
              <small className="mt-1 block text-xs text-slate-400">
                Via {item.via_club}
              </small>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <ul className="space-y-3">
        {results.map((item, index) => (
          <li
            key={`${item.club}-${index}`}
            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-700/80 bg-slate-950/70 p-3"
          >
            <strong className="text-sm font-semibold text-white">
              {item.club}
            </strong>
            <span className="text-sm text-slate-300">
              {item.player_count} players
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
