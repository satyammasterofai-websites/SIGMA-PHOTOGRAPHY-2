import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { Save, Video, Upload, FileVideo, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactPlayer from 'react-player';
import { isFileNameDuplicate, registerFileName } from '../../lib/fileRegistry';

export default function ManageSplashVideo() {
  const [enabled, setEnabled] = useState(false);
  const [videoUrl, setVideoUrl] = useState('https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
  const [mediaType, setMediaType] = useState<'video' | 'image'>('video');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [uploadProvider, setUploadProvider] = useState<'firebase' | 'cloudinary' | 'uguu'>('firebase');
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState('');
  const [cloudinaryUploadPreset, setCloudinaryUploadPreset] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = await getDoc(doc(db, "content", "splash_video"));
        if (docRef.exists()) {
          const data = docRef.data();
          let fetchedUrl = data.videoUrl || 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
          if (fetchedUrl.includes('vimeo.com/manage/videos/')) {
            fetchedUrl = fetchedUrl.replace('manage/videos/', '');
          }
          setEnabled(data.enabled ?? false);
          setVideoUrl(fetchedUrl);
          setUploadProvider(data.uploadProvider || 'firebase');
          setCloudinaryCloudName(data.cloudinaryCloudName || '');
          setCloudinaryUploadPreset(data.cloudinaryUploadPreset || '');
        } else {
          setEnabled(true);
          setVideoUrl('https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
        }
      } catch (error) {
        console.error("Error fetching splash video config:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "content", "splash_video"), {
        enabled,
        videoUrl,
        uploadProvider,
        cloudinaryCloudName,
        cloudinaryUploadPreset
      });
      toast.success("Splash video settings saved!");
    } catch (error) {
      console.error("Error saving splash video config:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/') && !file.type.startsWith('image/')) {
      toast.error('Please select a valid video or image file');
      return;
    }

    if (file.type.startsWith('image/')) {
      setMediaType('image');
    } else {
      setMediaType('video');
    }

    const isDuplicate = await isFileNameDuplicate(file.name);
    if (isDuplicate) {
      toast.error(`A file named "${file.name}" has already been uploaded.`);
      return;
    }

    setUploading(true);
    const toastId = toast.loading(`Uploading ${file.type.startsWith('image/') ? 'image' : 'video'}...`);

    try {
      if (uploadProvider === 'uguu') {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('https://tmpfiles.org/api/v1/upload', {
          method: 'POST',
          body: formData
        });

        if (!res.ok) {
          throw new Error("Temporary upload failed");
        }

        const data = await res.json();
        if (data.status === 'success' && data.data && data.data.url) {
          const finalUrl = data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
          setVideoUrl(finalUrl);
          toast.success("Media uploaded successfully (temporary host)", { id: toastId });
        } else {
          throw new Error("Invalid response from temporary host");
        }
      } else if (uploadProvider === 'cloudinary') {
        if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
          throw new Error("Cloudinary settings are incomplete. Please configure them first.");
        }
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', cloudinaryUploadPreset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/video/upload`, {
          method: 'POST',
          body: formData
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error?.message || "Cloudinary upload failed");
        }

        const data = await res.json();
        setVideoUrl(data.secure_url);
        toast.success("Media uploaded to Cloudinary successfully", { id: toastId });
      } else {
        const storageRef = ref(storage, `splash_videos/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        setVideoUrl(url);
        toast.success("Media uploaded to Firebase successfully", { id: toastId });
      }
      await registerFileName(file.name);
    } catch (error: any) {
      console.error("Error uploading media:", error);
      toast.error(error.message || "Failed to upload media", { id: toastId });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Video className="w-6 h-6 text-indigo-600" />
          Live Preview Video (Splash Screen)
        </h1>
        <button
          onClick={handleSave}
          disabled={saving || uploading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Enable Splash Video</h3>
            <p className="text-sm text-gray-500">Show a full-screen video overlay when users open or refresh the website.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none ring-4 ring-transparent peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-gray-900">Upload Provider Settings</h4>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-gray-500 hover:text-indigo-600 transition-colors"
              title="Configure upload settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {showSettings && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4 mb-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Storage Provider</label>
                <select
                  value={uploadProvider}
                  onChange={(e) => setUploadProvider(e.target.value as 'firebase' | 'cloudinary' | 'uguu')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="firebase">Firebase Storage (Requires setup)</option>
                  <option value="cloudinary">Cloudinary (Free tier available)</option>
                  <option value="uguu">Uguu (Zero setup, Temporary 48h hosting)</option>
                </select>
              </div>

              {uploadProvider === 'cloudinary' && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Cloudinary Cloud Name</label>
                    <input
                      type="text"
                      value={cloudinaryCloudName}
                      onChange={(e) => setCloudinaryCloudName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. dxyz123abc"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Unsigned Upload Preset</label>
                    <input
                      type="text"
                      value={cloudinaryUploadPreset}
                      onChange={(e) => setCloudinaryUploadPreset(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. ml_default"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      You can find or create an unsigned upload preset in your Cloudinary Settings {'>'} Upload.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Upload Media Directly</label>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-900">Click to upload media</p>
              <p className="text-xs text-gray-500 mt-1">MP4, WebM, JPG, PNG, GIF up to 50MB</p>
              <p className="text-xs text-indigo-500 mt-1">Using: {uploadProvider === 'firebase' ? 'Firebase' : uploadProvider === 'cloudinary' ? 'Cloudinary' : 'Uguu (Temporary)'}</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleVideoUpload}
                accept="video/*,image/*"
                className="hidden"
              />
            </div>
            {uploading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 overflow-hidden">
                <div className="bg-indigo-600 h-2.5 rounded-full animate-pulse w-full"></div>
              </div>
            )}
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-4 mb-2">
              <label className="block text-sm font-medium text-gray-700">Media Type:</label>
              <select value={mediaType} onChange={(e) => setMediaType(e.target.value as 'video' | 'image')} className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
                <option value="video">Video</option>
                <option value="image">Image</option>
              </select>
            </div>
            <label className="block text-sm font-medium text-gray-700">{mediaType === 'video' ? 'Video URL (Vimeo, YouTube, or Direct MP4 Link)' : 'Image URL'}</label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => {
                let url = e.target.value;
                if (url.includes('vimeo.com/manage/videos/')) {
                  url = url.replace('manage/videos/', '');
                }
                setVideoUrl(url);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g. https://vimeo.com/1203840674 or https://storage.googleapis.com/.../video.mp4"
            />
            <p className="text-xs text-gray-500">{mediaType === 'video' ? "Video will auto-play on load and will automatically close once completed." : "Image will be shown on load. User can tap to close."}</p>
          </div>
        </div>

        {enabled && videoUrl && (
          <div className="mt-4 border rounded-lg overflow-hidden aspect-video relative bg-black flex items-center justify-center">
            {mediaType === 'image' ? (
              <img src={videoUrl} alt="Splash Preview" className="w-full h-full object-contain" />
            ) : videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') || videoUrl.includes('vimeo.com') ? (
              React.createElement(ReactPlayer as any, {
                url: videoUrl,
                playing: true,
                muted: false,
                controls: true,
                width: "100%",
                height: "100%",
                playsinline: true,
                config: {
                  youtube: {
                    playerVars: { showinfo: 0, rel: 0, autoplay: 1, muted: 0, playsinline: 1 }
                  },
                  vimeo: {
                    playerOptions: { title: 0, byline: 0, portrait: 0 }
                  }
                }
              })
            ) : (
              <video 
                src={videoUrl} 
                className="w-full h-full object-contain"
                controls
                autoPlay
                playsInline
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
