import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect, useRef } from "react";
import { ScrollControls } from "@react-three/drei";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { PagesProvider } from "./contexts/PagesContext";
import { supabaseClient } from "./utils/supabase";
import {
  initGA,
  trackFlipbookView,
  trackTimeSpent,
} from "./utils/googleAnalytics";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

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
        setPdfUrl(data.pdf_file_url);
        setFlipbookTitle(data.title || "Your Flipbook Title");
        setCompanyName(data.company_name || "");
        setCoverOptions(data.cover_options || "default");
        setBackgroundGradient(data.background_gradient || "royal-blue");
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

  const getBackgroundClass = (style) => {
    const backgroundMap = {
      "deep-white": "bg-gradient-to-br from-[#616161] to-[#9E9E9E]",
      "deep-black": "bg-gradient-to-br from-[#000000] to-[#212121]",
      "royal-blue":
        "bg-gradient-to-br from-[#000080] via-[#0046FF] to-[#4169E1]",
      "purple-dream":
        "bg-gradient-to-br from-[#FF8C00] via-[#FF7F50] to-[#FF6347]",
      "sunset-orange": "bg-gradient-to-br from-[#E65C00] to-[#F9D423]",
      "fire-red": "bg-gradient-to-br from-[#870000] to-[#190A05]",
      "spring-green": "bg-gradient-to-br from-[#215F00] to-[#E4E4D9]",
      "arctic-blue":
        "bg-gradient-to-br from-[#5433FF] via-[#20BDFF] to-[#A5FECB]",
    };
    return backgroundMap[style] || backgroundMap["royal-blue"];
  };

  const renderBackground = (style) => {
    if (style === "test") {
      return (
        <div className="absolute inset-0 z-0">
          <ShaderGradientCanvas
            style={{
              width: "100%",
              height: "100%",
            }}
            lazyLoad={undefined}
            fov={45}
            pixelDensity={1}
            pointerEvents="none"
          >
            <ShaderGradient
              animate="on"
              type="waterPlane"
              wireframe={false}
              shader="defaults"
              uTime={0.2}
              uSpeed={0.1}
              uStrength={2.4}
              uDensity={1.1}
              uFrequency={5.5}
              uAmplitude={0}
              positionX={-0.5}
              positionY={0.1}
              positionZ={0}
              rotationX={0}
              rotationY={0}
              rotationZ={235}
              color1="#5606FF"
              color2="#e63535"
              color3="#000000"
              reflection={0.1}
              // View (camera) props
              cAzimuthAngle={180}
              cPolarAngle={115}
              cDistance={3.9}
              cameraZoom={1}
              // Effect props
              lightType="3d"
              brightness={1.1}
              envPreset="city"
              grain="off"
              // Tool props
              toggleAxis={undefined}
              zoomOut={undefined}
              hoverState=""
              // Optional - if using transition features
              enableTransition={false}
            />
          </ShaderGradientCanvas>
        </div>
      );
    }

    return (
      <div className={`absolute inset-0 z-0 ${getBackgroundClass(style)}`} />
    );
  };

  // Don't render anything until we have the background color
  if (!backgroundGradient && !error) {
    return null;
  }

  return (
    <div className="h-full w-full relative">
      {renderBackground(backgroundGradient)}
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
