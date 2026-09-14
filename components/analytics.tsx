"use client";

import { OpenPanel } from "@openpanel/web";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

let analytics: OpenPanel | undefined;

export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    analytics ??= new OpenPanel({
      clientId: "d407bd26-f3c7-49cd-9dce-2689e6c0033e",
      apiUrl: "https://op.kapish.dev/api",
      trackScreenViews: false,
      trackOutgoingLinks: true,
    });

    // Editor settings change the query string, not the page being viewed.
    analytics.screenView(`${window.location.origin}${pathname}`);
  }, [pathname]);

  return null;
}
