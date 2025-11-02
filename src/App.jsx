import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect } from "react";
import { ScrollControls } from "@react-three/drei";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { PagesProvider } from "./contexts/PagesContext";
import { supabaseClient } from "./utils/supabase";

function App() {
  const [pages, setPages] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [flipbookTitle, setFlipbookTitle] = useState("Your Flipbook Title");
  const [companyName, setCompanyName] = useState("Your Company Name");
  const [coverOptions, setCoverOptions] = useState("default");
  const [backgroundGradient, setBackgroundGradient] = useState("royal-blue");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get flipbook ID from URL query parameter
      const urlParams = new URLSearchParams(window.location.search);
      const flipbookId = urlParams.get("id");

      if (!flipbookId) {
        throw new Error(
          "No flipbook ID provided in URL. Please add ?id=your-flipbook-id to the URL."
        );
      }

      const { data, error: supabaseError } = await supabaseClient
        .from("flipbooks")
        .select("*")
        .eq("id", flipbookId)
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
        console.log(data);
      } else {
        throw new Error(`Flipbook with ID "${flipbookId}" not found.`);
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

  const getBackgroundClass = (style) => {
    const backgroundMap = {
      "deep-white": "bg-gradient-to-br from-[#FFFFFF] to-[#F0F0F0]",
      "deep-black": "bg-gradient-to-br from-[#000000] to-[#212121]",
      "royal-blue":
        "bg-gradient-to-br from-[#091E3A] via-[#2F80ED] to-[#2D9EE0]",
      "purple-dream": "bg-gradient-to-br from-[#9400D3] to-[#4B0082]",
      "sunset-orange": "bg-gradient-to-br from-[#E65C00] to-[#F9D423]",
      "fire-red": "bg-gradient-to-br from-[#E52D27] to-[#B31217]",
      "spring-green": "bg-gradient-to-br from-[#ADD100] to-[#7B920A]",
      "arctic-blue":
        "bg-gradient-to-br from-[#00F5FF] via-[#00CED1] to-[#20B2AA]",
    };
    return backgroundMap[style] || backgroundMap["royal-blue"];
  };

  return (
    <div className="h-full w-full relative">
      <div
        className={`absolute inset-0 z-0 ${getBackgroundClass(
          backgroundGradient
        )}`}
      />
      <PagesProvider pages={pages}>
        <UI
          onPagesChange={setPages}
          pdfUrl={pdfUrl}
          flipbookTitle={flipbookTitle}
          companyName={companyName}
          loading={loading}
          error={error}
          backgroundGradient={backgroundGradient}
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
