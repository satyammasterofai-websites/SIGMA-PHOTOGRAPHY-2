const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

if (!code.includes('import VideoModal from "../components/VideoModal";')) {
    code = code.replace('import { Download, ChevronRight, Video, FileText, CheckCircle, Package } from "lucide-react";', 'import { Download, ChevronRight, Video, FileText, CheckCircle, Package, Play } from "lucide-react";\nimport VideoModal from "../components/VideoModal";');
}

if (!code.includes('const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);')) {
    code = code.replace('const [loading, setLoading] = useState(true);', 'const [loading, setLoading] = useState(true);\n  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);');
}

const oldButtons = `<a
                href={d.downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 bg-brand-purple hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition-colors"
              >
                Download Video
              </a>`;
              
const newButtons = `<div className="flex flex-col gap-2">
                <button
                  onClick={() => setPreviewVideoUrl(d.downloadUrl)}
                  className="w-full flex justify-center items-center gap-2 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl text-sm font-bold transition-colors"
                >
                  <Play className="w-4 h-4" /> Preview Video
                </button>
                <a
                  href={d.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex justify-center items-center gap-2 py-2 bg-brand-purple hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition-colors"
                >
                  <Download className="w-4 h-4" /> Download Original
                </a>
              </div>`;

if (code.includes(oldButtons)) {
    code = code.replace(oldButtons, newButtons);
    
    // Add VideoModal component to return
    const oldReturn = 'return (\n    <div className="space-y-6">';
    const newReturn = 'return (\n    <div className="space-y-6">\n      {previewVideoUrl && <VideoModal url={previewVideoUrl} onClose={() => setPreviewVideoUrl(null)} />}';
    
    code = code.replace(oldReturn, newReturn);
    fs.writeFileSync('src/pages/Dashboard.tsx', code);
    console.log("Patched dashboard");
} else {
    console.log("Could not patch dashboard");
}
