import { PlaneGeometry, SRGBColorSpace, Texture, type BufferGeometry } from "three";
import { bulge, cutoutBounds, traceSilhouette } from "@/lib/cutout";

// Turns a product photo (a transparent cutout) into a 3D pack: a body shaped
// after the pack's outline, with the photo projected onto it from the front,
// the way a projector would light up a real tub. Client-only (needs `document`).

/** A product ready to show in 3D. */
export interface Pack {
  texture: Texture;
  /** The body, 1 unit tall, standing on y = 0 and centred on x = 0. */
  geometry: BufferGeometry;
  /** The pack's width ÷ height. */
  aspect: number;
}

/**
 * Size of the small copy of a photo whose pixels are scanned for the pack's
 * outline: detailed enough for a smooth body, and quick to scan.
 */
const SCAN_SIZE = 256;

/** How many quads the body is made of, across and down. */
const SEGMENTS_ACROSS = 96;
const SEGMENTS_DOWN = 128;

/**
 * Loads a product photo and builds its 3D pack. Resolves to null when the
 * photo fails to load or isn't a transparent cutout (a photo with a solid
 * background has no outline to shape a body from).
 */
export async function loadPack(url: string): Promise<Pack | null> {
  const image = new Image();
  image.src = url;
  try {
    await image.decode();
  } catch {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = SCAN_SIZE;
  canvas.height = SCAN_SIZE;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  context.drawImage(image, 0, 0, SCAN_SIZE, SCAN_SIZE);
  const pixels = context.getImageData(0, 0, SCAN_SIZE, SCAN_SIZE).data;
  const bounds = cutoutBounds(pixels, SCAN_SIZE, SCAN_SIZE);
  if (!bounds) return null;
  const silhouette = traceSilhouette(pixels, SCAN_SIZE, bounds);

  const texture = new Texture(image);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  // Show only the pack's part of the photo. Texture coordinates run from 0
  // to 1 with y pointing up, while pixel rows count down from the top.
  const cropWidth = silhouette.width / SCAN_SIZE;
  const cropHeight = silhouette.height / SCAN_SIZE;
  texture.repeat.set(cropWidth, cropHeight);
  texture.offset.set(bounds.left / SCAN_SIZE, 1 - bounds.bottom / SCAN_SIZE);
  texture.needsUpdate = true;

  // The scan was square, so convert back to the photo's real proportions.
  const aspect = (cropWidth * image.naturalWidth) / (cropHeight * image.naturalHeight);

  // Start from a flat, finely divided rectangle the pack's shape, then push
  // each point forward by how far the pack's surface bulges there. Its
  // texture coordinates stay as they were, so seen straight on it looks
  // exactly like the photo, and from an angle it shows its depth.
  const geometry = new PlaneGeometry(aspect, 1, SEGMENTS_ACROSS, SEGMENTS_DOWN);
  const positions = geometry.attributes.position;
  const uvs = geometry.attributes.uv;
  for (let i = 0; i < positions.count; i++) {
    // bulge measures depth in widths of the pack, and counts v from the top.
    const depth = bulge(silhouette, uvs.getX(i), 1 - uvs.getY(i)) * aspect;
    positions.setZ(i, depth);
  }
  geometry.translate(0, 0.5, 0);
  // Recalculate which way each point faces, so light shades the curve.
  geometry.computeVertexNormals();

  return { texture, geometry, aspect };
}
