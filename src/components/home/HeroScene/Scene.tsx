"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { DoubleSide, MathUtils, Vector2, type Group, type Mesh, type MeshBasicMaterial } from "three";
import { lidOpenness, productFlip, pulse } from "@/lib/heroMotion";
import { createGrainTexture, createLabelTexture, loadPackTexture, type PackTexture } from "./textures";

// Real moulded plastic is never pure black: a very dark grey reads as black
// but still shows its shape under light.
const PLASTIC = "#1b1b1b";
const LID_PLASTIC = "#141414";
const CAPSULE_WHITE = "#ecebe8";
const CAPSULE_BLUE = "#1f4f8a";

/** How fast the fallback tub turns on its own, in radians per second. */
const IDLE_SPIN_SPEED = 0.15;
/** The resting angle: seen slightly from above, like a product shot. */
const BASE_TILT_X = 0.18;
/** How far the scene leans toward the pointer. */
const POINTER_TILT = 0.3;
const POINTER_DAMPING = 3;

// The tub and lid are "lathed": a 2D outline (radius, height) spun around the
// vertical axis. The body is shaped like a protein jug: taller than it is
// wide, rounded at the base, with round shoulders narrowing to the neck.
const NECK_RADIUS = 0.72;
const SHOULDER_START_Y = 0.75;
const SHOULDER_HEIGHT = 0.55;

/** Points along a quarter ellipse, from the body's side in to the neck. */
const SHOULDER = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 15) * (Math.PI / 2);
  return [
    NECK_RADIUS + (1 - NECK_RADIUS) * Math.cos(angle),
    SHOULDER_START_Y + SHOULDER_HEIGHT * Math.sin(angle),
  ];
});

const BODY_OUTLINE = [
  [0, -1.46],
  [0.8, -1.46],
  // A slightly recessed base, as on a real blow-moulded tub.
  [0.86, -1.5],
  [0.95, -1.47],
  [1, -1.38],
  ...SHOULDER,
  [NECK_RADIUS - 0.02, 1.45],
  [0, 1.45],
].map(([x, y]) => new Vector2(x, y));

const LID_OUTLINE = [
  [0.7, 0],
  [0.79, 0],
  [0.8, 0.03],
  [0.8, 0.41],
  [0.78, 0.45],
  [0.74, 0.46],
  [0, 0.46],
].map(([x, y]) => new Vector2(x, y));
const LID_RADIUS = 0.8;
const LID_RIDGES = 64;

/** Where the lid's bottom edge sits when it's screwed shut. */
const LID_REST_Y = 1.3;
const LID_LIFT = 0.4;
const LID_TURNS = 1;

// Seven capsules on different orbits. The golden angle (≈2.4 rad) spreads
// their starting points evenly; the other values vary with the index so no
// two move alike. Every capsule pops open briefly, each at its own moment.
const CAPSULES = Array.from({ length: 7 }, (_, i) => ({
  radius: 1.75 + (i % 3) * 0.3,
  angle: i * 2.4,
  speed: 0.18 + (i % 4) * 0.04,
  height: -1.2 + ((i * 0.37) % 1) * 2.4,
  spin: 0.4 + (i % 3) * 0.25,
  tilt: i * 1.3,
  scale: 0.85 + (i % 3) * 0.12,
  popOffset: i * 2.1,
}));

// The product photos stand on flat planes, all the same height (about as tall
// as the tub) and no wider than PACK_MAX_WIDTH, so a wide tub doesn't crowd
// the capsules. A flat photo can't spin all the way round like the tub, so it
// only sways a little, and flips like a card to show the next product.
const PACK_HEIGHT = 2.9;
const PACK_MAX_WIDTH = 2.6;
/** Where the packs' bottom edges stand, level with the tub's base. */
const PACK_BOTTOM = -1.5;
/** How far a pack sways from side to side while it rests, in radians. */
const PACK_SWAY = 0.12;

/** The plane's width and height for a pack: PACK_HEIGHT tall, unless too wide. */
function packSize(aspect: number): [width: number, height: number] {
  const width = PACK_HEIGHT * aspect;
  if (width <= PACK_MAX_WIDTH) return [width, PACK_HEIGHT];
  return [PACK_MAX_WIDTH, PACK_MAX_WIDTH / aspect];
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

/** One half of a gelatin capsule: a short cylinder with a rounded end. */
function CapsuleHalf({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.18, 32]} />
        <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={1} clearcoatRoughness={0.15} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <sphereGeometry args={[0.12, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={1} clearcoatRoughness={0.15} />
      </mesh>
    </group>
  );
}

function Tub({ time }: { time: RefObject<number> }) {
  const lid = useRef<Group>(null);
  const label = useMemo(() => createLabelTexture(), []);
  const grain = useMemo(() => createGrainTexture(), []);

  useEffect(
    () => () => {
      label.dispose();
      grain.dispose();
    },
    [label, grain]
  );

  useFrame(() => {
    if (!lid.current) return;
    const openness = lidOpenness(time.current);
    lid.current.position.y = LID_REST_Y + openness * LID_LIFT;
    // Unscrewing turns the lid counter-clockwise, seen from above.
    lid.current.rotation.y = openness * LID_TURNS * Math.PI * 2;
  });

  // Matte moulded plastic: the grain map varies the roughness and adds a
  // faint bump, and a thin, rough clear coat gives the soft sheen of HDPE.
  const plastic = {
    roughness: 0.62,
    roughnessMap: grain,
    bumpMap: grain,
    bumpScale: 0.6,
    clearcoat: 0.25,
    clearcoatRoughness: 0.45,
  };

  return (
    <group>
      <mesh>
        <latheGeometry args={[BODY_OUTLINE, 128]} />
        <meshPhysicalMaterial color={PLASTIC} {...plastic} />
      </mesh>

      {/* The printed label sits a hair outside the body. It's glossier than
          the plastic, like a laminated sticker. Rotated so the front faces
          the camera at rest. */}
      <mesh position={[0, -0.3, 0]} rotation-y={-Math.PI / 2}>
        <cylinderGeometry args={[1.004, 1.004, 1.3, 128, 1, true]} />
        <meshPhysicalMaterial map={label} roughness={0.38} clearcoat={0.7} clearcoatRoughness={0.2} />
      </mesh>

      <group ref={lid} position={[0, LID_REST_Y, 0]}>
        <mesh>
          <latheGeometry args={[LID_OUTLINE, 128]} />
          <meshPhysicalMaterial color={LID_PLASTIC} {...plastic} roughness={0.5} />
        </mesh>
        {/* Fine grip ridges around the lid's edge. */}
        {Array.from({ length: LID_RIDGES }, (_, i) => {
          const angle = (i / LID_RIDGES) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.sin(angle) * LID_RADIUS, 0.22, Math.cos(angle) * LID_RADIUS]}
              rotation-y={angle}
            >
              <boxGeometry args={[0.018, 0.32, 0.018]} />
              <meshStandardMaterial color={LID_PLASTIC} roughness={0.55} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

/** Real product photos, one at a time, flipping to the next every few seconds. */
function Packs({ packs, time }: { packs: PackTexture[]; time: RefObject<number> }) {
  const mesh = useRef<Mesh>(null);
  const material = useRef<MeshBasicMaterial>(null);
  const [firstWidth, firstHeight] = packSize(packs[0].aspect);

  useFrame(() => {
    if (!mesh.current || !material.current) return;
    const t = time.current;
    const { step, turn } = productFlip(t);
    const pack = packs[step % packs.length];
    const [width, height] = packSize(pack.aspect);

    // Swapping the map is cheap: the material stays the same, so nothing has
    // to be recompiled. productFlip only changes `step` while edge-on.
    material.current.map = pack.texture;
    mesh.current.scale.set(width, height, 1);
    // Stand on PACK_BOTTOM and bob gently, as if floating.
    mesh.current.position.y = PACK_BOTTOM + height / 2 + Math.sin(t * 1.1) * 0.04;
    mesh.current.rotation.y = turn + Math.sin(t * 0.5) * PACK_SWAY;
  });

  return (
    <mesh ref={mesh} scale={[firstWidth, firstHeight, 1]} position-y={PACK_BOTTOM + firstHeight / 2}>
      <planeGeometry />
      {/* The photo already has its own studio lighting, so it's shown as is:
          a "basic" material ignores the scene's lights, and toneMapped={false}
          keeps its colors exactly as photographed. alphaTest drops the fully
          transparent pixels, so they don't hide capsules passing behind. Both
          sides are drawn because the pointer tilt can turn a flipping pack a
          little past edge-on. */}
      <meshBasicMaterial
        ref={material}
        map={packs[0].texture}
        transparent
        alphaTest={0.05}
        side={DoubleSide}
        toneMapped={false}
      />
    </mesh>
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
        capsule.height + Math.sin(t * 0.7 + i) * 0.1,
        Math.sin(angle) * capsule.radius
      );
      group.rotation.set(capsule.tilt + t * capsule.spin * 0.5, t * capsule.spin, capsule.tilt);

      // Pop open once every 10 seconds for about a second, then close again.
      const gap = pulse(t, 10, 1.2, capsule.popOffset) * 0.08;
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
            <CapsuleHalf color={CAPSULE_BLUE} />
          </group>
          <group rotation-x={Math.PI}>
            <CapsuleHalf color={CAPSULE_WHITE} />
          </group>
        </group>
      ))}
    </>
  );
}

interface CompositionProps {
  animate: boolean;
  /** The product photos to show; when empty, the drawn SK tub stands in. */
  packs: PackTexture[];
}

function Composition({ animate, packs }: CompositionProps) {
  const hasPacks = packs.length > 0;
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
    // Only the round tub keeps turning; the flat photos turn by flipping.
    const spin = hasPacks ? 0 : time.current * IDLE_SPIN_SPEED;
    const targetY = spin + pointer.current.x * POINTER_TILT;
    root.current.rotation.x = MathUtils.damp(root.current.rotation.x, targetX, POINTER_DAMPING, delta);
    root.current.rotation.y = MathUtils.damp(root.current.rotation.y, targetY, POINTER_DAMPING, delta);
  });

  return (
    <group ref={root} rotation-x={BASE_TILT_X}>
      {/* Lowered a little so the tall pack (or the tub with its lid lifted)
          stays centred. */}
      <group position-y={-0.2}>
        {hasPacks ? <Packs packs={packs} time={time} /> : <Tub time={time} />}
        <Capsules time={time} />
      </group>
    </group>
  );
}

interface SceneProps {
  /** False while the scene is off-screen, to stop rendering and save battery. */
  isActive: boolean;
  /** Product photos (transparent cutouts) to show in turn, in this order. */
  imageUrls: string[];
}

export default function Scene({ isActive, imageUrls }: SceneProps) {
  const [isReady, setIsReady] = useState(false);
  // null while the photos are loading. Those that fail to load, or aren't
  // cutouts, are left out.
  const [packs, setPacks] = useState<PackTexture[] | null>(null);
  // This module never runs on the server (it's loaded with ssr: false), so
  // `window` is safe to read here.
  const [prefersReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    let isCurrent = true;
    let loaded: PackTexture[] = [];
    Promise.all(imageUrls.map(loadPackTexture)).then((results) => {
      loaded = results.filter((pack) => pack !== null);
      if (isCurrent) setPacks(loaded);
      else loaded.forEach((pack) => pack.texture.dispose());
    });
    // Textures live on the GPU, outside JavaScript's garbage collection, so
    // they're freed by hand once they're no longer shown.
    return () => {
      isCurrent = false;
      loaded.forEach((pack) => pack.texture.dispose());
    };
  }, [imageUrls]);

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 9.5], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
      // "demand" renders only when something changes; with a still scene
      // (reduced motion) or an off-screen one, that means almost never.
      frameloop={isActive && !prefersReducedMotion ? "always" : "demand"}
      onCreated={() => setIsReady(true)}
      // Fade in once the canvas is set up and the photos are in, so the
      // scene doesn't appear first without its product.
      className={`transition-opacity duration-1000 ${isReady && packs ? "opacity-100" : "opacity-0"}`}
    >
      <ambientLight intensity={0.15} />
      <directionalLight position={[-4, 5, 5]} intensity={1.4} />
      {packs && <Composition animate={!prefersReducedMotion} packs={packs} />}

      {/* A soft shadow on an invisible floor grounds the pack, as in a
          studio product photo. It sits outside the tilting group, so it
          stays level. */}
      <ContactShadows position={[0, -2.15, 0]} scale={7} blur={2.6} far={3} opacity={0.7} resolution={256} />

      {/* Studio lighting without an HDR download: big soft boxes in front and
          on top, and tall narrow strip lights behind the sides. The strips
          draw the long vertical highlights along the tub's edges that make a
          product shot look real. Each panel faces the scene. */}
      <Environment resolution={512} frames={1}>
        <Lightformer intensity={2.5} position={[-5, 3, 5]} scale={[5, 5, 1]} />
        <Lightformer intensity={0.8} position={[5, 0, 5]} scale={[4, 6, 1]} />
        <Lightformer intensity={6} position={[4.5, 1, -4]} scale={[1.2, 10, 1]} />
        <Lightformer intensity={4} position={[-4.5, 1, -4]} scale={[1.2, 10, 1]} />
        <Lightformer intensity={1.5} position={[0, 6, 0]} scale={[6, 6, 1]} />
      </Environment>
    </Canvas>
  );
}
