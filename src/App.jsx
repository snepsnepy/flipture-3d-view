import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect } from "react";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { PagesProvider } from "./contexts/PagesContext";
import { supabaseClient } from "./utils/supabase";

function App() {
  const [pages, setPages] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [flipbookTitle, setFlipbookTitle] = useState("Your Flipbook Title");
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

  return (
    <PagesProvider pages={pages}>
      <UI
        onPagesChange={setPages}
        pdfUrl={pdfUrl}
        flipbookTitle={flipbookTitle}
        loading={loading}
        error={error}
      />
      <Canvas shadows camera={{ position: [-0.5, 1, 4], fov: 45 }}>
        <group position-y={0}>
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
        </group>
      </Canvas>
    </PagesProvider>
  );
}

export default App;
