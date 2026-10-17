"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { CanvasTexture, MathUtils, SRGBColorSpace, Vector2, type Group } from "three";
import { lidOpenness, pulse } from "@/lib/heroMotion";

// The site's palette: black, white and Tailwind's sky-600 / sky-400.
const BLACK = "#0d0d0d";
const SKY = "#0284c7";
const SKY_LIGHT = "#38bdf8";
const WHITE = "#f4f4f5";

const IDLE_SPIN_SPEED = 0.2; // radians per second
/** The resting angle: seen slightly from above. */
const BASE_TILT_X = 0.22;
/** How far the scene leans toward the pointer. */
const POINTER_TILT = 0.35;

// The tub and lid are "lathed": a 2D outline (radius, height) spun around the
// vertical axis, which gives the rounded edges of a real supplement tub.
const BODY_OUTLINE = [
  [0, -1],
  [0.86, -1],
  [0.95, -0.98],
  [1, -0.92],
  [1, 0.62],
  [0.97, 0.69],
  [0.9, 0.72],
  [0.9, 0.86],
  [0, 0.86],
].map(([x, y]) => new Vector2(x, y));

const LID_OUTLINE = [
  [0.93, 0],
  [1.02, 0],
  [1.05, 0.05],
  [1.05, 0.3],
  [1.01, 0.37],
  [0.92, 0.39],
  [0, 0.39],
].map(([x, y]) => new Vector2(x, y));

/** Where the lid's bottom edge sits when it's screwed shut. */
const LID_REST_Y = 0.7;
const LID_LIFT = 0.55;
const LID_TURNS = 1.5;

// Nine capsules on different orbits. The golden angle (≈2.4 rad) spreads their
// starting points evenly; the other values vary with the index so no two move
// alike. Every capsule pops open briefly, each at its own moment.
const CAPSULES = Array.from({ length: 9 }, (_, i) => ({
  radius: 1.7 + (i % 3) * 0.32,
  angle: i * 2.4,
  speed: 0.22 + (i % 4) * 0.05,
  height: -0.85 + ((i * 0.37) % 1) * 1.9,
  spin: 0.5 + (i % 3) * 0.35,
  tilt: i * 1.3,
  scale: 0.8 + (i % 3) * 0.15,
  secondHalf: i % 3 === 0 ? BLACK : WHITE,
  popOffset: i * 1.7,
}));

const POINTER_DAMPING = 3;

/** The tub's wrap-around label, drawn on a canvas: the SK logo, twice. */
function createLabelTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 320;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = SKY;
    context.fillRect(0, 14, canvas.width, 10);
    context.fillRect(0, 296, canvas.width, 10);
    context.textAlign = "center";
    context.textBaseline = "middle";
    // Twice around the tub, so the logo shows from the front and the back.
    for (const center of [512, 1536]) {
      context.fillStyle = WHITE;
      context.font = "italic 900 150px Arial, sans-serif";
      context.fillText("SK", center, 135);
      context.fillStyle = SKY_LIGHT;
      context.font = "700 40px Arial, sans-serif";
      context.fillText("S U P P L E M E N T", center, 240);
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** Pointer position across the whole window, from -1 to 1 on each axis. */
function useWindowPointer() {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    function handleMove(event: PointerEvent) {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    }
    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  return pointer;
}

/** One half of a capsule: a short cylinder with a rounded end, pointing up. */
function CapsuleHalf({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.18, 24]} />
        <meshPhysicalMaterial color={color} roughness={0.2} clearcoat={1} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <sphereGeometry args={[0.13, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color={color} roughness={0.2} clearcoat={1} />
      </mesh>
    </group>
  );
}

function Tub({ time }: { time: RefObject<number> }) {
  const lid = useRef<Group>(null);
  const label = useMemo(() => createLabelTexture(), []);

  useEffect(() => () => label.dispose(), [label]);

  useFrame(() => {
    if (!lid.current) return;
    const openness = lidOpenness(time.current);
    lid.current.position.y = LID_REST_Y + openness * LID_LIFT;
    // Unscrewing turns the lid counter-clockwise, seen from above.
    lid.current.rotation.y = openness * LID_TURNS * Math.PI * 2;
  });

  return (
    <group>
      <mesh>
        <latheGeometry args={[BODY_OUTLINE, 64]} />
        <meshPhysicalMaterial color={BLACK} roughness={0.55} metalness={0.15} clearcoat={0.3} />
      </mesh>

      {/* The label sits a hair outside the body; alphaTest keeps only the
          drawn parts, so the black body shows between them. Rotated so a
          logo faces the camera at rest. */}
      <mesh position={[0, -0.15, 0]} rotation-y={-Math.PI / 2}>
        <cylinderGeometry args={[1.004, 1.004, 1, 96, 1, true]} />
        <meshStandardMaterial map={label} alphaTest={0.5} roughness={0.4} />
      </mesh>

      <group ref={lid} position={[0, LID_REST_Y, 0]}>
        <mesh>
          <latheGeometry args={[LID_OUTLINE, 64]} />
          <meshPhysicalMaterial color={SKY} roughness={0.25} metalness={0.2} clearcoat={1} />
        </mesh>
        {/* Ridges around the lid's edge, for grip. */}
        {Array.from({ length: 36 }, (_, i) => (
          <mesh
            key={i}
            position={[Math.sin((i / 36) * Math.PI * 2) * 1.05, 0.175, Math.cos((i / 36) * Math.PI * 2) * 1.05]}
            rotation-y={(i / 36) * Math.PI * 2}
          >
            <boxGeometry args={[0.03, 0.2, 0.025]} />
            <meshStandardMaterial color={SKY_LIGHT} roughness={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Capsules({ time }: { time: RefObject<number> }) {
  const capsules = useRef<(Group | null)[]>([]);

  useFrame(() => {
    const t = time.current;
    CAPSULES.forEach((capsule, i) => {
      const group = capsules.current[i];
      if (!group) return;

      const angle = capsule.angle + t * capsule.speed;
      group.position.set(
        Math.cos(angle) * capsule.radius,
        capsule.height + Math.sin(t * 0.8 + i) * 0.12,
        Math.sin(angle) * capsule.radius
      );
      group.rotation.set(capsule.tilt + t * capsule.spin * 0.5, t * capsule.spin, capsule.tilt);

      // Pop open once every 9 seconds for about a second, then close again.
      const gap = pulse(t, 9, 1.2, capsule.popOffset) * 0.12;
      const [top, bottom] = group.children;
      top.position.y = gap;
      bottom.position.y = -gap;
    });
  });

  return (
    <>
      {CAPSULES.map((capsule, i) => (
        <group
          key={i}
          scale={capsule.scale}
          ref={(element) => {
            capsules.current[i] = element;
          }}
        >
          <group>
            <CapsuleHalf color={SKY} />
          </group>
          <group rotation-x={Math.PI}>
            <CapsuleHalf color={capsule.secondHalf} />
          </group>
        </group>
      ))}
    </>
  );
}

function Dumbbell({ time }: { time: RefObject<number> }) {
  const dumbbell = useRef<Group>(null);

  useFrame(() => {
    if (!dumbbell.current) return;
    const t = time.current;
    dumbbell.current.rotation.x = t * 0.6; // rolls around its handle
    dumbbell.current.position.y = Math.sin(t * 0.9) * 0.08;
  });

  return (
    // The outer group places and tilts the dumbbell; the inner one rolls and
    // bobs. It floats just below the tub's base (y = -1), so however the
    // scene turns, the two never pass through each other.
    <group position={[-1.4, -1.5, 1.1]} rotation={[0, 0.5, 0.25]} scale={1.2}>
      <group ref={dumbbell}>
        <mesh rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.055, 0.055, 1.05, 24]} />
          <meshStandardMaterial color="#a1a1aa" metalness={1} roughness={0.3} />
        </mesh>
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.62, 0, 0]} rotation-z={Math.PI / 2}>
            {/* Six radial segments make a hexagonal head. */}
            <mesh>
              <cylinderGeometry args={[0.27, 0.27, 0.32, 6]} />
              <meshPhysicalMaterial color={BLACK} roughness={0.6} clearcoat={0.2} />
            </mesh>
            <mesh position={[0, -side * 0.165, 0]}>
              <cylinderGeometry args={[0.275, 0.275, 0.03, 6]} />
              <meshStandardMaterial color={SKY} roughness={0.3} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

function Composition({ animate }: { animate: boolean }) {
  const root = useRef<Group>(null);
  // Our own clock: it only advances while animating, so the scene resumes
  // where it left off after being off-screen.
  const time = useRef(0);
  const pointer = useWindowPointer();

  useFrame((_, rawDelta) => {
    if (!root.current) return;
    // A long frame (e.g. after switching tabs) shouldn't make things jump.
    const delta = Math.min(rawDelta, 0.1);
    if (animate) time.current += delta;

    // Ease toward the pointer instead of snapping to it.
    const targetX = BASE_TILT_X + pointer.current.y * POINTER_TILT;
    const targetY = time.current * IDLE_SPIN_SPEED + pointer.current.x * POINTER_TILT;
    root.current.rotation.x = MathUtils.damp(root.current.rotation.x, targetX, POINTER_DAMPING, delta);
    root.current.rotation.y = MathUtils.damp(root.current.rotation.y, targetY, POINTER_DAMPING, delta);
  });

  return (
    <group ref={root} rotation-x={BASE_TILT_X}>
      <Tub time={time} />
      <Capsules time={time} />
      <Dumbbell time={time} />
    </group>
  );
}

interface SceneProps {
  /** False while the scene is off-screen, to stop rendering and save battery. */
  isActive: boolean;
}

export default function Scene({ isActive }: SceneProps) {
  const [isReady, setIsReady] = useState(false);
  // This module never runs on the server (it's loaded with ssr: false), so
  // `window` is safe to read here.
  const [prefersReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, -0.2, 9.5], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
      // "demand" renders only when something changes; with a still scene
      // (reduced motion) or an off-screen one, that means almost never.
      frameloop={isActive && !prefersReducedMotion ? "always" : "demand"}
      onCreated={() => setIsReady(true)}
      className={`transition-opacity duration-1000 ${isReady ? "opacity-100" : "opacity-0"}`}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 6, 4]} intensity={2.5} />
      <directionalLight position={[-6, 2, 5]} intensity={1.2} />
      {/* A sky-blue rim light from behind ties the scene to the brand color. */}
      <directionalLight position={[0, 3, -6]} intensity={2} color={SKY_LIGHT} />
      <Composition animate={!prefersReducedMotion} />

      {/* Reflections come from these soft light panels instead of a
          downloaded HDR image, so nothing extra is fetched. Each panel faces
          the scene (Lightformer looks at the origin). */}
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={3} position={[0, 6, -4]} scale={[10, 2, 1]} />
        <Lightformer intensity={2} position={[-6, 1, 5]} scale={[4, 8, 1]} />
        <Lightformer intensity={1.5} position={[6, -1, 5]} scale={[4, 8, 1]} />
        <Lightformer intensity={1.5} color={SKY_LIGHT} position={[0, -6, 3]} scale={[10, 2, 1]} />
      </Environment>
    </Canvas>
  );
}
