const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

const downloadsFunc = `function Downloads() {
  const { user } = useAuthStore();
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);`;

const newDownloadsFunc = `function Downloads() {
  const { user } = useAuthStore();
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);`;

if (code.includes(downloadsFunc)) {
    code = code.replace(downloadsFunc, newDownloadsFunc);
    
    const returnStatement = 'return (\n    <div className="space-y-6">';
    const newReturnStatement = 'return (\n    <div className="space-y-6">\n      {previewVideoUrl && <VideoModal url={previewVideoUrl} onClose={() => setPreviewVideoUrl(null)} />}';
    
    code = code.replace(returnStatement, newReturnStatement);
    fs.writeFileSync('src/pages/Dashboard.tsx', code);
    console.log("Patched Downloads function");
}
