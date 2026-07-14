const fs = require('fs');
let code = fs.readFileSync('src/pages/Checkout.tsx', 'utf-8');

const applyCouponReplacement = `  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    let targetCode = couponCode.trim().toUpperCase();
    let isSigma = targetCode === "SIGMA20";
    let matched = null;

    // Check template specific coupon first
    if (template?.couponCode && template.couponCode.trim().toUpperCase() === targetCode) {
      matched = { code: template.couponCode, percentage: template.couponPercentage || 0 };
    }

    if (!matched && settings?.coupons && settings.coupons.length > 0) {
      matched = settings.coupons.find(
        (c: any) =>
          c.code.replace(/\\s+/g, "").toUpperCase() === targetCode.replace(/\\s+/g, "").toUpperCase(),
      );
    }

    if (!matched && isSigma) {
      matched = { code: "SIGMA20", percentage: "20" };
    }

    if (!matched) {
      toast.error("Invalid coupon code");
      return;
    }

    if (matched) {
      if (matched.expiryDate) {
        const today = new Date().toISOString().split("T")[0];
        if (today > matched.expiryDate) {
          toast.error("This coupon has expired");
          return;
        }
      }
      
      const priceThreshold = Number(matched.maxPriceThreshold);
      if (priceThreshold > 0 && initialPrice > priceThreshold) {
        toast.error(\`This coupon is only valid for templates priced at or below ₹\${priceThreshold}\`);
        return;
      }`;

// We need to carefully replace the start of applyCoupon
// We can use a regex replacement to match everything up to "const priceThreshold"

code = code.replace(/  const applyCoupon = async \(\) => {[\s\S]*?const priceThreshold/m, applyCouponReplacement + "\n      const priceThreshold");

fs.writeFileSync('src/pages/Checkout.tsx', code);
