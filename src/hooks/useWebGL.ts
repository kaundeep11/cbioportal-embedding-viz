import { useEffect, useRef, useState } from 'react';
// @ts-ignore
import createREGL from 'regl';

export const useWebGL = (canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
  const reglRef = useRef<any>(null);
  const drawPointsRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    // Create new REGL context
    let regl: any;
    try {
      regl = createREGL({ canvas });
    } catch (err) {
      console.warn("REGL Not Supported", err);
      return;
    }
    
    reglRef.current = regl;

    // Create the draw command for circles using points primitive
    drawPointsRef.current = regl({
      frag: `
        precision mediump float;
        varying vec3 vColor;
        uniform float opacity;
        
        void main() {
          vec2 cxy = 2.0 * gl_PointCoord - 1.0;
          float r = dot(cxy, cxy);
          if (r > 1.0) discard;
          
          // Anti-alias smooth edge
          float alpha = (1.0 - smoothstep(0.8, 1.0, r));
          gl_FragColor = vec4(vColor, opacity * alpha * 0.9);
        }`,
      vert: `
        precision mediump float;
        attribute vec2 position;
        attribute vec3 color;
        varying vec3 vColor;
        
        uniform vec2 resolution;
        uniform vec2 offset;
        uniform float pointSize;
        
        void main() {
          vColor = color;
          gl_PointSize = pointSize;
          
          // Apply margins to data points to align linearly on canvas screen
          vec2 pixelPos = position + offset;
          
          // Map to clip space geometry: [-1, 1], flipping Y so 0 is top
          vec2 clipSpace = (pixelPos / resolution) * 2.0 - 1.0;
          gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        }`,
      attributes: {
        position: regl.prop('positions'),
        color: regl.prop('colors')
      },
      uniforms: {
        resolution: regl.prop('resolution'),
        offset: regl.prop('offset'),
        pointSize: regl.prop('pointSize'),
        opacity: regl.prop('opacity')
      },
      count: regl.prop('count'),
      primitive: 'points',
      blend: {
        enable: true,
        func: {
          srcRGB: 'src alpha',
          srcAlpha: 1,
          dstRGB: 'one minus src alpha',
          dstAlpha: 1
        }
      },
      depth: { enable: false }
    });

    setReady(true);

    return () => {
      regl.destroy();
      reglRef.current = null;
      drawPointsRef.current = null;
      setReady(false);
    };
  }, [canvasRef]);

  return { 
    regl: reglRef.current, 
    drawPoints: drawPointsRef.current,
    ready
  };
};
