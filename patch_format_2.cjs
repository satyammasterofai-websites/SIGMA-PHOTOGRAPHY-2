const fs = require('fs');
let code = fs.readFileSync('src/components/FormatOrderData.tsx', 'utf-8');

code = code.replace(
  `{data.bride && Object.keys(data.bride).length > 0 && (`,
  `{data.bride && typeof data.bride === 'object' && Object.keys(data.bride).length > 0 && (`
);

code = code.replace(
  `{data.groom && Object.keys(data.groom).length > 0 && (`,
  `{data.groom && typeof data.groom === 'object' && Object.keys(data.groom).length > 0 && (`
);

code = code.replace(
  `{data.additional && Object.keys(data.additional).length > 0 && (`,
  `{data.additional && typeof data.additional === 'object' && Object.keys(data.additional).length > 0 && (`
);

fs.writeFileSync('src/components/FormatOrderData.tsx', code);
