import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE, fetchJson } from "../services/api";

export default function LandingPage() {
  const [dbStatus, setDbStatus] = useState({ loading: true, connected: false });

  useEffect(() => {
    let ignore = false;

    fetchJson(`${API_BASE}/health`)
      .then((data) => {
        if (!ignore) {
          setDbStatus({
            loading: false,
            connected: Boolean(data.database_connected),
          });
        }
      })
      .catch(() => {
        if (!ignore) {
          setDbStatus({ loading: false, connected: false });
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="space-y-8 pt-4">
      <section className="grid gap-8 overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/40 lg:grid-cols-[1.4fr_0.8fr] lg:p-8">
        <div className="space-y-6">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${
              dbStatus.connected
                ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                : "border-red-400/40 bg-red-500/10 text-red-200"
            }`}
          >
            {dbStatus.loading
              ? "Checking backend…"
              : dbStatus.connected
                ? "Database online"
                : "Database unavailable"}
          </span>

          <div className="space-y-4">
            <h1 className="max-w-xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Connect the players, clubs, and stories behind the game.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Explore football relationships across clubs and teammates to
              understand who played with whom, how chains connect, and which
              squads were most populated.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/explore"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-300 via-cyan-400 to-sky-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5"
            >
              Get started
            </Link>
            <a
              href="https://github.com/tediyang/players-club-relationship"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-slate-600 bg-slate-900/60 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-slate-800"
            >
              Learn more
            </a>
          </div>
        </div>

        <div
          className="grid gap-4 self-center"
          aria-label="Relationship overview"
        >
          {[
            ["Path", "Shortest player connection"],
            ["Indirect", "Shared club teammates"],
            ["Squads", "Largest club rosters"],
          ].map(([title, text]) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-700/80 bg-slate-950/80 p-4"
            >
              <strong className="block text-2xl font-bold text-white">
                {title}
              </strong>
              <span className="mt-1 block text-sm text-slate-300">{text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            number: "01",
            title: "Trace a connection",
            description:
              "Find the shortest relationship chain between any two players.",
          },
          {
            number: "02",
            title: "Uncover distant links",
            description:
              "See which players are connected through teammates and shared club history.",
          },
          {
            number: "03",
            title: "Spot club scale",
            description:
              "Rank the clubs with the heaviest concentration of connected players.",
          },
        ].map((feature) => (
          <article
            key={feature.number}
            className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-5"
          >
            <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-sm font-bold text-emerald-300">
              {feature.number}
            </div>
            <h2 className="mb-2 text-xl font-semibold text-white">
              {feature.title}
            </h2>
            <p className="text-sm leading-6 text-slate-300">
              {feature.description}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
