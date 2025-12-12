# Background System

This document explains how to add and manage background variants for the flipbook viewer.

## Overview

The background system supports two types of backgrounds:

1. **CSS Gradients** - Simple Tailwind CSS gradient backgrounds
2. **Shader Gradients** - Advanced WebGL-based animated backgrounds using `@shadergradient/react`

## File Structure

- `Background.jsx` - Main background component that handles rendering
- `BACKGROUND_CONFIGS` - Configuration object containing all background definitions

## Adding a New CSS Gradient Background

To add a new CSS gradient background:

1. Open `src/components/Background.jsx`
2. Add a new entry to the `BACKGROUND_CONFIGS` object:

```javascript
"your-background-name": {
  type: "gradient",
  className: "bg-gradient-to-br from-[#HEX1] to-[#HEX2]",
}
```

3. Update your database to use `"your-background-name"` as the `background_gradient` value

### Example:

```javascript
"ocean-blue": {
  type: "gradient",
  className: "bg-gradient-to-br from-[#006994] via-[#00B4D8] to-[#90E0EF]",
}
```

## Adding a New Shader Gradient Background

To add a new shader gradient background:

1. Use the [Shader Gradient Playground](https://www.shadergradient.co/customize) to design your gradient
2. Copy the configuration values
3. Add a new entry to `BACKGROUND_CONFIGS`:

```javascript
"your-shader-name": {
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
      // Paste your shader configuration here
      animate: "on",
      type: "waterPlane", // or "sphere", "plane", etc.
      color1: "#HEX1",
      color2: "#HEX2",
      color3: "#HEX3",
      // ... other properties
    },
  },
}
```

### Example:

```javascript
"purple-sphere": {
  type: "shader",
  config: {
    canvas: {
      style: { width: "100%", height: "100%" },
      fov: 45,
      pixelDensity: 1,
      pointerEvents: "none",
    },
    gradient: {
      animate: "on",
      type: "sphere",
      color1: "#809bd6",
      color2: "#910aff",
      color3: "#af38ff",
      uSpeed: 0.3,
      cameraZoom: 12.5,
      // ... other properties
    },
  },
}
```

## Important Notes

- **Database Values**: The background name in `BACKGROUND_CONFIGS` must match exactly with the `background_gradient` value stored in your Supabase database
- **Default Background**: If a background name is not found, it will fall back to `"royal-blue"`
- **Performance**: Shader gradients are more resource-intensive than CSS gradients. Test on mobile devices before deploying
- **Pointer Events**: Always set `pointerEvents: "none"` for shader canvases to prevent interaction conflicts with the flipbook

## Testing

To test a new background:

1. Add the background configuration to `Background.jsx`
2. Update a flipbook's `background_gradient` field in the database
3. Load the flipbook with `?id=your-flipbook-id`
4. Verify the background renders correctly on both desktop and mobile

## Troubleshooting

### Background not showing

- Check that the database value matches the config key exactly (case-sensitive)
- Verify the background type is set to either `"gradient"` or `"shader"`

### Shader gradient not animating

- Ensure `animate: "on"` is set in the gradient config
- Check browser console for WebGL errors

### Performance issues

- Reduce `pixelDensity` (try 0.5 or 0.75)
- Disable grain effect
- Consider using CSS gradients for mobile devices
