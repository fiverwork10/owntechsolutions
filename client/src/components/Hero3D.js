import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';

useGLTF.preload('/assets/react_logo.glb');
useGLTF.preload('/assets/node-js.glb');
useGLTF.preload('/assets/mongodb.glb');

function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

function createGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(176, 5, 255, 1)');
  gradient.addColorStop(0.2, 'rgba(189, 14, 14, 1)');
  gradient.addColorStop(0.5, 'rgba(255, 19, 19, 0.93)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

const glowTexture = createGlowTexture();

function LogoGlow({ position, scale, visible, color }) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.material.opacity = (0.25 + Math.sin(state.clock.elapsedTime * 1.5) * 0.08) * (visible ? 1 : 0);
  });

  const s = visible ? scale * 3.5 : 0.001;

  return (
    <sprite ref={ref} position={[position[0], position[1], position[2] - 0.5]} scale={[s, s, 1]}>
      <spriteMaterial
        map={glowTexture}
        transparent
        opacity={0.25}
        color={color}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </sprite>
  );
}

function LogoModel({ scene, position, scale, mouseX, mouseY, delay, visible }) {
  const groupRef = useRef();

  const clone = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((child) => {
      if (child.isMesh && child.material) {
        child.castShadow = true;
        child.receiveShadow = true;
        const mat = child.material.clone();
        mat.metalness = 0.1;
        mat.roughness = 0.2;
        if (mat.color) {
          mat.color.multiplyScalar(5);
        }
        mat.needsUpdate = true;
        child.material = mat;
      }
    });
    return c;
  }, [scene]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.x = mouseY * 0.25 + Math.sin(t * 0.4 + delay) * 0.05;
    groupRef.current.rotation.y = mouseX * 0.25 + Math.cos(t * 0.3 + delay) * 0.05;
    groupRef.current.position.y = Math.sin(t * 0.5 + delay) * 0.1;
  });

  const s = visible && scale > 0.01 ? scale : 0.001;

  return (
    <group ref={groupRef} position={position} scale={[s, s, s]}>
      <primitive object={clone} />
    </group>
  );
}

function computeNormalizedScale(scene, targetSize) {
  const box = new THREE.Box3().setFromObject(scene);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  return maxDim > 0 ? targetSize / maxDim : 1;
}

function Scene({ progress, mouseX, mouseY, isMobile }) {
  const reactGltf = useGLTF('/assets/react_logo.glb');
  const nodeGltf = useGLTF('/assets/node-js.glb');
  const mongoGltf = useGLTF('/assets/mongodb.glb');

  const { normReact, normNode, normMongo } = useMemo(() => {
    const target = isMobile ? 3.0 : 1.8;
    return {
      normReact: computeNormalizedScale(reactGltf.scene, target),
      normNode: computeNormalizedScale(nodeGltf.scene, target),
      normMongo: computeNormalizedScale(mongoGltf.scene, target),
    };
  }, [reactGltf.scene, nodeGltf.scene, mongoGltf.scene, isMobile]);

  const p = Math.min(Math.max(progress, 0), 1);

  const REACT_IN = 0.00;
  const REACT_END = 0.25;
  const NODE_IN = 0.30;
  const NODE_END = 0.55;
  const MONGO_IN = 0.60;
  const MONGO_END = 0.85;

  const getReveal = (inStart, inEnd) => {
    if (p < inStart) return 0;
    if (p > inEnd) return 1;
    return smoothstep((p - inStart) / (inEnd - inStart));
  };

  const reactReveal = getReveal(REACT_IN, REACT_END);
  const nodeReveal = getReveal(NODE_IN, NODE_END);
  const mongoReveal = getReveal(MONGO_IN, MONGO_END);

  const X_BASE = isMobile ? -2.8 : -2.0;
  const X_SPACING = isMobile ? 3.2 : 2.0;
  const SLIDE_DIST = isMobile ? 3 : 4;

  const reactTargetX = X_BASE;
  const nodeTargetX = X_BASE + X_SPACING;
  const mongoTargetX = X_BASE + X_SPACING * 2;

  const reactX = reactReveal > 0
    ? reactTargetX + (1 - reactReveal) * SLIDE_DIST
    : reactTargetX + SLIDE_DIST;
  const nodeX = nodeReveal > 0
    ? nodeTargetX + (1 - nodeReveal) * SLIDE_DIST
    : nodeTargetX + SLIDE_DIST;
  const mongoX = mongoReveal > 0
    ? mongoTargetX + (1 - mongoReveal) * SLIDE_DIST
    : mongoTargetX + SLIDE_DIST;

  const reactScale = reactReveal * normReact;
  const nodeScale = nodeReveal * normNode;
  const mongoScale = mongoReveal * normMongo;

  const reactActive = reactReveal > 0.01;
  const nodeActive = nodeReveal > 0.01;
  const mongoActive = mongoReveal > 0.01;

  const yOffset = isMobile ? -0.3 : 0;

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 8, 6]} intensity={2.5} castShadow shadow-mapSize={[512, 512]}>
        <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10]} />
      </directionalLight>
      <directionalLight position={[-4, 3, -5]} intensity={0.8} color="#8B5CF6" />
      <Environment preset={isMobile ? 'dawn' : 'night'} environmentIntensity={0.4} />

      {reactActive && (
        <>
          <LogoGlow position={[reactTargetX, yOffset, isMobile ? -0.3 : 0]} scale={reactScale} visible={reactActive} color="#61DAFB" />
          <LogoModel scene={reactGltf.scene} position={[reactX, yOffset, 0]} scale={reactScale} mouseX={mouseX} mouseY={mouseY} delay={0} visible={reactActive} />
        </>
      )}

      {nodeActive && (
        <>
          <LogoGlow position={[nodeTargetX, yOffset, isMobile ? -0.3 : 0]} scale={nodeScale} visible={nodeActive} color="#ff0909ff" />
          <LogoModel scene={nodeGltf.scene} position={[nodeX, yOffset, 0]} scale={nodeScale} mouseX={mouseX} mouseY={mouseY} delay={1} visible={nodeActive} />
        </>
      )}

      {mongoActive && (
        <>
          <LogoGlow position={[mongoTargetX, yOffset, isMobile ? -0.3 : 0]} scale={nodeScale} visible={mongoActive} color="#ff00f2ff" />
          <LogoModel scene={mongoGltf.scene} position={[mongoX, yOffset, 0]} scale={nodeScale} mouseX={mouseX} mouseY={mouseY} delay={2} visible={mongoActive} />
        </>
      )}

      <ContactShadows
        position={[0, -2.5, 0]}
        opacity={isMobile ? 0.3 : 0.6}
        scale={isMobile ? 10 : 20}
        blur={isMobile ? 4 : 2.5}
        far={5}
      />
    </>
  );
}

export default function Hero3D({ progress = 0, mouseX = 0, mouseY = 0 }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, isMobile ? 11 : 7], fov: isMobile ? 65 : 55 }}
      dpr={isMobile ? [1, 1.2] : [1, 1.5]}
      shadows={!isMobile}
      gl={{ antialias: !isMobile, alpha: true, powerPreference: 'high-performance' }}
      style={{ touchAction: 'none' }}
    >
      <color attach="background" args={['#020617']} />
      <fog attach="fog" args={['#020617', isMobile ? 12 : 8, isMobile ? 25 : 18]} />
      <Scene progress={progress} mouseX={mouseX} mouseY={mouseY} isMobile={isMobile} />
    </Canvas>
  );
}
