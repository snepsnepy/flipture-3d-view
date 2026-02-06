import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect, useRef } from "react";
import { ScrollControls } from "@react-three/drei";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { Background } from "./components/Background";
import { PagesProvider } from "./contexts/PagesContext";
import { supabaseClient } from "./utils/supabase";
import {
  initGA,
  trackFlipbookView,
  trackTimeSpent,
} from "./utils/googleAnalytics";

function App() {
  const [pages, setPages] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [flipbookTitle, setFlipbookTitle] = useState("Your Flipbook Title");
  const [companyName, setCompanyName] = useState("Your Company Name");
  const [coverOptions, setCoverOptions] = useState("default");
  const [backgroundGradient, setBackgroundGradient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flipbookId, setFlipbookId] = useState(null);
  const [startTime] = useState(Date.now());
  const hasTrackedView = useRef(false);

  // Helper function to check if subscription is active
  const isSubscriptionActive = (subscriptionStatus) => {
    if (!subscriptionStatus) return true; // If no status field, assume active
    const inactiveStatuses = ["inactive", "canceled"];
    return !inactiveStatuses.includes(subscriptionStatus.toLowerCase());
  };

  const getData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get flipbook ID from URL query parameter
      const urlParams = new URLSearchParams(window.location.search);
      const flipbookIdParam = urlParams.get("id");

      if (!flipbookIdParam) {
        throw new Error(
          "No flipbook ID provided in URL. Please add ?id=your-flipbook-id to the URL."
        );
      }

      setFlipbookId(flipbookIdParam);

      const { data, error: supabaseError } = await supabaseClient
        .from("flipbooks")
        .select("*")
        .eq("id", flipbookIdParam)
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      if (data) {
        // Check subscription status and force default cover if inactive
        const subscriptionActive = isSubscriptionActive(data.subscription_status);
        const effectiveCoverOptions = subscriptionActive
          ? data.cover_options
          : "default";

        setPdfUrl(data.pdf_file_url);
        setFlipbookTitle(data.title || "Your Flipbook Title");
        setCompanyName(data.company_name || "");
        setCoverOptions(effectiveCoverOptions);
        setBackgroundGradient(data.background_gradient || "royal-blue");

        // Log subscription status for debugging
        if (!subscriptionActive) {
          console.error(
            `Subscription inactive (${data.subscription_status}) - using default cover`
          );
        }
      } else {
        throw new Error(`Flipbook with ID "${flipbookIdParam}" not found.`);
      }
    } catch (err) {
      console.error("Error fetching flipbook data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  // Initialize Google Analytics on mount
  useEffect(() => {
    initGA();
  }, []);

  // Track flipbook view when loaded (only once)
  useEffect(() => {
    if (flipbookId && flipbookTitle && !hasTrackedView.current) {
      trackFlipbookView(flipbookId, flipbookTitle);
      hasTrackedView.current = true;
    }
  }, [flipbookId, flipbookTitle]);

  // Track time spent when user leaves
  useEffect(() => {
    if (!flipbookId) return;

    const handleBeforeUnload = () => {
      // Calculate time spent
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      // Google Analytics
      trackTimeSpent(flipbookId, timeSpent);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [flipbookId, startTime]);

  // Update browser tab title with flipbook title
  useEffect(() => {
    if (flipbookTitle && flipbookTitle !== "Your Flipbook Title") {
      document.title = flipbookTitle;
    } else {
      document.title = "Flipture Flipbook";
    }
  }, [flipbookTitle]);

  // Don't render anything until we have the background color
  if (!backgroundGradient && !error) {
    return null;
  }

  return (
    <div className="h-full w-full relative">
      <Background style={backgroundGradient} />
      <PagesProvider pages={pages}>
        <UI
          onPagesChange={setPages}
          pdfUrl={pdfUrl}
          flipbookTitle={flipbookTitle}
          companyName={companyName}
          loading={loading}
          error={error}
          backgroundGradient={backgroundGradient}
          flipbookId={flipbookId}
        />
        <div className="relative w-full h-full">
          {/* Mobile viewport container */}
          <div className="md:hidden absolute inset-0 overflow-hidden">
            <div className="w-full h-full transform scale-110 origin-center">
              <Canvas shadows camera={{ position: [-0.5, 1, 4], fov: 45 }}>
                <ScrollControls pages={1} damping={0.1}>
                  <group position-y={0}>
                    <Suspense fallback={null}>
                      <Experience coverOptions={coverOptions} />
                    </Suspense>
                  </group>
                </ScrollControls>
              </Canvas>
            </div>
          </div>

          {/* Desktop/tablet viewport */}
          <div className="hidden md:block w-full h-full">
            <Canvas shadows camera={{ position: [-0.5, 1, 4], fov: 45 }}>
              <ScrollControls pages={1} damping={0.1}>
                <group position-y={0}>
                  <Suspense fallback={null}>
                    <Experience coverOptions={coverOptions} />
                  </Suspense>
                </group>
              </ScrollControls>
            </Canvas>
          </div>
        </div>
      </PagesProvider>
    </div>
  );
}

export default App;
