
import React, { useRef, useState, useEffect } from 'react';
import { Download, Printer, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import QRCodeStyling from 'qr-code-styling';
import { QRConfig } from '../types';

interface PreviewProps {
  config: QRConfig;
  onSave: () => void;
}

const Preview: React.FC<PreviewProps> = ({ config, onSave }) => {
  const designRef = useRef<HTMLDivElement>(null);
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const fgColor = config.fgColor || '#000000';
  const bgColor = config.bgColor || '#ffffff';
  const eyeColor = config.eyeColor || fgColor;

  // Use a slightly smaller base size to ensure it fits common laptop heights
  const QR_SIZE = 280;

  useEffect(() => {
    if (!qrCodeRef.current) {
      qrCodeRef.current = new QRCodeStyling({
        width: QR_SIZE,
        height: QR_SIZE,
        type: 'canvas',
        data: config.value || ' ',
        dotsOptions: { color: fgColor, type: 'square' },
        backgroundOptions: { color: bgColor },
        imageOptions: { crossOrigin: 'anonymous', margin: 8 }
      });
      if (qrContainerRef.current) {
        qrCodeRef.current.append(qrContainerRef.current);
      }
    }
  }, []);

  useEffect(() => {
    if (!qrCodeRef.current || !config.value) return;

    let cornersSquareType: any = 'square';
    let cornersDotType: any = 'square';

    if (config.eyeStyle === 'rounded') {
      cornersSquareType = 'extra-rounded';
      cornersDotType = 'square';
    } else if (config.eyeStyle === 'dots') {
      cornersSquareType = 'dot';
      cornersDotType = 'dot';
    }

    const options: any = {
      data: config.value,
      width: QR_SIZE,
      height: QR_SIZE,
      qrOptions: {
        errorCorrectionLevel: config.level,
      },
      dotsOptions: {
        type: 'square',
        color: fgColor,
      },
      backgroundOptions: {
        color: bgColor,
      },
      cornersSquareOptions: {
        type: cornersSquareType,
        color: eyeColor,
      },
      cornersDotOptions: {
        type: cornersDotType,
        color: eyeColor,
      },
      image: config.logoUrl,
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: config.logoSize / 100,
        opacity: config.logoOpacity,
        crossOrigin: 'anonymous',
        margin: 5
      }
    };

    if (config.dotStyle === 'gradient') {
      options.dotsOptions.gradient = {
        type: 'linear',
        rotation: 45,
        colorStops: [
          { offset: 0, color: fgColor },
          { offset: 1, color: config.fgGradientColor }
        ]
      };
    }

    qrCodeRef.current.update(options);
  }, [config, fgColor, bgColor, eyeColor]);

  const downloadPNG = async () => {
    if (!config.value || !designRef.current) return;
    setIsCapturing(true);
    await new Promise(r => setTimeout(r, 250));

    try {
      // Temporarily disable animation class for capture if necessary
      // But html2canvas captures the current frame, so we're good.
      const canvas = await html2canvas(designRef.current, {
        backgroundColor: null,
        scale: 4, 
        useCORS: true,
        logging: false,
      });
      
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-studio-pro-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onSave(); 
    } catch (err) {
      console.error('Capture failed', err);
    } finally {
      setIsCapturing(false);
    }
  };

  const isInvalid = !config.value || config.value.trim() === '';

  return (
    <div className="flex flex-col items-center justify-center h-full max-h-full w-full gap-8 transition-all animate-in zoom-in-95 duration-700">
      
      {/* Premium Preview Stage */}
      <div className="relative group flex justify-center">
        {/* Intense Neon Backdrop Glow */}
        <div 
          className={`absolute inset-0 bg-gradient-to-tr blur-[120px] transition-all duration-1000 
            ${isInvalid ? 'from-red-600/40 to-orange-600/40 opacity-15' : 'from-blue-600/50 to-indigo-600/50 opacity-20'}
            ${!isInvalid && config.animate ? 'animate-pulse-glow' : ''}`}
        ></div>
        
        <div className="glass p-8 lg:p-10 rounded-[3.5rem] border border-white/10 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.6)] relative z-10 flex flex-col items-center transform transition-transform duration-500 hover:scale-[1.02]">
          
          <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-slate-900/90 border border-white/10 rounded-full flex items-center gap-2 whitespace-nowrap backdrop-blur-3xl shadow-2xl">
            {isInvalid ? (
               <>
                <AlertTriangle size={12} className="text-orange-500" />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-orange-400">Offline</span>
               </>
            ) : (
              <>
                <Sparkles size={12} className="text-yellow-400" />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-300">Master Production Stage</span>
              </>
            )}
          </div>

          <div 
            ref={designRef} 
            className="p-1 mt-8 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500"
            style={{ 
              backgroundColor: config.includeFrame ? config.frameColor : 'transparent',
              padding: config.includeFrame ? '30px 30px 60px 30px' : '0'
            }}
          >
            <div className={`relative transition-all duration-700 p-8 flex items-center justify-center 
                 ${isInvalid ? 'bg-slate-900/40 grayscale opacity-20' : 'bg-white shadow-2xl'}
                 ${!isInvalid && config.animate ? 'animate-shimmer' : ''}`}
                 style={{ 
                   backgroundColor: bgColor, 
                   borderRadius: config.includeFrame ? '1.2rem' : '2.2rem',
                   width: `${QR_SIZE + 40}px`,
                   height: `${QR_SIZE + 40}px`
                 }}>
               {isInvalid ? (
                 <div className="flex flex-col items-center justify-center gap-4 text-slate-700">
                    <AlertTriangle size={48} strokeWidth={1.5} className="animate-pulse" />
                    <p className="text-[9px] font-bold text-center px-8 uppercase tracking-[0.3em] leading-relaxed opacity-50">Configuring...</p>
                 </div>
               ) : (
                 <div ref={qrContainerRef} className="qr-container relative z-10" style={{ width: `${QR_SIZE}px`, height: `${QR_SIZE}px` }}>
                    {/* Rendered Canvas */}
                 </div>
               )}
            </div>
            
            {config.includeFrame && !isInvalid && (
              <div className="mt-6 flex flex-col items-center justify-center text-center">
                <p className="text-2xl font-black uppercase tracking-[0.1em] italic leading-none" 
                   style={{ color: config.frameTextColor }}>
                  {config.frameText}
                </p>
                <p className="mt-2 text-[8px] font-bold opacity-40 uppercase tracking-[0.4em]" style={{ color: config.frameTextColor }}>
                  Professional Engine
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 px-6 py-2 bg-slate-950/60 border border-white/5 rounded-2xl flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isInvalid ? 'bg-orange-500' : 'bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}></div>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.4em]">SRV_{config.type}_ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Persistent Control Interface */}
      <div className="w-full max-w-sm flex flex-col gap-5">
        <button 
          onClick={downloadPNG}
          disabled={isInvalid || isCapturing}
          className="w-full py-5 rounded-[1.5rem] font-bold flex items-center justify-center gap-4 shadow-xl transition-all text-lg group bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/40 hover:translate-y-[-2px] active:translate-y-[1px] text-white disabled:bg-slate-900 disabled:text-slate-700 disabled:hover:translate-y-0 disabled:shadow-none border border-white/5"
        >
          {isCapturing ? <Loader2 className="animate-spin" size={24} /> : <Download size={24} className="group-hover:-translate-y-1 transition-transform" />}
          <span className="tracking-tight">{isCapturing ? 'Generating Master...' : 'Export Studio Assets'}</span>
        </button>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => onSave()}
            disabled={isInvalid}
            className={`py-4 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all bg-white/[0.03] hover:bg-white/[0.08] active:scale-95 ${isInvalid && 'opacity-20 pointer-events-none'}`}
          >
            <Sparkles size={16} className="text-yellow-400" /> Save Config
          </button>
          <button 
            onClick={() => window.print()}
            disabled={isInvalid}
            className={`py-4 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all bg-white/[0.03] hover:bg-white/[0.08] active:scale-95 ${isInvalid && 'opacity-20 pointer-events-none'}`}
          >
            <Printer size={16} className="text-blue-400" /> Print Master
          </button>
        </div>
      </div>
    </div>
  );
};

export default Preview;
