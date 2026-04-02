"use client";

import React, { useEffect, useRef } from "react";
import createGlobe from "cobe";
import { cn } from "@/lib/utils";

/** Defaults tuned for Pendlex light theme: primary #4d7a00, lime chart scale. */
const THEME_BASE: [number, number, number] = [0.2, 0.33, 0.11];
const THEME_MARKER: [number, number, number] = [0.302, 0.478, 0.04];
const THEME_GLOW: [number, number, number] = [0.42, 0.62, 0.14];

export interface GlobeProps {
  className?: string;
  theta?: number;
  dark?: number;
  scale?: number;
  diffuse?: number;
  mapSamples?: number;
  mapBrightness?: number;
  baseColor?: [number, number, number];
  markerColor?: [number, number, number];
  glowColor?: [number, number, number];
}

const Globe: React.FC<GlobeProps> = ({
  className,
  theta = 0.28,
  dark = 0.78,
  scale = 1.12,
  diffuse = 1.05,
  mapSamples = 40000,
  mapBrightness = 5.4,
  baseColor = THEME_BASE,
  markerColor = THEME_MARKER,
  glowColor = THEME_GLOW,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let phi = 0;
    let globe: ReturnType<typeof createGlobe> | null = null;
    let rafId = 0;

    const tick = () => {
      phi += 0.003;
      globe?.update({ phi });
      rafId = requestAnimationFrame(tick);
    };

    const layout = () => {
      const w = canvas.offsetWidth;
      if (w < 2) return;
      const dim = w * 2;
      if (!globe) {
        globe = createGlobe(canvas, {
          devicePixelRatio: 2,
          width: dim,
          height: dim,
          phi: 0,
          theta,
          dark,
          scale,
          diffuse,
          mapSamples,
          mapBrightness,
          baseColor,
          markerColor,
          glowColor,
          opacity: 1,
          offset: [0, 0],
          markers: [],
        });
        if (rafId === 0) rafId = requestAnimationFrame(tick);
      } else {
        globe.update({
          width: dim,
          height: dim,
          theta,
          dark,
          scale,
          diffuse,
          mapSamples,
          mapBrightness,
          baseColor,
          markerColor,
          glowColor,
        });
      }
    };

    const ro = new ResizeObserver(layout);
    ro.observe(canvas);
    layout();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      globe?.destroy();
    };
  }, [
    theta,
    dark,
    scale,
    diffuse,
    mapSamples,
    mapBrightness,
    baseColor,
    markerColor,
    glowColor,
  ]);

  return (
    <div
      className={cn(
        "z-10 mx-auto flex w-full max-w-[min(100%,560px)] items-center justify-center",
        className
      )}
    >
      <canvas
        ref={canvasRef}
        className="aspect-square w-full max-w-full"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default Globe;