const fs = require('fs');
let code = fs.readFileSync('src/pages/PremiumGallery.tsx', 'utf-8');

const regexToRemove = /const \[couponInputs, setCouponInputs\] = useState<Record<string, string>>\({}\);\s*const \[appliedCoupons, setAppliedCoupons\] = useState<Record<string, any>>\({}\);/g;
code = code.replace(regexToRemove, '');

const funcRegex = /const handleApplyCouponFromGallery = async \(templateId: string\) => {[\s\S]*?};/g;
code = code.replace(funcRegex, '');

fs.writeFileSync('src/pages/PremiumGallery.tsx', code);
