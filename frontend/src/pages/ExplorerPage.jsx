import { useEffect, useState } from "react";
import { API_BASE, fetchJson } from "../services/api";
import ResultsPanel from "./ResultsPanel";

export default function ExplorerPage() {
  const [health, setHealth] = useState({ loading: true, connected: false });
  const [pathForm, setPathForm] = useState({ player1: "", player2: "" });
  const [pathResult, setPathResult] = useState({
    loading: false,
    error: "",
    data: null,
  });
  const [indirectForm, setIndirectForm] = useState({ player: "", exclude: "" });
  const [indirectResult, setIndirectResult] = useState({
    loading: false,
    error: "",
    data: null,
  });
  const [squadsResult, setSquadsResult] = useState({
    loading: false,
    error: "",
    data: null,
  });

  const refreshHealth = async () => {
    try {
      const data = await fetchJson(`${API_BASE}/health`);
      setHealth({
        loading: false,
        connected: Boolean(data.database_connected),
      });
    } catch {
      setHealth({ loading: false, connected: false });
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshHealth();
  }, []);

  const submitPath = async (event) => {
    event.preventDefault();
    const player1 = pathForm.player1.trim();
    const player2 = pathForm.player2.trim();

    if (!player1 || !player2) {
      setPathResult({
        loading: false,
        error: "Enter two player names to compare.",
        data: null,
      });
      return;
    }

    setPathResult({ loading: true, error: "", data: null });

    try {
      const data = await fetchJson(
        `${API_BASE}/path?player1=${encodeURIComponent(player1)}&player2=${encodeURIComponent(player2)}`,
      );
      setPathResult({ loading: false, error: "", data });
    } catch (error) {
      setPathResult({ loading: false, error: error.message, data: null });
    }
  };

  const submitIndirect = async (event) => {
    event.preventDefault();
    const player = indirectForm.player.trim();
    const exclude = indirectForm.exclude.trim();

    if (!player || !exclude) {
      setIndirectResult({
        loading: false,
        error: "Enter a player and club name to exclude.",
        data: null,
      });
      return;
    }

    setIndirectResult({ loading: true, error: "", data: null });

    try {
      const data = await fetchJson(
        `${API_BASE}/indirect?player=${encodeURIComponent(player)}&exclude=${encodeURIComponent(exclude)}`,
      );
      setIndirectResult({ loading: false, error: "", data });
    } catch (error) {
      setIndirectResult({ loading: false, error: error.message, data: null });
    }
  };

  const loadSquads = async () => {
    setSquadsResult({ loading: true, error: "", data: null });

    try {
      const data = await fetchJson(`${API_BASE}/squads`);
      setSquadsResult({ loading: false, error: "", data });
    } catch (error) {
      setSquadsResult({ loading: false, error: error.message, data: null });
    }
  };

  return (
    <main className="space-y-6 py-4">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            Query explorer
          </p>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Football relationship queries
          </h1>
        </div>

        <span
          className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide ${
            health.connected
              ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
              : "border-red-400/40 bg-red-500/10 text-red-200"
          }`}
        >
          {health.loading
            ? "Connecting…"
            : health.connected
              ? "Backend connected"
              : "Backend offline"}
        </span>
      </section>

      <div className="space-y-5">
        <article className="rounded-3xl border border-slate-700/80 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/30 sm:p-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white">Shortest path</h2>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
              player-to-player
            </span>
          </div>
          <p className="mb-4 text-sm leading-6 text-slate-300">
            Find the quickest chain connecting two players through shared club
            history.
          </p>

          <form className="space-y-4" onSubmit={submitPath}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-200">
                <span>Player 1</span>
                <input
                  type="text"
                  value={pathForm.player1}
                  onChange={(event) =>
                    setPathForm({ ...pathForm, player1: event.target.value })
                  }
                  placeholder="e.g. Ronaldo"
                  disabled={!health.connected}
                  className="w-full rounded-xl border border-slate-600 bg-slate-950/80 px-3 py-2.5 text-slate-50 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-200">
                <span>Player 2</span>
                <input
                  type="text"
                  value={pathForm.player2}
                  onChange={(event) =>
                    setPathForm({ ...pathForm, player2: event.target.value })
                  }
                  placeholder="e.g. Messi"
                  disabled={!health.connected}
                  className="w-full rounded-xl border border-slate-600 bg-slate-950/80 px-3 py-2.5 text-slate-50 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-300 via-cyan-400 to-sky-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={!health.connected || pathResult.loading}
            >
              {pathResult.loading ? "Loading…" : "Find connection"}
            </button>
          </form>

          <ResultsPanel
            loading={pathResult.loading}
            error={pathResult.error}
            data={pathResult.data}
            type="path"
          />
        </article>

        <article className="rounded-3xl border border-slate-700/80 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/30 sm:p-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white">
              Indirect teammates
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
              club-based search
            </span>
          </div>
          <p className="mb-4 text-sm leading-6 text-slate-300">
            Look for distant players connected to a star player through
            teammates from another club.
          </p>

          <form className="space-y-4" onSubmit={submitIndirect}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-200">
                <span>Player</span>
                <input
                  type="text"
                  value={indirectForm.player}
                  onChange={(event) =>
                    setIndirectForm({
                      ...indirectForm,
                      player: event.target.value,
                    })
                  }
                  placeholder="e.g. Neymar"
                  disabled={!health.connected}
                  className="w-full rounded-xl border border-slate-600 bg-slate-950/80 px-3 py-2.5 text-slate-50 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-200">
                <span>Exclude club</span>
                <input
                  type="text"
                  value={indirectForm.exclude}
                  onChange={(event) =>
                    setIndirectForm({
                      ...indirectForm,
                      exclude: event.target.value,
                    })
                  }
                  placeholder="e.g. Barcelona"
                  disabled={!health.connected}
                  className="w-full rounded-xl border border-slate-600 bg-slate-950/80 px-3 py-2.5 text-slate-50 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-300 via-cyan-400 to-sky-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={!health.connected || indirectResult.loading}
            >
              {indirectResult.loading ? "Loading…" : "Search links"}
            </button>
          </form>

          <ResultsPanel
            loading={indirectResult.loading}
            error={indirectResult.error}
            data={indirectResult.data}
            type="indirect"
          />
        </article>

        <article className="rounded-3xl border border-slate-700/80 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/30 sm:p-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white">Largest squads</h2>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
              top clubs
            </span>
          </div>
          <p className="mb-4 text-sm leading-6 text-slate-300">
            Review the clubs with the highest number of connected players in the
            dataset.
          </p>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-300 via-cyan-400 to-sky-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            onClick={loadSquads}
            disabled={!health.connected || squadsResult.loading}
          >
            {squadsResult.loading ? "Loading…" : "Load clubs"}
          </button>

          <ResultsPanel
            loading={squadsResult.loading}
            error={squadsResult.error}
            data={squadsResult.data}
            type="squads"
          />
        </article>
      </div>
    </main>
  );
}
