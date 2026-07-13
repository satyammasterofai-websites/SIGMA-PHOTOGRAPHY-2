const fs = require('fs');
let code = fs.readFileSync('src/pages/Checkout.tsx', 'utf-8');

const applyCouponOld = `  const applyCoupon = () => {
    if (!couponCode.trim()) return;

    if (couponCode.trim().toUpperCase() === "SIGMA20") {
      setAppliedCoupon({ code: "SIGMA20", percentage: "20" });
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      toast.success(\`Coupon Applied! 20% OFF\`);
      return;
    }

    if (!settings?.coupons || settings.coupons.length === 0) {
      toast.error("Invalid coupon code");
      return;
    }

    const matched = settings.coupons.find(
      (c: any) =>
        c.code.replace(/\\s+/g, "").toUpperCase() === couponCode.replace(/\\s+/g, "").toUpperCase(),
    );
    if (matched) {
      if (matched.expiryDate) {
        const today = new Date().toISOString().split("T")[0];
        if (today > matched.expiryDate) {
          toast.error("This coupon has expired");
          return;
        }
      }
      setAppliedCoupon(matched);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      toast.success(\`Coupon Applied! \${matched.percentage}% OFF\`);
    } else {
      toast.error("Invalid coupon code");
    }
  };`;

const applyCouponNew = `  const applyCoupon = () => {
    if (!couponCode.trim()) return;

    if (!settings?.coupons || settings.coupons.length === 0) {
      if (couponCode.trim().toUpperCase() === "SIGMA20") {
        setAppliedCoupon({ code: "SIGMA20", percentage: "20" });
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        toast.success(\`Coupon Applied! 20% OFF\`);
        return;
      }
      toast.error("Invalid coupon code");
      return;
    }

    const matched = settings.coupons.find(
      (c: any) =>
        c.code.replace(/\\s+/g, "").toUpperCase() === couponCode.replace(/\\s+/g, "").toUpperCase(),
    );
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
      }
      
      if (matched.excludedTemplates && matched.excludedTemplates.includes(template?.id)) {
        toast.error("This coupon is not valid for this template");
        return;
      }

      setAppliedCoupon(matched);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      toast.success(\`Coupon Applied! \${matched.percentage}% OFF\`);
    } else if (couponCode.trim().toUpperCase() === "SIGMA20") {
      setAppliedCoupon({ code: "SIGMA20", percentage: "20" });
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      toast.success(\`Coupon Applied! 20% OFF\`);
      return;
    } else {
      toast.error("Invalid coupon code");
    }
  };`;

code = code.replace(applyCouponOld, applyCouponNew);

fs.writeFileSync('src/pages/Checkout.tsx', code);
console.log("Patched Checkout.tsx for coupons");
