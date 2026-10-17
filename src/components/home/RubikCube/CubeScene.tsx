"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { MathUtils, type Group } from "three";
import { nextMove, type CubeMove } from "@/lib/rubik";

/** Distance between neighbouring pieces; a little over 1 leaves a thin gap. */
const SPACING = 1.03;
const TURN_SECONDS = 0.6;
const PAUSE_SECONDS = 0.45;
const IDLE_SPIN_SPEED = 0.12; // radians per second
const QUARTER_TURN = Math.PI / 2;

/** The resting angle, tilted so three faces show, like an isometric view. */
const BASE_TILT_X = 0.55;
const BASE_TILT_Y = -0.75;
/** How far the cube leans toward the pointer. */
const POINTER_TILT = 0.45;

// Three black finishes, mixed across the pieces so the light catches them
// differently: glossy, satin and matte. Metalness stays low because a metal
// surface shows only reflections, and would vanish against a dark background.
const FINISHES = [
  { roughness: 0.2, metalness: 0.3, clearcoat: 1 },
  { roughness: 0.45, metalness: 0.25, clearcoat: 0.4 },
  { roughness: 0.8, metalness: 0.1, clearcoat: 0 },
] as const;

const PIECES = [-1, 0, 1].flatMap((x) =>
  [-1, 0, 1].flatMap((y) => [-1, 0, 1].map((z) => [x, y, z] as const))
);

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function snapToQuarter(angle: number) {
  return Math.round(angle / QUARTER_TURN) * QUARTER_TURN;
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

function Cube({ animate }: { animate: boolean }) {
  const root = useRef<Group>(null);
  const pieces = useRef<Group>(null);
  // Turning a layer = temporarily moving its 9 pieces under this pivot,
  // rotating the pivot, then moving them back.
  const pivot = useRef<Group>(null);
  const turn = useRef<{ move: CubeMove; progress: number } | null>(null);
  const lastMove = useRef<CubeMove | null>(null);
  const waitLeft = useRef(PAUSE_SECONDS);
  const spin = useRef(0);
  const pointer = useWindowPointer();

  useFrame((_, rawDelta) => {
    if (!root.current || !pieces.current || !pivot.current) return;
    // A long frame (e.g. after switching tabs) shouldn't make the cube jump.
    const delta = Math.min(rawDelta, 0.1);

    if (animate) spin.current += delta * IDLE_SPIN_SPEED;

    // Ease toward the pointer instead of snapping to it.
    const targetX = BASE_TILT_X + pointer.current.y * POINTER_TILT;
    const targetY = BASE_TILT_Y + spin.current + pointer.current.x * POINTER_TILT;
    root.current.rotation.x = MathUtils.damp(root.current.rotation.x, targetX, 3, delta);
    root.current.rotation.y = MathUtils.damp(root.current.rotation.y, targetY, 3, delta);

    if (!animate) return;

    if (!turn.current) {
      waitLeft.current -= delta;
      if (waitLeft.current > 0) return;

      const move = nextMove(lastMove.current);
      for (const piece of [...pieces.current.children]) {
        if (Math.round(piece.position[move.axis] / SPACING) === move.layer) pivot.current.attach(piece);
      }
      turn.current = { move, progress: 0 };
      return;
    }

    const { move } = turn.current;
    turn.current.progress = Math.min(turn.current.progress + delta / TURN_SECONDS, 1);
    pivot.current.rotation.set(0, 0, 0);
    pivot.current.rotation[move.axis] =
      easeInOutCubic(turn.current.progress) * QUARTER_TURN * move.direction;

    if (turn.current.progress === 1) {
      // Hand the pieces back and snap them to the grid, so tiny floating-point
      // errors don't build up over thousands of turns.
      for (const piece of [...pivot.current.children]) {
        pieces.current.attach(piece);
        piece.position.set(
          Math.round(piece.position.x / SPACING) * SPACING,
          Math.round(piece.position.y / SPACING) * SPACING,
          Math.round(piece.position.z / SPACING) * SPACING
        );
        piece.rotation.set(
          snapToQuarter(piece.rotation.x),
          snapToQuarter(piece.rotation.y),
          snapToQuarter(piece.rotation.z)
        );
      }
      pivot.current.rotation.set(0, 0, 0);
      lastMove.current = move;
      turn.current = null;
      waitLeft.current = PAUSE_SECONDS;
    }
  });

  return (
    <group ref={root} rotation={[BASE_TILT_X, BASE_TILT_Y, 0]}>
      <group ref={pieces}>
        {PIECES.map(([x, y, z], index) => (
          <RoundedBox
            key={index}
            args={[1, 1, 1]}
            radius={0.1}
            smoothness={4}
            position={[x * SPACING, y * SPACING, z * SPACING]}
          >
            <meshPhysicalMaterial color="#141414" {...FINISHES[(index * 7) % FINISHES.length]} />
          </RoundedBox>
        ))}
      </group>
      <group ref={pivot} />
    </group>
  );
}

interface CubeSceneProps {
  /** False while the cube is off-screen, to stop rendering and save battery. */
  isActive: boolean;
}

export default function CubeScene({ isActive }: CubeSceneProps) {
  const [isReady, setIsReady] = useState(false);
  // This module never runs on the server (it's loaded with ssr: false), so
  // `window` is safe to read here.
  const [prefersReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 10], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
      // "demand" renders only when something changes; with a still cube
      // (reduced motion) or an off-screen one, that means almost never.
      frameloop={isActive && !prefersReducedMotion ? "always" : "demand"}
      onCreated={() => setIsReady(true)}
      className={`transition-opacity duration-1000 ${isReady ? "opacity-100" : "opacity-0"}`}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 6, 4]} intensity={2.5} />
      <directionalLight position={[-6, 2, 5]} intensity={1.2} />
      {/* A rim light from behind outlines the cube against the dark. */}
      <directionalLight position={[0, 3, -6]} intensity={1.5} />
      <Cube animate={!prefersReducedMotion} />

      {/* Reflections come from these soft light panels instead of a
          downloaded HDR image, so nothing extra is fetched. */}
      <Environment resolution={256} frames={1}>
        {/* Each panel faces the cube (Lightformer looks at the origin). */}
        <Lightformer intensity={3} position={[0, 6, -4]} scale={[10, 2, 1]} />
        <Lightformer intensity={2} position={[-6, 1, 5]} scale={[4, 8, 1]} />
        <Lightformer intensity={1.5} position={[6, -1, 5]} scale={[4, 8, 1]} />
        <Lightformer intensity={0.8} position={[0, -6, 3]} scale={[10, 2, 1]} />
      </Environment>
    </Canvas>
  );
}
