'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LogoMark } from './LogoMark';
import { motionConfig } from '@/lib/motion-tokens';

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;

  void main() {
    float wave = sin(vUv.x * 3.0 + uTime * 0.6) * 0.5 + 0.5;
    float wave2 = cos(vUv.y * 2.0 - uTime * 0.4) * 0.5 + 0.5;
    vec3 mixed = mix(uColorA, uColorB, wave);
    mixed = mix(mixed, uColorC, wave2 * 0.5);
    gl_FragColor = vec4(mixed, 1.0);
  }
`;

function GradientPlane() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useRef({
    uTime: { value: 0 },
    // hsl(263, 70%, 58%), hsl(160, 84%, 39%), hsl(38, 92%, 50%) — primary/emerald/amber tokens
    uColorA: { value: new THREE.Color(0.55, 0.29, 0.93) },
    uColorB: { value: new THREE.Color(0.06, 0.66, 0.51) },
    uColorC: { value: new THREE.Color(0.94, 0.68, 0.16) },
  });

  useFrame((_, delta) => {
    uniforms.current.uTime.value += delta;
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms.current}
      />
    </mesh>
  );
}

const MASK_STYLE: React.CSSProperties = {
  WebkitMaskImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath d='M5 22 Q16 15 27 22' stroke='black' stroke-opacity='0.5' stroke-width='1.25' fill='none'/%3E%3Cpath d='M8 22V10L16 18L24 10V22' stroke='black' stroke-width='2.25' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E\")",
  maskImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath d='M5 22 Q16 15 27 22' stroke='black' stroke-opacity='0.5' stroke-width='1.25' fill='none'/%3E%3Cpath d='M8 22V10L16 18L24 10V22' stroke='black' stroke-width='2.25' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E\")",
  WebkitMaskSize: 'contain',
  maskSize: 'contain',
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center',
  maskPosition: 'center',
};

interface LiquidMarkProps {
  size?: number;
  className?: string;
}

/**
 * Animated shader-gradient version of the brand mark, for the marketing
 * hero's signature moment. Falls back to the static LogoMark under
 * prefers-reduced-motion or on low-end devices. Import this via
 * next/dynamic({ ssr: false }) at the call site — it touches the DOM/WebGL
 * and has no meaningful server-rendered output.
 */
export function LiquidMark({ size = 96, className }: LiquidMarkProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(motionConfig.shouldAnimate({ essential: false }));
  }, []);

  if (!animate) {
    return <LogoMark size={size} className={className} />;
  }

  return (
    <div style={{ width: size, height: size, ...MASK_STYLE }} className={className}>
      <Canvas gl={{ antialias: true }} dpr={[1, 1.5]}>
        <GradientPlane />
      </Canvas>
    </div>
  );
}
