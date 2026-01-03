
import React, { useState, useEffect } from 'react';
import { 
  Link, 
  Wifi, 
  UserCircle, 
  Type as TypeIcon, 
  Mail, 
  Settings2, 
  Palette, 
  Image as ImageIcon,
  ChevronDown,
  Lock,
  Eye,
  AlertCircle,
  HelpCircle,
  Layout,
  History as HistoryIcon,
  MousePointer2,
  Grid,
  Phone,
  Briefcase,
  MapPin,
  Globe,
  AtSign,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { QRConfig, QRType, WifiData, VCardData, EmailData, SavedQR, EyeStyle, DotStyle } from '../types';

interface EditorProps {
  config: QRConfig;
  updateConfig: (updates: Partial<QRConfig>) => void;
  history: SavedQR[];
  onLoadFromHistory: (h: SavedQR) => void;
}

const Tooltip: React.FC<{ children: React.ReactNode; text: string }> = ({ children, text }) => (
  <div className="relative group/tooltip inline-block">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-[10px] text-slate-200 rounded border border-white/10 opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-all duration-200 translate-y-1 group-hover/tooltip:translate-y-0 whitespace-nowrap z-[60] shadow-2xl backdrop-blur-md">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-slate-900"></div>
    </div>
  </div>
);

const InputField = ({ label, icon: Icon, error, tooltip, required, ...props }: any) => (
  <div className="space-y-1.5 w-full">
    <div className="flex justify-between items-center ml-1">
      <div className="flex items-center gap-1">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {label} {required && <span className="text-red-500/80">*</span>}
        </label>
        {tooltip && (
          <Tooltip text={tooltip}>
            <HelpCircle size={10} className="text-slate-600 hover:text-slate-400 cursor-help transition-colors" />
          </Tooltip>
        )}
      </div>
      {error && (
        <span className="text-[10px] text-red-400 font-medium flex items-center gap-1 animate-pulse">
          <AlertCircle size={10} /> {error}
        </span>
      )}
    </div>
    <div className="relative group">
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-red-500' : 'text-slate-500 group-focus-within:text-blue-500'}`}>
        <Icon size={16} />
      </div>
      <input 
        {...props}
        className={`w-full bg-slate-900/40 border rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-slate-700 ${
          error 
            ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500' 
            : 'border-white/5 focus:ring-blue-500/20 focus:border-blue-500/50 hover:bg-slate-900/60'
        }`}
      />
    </div>
  </div>
);

const Editor: React.FC<EditorProps> = ({ config, updateConfig, history, onLoadFromHistory }) => {
  const [activeTab, setActiveTab] = useState<QRType | 'history'>(config.type);
  const [openSection, setOpenSection] = useState<'content' | 'colors' | 'frame' | 'logo' | 'eyes' | 'bodyStyle' | null>('content');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [wifiData, setWifiData] = useState<WifiData>({
    ssid: '',
    password: '',
    encryption: 'WPA',
    hidden: false
  });

  const [vcardData, setVcardData] = useState<VCardData>({
    fullName: '',
    phone: '',
    email: '',
    company: '',
    job: '',
    website: '',
    address: ''
  });

  const [emailData, setEmailData] = useState<EmailData>({
    address: '',
    subject: '',
    body: ''
  });

  const toggleSection = (section: 'content' | 'colors' | 'frame' | 'logo' | 'eyes' | 'bodyStyle') => {
    setOpenSection(prev => prev === section ? null : section);
  };

  useEffect(() => {
    if (activeTab === 'history') return;
    
    let finalValue = config.value;

    if (activeTab === QRType.WIFI) {
      finalValue = `WIFI:S:${wifiData.ssid};T:${wifiData.encryption};P:${wifiData.password};H:${wifiData.hidden ? 'true' : 'false'};;`;
    } else if (activeTab === QRType.VCARD) {
      const nameParts = vcardData.fullName.split(' ');
      const lastName = nameParts.length > 1 ? nameParts.pop() : '';
      const firstName = nameParts.join(' ');
      
      finalValue = `BEGIN:VCARD
VERSION:3.0
N:${lastName};${firstName}
FN:${vcardData.fullName}
ORG:${vcardData.company}
TITLE:${vcardData.job}
ADR;TYPE=WORK:;;${vcardData.address}
TEL;TYPE=CELL:${vcardData.phone}
EMAIL:${vcardData.email}
URL:${vcardData.website}
END:VCARD`;
    } else if (activeTab === QRType.EMAIL) {
      finalValue = `mailto:${emailData.address}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
    }

    if (finalValue !== config.value || activeTab !== config.type) {
      updateConfig({ value: finalValue, type: activeTab as QRType });
    }
  }, [wifiData, vcardData, emailData, activeTab]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Logo file is too large. Max 2MB allowed.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateConfig({ logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-10">
      {/* Type Tabs */}
      <div className="grid grid-cols-6 gap-2 bg-slate-900/60 p-2 rounded-2xl border border-white/5 shadow-inner">
        {[
          { id: QRType.URL, icon: Link, label: 'URL', hint: 'Website Link' },
          { id: QRType.WIFI, icon: Wifi, label: 'Wi-Fi', hint: 'Network Access' },
          { id: QRType.VCARD, icon: UserCircle, label: 'Contact', hint: 'vCard Profile' },
          { id: QRType.EMAIL, icon: Mail, label: 'Email', hint: 'Mail Message' },
          { id: QRType.TEXT, icon: TypeIcon, label: 'Text', hint: 'Plain Text' },
          { id: 'history', icon: HistoryIcon, label: 'Recent', hint: 'Saved Work' },
        ].map((tab) => (
          <Tooltip key={tab.id} text={tab.hint}>
            <button
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex flex-col items-center justify-center gap-2 py-4 rounded-xl transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
            </button>
          </Tooltip>
        ))}
      </div>

      {activeTab === 'history' ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-xs font-bold flex items-center gap-2 text-slate-500 uppercase tracking-widest px-2">
            <HistoryIcon size={14} /> Production History
          </h3>
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02] italic text-slate-600 text-xs">
                History is currently empty.
              </div>
            ) : (
              history.map((h) => (
                <button
                  key={h.id}
                  onClick={() => onLoadFromHistory(h)}
                  className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all flex items-center justify-between group"
                >
                  <div className="truncate pr-4">
                    <p className="text-xs font-bold text-slate-200 truncate mb-1">{h.config.value}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{new Date(h.timestamp).toLocaleString()}</p>
                  </div>
                  <MousePointer2 size={16} className="text-slate-600 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Section: Content Details */}
          <div className="glass rounded-[2rem] overflow-hidden">
            <button className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors" onClick={() => toggleSection('content')}>
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl transition-all ${openSection === 'content' ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400'}`}>
                  <Settings2 size={20} />
                </div>
                <span className="font-bold text-sm tracking-tight">Content Parameters</span>
              </div>
              <ChevronDown size={20} className={`text-slate-600 transition-transform duration-300 ${openSection === 'content' ? 'rotate-180' : ''}`} />
            </button>
            <div className={`p-6 pt-0 space-y-5 ${openSection === 'content' ? 'block' : 'hidden'}`}>
              <div className="h-[1px] w-full bg-white/5 mb-6"></div>
              
              {activeTab === QRType.URL && (
                <InputField 
                  label="Network Destination" 
                  icon={Link} 
                  placeholder="https://example.com" 
                  value={config.value} 
                  onChange={(e: any) => updateConfig({ value: e.target.value })} 
                />
              )}

              {activeTab === QRType.WIFI && (
                <div className="space-y-5">
                  <InputField label="SSID Name" icon={Wifi} value={wifiData.ssid} onChange={(e: any) => setWifiData(p => ({...p, ssid: e.target.value}))} />
                  <InputField label="Access Key" icon={Lock} type="password" value={wifiData.password} onChange={(e: any) => setWifiData(p => ({...p, password: e.target.value}))} />
                </div>
              )}

              {activeTab === QRType.VCARD && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
                  <div className="md:col-span-2">
                    <InputField label="Full Name" icon={UserCircle} required placeholder="John Doe" value={vcardData.fullName} onChange={(e: any) => setVcardData(p => ({...p, fullName: e.target.value}))} />
                  </div>
                  <InputField label="Mobile Number" icon={Phone} required placeholder="+1 234 567 890" value={vcardData.phone} onChange={(e: any) => setVcardData(p => ({...p, phone: e.target.value}))} />
                  <InputField label="Email" icon={AtSign} placeholder="john@example.com" value={vcardData.email} onChange={(e: any) => setVcardData(p => ({...p, email: e.target.value}))} />
                  <InputField label="Company" icon={Briefcase} placeholder="Acme Corp" value={vcardData.company} onChange={(e: any) => setVcardData(p => ({...p, company: e.target.value}))} />
                  <InputField label="Job Title" icon={TypeIcon} placeholder="Product Designer" value={vcardData.job} onChange={(e: any) => setVcardData(p => ({...p, job: e.target.value}))} />
                  <div className="md:col-span-2">
                    <InputField label="Website / Portfolio" icon={Globe} placeholder="www.johndoe.design" value={vcardData.website} onChange={(e: any) => setVcardData(p => ({...p, website: e.target.value}))} />
                  </div>
                  <div className="md:col-span-2">
                    <InputField label="Location / Address" icon={MapPin} placeholder="San Francisco, CA" value={vcardData.address} onChange={(e: any) => setVcardData(p => ({...p, address: e.target.value}))} />
                  </div>
                </div>
              )}

              {activeTab === QRType.EMAIL && (
                <div className="space-y-5">
                  <InputField label="Recipient" icon={Mail} placeholder="support@example.com" value={emailData.address} onChange={(e: any) => setEmailData(p => ({...p, address: e.target.value}))} />
                  <InputField label="Subject" icon={TypeIcon} placeholder="Inquiry about services" value={emailData.subject} onChange={(e: any) => setEmailData(p => ({...p, subject: e.target.value}))} />
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Body Message</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-4 text-slate-500 group-focus-within:text-blue-500">
                        <MessageSquare size={16} />
                      </div>
                      <textarea 
                        className="w-full bg-slate-900/40 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 h-28 focus:outline-none transition-all placeholder:text-slate-700"
                        placeholder="Hi, I'm interested in..."
                        value={emailData.body}
                        onChange={(e) => setEmailData(p => ({...p, body: e.target.value}))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === QRType.TEXT && (
                <textarea 
                  className="w-full bg-slate-900/40 border border-white/5 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500/20 h-32 focus:outline-none transition-all placeholder:text-slate-700" 
                  placeholder="Enter raw data or notes..."
                  value={config.value} 
                  onChange={(e) => updateConfig({ value: e.target.value })} 
                />
              )}
            </div>
          </div>

          {/* Section: Frame */}
          <div className="glass rounded-[2rem] overflow-hidden">
            <button className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors" onClick={() => toggleSection('frame')}>
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl transition-all ${openSection === 'frame' ? 'bg-pink-600 text-white' : 'bg-white/5 text-slate-400'}`}>
                  <Layout size={20} />
                </div>
                <span className="font-bold text-sm tracking-tight">Visual Framing</span>
              </div>
              <ChevronDown size={20} className={`text-slate-600 transition-transform duration-300 ${openSection === 'frame' ? 'rotate-180' : ''}`} />
            </button>
            <div className={`p-6 pt-0 space-y-6 ${openSection === 'frame' ? 'block' : 'hidden'}`}>
              <div className="h-[1px] w-full bg-white/5 mb-6"></div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Display Frame</span>
                <button 
                  onClick={() => updateConfig({ includeFrame: !config.includeFrame })}
                  className={`w-12 h-6 rounded-full transition-all relative ${config.includeFrame ? 'bg-blue-600' : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${config.includeFrame ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
              {config.includeFrame && (
                <div className="space-y-5 animate-in fade-in slide-in-from-top-2">
                  <InputField label="Call to Action" icon={TypeIcon} value={config.frameText} onChange={(e: any) => updateConfig({ frameText: e.target.value })} />
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Surface</label>
                      <div className="p-2 bg-slate-950/50 rounded-xl border border-white/5 flex items-center gap-3">
                        <input type="color" className="w-8 h-8 bg-transparent cursor-pointer rounded-lg border-0" value={config.frameColor} onChange={(e) => updateConfig({ frameColor: e.target.value })} />
                        <span className="text-[10px] font-mono text-slate-400">{config.frameColor}</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Typeface</label>
                      <div className="p-2 bg-slate-950/50 rounded-xl border border-white/5 flex items-center gap-3">
                        <input type="color" className="w-8 h-8 bg-transparent cursor-pointer rounded-lg border-0" value={config.frameTextColor} onChange={(e) => updateConfig({ frameTextColor: e.target.value })} />
                        <span className="text-[10px] font-mono text-slate-400">{config.frameTextColor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section: Corner Markers (Simplified) */}
          <div className="glass rounded-[2rem] overflow-hidden">
            <button className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors" onClick={() => toggleSection('eyes')}>
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl transition-all ${openSection === 'eyes' ? 'bg-orange-600 text-white' : 'bg-white/5 text-slate-400'}`}>
                  <Eye size={20} />
                </div>
                <span className="font-bold text-sm tracking-tight">Corner Markers</span>
              </div>
              <ChevronDown size={20} className={`text-slate-600 transition-transform duration-300 ${openSection === 'eyes' ? 'rotate-180' : ''}`} />
            </button>
            <div className={`p-6 pt-0 space-y-6 ${openSection === 'eyes' ? 'block' : 'hidden'}`}>
               <div className="h-[1px] w-full bg-white/5 mb-6"></div>
               
               <div className="flex items-center justify-between px-1">
                 <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Style Mode</label>
                 <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest px-3 py-1 bg-orange-600/10 rounded-full border border-orange-600/20">Classic Square</span>
               </div>
               
               <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider ml-1">Marker Color</label>
                  <div className="flex items-center gap-4 bg-slate-950/50 p-3 rounded-2xl border border-white/5">
                    <input type="color" value={config.eyeColor} onChange={(e) => updateConfig({ eyeColor: e.target.value })} className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border-0" />
                    <span className="text-xs font-mono text-slate-300 uppercase font-bold tracking-widest">{config.eyeColor}</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Section: Body Style */}
          <div className="glass rounded-[2rem] overflow-hidden">
            <button className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors" onClick={() => toggleSection('bodyStyle')}>
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl transition-all ${openSection === 'bodyStyle' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400'}`}>
                  <Grid size={20} />
                </div>
                <span className="font-bold text-sm tracking-tight">Body Architecture</span>
              </div>
              <ChevronDown size={20} className={`text-slate-600 transition-transform duration-300 ${openSection === 'bodyStyle' ? 'rotate-180' : ''}`} />
            </button>
            <div className={`p-6 pt-0 space-y-6 ${openSection === 'bodyStyle' ? 'block' : 'hidden'}`}>
               <div className="h-[1px] w-full bg-white/5 mb-6"></div>
               
               <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Dot Shape</label>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] px-3 py-1 bg-indigo-600/10 rounded-full border border-indigo-600/20">Standard Square</span>
                 </div>
                 <p className="text-[11px] text-slate-500 leading-relaxed italic">Maximum scan reliability and professional aesthetic retained via standard square architecture.</p>
               </div>

               <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-blue-400" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cyberpunk Animation</span>
                </div>
                <button 
                  onClick={() => updateConfig({ animate: !config.animate })}
                  className={`w-10 h-5 rounded-full transition-all relative ${config.animate ? 'bg-indigo-600' : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${config.animate ? 'left-5.5' : 'left-0.5'}`}></div>
                </button>
              </div>

               <div className="space-y-3">
                 <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider ml-1">Fill Mode</label>
                 <div className="flex gap-2 p-1 bg-slate-950/60 rounded-2xl border border-white/5">
                   {(['solid', 'gradient'] as DotStyle[]).map((style) => (
                     <button 
                      key={style}
                      onClick={() => updateConfig({ dotStyle: style })}
                      className={`flex-1 py-3 text-[10px] font-bold rounded-xl transition-all uppercase tracking-widest ${config.dotStyle === style ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                     >
                       {style}
                     </button>
                   ))}
                 </div>
               </div>

               {config.dotStyle === 'gradient' && (
                 <div className="animate-in fade-in slide-in-from-top-2 space-y-3">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider ml-1">Secondary Gradient Color</label>
                      <div className="flex items-center gap-4 bg-slate-950/50 p-3 rounded-2xl border border-white/5">
                        <input type="color" value={config.fgGradientColor} onChange={(e) => updateConfig({ fgGradientColor: e.target.value })} className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border-0" />
                        <span className="text-xs font-mono text-slate-300 uppercase font-bold tracking-widest">{config.fgGradientColor}</span>
                      </div>
                    </div>
                 </div>
               )}
            </div>
          </div>

          {/* Section: Colors */}
          <div className="glass rounded-[2rem] overflow-hidden">
            <button className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors" onClick={() => toggleSection('colors')}>
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl transition-all ${openSection === 'colors' ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400'}`}>
                  <Palette size={20} />
                </div>
                <span className="font-bold text-sm tracking-tight">Color Palette</span>
              </div>
              <ChevronDown size={20} className={`text-slate-600 transition-transform duration-300 ${openSection === 'colors' ? 'rotate-180' : ''}`} />
            </button>
            <div className={`p-6 pt-0 space-y-6 ${openSection === 'colors' ? 'block' : 'hidden'}`}>
              <div className="h-[1px] w-full bg-white/5 mb-6"></div>
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider ml-1">Main Theme</label>
                  <div className="p-3 bg-slate-950/50 rounded-2xl border border-white/5 flex flex-col items-center gap-2">
                    <input type="color" value={config.fgColor} onChange={(e) => updateConfig({ fgColor: e.target.value })} className="w-full h-12 rounded-xl bg-transparent cursor-pointer border-0" />
                    <span className="text-[10px] font-mono text-slate-400 font-bold">{config.fgColor}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider ml-1">Surface</label>
                   <div className="p-3 bg-slate-950/50 rounded-2xl border border-white/5 flex flex-col items-center gap-2">
                    <input type="color" value={config.bgColor} onChange={(e) => updateConfig({ bgColor: e.target.value })} className="w-full h-12 rounded-xl bg-transparent cursor-pointer border-0" />
                    <span className="text-[10px] font-mono text-slate-400 font-bold">{config.bgColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Logo */}
          <div className="glass rounded-[2rem] overflow-hidden">
            <button className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors" onClick={() => toggleSection('logo')}>
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl transition-all ${openSection === 'logo' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-400'}`}>
                  <ImageIcon size={20} />
                </div>
                <span className="font-bold text-sm tracking-tight">Identity Overlay</span>
              </div>
              <ChevronDown size={20} className={`text-slate-600 transition-transform duration-300 ${openSection === 'logo' ? 'rotate-180' : ''}`} />
            </button>
            <div className={`p-6 pt-0 space-y-6 ${openSection === 'logo' ? 'block' : 'hidden'}`}>
              <div className="h-[1px] w-full bg-white/5 mb-6"></div>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-3xl border border-dashed border-white/10 bg-slate-950/50 flex items-center justify-center overflow-hidden group/logo hover:border-blue-500/30 transition-all">
                  {config.logoUrl ? (
                    <img src={config.logoUrl} className="w-full h-full object-contain p-3" alt="Identity" />
                  ) : (
                    <ImageIcon className="text-slate-800" size={32} />
                  )}
                </div>
                <div className="flex-grow flex flex-col gap-3">
                  <input type="file" id="logo-upload" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  <label htmlFor="logo-upload" className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-center cursor-pointer hover:bg-white/10 transition-all hover:border-white/20">Select Identifier</label>
                  {config.logoUrl && (
                    <button onClick={() => updateConfig({ logoUrl: undefined })} className="text-[10px] font-bold text-red-500/70 hover:text-red-500 uppercase tracking-widest text-left ml-1">Remove Overlay</button>
                  )}
                </div>
              </div>

              {config.logoUrl && (
                <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Overlay scale</label>
                      <span className="text-[10px] font-mono text-slate-300 font-bold">{config.logoSize}%</span>
                    </div>
                    <input type="range" min="10" max="35" step="1" className="w-full accent-emerald-600 h-1 bg-white/5 rounded-full appearance-none cursor-pointer" value={config.logoSize} onChange={(e) => updateConfig({ logoSize: parseInt(e.target.value) })} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Luminance</label>
                      <span className="text-[10px] font-mono text-slate-300 font-bold">{Math.round(config.logoOpacity * 100)}%</span>
                    </div>
                    <input type="range" min="0.1" max="1" step="0.1" className="w-full accent-emerald-600 h-1 bg-white/5 rounded-full appearance-none cursor-pointer" value={config.logoOpacity} onChange={(e) => updateConfig({ logoOpacity: parseFloat(e.target.value) })} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
