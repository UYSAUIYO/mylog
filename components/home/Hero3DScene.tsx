"use client";

import { Float, Line } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    function handleChange(event: MediaQueryListEvent) {
      setReduced(event.matches);
    }

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return reduced;
}

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    const root = document.documentElement;

    const observer = new MutationObserver(() => {
      setDark(root.classList.contains("dark"));
    });

    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return dark;
}

function RotatingCore({ dark, reduced }: { dark: boolean; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const lineColor = dark ? "#e4e4e7" : "#18181b";
  const accentColor = dark ? "#60a5fa" : "#2563eb";

  useFrame((_, delta) => {
    if (!group.current || reduced) return;
    group.current.rotation.x += delta * 0.12;
    group.current.rotation.y += delta * 0.18;
    group.current.rotation.z += delta * 0.06;
  });

  return (
    <group ref={group}>
      <Float speed={reduced ? 0 : 1.2} rotationIntensity={0.25} floatIntensity={0.35}>
        <mesh rotation={[0.55, 0.35, 0.2]}>
          <icosahedronGeometry args={[1.45, 1]} />
          <meshBasicMaterial color={lineColor} wireframe transparent opacity={dark ? 0.42 : 0.32} />
        </mesh>

        <mesh rotation={[0.1, 0.7, 0.35]} scale={0.72}>
          <octahedronGeometry args={[1.15, 0]} />
          <meshBasicMaterial color={accentColor} wireframe transparent opacity={0.65} />
        </mesh>

        <mesh rotation={[0.2, -0.35, 0.15]} scale={1.08}>
          <boxGeometry args={[1.85, 1.85, 1.85, 3, 3, 3]} />
          <meshBasicMaterial color={lineColor} wireframe transparent opacity={dark ? 0.18 : 0.14} />
        </mesh>
      </Float>
    </group>
  );
}

function OrbitRings({ dark, reduced }: { dark: boolean; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const color = dark ? "#3b82f6" : "#1d4ed8";
  const neutral = dark ? "#71717a" : "#52525b";

  const circle = useMemo(() => {
    return Array.from({ length: 96 }, (_, index) => {
      const angle = (index / 96) * Math.PI * 2;
      return [Math.cos(angle) * 2.05, Math.sin(angle) * 2.05, 0] as [number, number, number];
    });
  }, []);

  useFrame((_, delta) => {
    if (!group.current || reduced) return;
    group.current.rotation.y -= delta * 0.1;
    group.current.rotation.z += delta * 0.04;
  });

  return (
    <group ref={group}>
      <Line points={circle} color={color} lineWidth={1} transparent opacity={0.38} rotation={[Math.PI / 2.5, 0, 0]} />
      <Line points={circle} color={neutral} lineWidth={1} transparent opacity={0.24} rotation={[0, Math.PI / 2.8, 0.35]} />
      <Line points={circle} color={neutral} lineWidth={1} transparent opacity={0.18} rotation={[0.7, 0.35, Math.PI / 2]} />
    </group>
  );
}

function AxisMarks({ dark }: { dark: boolean }) {
  const color = dark ? "#52525b" : "#a1a1aa";
  const marks = useMemo(
    () => [
      [[-2.45, -1.85, -0.2], [2.45, -1.85, -0.2]],
      [[-2.45, 1.85, -0.2], [2.45, 1.85, -0.2]],
      [[-2.45, -1.85, -0.2], [-2.45, 1.85, -0.2]],
      [[2.45, -1.85, -0.2], [2.45, 1.85, -0.2]],
    ] as [THREE.Vector3Tuple, THREE.Vector3Tuple][],
    []
  );

  return (
    <group>
      {marks.map((points, index) => (
        <Line key={index} points={points} color={color} lineWidth={1} transparent opacity={0.24} />
      ))}
    </group>
  );
}

export default function Hero3DScene() {
  const reduced = useReducedMotion();
  const dark = useDarkMode();

  return (
    <div aria-hidden className="pointer-events-none h-full min-h-[260px] w-full">
      <Canvas
        camera={{ position: [0, 0, 5.8], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.8} />
        <AxisMarks dark={dark} />
        <OrbitRings dark={dark} reduced={reduced} />
        <RotatingCore dark={dark} reduced={reduced} />
      </Canvas>
    </div>
  );
}
