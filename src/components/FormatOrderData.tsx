import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';


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

export const FormatOrderData = ({ data, theme = 'light', templateId }: { data: any, theme?: 'light' | 'dark', templateId?: string }) => {
    const [customLabels, setCustomLabels] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!templateId) return;
    
    // Check if there are any keys starting with f_
    const hasLegacyKeys = (obj: any): boolean => {
      if (!obj || typeof obj !== 'object') return false;
      for (const key of Object.keys(obj)) {
        if (key.startsWith('f_')) return true;
        if (typeof obj[key] === 'object') {
           if (hasLegacyKeys(obj[key])) return true;
        }
      }
      return false;
    };

    if (!hasLegacyKeys(data)) return;

    const fetchTemplateFields = async () => {
      try {
        const snap = await getDoc(doc(db, "templates", templateId));
        if (snap.exists()) {
          const t = snap.data();
          const labels: Record<string, string> = {};
          if (t.customFields && Array.isArray(t.customFields)) {
            t.customFields.forEach((f: any) => {
              labels[f.id] = f.name;
            });
          }
          if (t.formId) {
            const formSnap = await getDoc(doc(db, 'settings', 'data', 'custom_forms', t.formId));
            if (formSnap.exists()) {
               const formData = formSnap.data();
               const fieldsToExtract = [
                  ...(formData.familySettings?.brideFields || []),
                  ...(formData.familySettings?.groomFields || []),
                  ...(formData.additionalFields || [])
               ];
               fieldsToExtract.forEach((f: any) => {
                  labels[f.id] = f.name;
               });
            }
          }
          if (t.formConfig && t.formConfig.additionalFields) {
            t.formConfig.additionalFields.forEach((f: any) => {
              labels[f.id] = f.name;
            });
          }
          setCustomLabels(labels);
        }
      } catch (e) {
        console.error("Failed to fetch template fields", e);
      }
    };
    fetchTemplateFields();
  }, [templateId, data]);

    const formatKeyLocal = (k: string) => {
    if (!k) return '';
    if (customLabels[k]) return customLabels[k];
    let spaced = k.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, " ");
    if (spaced.toLowerCase().startsWith('f ')) spaced = spaced.substring(2);
    return spaced.replace(/\b\w/g, c => c.toUpperCase());
  };
  if (!data) return null;

  const labelClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const valClass = theme === 'dark' ? 'text-gray-200' : 'text-gray-900';
  const bulletClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-800';

  if (data.events && Array.isArray(data.events)) {
    return (
      <div className="space-y-3">
{templateId && <div className="text-xs text-red-500">DEBUG: templateId={templateId}</div>}
        {data.bride && typeof data.bride === 'object' && Object.keys(data.bride).length > 0 && (
          <div className="mt-2">
            <span className={`font-medium text-sm ${labelClass}`}>Bride Details:</span>
            <div className="mt-1 space-y-1">
              {Object.entries(data.bride).map(([k, v]) => (
                <div key={k} className="text-sm flex flex-col sm:flex-row sm:gap-2">
                  <span className={`font-medium sm:w-1/3 shrink-0 ${labelClass}`}>{formatKeyLocal(k)}:</span> 
                  <span className={`sm:w-2/3 ${valClass}`}>{formatValue(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {data.groom && typeof data.groom === 'object' && Object.keys(data.groom).length > 0 && (
          <div className="mt-2">
            <span className={`font-medium text-sm ${labelClass}`}>Groom Details:</span>
            <div className="mt-1 space-y-1">
              {Object.entries(data.groom).map(([k, v]) => (
                <div key={k} className="text-sm flex flex-col sm:flex-row sm:gap-2">
                  <span className={`font-medium sm:w-1/3 shrink-0 ${labelClass}`}>{formatKeyLocal(k)}:</span> 
                  <span className={`sm:w-2/3 ${valClass}`}>{formatValue(v)}</span>
                </div>
              ))}
            </div>
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

        {data.additional && typeof data.additional === 'object' && Object.keys(data.additional).length > 0 && (
          <div className="mt-2">
            <span className={`font-medium text-sm ${labelClass}`}>Additional Info:</span>
            <div className="mt-1 space-y-1">
              {Object.entries(data.additional).map(([k, v]) => (
                <div key={k} className="text-sm flex flex-col sm:flex-row sm:gap-2">
                  <span className={`font-medium sm:w-1/3 shrink-0 ${labelClass}`}>{formatKeyLocal(k)}:</span> 
                  <span className={`sm:w-2/3 ${valClass}`}>{formatValue(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {Object.entries(data).filter(([k, v]) => {
          if (k === 'events') return false;
          if (['bride', 'groom', 'additional'].includes(k) && typeof v === 'object' && v !== null) return false;
          return true;
        }).map(([k, v]) => {
          return (
            <div key={k} className="flex flex-col sm:flex-row sm:gap-2 text-sm mt-1">
              <span className={`font-medium sm:w-1/3 shrink-0 ${labelClass}`}>{formatKeyLocal(k)}:</span>
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
{templateId && <div className="text-xs text-red-500">DEBUG: templateId={templateId}</div>}
{!templateId && <div className="text-xs text-red-500">DEBUG: NO templateId</div>}
      {Object.entries(data).map(([k, v]) => {
        return (
          <div key={k} className="flex flex-col sm:flex-row sm:gap-2 text-sm">
            <span className={`sm:w-1/3 shrink-0 font-medium ${labelClass}`}>
              {formatKeyLocal(k)}:
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
