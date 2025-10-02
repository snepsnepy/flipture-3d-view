import {
  Environment,
  OrbitControls,
  Float,
  useScroll,
} from "@react-three/drei";
import { Book } from "./Book";
import { useAtom } from "jotai";
import { pageAtom, scrollProgressAtom } from "./UI";
import { useEffect, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { usePages } from "../contexts/PagesContext";
import { MathUtils } from "three";

export const Experience = () => {
  const [page] = useAtom(pageAtom);
  const [, setScrollProgress] = useAtom(scrollProgressAtom);
  const { pages } = usePages();
  const isBookOpened = page > 0;
  const { camera, viewport } = useThree();
  const [bookPosition, setBookPosition] = useState([0, -1.9, 0]);
  const [isMobile, setIsMobile] = useState(false);
  const scroll = useScroll();

  // Responsive camera positioning
  useEffect(() => {
    const handleResize = () => {
      const isMobileScreen = window.innerWidth < 768;
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

      setIsMobile(isMobileScreen);

      // Keep camera positioning consistent across all devices
      if (isMobileScreen) {
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

  // Handle scroll-based book positioning
  useFrame(() => {
    if (scroll) {
      // Get scroll progress (0 to 1)
      const scrollProgress = scroll.offset;

      // Update scroll progress atom for UI components
      setScrollProgress(scrollProgress);

      // Initial position: [0, -1.9, 0]
      // Target position: [0, 0, 0] (centered on Y-axis)
      const initialY = -1.9;
      const targetY = 0;

      // Interpolate Y position based on scroll progress
      const currentY = MathUtils.lerp(initialY, targetY, scrollProgress);

      // Keep book centered - mobile offset is handled in Book component
      setBookPosition([0, currentY, 0]);
    }
  });

  return (
    <>
      <Book pages={pages} position={bookPosition} includeCover={true} />
      {/* <OrbitControls
        maxDistance={8}
        minDistance={2}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 3}
      /> */}
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
