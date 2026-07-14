import React from 'react';

const formatValue = (val: any): string => {
  if (val === null || val === undefined) return "N/A";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (typeof val !== "object") return String(val);
  if (Array.isArray(val)) return val.map(formatValue).join(", ");
  
  return Object.entries(val)
    .filter(([_, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => {
      const formattedKey = k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      return `${formattedKey}: ${formatValue(v)}`;
    })
    .join(" | ");
};

export const FormatOrderData = ({ data, theme = 'light' }: { data: any, theme?: 'light' | 'dark' }) => {
  if (!data) return null;

  const labelClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const valClass = theme === 'dark' ? 'text-gray-200' : 'text-gray-900';
  const bulletClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-800';

  if (data.events && Array.isArray(data.events)) {
    return (
      <div className="space-y-3">
        {data.bride && data.groom && (
          <div className="flex flex-col gap-1 text-sm">
            <div><span className={`font-medium ${labelClass}`}>Bride:</span> <span className={valClass}>{formatValue(data.bride)}</span></div>
            <div><span className={`font-medium ${labelClass}`}>Groom:</span> <span className={valClass}>{formatValue(data.groom)}</span></div>
          </div>
        )}
        
        {data.events.length > 0 && (
          <div className="mt-2">
            <span className={`font-medium text-sm ${labelClass}`}>Events:</span>
            <ul className="list-disc pl-4 mt-1 space-y-1">
              {data.events.map((ev: any, idx: number) => (
                <li key={idx} className={`text-sm ${bulletClass}`}>
                  <span className="font-semibold">{ev.type || 'Event'}</span> 
                  {ev.date && ` - ${ev.date}`} 
                  {ev.time && ` at ${ev.time}`} 
                  {ev.venue && ` (${ev.venue})`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.additional && Object.keys(data.additional).length > 0 && (
          <div className="mt-2">
            <span className={`font-medium text-sm ${labelClass}`}>Additional Info:</span>
            <div className="mt-1 space-y-1">
              {Object.entries(data.additional).map(([k, v]) => (
                <div key={k} className="text-sm flex flex-col sm:flex-row sm:gap-2">
                  <span className={`font-medium capitalize sm:w-1/3 shrink-0 ${labelClass}`}>{k.replace(/_/g, " ")}:</span> 
                  <span className={`sm:w-2/3 ${valClass}`}>{formatValue(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {Object.entries(data).filter(([k]) => !['bride', 'groom', 'events', 'additional'].includes(k)).map(([k, v]) => {
          return (
            <div key={k} className="flex flex-col sm:flex-row sm:gap-2 text-sm mt-1">
              <span className={`font-medium capitalize sm:w-1/3 shrink-0 ${labelClass}`}>{k.replace(/_/g, " ")}:</span>
              <span className={`sm:w-2/3 ${valClass}`}>{formatValue(v)}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // Legacy data fallback
  return (
    <div className="space-y-2">
      {Object.entries(data).map(([k, v]) => {
        return (
          <div key={k} className="flex flex-col sm:flex-row sm:gap-2 text-sm">
            <span className={`sm:w-1/3 shrink-0 font-medium capitalize ${labelClass}`}>
              {k.replace(/_/g, " ")}:
            </span>
            <span className={`sm:w-2/3 ${valClass}`}>
              {formatValue(v)}
            </span>
          </div>
        );
      })}
    </div>
  );
};
