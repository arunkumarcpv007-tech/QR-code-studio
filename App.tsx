
import React, { useState, useEffect } from 'react';
import { 
  Zap,
} from 'lucide-react';
import { QRConfig, QRType, SavedQR } from './types';
import Editor from './components/Editor';
import Preview from './components/Preview';

const HISTORY_KEY = 'qr_studio_pro_history';

const App: React.FC = () => {
  const [config, setConfig] = useState<QRConfig>({
    type: QRType.URL,
    value: 'https://google.com',
    fgColor: '#000000',
    fgGradientColor: '#3b82f6',
    dotStyle: 'solid',
    dotShape: 'square',
    bgColor: '#ffffff',
    logoSize: 20,
    logoOpacity: 1,
    includeFrame: false,
    frameText: 'SCAN ME',
    frameColor: '#3b82f6',
    frameTextColor: '#ffffff',
    eyeStyle: 'square',
    eyeColor: '#000000',
    level: 'H',
    animate: true
  });

  const [history, setHistory] = useState<SavedQR[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history");
      }
    }
  }, []);

  const updateConfig = (updates: Partial<QRConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const saveToHistory = (newConfig: QRConfig) => {
    const newEntry: SavedQR = {
      id: Math.random().toString(36).substr(2, 9),
      config: { ...newConfig },
      timestamp: Date.now()
    };
    const updatedHistory = [newEntry, ...history.filter(h => h.config.value !== newConfig.value)].slice(0, 5);
    setHistory(updatedHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  };

  return (
    <div className="h-screen w-full flex bg-[#020617] text-slate-100 overflow-hidden font-display selection:bg-blue-500/30">
      
      {/* Left Sidebar: Controls - Fixed Width & Internal Scroll */}
      <aside className="w-[420px] h-full flex flex-col border-r border-white/5 bg-slate-950/40 backdrop-blur-3xl z-20">
        <header className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">QR Studio</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Configurator v2.5</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-8 space-y-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Studio Interface</h2>
            <p className="text-slate-500 text-xs leading-relaxed">Configure precision digital gateways.</p>
          </div>
          <Editor 
            config={config} 
            updateConfig={updateConfig} 
            history={history}
            onLoadFromHistory={(h) => setConfig(h.config)}
          />
          <div className="pb-12" /> {/* Bottom spacer for scroll */}
        </div>

        <footer className="p-6 border-t border-white/5 bg-slate-950/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Production Ready</span>
          </div>
        </footer>
      </aside>

      {/* Right Stage: Workspace - Never Scrolls, Auto-fits */}
      <main className="flex-1 h-full relative overflow-hidden flex flex-col items-center justify-center bg-[#01040a]">
        
        {/* Spotlight Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-600/5 blur-[150px] rounded-full"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
        </div>

        <div className="w-full h-full p-8 lg:p-12 xl:p-20 flex flex-col items-center justify-center z-10">
          <Preview config={config} onSave={() => saveToHistory(config)} />
        </div>

      </main>
    </div>
  );
};

export default App;
