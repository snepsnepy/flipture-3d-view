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
};

// Track zoom
export const trackZoom = (
  action: "zoom_in" | "zoom_out" | "zoom_reset",
  level: number
) => {
  ReactGA.event({
    category: "Interaction",
    action: action,
    label: `Zoom ${action}`,
    value: level,
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
export const trackTimeSpent = (timeInSeconds: number) => {
  ReactGA.event({
    category: "Engagement",
    action: "time_spent",
    value: timeInSeconds,
  });
};
