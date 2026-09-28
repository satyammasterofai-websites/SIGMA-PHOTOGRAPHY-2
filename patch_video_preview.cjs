const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageSelfVideoTemplates.tsx', 'utf-8');

// Add useRef to React import
if (!code.includes('useRef')) {
  code = code.replace(/import React, \{ useState, useEffect \} from 'react';/, "import React, { useState, useEffect, useRef } from 'react';");
}

code = code.replace(
  /const \[editingTemplate, setEditingTemplate\] = useState<any \| null>\(null\);/,
  `const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoTime, setVideoTime] = useState(0);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const updateTime = () => setVideoTime(video.currentTime);
    video.addEventListener('timeupdate', updateTime);
    return () => video.removeEventListener('timeupdate', updateTime);
  }, [editingTemplate?.videoUrl]);

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    setDraggingId(id);
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setEditingTemplate((prev: any) => {
      const arr = prev.textFields.map((tf: any) => 
        tf.id === draggingId ? { ...tf, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } : tf
      );
      return { ...prev, textFields: arr };
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingId) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setDraggingId(null);
    }
  };`
);

const newPreview = `
            {editingTemplate.videoUrl && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h4 className="font-bold mb-2">Live Video Preview (Interactive)</h4>
                <p className="text-sm text-gray-500 mb-4">Play the video to see when text appears. Drag text to reposition it.</p>
                <div 
                  ref={containerRef}
                  className="relative bg-black rounded-lg overflow-hidden select-none" 
                  style={{ aspectRatio: '16/9', maxHeight: '500px' }}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                >
                  <video ref={videoRef} src={editingTemplate.videoUrl} controls className="w-full h-full object-contain pointer-events-auto" />
                  {editingTemplate.textFields?.map((tf: any) => {
                    const isVisible = videoTime >= (tf.startTime || 0) && videoTime <= (tf.endTime || 9999);
                    return (
                      <div 
                        key={tf.id}
                        onPointerDown={(e) => handlePointerDown(e, tf.id)}
                        className={\`absolute whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2 drop-shadow-md cursor-move \${isVisible ? 'opacity-100' : 'opacity-30 border border-dashed border-white/50'}\`}
                        style={{
                          left: \`\${tf.x}%\`,
                          top: \`\${tf.y}%\`,
                          fontSize: \`\${tf.fontSize}px\`,
                          fontFamily: tf.fontFamily,
                          color: tf.color,
                          zIndex: draggingId === tf.id ? 20 : 10,
                          pointerEvents: 'auto',
                          padding: '4px 8px',
                          background: draggingId === tf.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                          borderRadius: '4px'
                        }}
                      >
                        {tf.defaultText}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
`;

code = code.replace(/\{editingTemplate\.videoUrl && \([\s\S]*?\}\)\s*<\/div>\s*<\/div>\s*\)\}/, newPreview.trim());

fs.writeFileSync('src/pages/admin/ManageSelfVideoTemplates.tsx', code);
console.log('patched video preview');
