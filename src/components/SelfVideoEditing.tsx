import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Play, Pause, RotateCcw, Maximize, Download, X, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';


const FILTERS = [
  { id: 'none', label: 'Normal', css: 'none' },
  { id: 'vintage', label: 'Vintage', css: 'sepia(50%) contrast(110%) brightness(90%)' },
  { id: 'soft-glow', label: 'Soft Glow', css: 'brightness(110%) contrast(90%) saturate(80%)' },
  { id: 'bw', label: 'Black & White', css: 'grayscale(100%)' },
  { id: 'cinema', label: 'Cinematic', css: 'contrast(120%) saturate(120%) brightness(90%)' },
];

export default function SelfVideoEditing() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [userTexts, setUserTexts] = useState<Record<string, string>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('none');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      const q = query(collection(db, 'settings', 'data', 'selfVideoTemplates'), where('published', '==', true));
      const snap = await getDocs(q);
      setTemplates(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchTemplates();
  }, []);

  const openEditor = (template: any) => {
    const defaultTexts: Record<string, string> = {};
    if (template.textFields) {
      template.textFields.forEach((tf: any) => {
        defaultTexts[tf.id] = tf.defaultText;
      });
    }
    setUserTexts(defaultTexts);
    setSelectedTemplate(template);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const closeEditor = () => {
    setSelectedTemplate(null);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const restart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    setCurrentTime(0);
    if (!isPlaying) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [selectedTemplate]);

  const handleExport = async () => {
    if (!videoRef.current || !selectedTemplate) return;
    setIsExporting(true);
    setExportProgress(0);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset video to start
    video.pause();
    video.currentTime = 0;
    setIsPlaying(false);

    // We'll use MediaRecorder on the canvas stream
    const stream = canvas.captureStream(30);
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, { mimeType: 'video/mp4' });
    } catch (e) {
      recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    }

    const chunks: Blob[] = [];
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: recorder.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invitation_${Date.now()}.${recorder.mimeType.includes('mp4') ? 'mp4' : 'webm'}`;
      a.click();
      URL.revokeObjectURL(url);
      setIsExporting(false);
      setExportProgress(0);
    };

    recorder.start();

    // Render loop
    const duration = video.duration || 10;
    const drawFrame = () => {
      if (video.currentTime >= duration || video.ended) {
        recorder.stop();
        return;
      }
      
      ctx.filter = selectedFilter === 'none' ? 'none' : FILTERS.find(f => f.id === selectedFilter)?.css || 'none';
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.filter = 'none';
      
      // Draw text overlays
      selectedTemplate.textFields?.forEach((tf: any) => {
        if (video.currentTime >= tf.startTime && video.currentTime <= tf.endTime) {
          ctx.save();
          
          let opacity = 1;
          if (tf.animation === 'fade') {
            const fadeInEnd = tf.startTime + 0.5;
            const fadeOutStart = tf.endTime - 0.5;
            if (video.currentTime < fadeInEnd) {
              opacity = (video.currentTime - tf.startTime) / 0.5;
            } else if (video.currentTime > fadeOutStart) {
              opacity = (tf.endTime - video.currentTime) / 0.5;
            }
          }
          
          ctx.globalAlpha = opacity;
          ctx.font = `bold ${tf.fontSize * (canvas.width / 1000)}px ${tf.fontFamily || 'sans-serif'}`;
          ctx.fillStyle = tf.color || '#fff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          let x = (tf.x / 100) * canvas.width;
          let y = (tf.y / 100) * canvas.height;
          
          if (tf.animation === 'slide-up') {
            const slideEnd = tf.startTime + 0.5;
            if (video.currentTime < slideEnd) {
              y += 50 * (1 - (video.currentTime - tf.startTime) / 0.5);
              opacity = (video.currentTime - tf.startTime) / 0.5;
              ctx.globalAlpha = opacity;
            }
          }
          
          const text = userTexts[tf.id] || tf.defaultText;
          ctx.fillText(text, x, y);
          ctx.restore();
        }
      });

      setExportProgress(Math.min(99, Math.round((video.currentTime / duration) * 100)));
      requestAnimationFrame(drawFrame);
    };

    video.play().then(() => {
      drawFrame();
    }).catch(e => {
      console.error("Export video play error:", e);
      setIsExporting(false);
      alert("Failed to play video. Ensure the video source is valid and supported.");
    });
  };

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-display font-bold text-brand-navy mb-4">
          Self <span className="text-gradient-primary">Video Editing</span>
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Personalize premium invitation video templates instantly. Just edit the text and export your HD video directly from your browser.
        </p>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-brand-purple/10 shadow-sm">
          <p className="text-gray-500 text-lg">No video templates available at the moment. Please check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(t => (
          <motion.div 
            key={t.id}
            whileHover={{ y: -5 }}
            className="bg-white rounded-3xl overflow-hidden shadow-sm border border-brand-purple/10 cursor-pointer group"
            onClick={() => openEditor(t)}
          >
            <div className="aspect-video relative overflow-hidden bg-gray-100">
              {t.thumbnailUrl ? (
                <img src={t.thumbnailUrl} alt={t.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Preview</div>
              )}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-full text-brand-purple">
                  <Play className="w-6 h-6 fill-current" />
                </div>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg text-brand-navy flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-brand-purple" /> {t.title}
              </h3>
            </div>
          </motion.div>
        ))}
        </div>
      )}

      <AnimatePresence>
        {selectedTemplate && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl"
            >
              <div className="flex-1 bg-black relative" ref={containerRef}>
                <video 
                  ref={videoRef}
                  src={selectedTemplate.videoUrl || undefined} 
                  playsInline 
                  crossOrigin="anonymous"
                  className="w-full h-full object-contain"
                  style={{ filter: selectedFilter === 'none' ? 'none' : FILTERS.find(f => f.id === selectedFilter)?.css }}
                />
                
                {/* Text Overlays */}
                {selectedTemplate.textFields?.map((tf: any) => {
                  const isVisible = currentTime >= tf.startTime && currentTime <= tf.endTime;
                  if (!isVisible) return null;
                  
                  let animationClass = '';
                  if (tf.animation === 'fade') animationClass = 'animate-fade-in-out';
                  if (tf.animation === 'slide-up') animationClass = 'animate-slide-up';
                  if (tf.animation === 'scale') animationClass = 'animate-scale';

                  return (
                    <div 
                      key={tf.id}
                      className={`absolute whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2 pointer-events-none drop-shadow-lg ${animationClass}`}
                      style={{
                        left: `${tf.x}%`,
                        top: `${tf.y}%`,
                        fontSize: `calc(${tf.fontSize}px * (100vw / 1280))`, // basic scaling
                        fontFamily: tf.fontFamily,
                        color: tf.color,
                        zIndex: 10
                      }}
                    >
                      {userTexts[tf.id] || tf.defaultText}
                    </div>
                  );
                })}

                {/* Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-center justify-center gap-4 text-white">
                  <button onClick={restart} className="p-2 hover:bg-white/20 rounded-full transition-colors"><RotateCcw className="w-5 h-5" /></button>
                  <button onClick={togglePlay} className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm">
                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                  </button>
                  <button onClick={toggleFullScreen} className="p-2 hover:bg-white/20 rounded-full transition-colors"><Maximize className="w-5 h-5" /></button>
                </div>
                
                {isExporting && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 text-white">
                    <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mb-4"></div>
                    <h3 className="text-xl font-bold mb-2">Rendering Video...</h3>
                    <div className="w-64 bg-gray-800 rounded-full h-2 mb-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-brand-pink to-brand-purple h-full transition-all duration-300" style={{ width: `${exportProgress}%` }}></div>
                    </div>
                    <p className="text-gray-400 text-sm">Please do not close this window</p>
                  </div>
                )}
              </div>

              <div className="w-full md:w-80 bg-gray-50 flex flex-col max-h-[500px] md:max-h-none">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
                  <h3 className="font-bold text-brand-navy">Personalize</h3>
                  <button onClick={closeEditor} className="text-gray-500 hover:text-gray-800 p-1"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-4 flex-1 overflow-y-auto space-y-4">
                  {selectedTemplate.textFields?.map((tf: any) => (
                    <div key={tf.id}>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{tf.label}</label>
                      <input 
                        type="text" 
                        value={userTexts[tf.id] || ''}
                        onChange={(e) => setUserTexts({ ...userTexts, [tf.id]: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-brand-navy focus:ring-2 focus:ring-brand-purple/20 outline-none transition-shadow"
                      />
                    </div>
                  ))}
                </div>
                
                <div className="p-4 bg-white border-t border-gray-200">
                  <h4 className="font-bold text-sm text-gray-700 mb-3">Color Filter</h4>
                  <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {FILTERS.map(f => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFilter(f.id)}
                        className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedFilter === f.id ? 'bg-brand-purple text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-white border-t border-gray-200">
                  <button 
                    onClick={handleExport}
                    disabled={isExporting}
                    className="w-full py-3 bg-gradient-to-r from-brand-pink to-brand-purple text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Download className="w-5 h-5" /> Export Video
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
