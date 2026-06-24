// @ts-nocheck
import React, { useEffect, useState, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ReactPlayer from 'react-player';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SplashVideo() {
  const [show, setShow] = useState(false);
  const [visible, setVisible] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = await getDoc(doc(db, "content", "splash_video"));
        if (docRef.exists()) {
          const data = docRef.data();
          if (data.enabled && data.videoUrl) {
            let fetchedUrl = data.videoUrl;
            if (fetchedUrl.includes('vimeo.com/manage/videos/')) {
              fetchedUrl = fetchedUrl.replace('manage/videos/', '');
            }
            setVideoUrl(fetchedUrl);
            setShow(true);
            setVisible(true);
            document.body.style.overflow = 'hidden';
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
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') || videoUrl.includes('vimeo.com') ? (
                /* @ts-ignore */
                <ReactPlayer
                  url={videoUrl}
                  playing={true}
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
                      playerOptions: { title: 0, byline: 0, portrait: 0, dnt: 1, autopause: 0 }
                    }
                  }}
                />
              ) : (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  autoPlay
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
