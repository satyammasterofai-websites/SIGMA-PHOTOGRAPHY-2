import React from "react";
import { X } from "lucide-react";

interface VideoModalProps {
  url: string;
  onClose: () => void;
}

export default function VideoModal({ url, onClose }: VideoModalProps) {
  let embedUrl = url;
  let isVertical = false;

  if (url.includes("vimeo.com")) {
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (match) {
      embedUrl = `https://player.vimeo.com/video/${match[1]}`;
    }
  } else if (url.includes("youtube.com/watch")) {
    const match = url.match(/v=([^&]+)/);
    if (match) {
      embedUrl = `https://www.youtube.com/embed/${match[1]}`;
    }
  } else if (url.includes("youtu.be/")) {
    const match = url.match(/youtu\.be\/([^?]+)/);
    if (match) {
      embedUrl = `https://www.youtube.com/embed/${match[1]}`;
    }
  } else if (url.includes("youtube.com/shorts/")) {
    const match = url.match(/youtube\.com\/shorts\/([^/?]+)/);
    if (match) {
      embedUrl = `https://www.youtube.com/embed/${match[1]}`;
      isVertical = true;
    }
  } else if (url.includes("instagram.com")) {
    // Handle instagram.com/p/CODE or instagram.com/reel/CODE
    // Instagram embed URL is just the post URL + embed/
    // Ensure it ends with a slash before adding embed/ if it doesn't have one
    const cleanUrl = url.split("?")[0];
    isVertical = true;
    embedUrl = cleanUrl.endsWith("/")
      ? `${cleanUrl}embed/`
      : `${cleanUrl}/embed/`;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm shadow-2xl">
      <div 
        className={`relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20 mx-auto w-full flex justify-center`}
        style={isVertical ? { maxHeight: "90vh", width: "100%", maxWidth: "calc(90vh * 9 / 16)", aspectRatio: "9/16" } : { maxWidth: "64rem", aspectRatio: "16/9" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-white border border-white/20 hover:text-black transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <iframe
          src={embedUrl}
          className="w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}
