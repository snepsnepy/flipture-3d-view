import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

// Background configurations
const BACKGROUND_CONFIGS = {
  // CSS Gradient backgrounds
  "deep-white": {
    type: "gradient",
    theme: "light",
    className: "bg-white",
    layers: [
      {
        className: "absolute inset-0",
        style: {
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(15,23,42,0.08), transparent 70%), #ffffff",
        },
      },
    ],
  },
  "light-grid": {
    type: "gradient",
    theme: "light",
    className: "bg-white",
    layers: [
      {
        className: "absolute inset-0",
        style: {
          backgroundImage: `
            linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),
            radial-gradient(circle 500px at 20% 100%, rgba(139,92,246,0.3), transparent),
            radial-gradient(circle 500px at 100% 80%, rgba(59,130,246,0.3), transparent)
          `,
          backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
        },
      },
    ],
  },
  "deep-black": {
    type: "gradient",
    theme: "dark",
    className: "bg-black",
    layers: [
      {
        className: "absolute inset-0",
        style: {
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(226,232,240,0.15), transparent 70%), #000000",
        },
      },
    ],
  },
  "royal-blue": {
    type: "gradient",
    theme: "dark",
    className: "bg-[#0f172a]",
    layers: [
      {
        className: "absolute inset-0",
        style: {
          background:
            "linear-gradient(135deg, rgba(59,130,246,1), rgba(30,58,138,1))",
        },
      },
    ],
  },
  "purple-dream": {
    type: "gradient",
    theme: "dark",
    className: "bg-[#020617]",
    layers: [
      {
        className: "absolute inset-0",
        style: {
          background: "#020617",
          backgroundImage: `
            linear-gradient(to right, rgba(71,85,105,0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(71,85,105,0.3) 1px, transparent 1px),
            radial-gradient(circle at 50% 50%, rgba(139,92,246,0.15) 0%, transparent 70%)
          `,
          backgroundSize: "32px 32px, 32px 32px, 100% 100%",
        },
      },
    ],
  },
  "sunset-orange": {
    type: "gradient",
    theme: "dark",
    className: "bg-black",
    layers: [
      {
        className: "absolute inset-0",
        style: {
          background:
            "radial-gradient(70% 55% at 50% 50%, #c45a28 0%, #8b3518 18%, #5c2210 34%, #3a1508 50%, #250e04 66%, #160802 80%, #0d0401 92%, #060200 97%, #020100 100%), radial-gradient(160% 130% at 10% 10%, rgba(0,0,0,0) 38%, #060200 76%, #040100 100%), radial-gradient(160% 130% at 90% 90%, rgba(0,0,0,0) 38%, #060200 76%, #040100 100%)",
        },
      },
    ],
  },
  "fire-red": {
    type: "gradient",
    theme: "dark",
    className: "bg-[#1a0505]",
    layers: [
      {
        className: "absolute inset-0",
        style: {
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "6rem 4rem",
        },
      },
      {
        className: "absolute inset-0",
        style: {
          background:
            "linear-gradient(225deg, rgba(234,88,12,0.7), rgba(220,38,38,0.7) 50%, rgba(127,29,29,0.7))",
        },
      },
    ],
  },
  "spring-green": {
    type: "gradient",
    theme: "dark",
    className: "bg-[#0f172a]",
    layers: [
      {
        className:
          "absolute inset-0 bg-[radial-gradient(#ffffff33_1px,#0f172a_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_80%_50%_at_0%_0%,#000_70%,transparent_110%)]",
      },
      {
        className:
          "absolute inset-0 bg-[radial-gradient(125%_125%_at_50%_50%,rgba(34,197,94,0.5)_40%,rgba(15,23,42,1)_100%)]",
      },
    ],
  },
  "premium-blue": {
    type: "gradient",
    theme: "dark",
    className: "bg-black",
    layers: [
      {
        className: "absolute inset-0",
        style: {
          background:
            "radial-gradient(70% 55% at 50% 50%, #2a5d77 0%, #184058 18%, #0f2a43 34%, #0a1b30 50%, #071226 66%, #040d1c 80%, #020814 92%, #01040d 97%, #000309 100%), radial-gradient(160% 130% at 10% 10%, rgba(0,0,0,0) 38%, #000309 76%, #000208 100%), radial-gradient(160% 130% at 90% 90%, rgba(0,0,0,0) 38%, #000309 76%, #000208 100%)",
        },
      },
    ],
  },
  "aurora-bloom": {
    type: "gradient",
    theme: "light",
    className: "bg-[#f7eaff]",
    layers: [
      {
        className: "absolute inset-0",
        style: {
          background: `
            radial-gradient(ellipse 80% 60% at 70% 20%, rgba(175,109,255,0.85), transparent 68%),
            radial-gradient(ellipse 70% 60% at 20% 80%, rgba(255,100,180,0.75), transparent 68%),
            radial-gradient(ellipse 60% 50% at 60% 65%, rgba(255,235,170,0.98), transparent 68%),
            radial-gradient(ellipse 65% 40% at 50% 60%, rgba(120,190,255,0.3), transparent 68%),
            linear-gradient(180deg, #f7eaff 0%, #fde2ea 100%)
          `,
        },
      },
    ],
  },
  "cosmic-pulse": {
    type: "gradient",
    theme: "dark",
    className: "bg-[#0a0a0a]",
    layers: [
      {
        className: "absolute inset-0",
        style: {
          backgroundImage: `
            repeating-radial-gradient(
            circle at 50% 50%,
              rgba(168,85,247,0.18) 0 6px,
              rgba(168,85,247,0) 6px 44px
            ),
            radial-gradient(circle at 50% 60%, rgba(59,130,246,0.18), transparent 55%),
            radial-gradient(circle at 50% 85%, rgba(16,185,129,0.12), transparent 65%)
          `,
        },
      },
    ],
  },
  // Shader Gradient backgrounds
  "violet-ember": {
    type: "shader",
    theme: "dark",
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
  "amethyst-orb": {
    type: "shader",
    theme: "dark",
    config: {
      canvas: {
        style: {
          width: "100%",
          height: "100%",
        },
        lazyLoad: undefined,
        fov: undefined,
        pixelDensity: 2,
        pointerEvents: "none",
      },
      gradient: {
        animate: "on",
        type: "sphere",
        wireframe: false,
        shader: "defaults",
        uTime: 0,
        uSpeed: 0.3,
        uStrength: 0.4,
        uDensity: 0.8,
        uFrequency: 5.5,
        uAmplitude: 7,
        positionX: 0,
        positionY: 0,
        positionZ: 0,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 140,
        color1: "#809bd6",
        color2: "#910aff",
        color3: "#af38ff",
        reflection: 0.5,
        cAzimuthAngle: 250,
        cPolarAngle: 140,
        cDistance: 1.5,
        cameraZoom: 12.5,
        lightType: "3d",
        brightness: 1.5,
        envPreset: "city",
        grain: "off",
        toggleAxis: false,
        zoomOut: false,
        hoverState: "",
        enableTransition: false,
      },
    },
  },
  synthwave: {
    type: "shader",
    theme: "dark",
    config: {
      canvas: {
        style: {
          width: "100%",
          height: "100%",
        },
        lazyLoad: undefined,
        fov: undefined,
        pixelDensity: 1,
        pointerEvents: "none",
      },
      gradient: {
        animate: "on",
        type: "waterPlane",
        wireframe: true,
        shader: "defaults",
        uTime: 10.1,
        uSpeed: 0.2,
        uStrength: 0.5,
        uDensity: 2,
        uFrequency: 0,
        uAmplitude: 0,
        positionX: 0,
        positionY: 0,
        positionZ: 0,
        rotationX: 60,
        rotationY: 0,
        rotationZ: 30,
        color1: "#ff00cc",
        color2: "#333399",
        color3: "#00ffff",
        reflection: 0.4,
        cAzimuthAngle: 180,
        cPolarAngle: 70,
        cDistance: 3.2,
        cameraZoom: 8.5,
        lightType: "3d",
        brightness: 1.3,
        envPreset: "city",
        grain: "off",
        toggleAxis: false,
        zoomOut: false,
        hoverState: "",
        enableTransition: false,
      },
    },
  },
  "desert-dusk": {
    type: "shader",
    theme: "dark",
    config: {
      canvas: {
        style: {
          width: "100%",
          height: "100%",
        },
        lazyLoad: undefined,
        fov: undefined,
        pixelDensity: 1,
        pointerEvents: "none",
      },
      gradient: {
        animate: "on",
        type: "waterPlane",
        wireframe: true,
        shader: "defaults",
        uTime: 12,
        uSpeed: 0.16,
        uStrength: 0.7,
        uDensity: 2,
        uFrequency: 0,
        uAmplitude: 0,
        positionX: 0,
        positionY: 0,
        positionZ: 0,
        rotationX: 60,
        rotationY: 0,
        rotationZ: 30,
        color1: "#eed039",
        color2: "#9f5007",
        color3: "#000000",
        reflection: 0.4,
        cAzimuthAngle: 180,
        cPolarAngle: 70,
        cDistance: 3.2,
        cameraZoom: 8.5,
        lightType: "3d",
        brightness: 1.3,
        envPreset: "city",
        grain: "off",
        toggleAxis: false,
        zoomOut: false,
        hoverState: "",
        enableTransition: false,
      },
    },
  },
};

// Default fallback background
const DEFAULT_BACKGROUND = "royal-blue";

/**
 * Returns "dark" or "light" theme for a given background style.
 * Use this to determine color: white on dark, black on light.
 */
export const getBackgroundTheme = (style) => {
  const config =
    BACKGROUND_CONFIGS[style] || BACKGROUND_CONFIGS[DEFAULT_BACKGROUND];
  return config.theme ?? "dark";
};

/**
 * Background Component
 * Renders either a CSS gradient or shader gradient background based on configuration
 *
 * @param {string} style - The background style identifier from the database
 * @param {boolean} animate - Whether to animate shader gradients (default: true)
 */
export const Background = ({ style, animate = true }) => {
  const config =
    BACKGROUND_CONFIGS[style] || BACKGROUND_CONFIGS[DEFAULT_BACKGROUND];

  if (config.type === "shader") {
    const { canvas, gradient } = config.config;
    return (
      <div className="absolute inset-0 z-0">
        <ShaderGradientCanvas {...canvas}>
          <ShaderGradient
            {...gradient}
            animate={animate ? gradient.animate : "off"}
          />
        </ShaderGradientCanvas>
      </div>
    );
  }

  // Default to gradient type
  return (
    <div className={`absolute inset-0 z-0 ${config.className}`}>
      {config.layers?.map((layer, index) => (
        <div key={index} className={layer.className} style={layer.style} />
      ))}
    </div>
  );
};
