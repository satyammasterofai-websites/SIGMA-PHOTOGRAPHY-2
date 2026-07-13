const fs = require('fs');
let code = fs.readFileSync('src/pages/Checkout.tsx', 'utf-8');

// 1. Add imports
code = code.replace(
  `  increment,
} from "firebase/firestore";`,
  `  increment,
  getDocs,
  query,
  where,
} from "firebase/firestore";`
);

// 2. Modify applyCoupon
const oldApply = `  const applyCoupon = () => {
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

const newApply = `  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    let targetCode = couponCode.trim().toUpperCase();
    let isSigma = targetCode === "SIGMA20";

    if (!settings?.coupons || settings.coupons.length === 0) {
      if (isSigma) {
        targetCode = "SIGMA20";
      } else {
        toast.error("Invalid coupon code");
        return;
      }
    }

    let matched = settings?.coupons?.find(
      (c: any) =>
        c.code.replace(/\\s+/g, "").toUpperCase() === targetCode.replace(/\\s+/g, "").toUpperCase(),
    );

    if (!matched && isSigma) {
      matched = { code: "SIGMA20", percentage: "20" };
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
      }
      
      if (matched.excludedTemplates && matched.excludedTemplates.includes(template?.id)) {
        toast.error("This coupon is not valid for this template");
        return;
      }

      if (user) {
        try {
          const q = query(
            collection(db, "orders"),
            where("userId", "==", user.uid),
            where("couponApplied", "==", matched.code)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            toast.error("You have already used this coupon code once.");
            return;
          }
        } catch (err) {
          console.error("Error checking coupon usage", err);
        }
      }

      setAppliedCoupon(matched);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      toast.success(\`Coupon Applied! \${matched.percentage}% OFF\`);
    } else {
      toast.error("Invalid coupon code");
    }
  };`;

code = code.replace(oldApply, newApply);

fs.writeFileSync('src/pages/Checkout.tsx', code);
console.log("Patched Checkout.tsx");
