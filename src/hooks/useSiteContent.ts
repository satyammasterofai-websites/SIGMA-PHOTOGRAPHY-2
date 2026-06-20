import { useEffect } from "react";
import { useSiteStore } from "../store/useSiteStore";

export function useSiteContent() {
  const init = useSiteStore((state) => state.init);
  
  useEffect(() => {
    init();
  }, [init]);

  return useSiteStore();
}
