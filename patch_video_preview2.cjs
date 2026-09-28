const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageSelfVideoTemplates.tsx', 'utf-8');

const startStr = '{editingTemplate.videoUrl && (';
const endStr = '</div>\n        </div>\n      ) : (';

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
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
          </div>
`;
  code = code.substring(0, startIndex) + newPreview.trim() + '\n        </div>\n      ) : ( ' + code.substring(endIndex + endStr.length);
  fs.writeFileSync('src/pages/admin/ManageSelfVideoTemplates.tsx', code);
  console.log('patched successfully');
} else {
  console.log('could not find indices', startIndex, endIndex);
}
