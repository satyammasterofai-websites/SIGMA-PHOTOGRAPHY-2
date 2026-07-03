import React, { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { fileToBase64HD } from "../../lib/utils";
import { Trash2, Plus, Image as ImageIcon, Link } from "lucide-react";
import toast from "react-hot-toast";
import { isFileNameDuplicate, registerFileName } from '../../lib/fileRegistry';

export default function ManageBanners() {
  const [banners, setBanners] = useState<any[]>([]);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "banners"),
      (snapshot) => {
        setBanners(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (error) => {
        console.error("Error fetching banners:", error);
      },
    );
    return () => unsub();
  }, []);

  const addBannerFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const isDuplicate = await isFileNameDuplicate(file.name);
      if (isDuplicate) {
        toast.error(`A file named "${file.name}" has already been uploaded.`);
        return;
      }

      const toastId = toast.loading("Processing and uploading HD banner...");
      try {
        const base64Url = await fileToBase64HD(file);
        
        // Ensure payload size is within Firestore 1MB limits approx
        if (base64Url.length > 1048487) {
            toast.error("File is too large even after compression. Please use the Direct Image Link option.", { id: toastId });
            return;
        }

        await registerFileName(file.name);
        const id = Date.now().toString();
        await setDoc(doc(db, "banners", id), { image: base64Url, active: true });
        toast.success("HD Banner added successfully", { id: toastId });
      } catch (err: any) {
        console.error("Upload Error:", err);
        toast.error("Failed to add banner: " + err.message, { id: toastId });
      }
    }
  };

  const addBannerUrl = async () => {
    if (!imageUrl) {
      toast.error("Please enter a valid image URL");
      return;
    }
    const toastId = toast.loading("Adding banner via URL...");
    try {
      const id = Date.now().toString();
      let finalUrl = imageUrl;

      // Auto-convert Google Drive viewing links to direct download links
      if (imageUrl.includes("drive.google.com/file/d/")) {
        const fileIdMatch = imageUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (fileIdMatch && fileIdMatch[1]) {
          finalUrl = `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
        }
      } else if (imageUrl.includes("drive.google.com/open?id=")) {
        const fileIdMatch = imageUrl.match(/id=([a-zA-Z0-9_-]+)/);
        if (fileIdMatch && fileIdMatch[1]) {
          finalUrl = `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
        }
      }

      await setDoc(doc(db, "banners", id), { image: finalUrl, active: true });
      setImageUrl("");
      toast.success("Banner added via URL", { id: toastId });
    } catch (err: any) {
      toast.error("Failed to add banner via URL", { id: toastId });
    }
  };

  const deleteBanner = async (id: string) => {
    try {
      await deleteDoc(doc(db, "banners", id));
      toast.success("Banner deleted");
    } catch (e) {
      toast.error("Failed to delete banner");
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-brand-navy">
          Banner Management
        </h1>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8 flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Option 1: Add via Direct Image Link (e.g. ImgBB)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Link className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste direct URL (No Google Drive)..."
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <button
              onClick={addBannerUrl}
              className="bg-indigo-500 hover:bg-indigo-600 justify-center text-white px-6 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap"
            >
              Add Link
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            * Use services like <strong>ImgBB</strong> or <strong>Postimages</strong>.<br />
            <span className="text-red-400 font-medium">Note: Google Drive links block embedding.</span>
          </p>
        </div>

        <div className="hidden md:flex flex-col items-center justify-center px-4 text-gray-500 font-medium">
          OR
        </div>

        <div className="flex-1 flex flex-col justify-start">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Option 2: Direct Upload (Lossless HD)
          </label>
          <div className="relative w-full h-[42px]">
            <button className="w-full h-full bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Plus className="w-4 h-4" /> Upload File Directly
            </button>
            <input
              type="file"
              accept="image/*"
              onChange={addBannerFile}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            * <strong>Recommended:</strong> Uploads are now 100% HD. Compress/resize limits were removed!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4"
          >
            <div className="h-40 w-full mb-4 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
              {banner.image ? (
                <img
                  src={banner.image}
                  alt="Banner"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-500" />
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">
                Banner ID: {banner.id}
              </span>
              <button
                onClick={() => deleteBanner(banner.id)}
                className="text-red-400 p-2 hover:bg-red-400/10 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <p className="text-gray-500 col-span-2 text-center py-8">
            No banners added.
          </p>
        )}
      </div>
    </div>
  );
}
