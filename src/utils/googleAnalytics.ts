import ReactGA from "react-ga4";

// Inițializează GA4
export const initGA = () => {
  const GA_MEASUREMENT_ID = (import.meta as any).env
    .VITE_GA_MEASUREMENT_ID as string;

  if (GA_MEASUREMENT_ID) {
    ReactGA.initialize(GA_MEASUREMENT_ID);
  }
};

// Track page view
export const trackPageView = (flipbookId: string, pageNumber: number) => {
  ReactGA.event({
    category: "Flipbook",
    action: "page_view",
    label: `Flipbook ${flipbookId} - Page ${pageNumber}`,
    value: pageNumber,
  });

  // Trimite și ca event custom cu flipbook_id pentru filtrare în GA4
  ReactGA.gtag("event", "page_flip", {
    flipbook_id: flipbookId,
    page_number: pageNumber,
  });
};

// Track zoom
export const trackZoom = (
  flipbookId: string,
  action: "zoom_in" | "zoom_out" | "zoom_reset",
  level: number
) => {
  ReactGA.event({
    category: "Interaction",
    action: action,
    label: `Zoom ${action}`,
    value: level,
  });

  // Trimite și ca event custom cu flipbook_id
  ReactGA.gtag("event", action, {
    flipbook_id: flipbookId,
    zoom_level: level,
  });
};

// Track session start
export const trackFlipbookView = (flipbookId: string, title: string) => {
  ReactGA.event({
    category: "Flipbook",
    action: "view",
    label: title,
  });

  // Custom dimension pentru flipbook ID
  ReactGA.gtag("event", "flipbook_view", {
    flipbook_id: flipbookId,
    flipbook_title: title,
  });
};

// Track time spent (când utilizatorul pleacă)
export const trackTimeSpent = (flipbookId: string, timeInSeconds: number) => {
  ReactGA.event({
    category: "Engagement",
    action: "time_spent",
    value: timeInSeconds,
  });

  // Trimite și ca event custom cu flipbook_id
  ReactGA.gtag("event", "engagement_time", {
    flipbook_id: flipbookId,
    time_seconds: timeInSeconds,
  });
};
