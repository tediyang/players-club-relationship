import { NavLink, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ExplorerPage from "./pages/ExplorerPage";

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-300 via-cyan-400 to-sky-500 font-black text-slate-950">
            P
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold tracking-wide text-slate-50">
              Players Club
            </p>
            <small className="text-xs text-slate-400">
              Relationship Explorer
            </small>
          </div>
        </div>

        <nav
          className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/70 p-1"
          aria-label="Main navigation"
        >
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/explore"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            Explore
          </NavLink>
        </nav>
      </header>

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ExplorerPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
