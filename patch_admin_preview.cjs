const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageOrders.tsx', 'utf-8');

if (!code.includes('VideoModal')) {
    code = code.replace('import toast from "react-hot-toast";', 'import toast from "react-hot-toast";\nimport VideoModal from "../../components/VideoModal";\nimport { Play } from "lucide-react";');
    
    code = code.replace('const [activeTab, setActiveTab] = useState("All");', 'const [activeTab, setActiveTab] = useState("All");\n  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);');
    
    const deliverySection = '{order.downloadUrl ? (\n                                  <div className="text-sm bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl flex items-start gap-2">\n                                    <LinkIcon className="w-4 h-4 mt-0.5" />\n                                    <div>\n                                      <div className="font-bold mb-1">\n                                        Link Sent to Client\n                                      </div>\n                                      <a\n                                        href={order.downloadUrl}\n                                        target="_blank"\n                                        rel="noreferrer"\n                                        className="text-blue-400 hover:underline break-all"\n                                      >\n                                        {order.downloadUrl}\n                                      </a>\n                                    </div>\n                                  </div>\n                                )';

    const newDeliverySection = '{order.downloadUrl ? (\n                                  <div className="text-sm bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl flex items-start gap-2">\n                                    <LinkIcon className="w-4 h-4 mt-0.5" />\n                                    <div className="flex-1">\n                                      <div className="font-bold mb-1">\n                                        Link Sent to Client\n                                      </div>\n                                      <a\n                                        href={order.downloadUrl}\n                                        target="_blank"\n                                        rel="noreferrer"\n                                        className="text-blue-400 hover:underline break-all block mb-2"\n                                      >\n                                        {order.downloadUrl}\n                                      </a>\n                                      <button\n                                        onClick={() => setPreviewVideoUrl(order.downloadUrl)}\n                                        className="flex items-center gap-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 px-3 py-1 rounded text-xs font-medium"\n                                      >\n                                        <Play className="w-3 h-3" /> Preview Delivery Video\n                                      </button>\n                                    </div>\n                                  </div>\n                                )';
    
    if (code.includes(deliverySection)) {
        code = code.replace(deliverySection, newDeliverySection);
    }
    
    // Add VideoModal to root element return
    code = code.replace('return (\n    <div className="w-full">', 'return (\n    <div className="w-full">\n      {previewVideoUrl && <VideoModal url={previewVideoUrl} onClose={() => setPreviewVideoUrl(null)} />}');
    
    fs.writeFileSync('src/pages/admin/ManageOrders.tsx', code);
    console.log("Patched admin ManageOrders");
}
