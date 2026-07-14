const fs = require('fs');
let code = fs.readFileSync('src/components/FormatOrderData.tsx', 'utf-8');

code = code.replace(
  `        {data.bride && data.groom && (
          <div className="flex flex-col gap-1 text-sm">
            <div><span className={\`font-medium \${labelClass}\`}>Bride:</span> <span className={valClass}>{formatValue(data.bride)}</span></div>
            <div><span className={\`font-medium \${labelClass}\`}>Groom:</span> <span className={valClass}>{formatValue(data.groom)}</span></div>
          </div>
        )}`,
  `        {data.bride && Object.keys(data.bride).length > 0 && (
          <div className="mt-2">
            <span className={\`font-medium text-sm \${labelClass}\`}>Bride Details:</span>
            <div className="mt-1 space-y-1">
              {Object.entries(data.bride).map(([k, v]) => (
                <div key={k} className="text-sm flex flex-col sm:flex-row sm:gap-2">
                  <span className={\`font-medium capitalize sm:w-1/3 shrink-0 \${labelClass}\`}>{k.replace(/_/g, " ")}:</span> 
                  <span className={\`sm:w-2/3 \${valClass}\`}>{formatValue(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {data.groom && Object.keys(data.groom).length > 0 && (
          <div className="mt-2">
            <span className={\`font-medium text-sm \${labelClass}\`}>Groom Details:</span>
            <div className="mt-1 space-y-1">
              {Object.entries(data.groom).map(([k, v]) => (
                <div key={k} className="text-sm flex flex-col sm:flex-row sm:gap-2">
                  <span className={\`font-medium capitalize sm:w-1/3 shrink-0 \${labelClass}\`}>{k.replace(/_/g, " ")}:</span> 
                  <span className={\`sm:w-2/3 \${valClass}\`}>{formatValue(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}`
);

fs.writeFileSync('src/components/FormatOrderData.tsx', code);
