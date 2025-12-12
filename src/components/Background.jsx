import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

// Background configurations
const BACKGROUND_CONFIGS = {
  // CSS Gradient backgrounds
  "deep-white": {
    type: "gradient",
    className: "bg-gradient-to-br from-[#616161] to-[#9E9E9E]",
  },
  "deep-black": {
    type: "gradient",
    className: "bg-gradient-to-br from-[#000000] to-[#212121]",
  },
  "royal-blue": {
    type: "gradient",
    className: "bg-gradient-to-br from-[#000080] via-[#0046FF] to-[#4169E1]",
  },
  "purple-dream": {
    type: "gradient",
    className: "bg-gradient-to-br from-[#FF8C00] via-[#FF7F50] to-[#FF6347]",
  },
  "sunset-orange": {
    type: "gradient",
    className: "bg-gradient-to-br from-[#E65C00] to-[#F9D423]",
  },
  "fire-red": {
    type: "gradient",
    className: "bg-gradient-to-br from-[#870000] to-[#190A05]",
  },
  "spring-green": {
    type: "gradient",
    className: "bg-gradient-to-br from-[#215F00] to-[#E4E4D9]",
  },
  "arctic-blue": {
    type: "gradient",
    className: "bg-gradient-to-br from-[#5433FF] via-[#20BDFF] to-[#A5FECB]",
  },

  // Shader Gradient backgrounds
  test: {
    type: "shader",
    config: {
      canvas: {
        style: {
          width: "100%",
          height: "100%",
        },
        lazyLoad: undefined,
        fov: 45,
        pixelDensity: 1,
        pointerEvents: "none",
      },
      gradient: {
        animate: "on",
        type: "waterPlane",
        wireframe: false,
        shader: "defaults",
        uTime: 0.2,
        uSpeed: 0.1,
        uStrength: 2.4,
        uDensity: 1.1,
        uFrequency: 5.5,
        uAmplitude: 0,
        positionX: -0.5,
        positionY: 0.1,
        positionZ: 0,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 235,
        color1: "#5606FF",
        color2: "#e63535",
        color3: "#000000",
        reflection: 0.1,
        cAzimuthAngle: 180,
        cPolarAngle: 115,
        cDistance: 3.9,
        cameraZoom: 1,
        lightType: "3d",
        brightness: 1.1,
        envPreset: "city",
        grain: "off",
        toggleAxis: undefined,
        zoomOut: undefined,
        hoverState: "",
        enableTransition: false,
      },
    },
  },

  // Add more shader backgrounds here as needed
  // Example:
  // "shader-purple-sphere": {
  //   type: "shader",
  //   config: {
  //     canvas: { ... },
  //     gradient: { ... }
  //   }
  // }
};

// Default fallback background
const DEFAULT_BACKGROUND = "royal-blue";

/**
 * Background Component
 * Renders either a CSS gradient or shader gradient background based on configuration
 *
 * @param {string} style - The background style identifier from the database
 */
export const Background = ({ style }) => {
  const config =
    BACKGROUND_CONFIGS[style] || BACKGROUND_CONFIGS[DEFAULT_BACKGROUND];

  if (config.type === "shader") {
    const { canvas, gradient } = config.config;
    return (
      <div className="absolute inset-0 z-0">
        <ShaderGradientCanvas {...canvas}>
          <ShaderGradient {...gradient} />
        </ShaderGradientCanvas>
      </div>
    );
  }

  // Default to gradient type
  return <div className={`absolute inset-0 z-0 ${config.className}`} />;
};
