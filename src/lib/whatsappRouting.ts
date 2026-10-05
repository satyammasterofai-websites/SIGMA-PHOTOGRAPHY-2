import { doc, runTransaction, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { formatWhatsAppNumber } from "./utils";

export const DEFAULT_OFFICIAL_WA_NUMBER = "9162478070";
export const DEFAULT_ALTERNATIVE_WA_NUMBER = "919973482994"; // 9973482994 with +91 country code

export interface WhatsAppRoutingResult {
  assignedNumber: string;
  routingSlot: "official" | "alternative";
  orderIndex: number;
  formattedDisplay: string;
}

/**
 * Atomically determines whether the order goes to the Official or Alternative WhatsApp number.
 * 1st order -> Official Number
 * 2nd order -> Alternative Number (9973482994)
 * 3rd order -> Official Number
 * 4th order -> Alternative Number (9973482994)
 * ...alternating every time users order.
 */
export async function assignNextWhatsAppNumber(
  settings?: any,
  orderDisplayId?: string
): Promise<WhatsAppRoutingResult> {
  const official = formatWhatsAppNumber(
    settings?.whatsapp?.number || DEFAULT_OFFICIAL_WA_NUMBER,
    DEFAULT_OFFICIAL_WA_NUMBER
  );
  const alternative = formatWhatsAppNumber(
    settings?.whatsapp?.alternativeNumber || DEFAULT_ALTERNATIVE_WA_NUMBER,
    DEFAULT_ALTERNATIVE_WA_NUMBER
  );

  const routingRef = doc(db, "settings", "whatsapp_routing");

  try {
    const result = await runTransaction(db, async (transaction) => {
      const routingDoc = await transaction.get(routingRef);
      let orderIndex = 1;
      if (routingDoc.exists()) {
        const data = routingDoc.data();
        orderIndex = (Number(data.totalOrdersCount) || 0) + 1;
      }

      // Alternating logic: Odd = Official (1st, 3rd, 5th...), Even = Alternative (2nd, 4th, 6th...)
      const isEven = orderIndex % 2 === 0;
      const assignedNumber = isEven ? alternative : official;
      const routingSlot: "official" | "alternative" = isEven
        ? "alternative"
        : "official";

      transaction.set(
        routingRef,
        {
          totalOrdersCount: orderIndex,
          lastAssignedNumber: assignedNumber,
          lastRoutingSlot: routingSlot,
          lastOrderDisplayId: orderDisplayId || "N/A",
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      return {
        assignedNumber,
        routingSlot,
        orderIndex,
        formattedDisplay: isEven
          ? `Alternative WhatsApp (${alternative})`
          : `Official WhatsApp (${official})`,
      };
    });

    try {
      localStorage.setItem("sigma_last_wa_routing", result.routingSlot);
      localStorage.setItem("sigma_wa_order_count", String(result.orderIndex));
    } catch {
      // ignore
    }

    return result;
  } catch (err) {
    console.warn("Firestore routing transaction failed, using local rotation fallback:", err);

    // Local fallback for offline/permissions
    let localCount = 1;
    try {
      localCount = (Number(localStorage.getItem("sigma_wa_order_count")) || 0) + 1;
      localStorage.setItem("sigma_wa_order_count", String(localCount));
    } catch {
      localCount = Date.now() % 2 === 0 ? 2 : 1;
    }

    const isEven = localCount % 2 === 0;
    const assignedNumber = isEven ? alternative : official;
    const routingSlot: "official" | "alternative" = isEven
      ? "alternative"
      : "official";

    return {
      assignedNumber,
      routingSlot,
      orderIndex: localCount,
      formattedDisplay: isEven
        ? `Alternative WhatsApp (${alternative})`
        : `Official WhatsApp (${official})`,
    };
  }
}

/**
 * Fetch current routing stats for Admin settings
 */
export async function getWhatsAppRoutingStats(settings?: any) {
  const official = formatWhatsAppNumber(
    settings?.whatsapp?.number || DEFAULT_OFFICIAL_WA_NUMBER,
    DEFAULT_OFFICIAL_WA_NUMBER
  );
  const alternative = formatWhatsAppNumber(
    settings?.whatsapp?.alternativeNumber || DEFAULT_ALTERNATIVE_WA_NUMBER,
    DEFAULT_ALTERNATIVE_WA_NUMBER
  );

  try {
    const snap = await getDoc(doc(db, "settings", "whatsapp_routing"));
    if (snap.exists()) {
      const data = snap.data();
      const count = Number(data.totalOrdersCount) || 0;
      const nextSlot = (count + 1) % 2 === 0 ? "alternative" : "official";
      return {
        totalOrdersCount: count,
        lastRoutingSlot: data.lastRoutingSlot || "None",
        lastAssignedNumber: data.lastAssignedNumber || official,
        nextRoutingSlot: nextSlot,
        nextAssignedNumber: nextSlot === "alternative" ? alternative : official,
        officialNumber: official,
        alternativeNumber: alternative,
      };
    }
  } catch (e) {
    console.error("Error reading routing stats:", e);
  }

  return {
    totalOrdersCount: 0,
    lastRoutingSlot: "None",
    lastAssignedNumber: official,
    nextRoutingSlot: "official",
    nextAssignedNumber: official,
    officialNumber: official,
    alternativeNumber: alternative,
  };
}
