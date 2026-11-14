import { useState, useEffect } from 'react';
import { TacticalAcademy } from './components/TacticalAcademy';
import { MatchSimulator, MatchTelemetry } from './components/MatchSimulator';
import { TileTracker } from './components/TileTracker';
import { PrinciplesLibrary } from './components/PrinciplesLibrary';
import { useLanguage } from './i18n/LanguageContext';
import { Brain, Play, BarChart2, BookOpen, Layers, Sun, Moon, Languages } from 'lucide-react';

const formatClock = (seconds: number): string => {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
};

export function App() {
  const { lang, toggleLang, tr } = useLanguage();
  const [activeTab, setActiveTab] = useState<'academy' | 'simulator' | 'tracker' | 'library'>('simulator');
  const [telemetry, setTelemetry] = useState<MatchTelemetry>({
    scores: [0, 0],
    targetScore: 200,
    handNumber: 1,
    roundSeconds: 0,
  });
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('domino-theme') as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-mode');
    } else {
      root.classList.remove('light-mode');
    }
    localStorage.setItem('domino-theme', theme);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'light' ? '#f8fafc' : '#0d1527');
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <div className="min-h-[100dvh] felt-texture text-slate-100 flex flex-col transition-colors duration-200">
      {/* Top Floating Glass Navigation Bar */}
      <header className="border-b border-white/[0.08] bg-black/45 backdrop-blur-2xl sticky top-0 z-50 pt-[env(safe-area-inset-top,0px)] transition-colors duration-200 shadow-xl">
        <div className="max-w-[1700px] mx-auto px-3 sm:px-6 py-2 sm:py-0 sm:h-16 flex items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-0.5 shadow-lg shadow-amber-500/25 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              </div>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-sm sm:text-base font-black tracking-wider text-white truncate">
                DOMINÓ MAESTRO
              </h1>
              <svg
                viewBox="0 0 30 20"
                className="w-4 h-2.5 rounded-[2px] shadow-sm inline-block shrink-0 border border-white/20"
                aria-label={tr('Bandera de la República Dominicana', 'Flag of the Dominican Republic')}
              >
                <rect width="30" height="20" fill="#ffffff" />
                <rect x="0" y="0" width="13" height="8" fill="#002d62" />
                <rect x="17" y="0" width="13" height="8" fill="#ce1126" />
                <rect x="0" y="12" width="13" height="8" fill="#ce1126" />
                <rect x="17" y="12" width="13" height="8" fill="#002d62" />
                <circle cx="15" cy="10" r="1.4" fill="#006847" />
              </svg>
            </div>
          </div>

          {/* Center Tournament Score Telemetry */}
          <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md shadow-inner">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-[10px] tracking-wider flex items-center gap-1.5 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {tr('EN VIVO', 'LIVE')}
            </span>
            <div className="text-center font-mono">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block -mb-0.5">
                {tr(`Nosotros / Ellos (Meta ${telemetry.targetScore})`, `Us / Them (Target ${telemetry.targetScore})`)}
              </span>
              <span data-testid="header-live-score" className="text-sm font-black text-white">
                {telemetry.scores[0]} - {telemetry.scores[1]}
              </span>
            </div>
            <div className="text-center font-mono border-l border-white/10 pl-4">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block -mb-0.5">
                {tr('Mano / Tiempo', 'Hand / Time')}
              </span>
              <span data-testid="header-round-timer" className="text-xs font-bold text-amber-300">
                #{telemetry.handNumber} • {formatClock(telemetry.roundSeconds)}
              </span>
            </div>
          </div>

          {/* Minimal Navigation Switches + Language & Theme Toggles */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <nav className="flex items-center gap-1 sm:gap-1.5">
              <button
                onClick={() => setActiveTab('simulator')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'simulator'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/25'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>{tr('Mesa', 'Table')}</span>
              </button>

              <button
                onClick={() => setActiveTab('academy')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'academy'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/25'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tr('Academia', 'Academy')}</span>
              </button>

              <button
                onClick={() => setActiveTab('tracker')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'tracker'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/25'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tr('Matriz 28', '28 Matrix')}</span>
              </button>

              <button
                onClick={() => setActiveTab('library')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'library'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/25'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tr('Doctrina', 'Doctrine')}</span>
              </button>
            </nav>

            <button
              type="button"
              data-testid="lang-toggle"
              onClick={toggleLang}
              className="px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-black tracking-wider text-amber-300 hover:text-white hover:border-amber-400/50 transition flex items-center gap-1"
              title={tr('Switch to English (EN)', 'Cambiar a Español (ES)')}
              aria-label={tr('Switch to English (EN)', 'Cambiar a Español (ES)')}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{lang.toUpperCase()}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-black/40 border border-white/10 text-slate-300 hover:text-white transition"
              title={tr('Cambiar tema', 'Toggle theme')}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content View */}
      <main className={`flex-1 w-full mx-auto pb-[ calc(1rem+env(safe-area-inset-bottom,0px)) ] ${
        activeTab === 'simulator'
          ? 'max-w-[1700px] px-2 sm:px-4 py-2 sm:py-4'
          : 'max-w-7xl px-2.5 sm:px-6 lg:px-8 py-3 sm:py-6'
      }`}>
        {activeTab === 'academy' && <TacticalAcademy />}
        {activeTab === 'simulator' && <MatchSimulator onTelemetryChange={setTelemetry} />}
        {activeTab === 'tracker' && <TileTracker />}
        {activeTab === 'library' && <PrinciplesLibrary />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 bg-slate-950 text-slate-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {tr(
              'Material educativo original sobre estrategia de dominó.',
              'Original educational material on competitive domino strategy.'
            )}
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
