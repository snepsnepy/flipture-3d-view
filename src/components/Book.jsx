import { useRef, useMemo } from "react";
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
} from "three";
import { pages } from "./UI";
import { useFrame } from "@react-three/fiber";

const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71; // 4:3 Aspect Ratio
const PAGE_DEPTH = 0.003;
const PAGE_SEGMENTS = 30;
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

const pageMaterials = [
  new MeshStandardMaterial({ color: whiteColor }),
  new MeshStandardMaterial({ color: "#111" }),
  new MeshStandardMaterial({ color: whiteColor }),
  new MeshStandardMaterial({ color: whiteColor }),
  new MeshStandardMaterial({ color: "pink" }),
  new MeshStandardMaterial({ color: "blue" }),
];

const Page = ({ number, front, back, ...props }) => {
  const group = useRef();
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
    const materials = pageMaterials;

    const mesh = new SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;

    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);

    return mesh;
  }, []);

  //   useHelper(skinnedMeshRef, SkeletonHelper, "red");

  useFrame(() => {
    if (!skinnedMeshRef.current) return;

    const bones = skinnedMeshRef.current.skeleton.bones;
  });

  return (
    <group {...props} ref={group}>
      <primitive object={manualSkinnedMesh} ref={skinnedMeshRef} />
    </group>
  );
};

export const Book = ({ ...props }) => {
  return (
    <group {...props}>
      {[...pages].map((pageData, index) =>
        index === 0 ? (
          <Page
            position-x={index * 0.15}
            key={index}
            number={index}
            {...pageData}
          />
        ) : null
      )}
    </group>
  );
};
