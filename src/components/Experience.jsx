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
  const [isTablet, setIsTablet] = useState(false);
  const scroll = useScroll();

  // Responsive camera positioning
  useEffect(() => {
    const handleResize = () => {
      const isMobileScreen = window.innerWidth < 768;
      const isTabletScreen =
        window.innerWidth >= 768 && window.innerWidth < 1024;

      setIsMobile(isMobileScreen);
      setIsTablet(isTabletScreen);

      // Keep camera positioning consistent across all devices
      if (isMobileScreen) {
        camera.position.set(0, 0, 4.3);
        camera.lookAt(0, 0, 0);
      } else if (isTablet) {
        camera.position.set(0, 0, 3.5);
        camera.lookAt(0, 0, 0);
      } else {
        camera.position.set(0, 0, 2.5);
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
      const initialY = -1.6;
      const targetY = 0;

      // Interpolate Y position based on scroll progress
      let currentY = MathUtils.lerp(initialY, targetY, scrollProgress);

      // On mobile, when book is opened, move it up a bit
      if (isMobile && isBookOpened) {
        currentY += 0.2; // Adjust this value to move book higher or lower
      }

      // When book is closed (page 0), shift it to center the closed book
      // When open, keep it at 0 so the spine is centered
      // PAGE_WIDTH is 1.28, and after rotation, we need to offset in X
      // Calculate offset based on viewport and book scale
      let xOffset = 0;
      if (!isBookOpened) {
        if (isMobile) {
          // Mobile: scale 0.7, adjust offset proportionally
          xOffset = -0.64 * 0.8;
        } else if (isTablet) {
          // Tablet: scale 0.85, adjust offset proportionally
          xOffset = -0.64 * 0.85;
        } else {
          // Desktop: scale 1
          xOffset = -0.64;
        }
      }

      setBookPosition([xOffset, currentY, 0]);
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
