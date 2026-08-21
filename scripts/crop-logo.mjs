import sharp from "sharp";

const src = "img/logo.jpeg";
const CREAM = { r: 251, g: 246, b: 242 }; // matches --color-bg: #fbf6f2
const SIZE = 512;

// 1) Crop tightly to just the babies illustration (trim the wordmark pills below),
//    pad with the site's cream background (no alpha tricks — avoids edge fringing).
const squareBuffer = await sharp(src)
  .extract({ left: 260, top: 90, width: 560, height: 440 })
  .resize(460, 460, { fit: "contain", background: CREAM })
  .extend({ top: 26, bottom: 26, left: 26, right: 26, background: CREAM })
  .png()
  .toBuffer();

// Square version — used only for the Apple touch icon, which iOS masks into
// a rounded square itself; a transparent PNG there would look broken.
await sharp(squareBuffer).toFile("img/apple-touch-icon.png");

// 2) Clip the square into an actual circle (transparent outside), so the icon
//    is round everywhere it's used — browser tab, bookmarks, raw <img> without
//    relying on CSS border-radius to fake it.
const circleMask = Buffer.from(
  `<svg width="${SIZE}" height="${SIZE}"><circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${SIZE / 2}" fill="#fff"/></svg>`
);

await sharp(squareBuffer)
  .resize(SIZE, SIZE)
  .composite([{ input: circleMask, blend: "dest-in" }])
  .png()
  .toFile("img/favicon-512.png");

await sharp("img/favicon-512.png").resize(32, 32).toFile("img/favicon-32.png");
await sharp("img/favicon-512.png").resize(16, 16).toFile("img/favicon-16.png");

console.log("done");
