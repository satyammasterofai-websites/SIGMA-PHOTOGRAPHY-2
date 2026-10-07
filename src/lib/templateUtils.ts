/**
 * Detection and validation utilities for Website and E-Card templates vs Video invitation templates.
 * Enforces the strict rule: only templates having a valid responsive website link are shown in E-Cards & Website templates.
 * Video invitation templates (even in 9:16 aspect ratio) are excluded.
 */

export const isVideoUrl = (url?: string | null): boolean => {
  if (!url || typeof url !== "string") return false;
  const u = url.trim().toLowerCase();
  const videoIndicators = [
    "youtube.com",
    "youtu.be",
    "vimeo.com",
    "dailymotion.com",
    ".mp4",
    ".mov",
    ".webm",
    "/watch",
    "/shorts/",
    "/embed/",
    "googlevideo.com",
    "drive.google.com/file",
    "instagram.com/reel",
    "tiktok.com",
  ];
  return videoIndicators.some((indicator) => u.includes(indicator));
};

/**
 * Validates whether a URL is a genuine responsive website link (not a video stream or file).
 */
export const isValidWebsiteUrl = (url?: string | null): boolean => {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (trimmed.length < 5) return false;

  // Must NOT be a video URL
  if (isVideoUrl(trimmed)) return false;

  const lower = trimmed.toLowerCase();
  const hasWebProtocolOrDomain =
    lower.startsWith("http://") ||
    lower.startsWith("https://") ||
    lower.startsWith("www.") ||
    lower.includes(".app") ||
    lower.includes(".com") ||
    lower.includes(".in") ||
    lower.includes(".org") ||
    lower.includes(".net") ||
    lower.includes(".co") ||
    lower.includes(".site") ||
    lower.includes(".online") ||
    lower.includes(".io");

  return hasWebProtocolOrDomain;
};

/**
 * Determines if a template is an E-Card / Website Template.
 * Rule: MUST have a valid website link AND must NOT be a video invitation template.
 * Video templates (even in 9:16 vertical ratio) must NEVER be included.
 */
export const isWebsiteOrECardTemplate = (template: any): boolean => {
  if (!template || typeof template !== "object") return false;

  const type = (template.type || "").toString().toLowerCase();
  // If explicitly declared as video, reject immediately
  if (type === "video") return false;

  // Extract candidate website links
  const webUrl = (template.websiteUrl || "").toString().trim();
  const generalLink = (template.link || "").toString().trim();
  const videoUrl = (template.videoUrl || "").toString().trim();

  // If candidate webUrl or link is a video link, reject
  if (isVideoUrl(webUrl) || isVideoUrl(generalLink)) return false;

  // Check if it has a genuine website URL
  const hasWebUrl = isValidWebsiteUrl(webUrl);
  const hasGeneralWebUrl = isValidWebsiteUrl(generalLink);

  // If template has videoUrl and NO genuine websiteUrl, it is a video template
  if (videoUrl.length > 0 && !hasWebUrl) return false;

  // A template MUST have a valid website link to show in e-card / website templates
  return hasWebUrl || hasGeneralWebUrl;
};
