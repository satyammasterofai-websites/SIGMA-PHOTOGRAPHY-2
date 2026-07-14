const fs = require('fs');
let code = fs.readFileSync('src/components/FormatOrderData.tsx', 'utf-8');

code = code.replace(
  `        {Object.entries(data).filter(([k]) => !['bride', 'groom', 'events', 'additional'].includes(k)).map(([k, v]) => {`,
  `        {Object.entries(data).filter(([k, v]) => {
          if (k === 'events') return false;
          if (['bride', 'groom', 'additional'].includes(k) && typeof v === 'object' && v !== null) return false;
          return true;
        }).map(([k, v]) => {`
);

fs.writeFileSync('src/components/FormatOrderData.tsx', code);
