const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

if (!code.includes('Play,')) {
    code = code.replace('Download,', 'Download,\n  Play,');
}

if (!code.includes('import VideoModal from "../components/VideoModal";')) {
    code = code.replace('import { useSiteContent } from "../hooks/useSiteContent";', 'import { useSiteContent } from "../hooks/useSiteContent";\nimport VideoModal from "../components/VideoModal";');
}

const myDownloadsFunc = `function MyDownloads() {
  const { user } = useAuthStore();
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);`;

const newMyDownloadsFunc = `function MyDownloads() {
  const { user } = useAuthStore();
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);`;

if (code.includes(myDownloadsFunc)) {
    code = code.replace(myDownloadsFunc, newMyDownloadsFunc);
}

const myDownloadsReturn = `return (
    <div className="space-y-6">`;

const newMyDownloadsReturn = `return (
    <div className="space-y-6">
      {previewVideoUrl && <VideoModal url={previewVideoUrl} onClose={() => setPreviewVideoUrl(null)} />}`;

if (code.includes(myDownloadsReturn)) {
    code = code.replace(myDownloadsReturn, newMyDownloadsReturn);
}

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Patched dashboard imports");
