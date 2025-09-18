import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { PagesProvider } from "./contexts/PagesContext";

function App() {
  const [pages, setPages] = useState([]);

  return (
    <PagesProvider pages={pages}>
      <UI onPagesChange={setPages} />
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
