import { Environment, OrbitControls, Float } from "@react-three/drei";
import { Book } from "./Book";
import { useAtom } from "jotai";
import { pageAtom } from "./UI";
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { usePages } from "../contexts/PagesContext";

export const Experience = () => {
  const [page] = useAtom(pageAtom);
  const { pages } = usePages();
  const isBookOpened = page > 0;
  const { camera, viewport } = useThree();

  // Responsive camera positioning
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

      if (isMobile) {
        camera.position.set(0, 0, 4);
        camera.lookAt(0, 0, 0);
      } else if (isTablet) {
        camera.position.set(0, 0, 3.5);
        camera.lookAt(0, 0, 0);
      } else {
        camera.position.set(0, 0, 3);
        camera.lookAt(0, 0, 0);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [camera]);

  return (
    <>
      <Book pages={pages} />
      <OrbitControls
        maxDistance={8}
        minDistance={2}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 3}
      />
      <Environment preset="city"></Environment>
      <directionalLight
        position={[2, 5, 2]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={window.innerWidth < 768 ? 1024 : 2048}
        shadow-mapSize-height={window.innerWidth < 768 ? 1024 : 2048}
        shadow-bias={-0.0001}
      />
      <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
    </>
  );
};
