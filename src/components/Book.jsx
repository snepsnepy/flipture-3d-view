import { useRef, useMemo, useState, useEffect } from "react";
import { useAtom } from "jotai";
import { easing } from "maath";
import {
  BoxGeometry,
  Uint16BufferAttribute,
  Vector3,
  Bone,
  Skeleton,
  SkinnedMesh,
  MeshStandardMaterial,
  Color,
  Float32BufferAttribute,
  SRGBColorSpace,
  MathUtils,
  TextureLoader,
} from "three";
import { pageAtom, pageFocusAtom } from "./UI";
import { useFrame } from "@react-three/fiber";
import { useTexture, useCursor } from "@react-three/drei";
import { degToRad } from "three/src/math/MathUtils.js";

const easingFactor = 0.5; // Controls the speed of the easing;
const easingFactorFold = 0.3; // Controls the speed of the fold easing;
const insideCurveStrenght = 0.18; // Controls the strength of the inside curve;
const outsideCurveStrength = -0.002; // Controls the strength of the outside curve;
const turningCurveStrength = 0.09; // Controls the strength of the turning curve;

const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71; // 4:3 Aspect Ratio
const PAGE_DEPTH = 0.003;
const PAGE_SEGMENTS = 40;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

const pageGeometry = new BoxGeometry(
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_DEPTH,
  PAGE_SEGMENTS,
  2
);

pageGeometry.translate(PAGE_WIDTH / 2, 0, 0);

const position = pageGeometry.attributes.position;
const vertex = new Vector3();
const skinIndexes = [];
const skinWeights = [];

// Populate the arrays first
for (let i = 0; i < position.count; i++) {
  vertex.fromBufferAttribute(position, i); // get the vertex position
  const x = vertex.x; // get the x position

  const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH)); // Calculate the skin index
  let skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH; // Calculate the skin weight

  skinIndexes.push(skinIndex, skinIndex + 1, 0, 0);
  skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
}

// Set the attributes after the loop
pageGeometry.setAttribute(
  "skinIndex",
  new Uint16BufferAttribute(skinIndexes, 4)
);
pageGeometry.setAttribute(
  "skinWeight",
  new Float32BufferAttribute(skinWeights, 4)
);

const whiteColor = new Color("white");
const emissiveColor = new Color("#FFCC00");

const pageMaterials = [
  new MeshStandardMaterial({ color: whiteColor }),
  new MeshStandardMaterial({ color: "#111" }),
  new MeshStandardMaterial({ color: whiteColor }),
  new MeshStandardMaterial({ color: whiteColor }),
];

// Preload textures for book covers
useTexture.preload(`/textures/book-cover.jpg`);
useTexture.preload(`/textures/book-back.jpg`);
useTexture.preload(`/textures/book-cover-roughness.jpg`);

const Page = ({
  number,
  front,
  back,
  page,
  opened,
  bookClosed,
  pages,
  ...props
}) => {
  const [picture, setPicture] = useState(null);
  const [picture2, setPicture2] = useState(null);
  const [pictureRoughness, setPictureRoughness] = useState(null);

  // Load textures based on whether they are data URLs or file paths
  useEffect(() => {
    const loader = new TextureLoader();

    // Create blank white texture for blank pages
    const createBlankTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const context = canvas.getContext("2d");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, 512, 512);
      return canvas.toDataURL();
    };

    // Load front texture
    if (front === "blank-page") {
      loader.load(createBlankTexture(), setPicture);
    } else if (front.startsWith("data:")) {
      loader.load(front, setPicture);
    } else {
      loader.load(`/textures/${front}.jpg`, setPicture);
    }

    // Load back texture
    if (back === "blank-page") {
      loader.load(createBlankTexture(), setPicture2);
    } else if (back.startsWith("data:")) {
      loader.load(back, setPicture2);
    } else {
      loader.load(`/textures/${back}.jpg`, setPicture2);
    }

    // Load roughness texture for covers
    if (number === 0 || number === pages.length - 1) {
      loader.load("/textures/book-cover-roughness.jpg", setPictureRoughness);
    }
  }, [front, back, number, pages.length]);

  // Set color space when textures are loaded
  useEffect(() => {
    if (picture) picture.colorSpace = SRGBColorSpace;
    if (picture2) picture2.colorSpace = SRGBColorSpace;
  }, [picture, picture2]);

  const group = useRef();
  const turnedAt = useRef(0);
  const lastOpened = useRef(opened);

  const skinnedMeshRef = useRef();

  const manualSkinnedMesh = useMemo(() => {
    const bones = [];
    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      let bone = new Bone();
      bones.push(bone);
      if (i === 0) {
        bone.position.x = 0;
      } else {
        bone.position.x = SEGMENT_WIDTH;
      }

      if (i > 0) {
        bones[i - 1].add(bone);
      }
    }

    const skeleton = new Skeleton(bones);
    const materials = [
      ...pageMaterials,
      // Front page material roughness (use 1 for matte texture)
      new MeshStandardMaterial({
        color: whiteColor,
        map: picture,
        ...(number === 0
          ? { roughnessMap: pictureRoughness }
          : { roughness: 0.2 }),
        emissive: emissiveColor,
        emissiveIntensity: 0,
      }),
      // Back page material roughness (use 0 for glossy texture)
      new MeshStandardMaterial({
        color: whiteColor,
        map: picture2,
        ...(number === pages.length - 1
          ? { roughnessMap: pictureRoughness }
          : { roughness: 0.2 }),
        emissive: emissiveColor,
        emissiveIntensity: 0,
      }),
    ];

    const mesh = new SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;

    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);

    return mesh;
  }, [picture, picture2, pictureRoughness, number, pages.length]);

  //   useHelper(skinnedMeshRef, SkeletonHelper, "red");

  useFrame((_, delta) => {
    if (!skinnedMeshRef.current) return;

    // Hover effect intensity
    const emissiveIntensity = highlighted ? 0.02 : 0;
    skinnedMeshRef.current.material[4].emissiveIntensity =
      skinnedMeshRef.current.material[5].emissiveIntensity = MathUtils.lerp(
        skinnedMeshRef.current.material[4].emissiveIntensity,
        emissiveIntensity,
        0.1
      );

    if (lastOpened.current !== opened) {
      turnedAt.current = +new Date();
      lastOpened.current = opened;
    }

    let turningTime = Math.min(400, new Date() - turnedAt.current) / 400;
    turningTime = Math.sin(turningTime * Math.PI);

    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
    // If the book is not closed, rotate the page (How the book looks when it's closed)
    if (!bookClosed) {
      targetRotation += degToRad(number * 0.8);
    }

    const bones = skinnedMeshRef.current.skeleton.bones;
    for (let i = 0; i < bones.length; i++) {
      const target = i === 0 ? group.current : bones[i];

      const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
      const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.1 + 0.35) : 0;
      const turningIntensity =
        Math.sin(i * Math.PI * (1 / bones.length)) * turningTime;

      let rotationAngle =
        insideCurveStrenght * insideCurveIntensity * targetRotation -
        outsideCurveStrength * outsideCurveIntensity * targetRotation +
        turningCurveStrength * turningIntensity * targetRotation;

      let foldRotationAngle = degToRad(Math.sign(targetRotation) * 2);

      if (bookClosed) {
        if (i === 0) {
          rotationAngle = targetRotation;
          foldRotationAngle = 0;
        } else {
          rotationAngle = 0;
        }
      }

      easing.dampAngle(
        target.rotation,
        "y",
        rotationAngle,
        easingFactor,
        delta
      );

      const foldIntensity =
        i > 8
          ? Math.sin(i * Math.PI * (1 / bones.length) - 0.3) * turningTime // Adjusted offset for 40 segments
          : 0;

      easing.dampAngle(
        target.rotation,
        "x",
        foldRotationAngle * foldIntensity,
        easingFactorFold,
        delta
      );
    }
  });

  const [_, setPage] = useAtom(pageAtom);
  const [pageFocus, setPageFocus] = useAtom(pageFocusAtom);
  const [highlighted, setHighlighted] = useState(false);
  useCursor(highlighted);

  return (
    <group
      {...props}
      ref={group}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setHighlighted(true);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        setHighlighted(false);
      }}
      onClick={(e) => {
        e.stopPropagation();

        // Check if we're on mobile
        const isMobile = window.innerWidth < 768;

        if (isMobile && opened && page > 0 && page < pages.length) {
          // On mobile, for opened pages, check if we should focus or turn page
          const isEvenPage = page % 2 === 0;
          const isLeftPageVisible = isEvenPage;
          const isRightPageVisible = !isEvenPage;

          // Determine which page was clicked based on the page number
          const isClickingLeftPage = number === page - 1;
          const isClickingRightPage = number === page;

          if (isClickingRightPage && pageFocus === "left") {
            // Clicking on right page while focused on left - switch focus
            setPageFocus("right");
          } else if (isClickingLeftPage && pageFocus === "right") {
            // Clicking on left page while focused on right - switch focus
            setPageFocus("left");
          } else {
            // Normal page turn
            const newPage = opened ? number : number + 1;
            setPage(newPage);
            // When going forward, start with left focus for new spreads
            // When going backward (opened && number < page), start with right focus
            const isGoingBackward = opened && number < page;
            setPageFocus(isGoingBackward ? "right" : "left");
          }
        } else {
          // Desktop behavior or non-opened pages
          const newPage = opened ? number : number + 1;
          setPage(newPage);
          // When opening from cover (page 0 -> 1), start with right focus
          // Otherwise reset to left focus for new spreads
          setPageFocus(page === 0 && newPage === 1 ? "right" : "left");
        }

        setHighlighted(false);
      }}
    >
      <primitive
        object={manualSkinnedMesh}
        ref={skinnedMeshRef}
        position-z={-number * PAGE_DEPTH + page * PAGE_DEPTH}
      />
    </group>
  );
};

export const Book = ({ pages = [], ...props }) => {
  const [page] = useAtom(pageAtom);
  const [pageFocus] = useAtom(pageFocusAtom);
  const [delayedPage, setDelayedPage] = useState(page);
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOffset, setMobileOffset] = useState(0);
  const groupRef = useRef();

  useEffect(() => {
    const handleResize = () => {
      const isMobileScreen = window.innerWidth < 768;
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

      setIsMobile(isMobileScreen);

      if (isMobileScreen) {
        // On mobile: 0.7 when closed, 1.1 when opened
        const isBookOpened = page > 0 && page < pages.length;
        setScale(isBookOpened ? 1.1 : 0.7);
      } else if (isTablet) {
        setScale(0.85);
      } else {
        setScale(1);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [page, pages.length]);

  // Calculate mobile offset based on current page and focus
  useEffect(() => {
    if (isMobile) {
      const pageWidth = 1.28; // PAGE_WIDTH
      let offset = 0;

      // Base positioning adjustment for opened book (1.1 scale)
      const isBookOpened = page > 0 && page < pages.length;
      const scaleAdjustment = isBookOpened ? 0.15 : 0; // Move right when scaled up

      if (page === 0) {
        // Show cover (right page) - shift left to center the right page
        offset = -pageWidth * 0.3;
      } else if (page === pages.length) {
        // Show back cover (left page) - shift right to center the left page
        offset = pageWidth * 0.3;
      } else {
        // For content pages, use focus state to determine which page to show
        if (pageFocus === "left") {
          // Focus on left page of the spread
          offset = pageWidth * 0.3 + scaleAdjustment;
        } else {
          // Focus on right page of the spread - needs different adjustment
          offset = -pageWidth * 0.75 + scaleAdjustment * 2; // More adjustment for right pages
        }
      }

      setMobileOffset(offset);
    } else {
      setMobileOffset(0);
    }
  }, [page, pages.length, isMobile, pageFocus]);

  useEffect(() => {
    let timeout;
    // If the page difference is greater than 2, we need to wait for 50ms before going to the next page, otherwise we can go to the next page immediately
    const goToPage = () => {
      setDelayedPage((delayedPage) => {
        if (page === delayedPage) {
          return delayedPage;
        } else {
          timeout = setTimeout(
            () => {
              goToPage();
            },
            Math.abs(page - delayedPage) > 2 ? 50 : 150
          );

          if (page > delayedPage) {
            return delayedPage + 1;
          }
          if (page < delayedPage) {
            return delayedPage - 1;
          }
        }
      });
    };
    goToPage();
    return () => clearTimeout(timeout);
  }, [page]);

  // Smooth position transitions using easing
  useFrame((_, delta) => {
    if (groupRef.current) {
      // Combine external position with mobile offset
      const targetPosition = [
        (props.position?.[0] || 0) + mobileOffset,
        props.position?.[1] || 0,
        props.position?.[2] || 0,
      ];

      easing.damp3(groupRef.current.position, targetPosition, 0.25, delta);
    }
  });

  return (
    <group ref={groupRef} rotation-y={-Math.PI / 2} scale={scale}>
      {[...pages].map((pageData, index) => (
        <Page
          key={index}
          page={delayedPage}
          number={index}
          opened={delayedPage > index}
          bookClosed={delayedPage === 0 || delayedPage === pages.length}
          pages={pages}
          {...pageData}
        />
      ))}
    </group>
  );
};
