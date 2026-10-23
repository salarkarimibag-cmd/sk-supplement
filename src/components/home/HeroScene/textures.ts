import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";

// Textures for the hero's protein tub, drawn on canvases at runtime so no
// image or font files are downloaded. Client-only (they need `document`).

const SKY = "#0284c7";
const SKY_LIGHT = "#38bdf8";

/** A repeatable number in [0, 1) for a given seed, so the art never changes. */
function hash(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Fine grey speckle used as a roughness and bump map. Real moulded plastic is
 * never perfectly smooth; this tiny variation breaks up the reflections the
 * way a real surface does, which is a big part of looking photographic.
 */
export function createGrainTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (context) {
    const image = context.createImageData(size, size);
    for (let i = 0; i < size * size; i++) {
      // Mostly bright (≈ full roughness), with faint darker specks.
      const value = 215 + Math.floor(hash(i) * 40);
      image.data.set([value, value, value, 255], i * 4);
    }
    context.putImageData(image, 0, 0);
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(10, 6);
  return texture;
}

/**
 * The tub's printed wrap-around label. The front (a quarter of the way
 * around) carries the logo and product name; the back carries a nutrition
 * table and a barcode, like a real tub. The canvas has the same proportions
 * as the label's cylinder (circumference ÷ height) so nothing is stretched.
 */
export function createLabelTexture() {
  const width = 4096;
  const height = 844;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (context) {
    const background = context.createLinearGradient(0, 0, 0, height);
    background.addColorStop(0, "#1a1a1a");
    background.addColorStop(1, "#0e0e0e");
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    // Thin printed accent lines near the top and bottom edges.
    context.fillStyle = SKY;
    context.fillRect(0, 46, width, 6);
    context.fillRect(0, height - 52, width, 6);

    context.textAlign = "center";
    context.textBaseline = "middle";

    // Front.
    const front = width * 0.25;
    context.fillStyle = "#f4f4f5";
    context.font = "italic 900 300px Arial, sans-serif";
    context.fillText("SK", front, 300);
    context.fillStyle = SKY_LIGHT;
    context.font = "700 64px Arial, sans-serif";
    context.letterSpacing = "22px";
    context.fillText("SUPPLEMENT", front, 455);
    context.letterSpacing = "6px";
    context.fillStyle = "#e4e4e7";
    context.font = "700 70px Arial, sans-serif";
    context.fillText("100% WHEY PROTEIN", front, 590);
    context.letterSpacing = "2px";
    context.fillStyle = "#a1a1aa";
    context.font = "500 40px Arial, sans-serif";
    context.fillText("DOUBLE RICH CHOCOLATE  ·  2.27 KG / 5 LB", front, 690);

    // Back: a nutrition table and a barcode.
    const back = width * 0.75;
    context.letterSpacing = "0px";
    context.textAlign = "left";
    context.fillStyle = "#d4d4d8";
    context.font = "700 54px Arial, sans-serif";
    context.fillText("Nutrition Facts", back - 420, 170);
    context.fillRect(back - 420, 215, 560, 4);
    for (let row = 0; row < 9; row++) {
      const y = 260 + row * 46;
      context.fillStyle = "#71717a";
      context.fillRect(back - 420, y, 180 + hash(row) * 200, 14);
      context.fillRect(back + 60, y, 50 + hash(row + 20) * 70, 14);
      context.fillStyle = "#3f3f46";
      context.fillRect(back - 420, y + 30, 560, 2);
    }

    const barcodeX = back + 240;
    context.fillStyle = "#f4f4f5";
    context.fillRect(barcodeX, 300, 230, 300);
    context.fillStyle = "#0a0a0a";
    for (let x = barcodeX + 16; x < barcodeX + 214; ) {
      const bar = 2 + Math.floor(hash(x) * 7);
      context.fillRect(x, 320, bar, 230);
      x += bar + 2 + Math.floor(hash(x + 7) * 6);
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
