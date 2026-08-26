import { useState, useEffect } from "react";

const PAGE_SIZE = 5;

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const goto = (p) => {
    const next = Math.max(1, Math.min(totalPages, p));
    onPageChange(next);
  };

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={() => goto(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors disabled:cursor-not-allowed disabled:opacity-40 hover:not-disabled:bg-slate-800/70"
      >
        Previous
      </button>

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => goto(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`h-7 min-w-[1.75rem] rounded-lg px-2 text-xs font-medium transition-colors ${
              page === currentPage
                ? "bg-emerald-500/20 text-emerald-300"
                : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-200"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => goto(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors disabled:cursor-not-allowed disabled:opacity-40 hover:not-disabled:bg-slate-800/70"
      >
        Next
      </button>
    </div>
  );
}

export default function ResultsPanel({ loading, error, data, type }) {
  const [currentPage, setCurrentPage] = useState(1);

  const results = Array.isArray(data?.results) ? data.results : [];
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));

  // Reset to page 1 whenever the underlying result set changes (new query, new type, etc.)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [data, type]);

  // Guard against landing on a page that no longer exists
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageResults = results.slice(startIndex, startIndex + PAGE_SIZE);

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
          {pageResults.map((item, index) => {
            const absoluteIndex = startIndex + index;
            return (
              <li
                key={`${item.sequence?.join("-") || absoluteIndex}-${absoluteIndex}`}
                className="rounded-2xl border border-slate-700/80 bg-slate-950/70 p-3"
              >
                <strong className="mb-1 block text-sm font-semibold text-white">
                  Path {absoluteIndex + 1}
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
            );
          })}
        </ul>
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    );
  }

  if (type === "indirect") {
    return (
      <div className="mt-4">
        <ul className="space-y-3">
          {pageResults.map((item, index) => (
            <li
              key={`${item.distant_player}-${item.connector}-${startIndex + index}`}
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
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    );
  }

  return (
    <div className="mt-4">
      <ul className="space-y-3">
        {pageResults.map((item, index) => (
          <li
            key={`${item.club}-${startIndex + index}`}
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
      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
