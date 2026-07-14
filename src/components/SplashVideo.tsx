// @ts-nocheck
import React, { useEffect, useState, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ReactPlayer from 'react-player';
import { X, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SplashVideo() {
  const [show, setShow] = useState(false);
  const [visible, setVisible] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [mediaType, setMediaType] = useState<'video' | 'image'>('video');
  const [loading, setLoading] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = await getDoc(doc(db, "content", "splash_video"));
        if (docRef.exists()) {
          const data = docRef.data();
          if (data.enabled && data.videoUrl) {
            const type = data.mediaType || 'video';
            setMediaType(type);
            if (type === 'image') {
              setHasInteracted(true);
            }
            let fetchedUrl = data.videoUrl;
            if (fetchedUrl.includes('vimeo.com/manage/videos/')) {
              fetchedUrl = fetchedUrl.replace('manage/videos/', '');
            }
            setVideoUrl(fetchedUrl);
            setShow(true);
            setVisible(true);
            document.body.style.overflow = 'hidden';
            
            if (type === 'image') {
              setTimeout(() => {
                setVisible(false);
                document.body.style.overflow = 'auto';
                setTimeout(() => setShow(false), 500);
              }, 4000); // auto close image after 4 seconds
            }
          }
        } else {
          // Default state if no config saved
          setVideoUrl('https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
          setShow(true);
          setVisible(true);
          document.body.style.overflow = 'hidden';
        }
      } catch (error) {
        console.error("Error fetching splash video config:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const closeSplash = () => {
    setVisible(false);
    document.body.style.overflow = 'auto';
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setTimeout(() => {
      setShow(false);
    }, 500); // Wait for fade out to complete before unmounting
  };

  if (loading) return null;

  return (
    <>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-md flex items-center justify-center p-4 transition-opacity duration-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: visible ? 1 : 0 }}
        >
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
            {!hasInteracted && (
              <div 
                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 cursor-pointer group backdrop-blur-sm transition-all"
                onClick={() => {
                  setHasInteracted(true);
                  if (videoRef.current) {
                    const playPromise = videoRef.current.play();
                    if (playPromise !== undefined) {
                      playPromise.catch(error => {
                        if (error.name !== 'AbortError') {
                          console.error("Native video play error:", error);
                        }
                      });
                    }
                  }
                }}
              >
                <div className="bg-white/20 p-6 rounded-full group-hover:bg-white/30 transition-all transform group-hover:scale-110 mb-4">
                  <Play className="w-12 h-12 text-white ml-2" />
                </div>
                <p className="text-white font-medium text-lg tracking-wider drop-shadow-md">{mediaType === 'image' ? 'Tap to View Splash Image' : 'Tap to Play Splash Video'}</p>
              </div>
            )}

            <div className="relative w-full h-full bg-black flex items-center justify-center">
              {mediaType === 'image' ? (
                <img src={videoUrl} alt="Splash Image" className="w-full h-full object-contain pointer-events-none" />
              ) : videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') || videoUrl.includes('vimeo.com') ? (
                /* @ts-ignore */
                <ReactPlayer
                  url={videoUrl}
                  playing={hasInteracted && visible}
                  muted={false}
                  controls={false}
                  width="100%"
                  height="100%"
                  style={{ pointerEvents: 'none' }}
                  onReady={() => console.log("Video ready")}
                  onStart={() => console.log("Video playing")}
                  onEnded={closeSplash}
                  onError={(e) => console.error("Video player error:", e)}
                  playsinline={true}
                  config={{
                    youtube: {
                      playerVars: { showinfo: 0, rel: 0, autoplay: 1, muted: 0, playsinline: 1, controls: 0 }
                    },
                    vimeo: {
                      playerOptions: { title: 0, byline: 0, portrait: 0, dnt: 1, autopause: 0, playsinline: true, muted: false, autoplay: true }
                    }
                  }}
                />
              ) : (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  playsInline
                  onEnded={closeSplash}
                  onError={(e) => console.error("Native video player error:", e)}
                  className="w-full h-full object-cover pointer-events-none"
                />
              )}
            </div>
            
            <button
              onClick={closeSplash}
              className="absolute top-4 right-4 z-[999] p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}
