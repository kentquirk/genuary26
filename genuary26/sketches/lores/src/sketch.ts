import type p5 from "p5";

export function sketch(p: p5) {
  const baseImages: p5.Image[] = [];
  let paused = false;
  let backgroundColor = 0;
  let baseImage!: p5.Image;
  let images!: p5.Image[];
  let imageReady = false;
  let imagePixels = 64;

  let redHgt = 0;
  let redVel = 0;
  let greenHgt = 0;
  let greenVel = 0;
  let blueHgt = 0;
  let blueVel = 0;

  // Resolve asset URL via Vite so it works in dev/build
  const imageUrls = [
    new URL("./assets/shiner.png", import.meta.url).href,
    new URL("./assets/daylily.png", import.meta.url).href,
    new URL("./assets/iceland.png", import.meta.url).href,
    new URL("./assets/ireland.png", import.meta.url).href,
  ];

  const getCanvasSize = () => {
    // Get the parent container element
    const container = document.getElementById("sketch-holder");
    if (!container) {
      return p.windowWidth;
    }

    // Get container width
    const containerWidth = container.clientWidth;

    // Calculate available height by finding how much space is left below the container
    const containerRect = container.getBoundingClientRect();
    const distanceFromTop = containerRect.top;
    const bottomPadding = 20; // Small padding at the bottom
    const availableHeight = p.windowHeight - distanceFromTop - bottomPadding;

    // Canvas should be square, using the smaller of width or available height
    return Math.min(containerWidth, availableHeight);
  };

  enum ColorChannel {
    RED = 0,
    GREEN = 1,
    BLUE = 2,
    HUE = 3,
    SATURATION = 4,
    VALUE = 5,
  }

  const rgbToHsv = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const cmax = p.max([r, g, b]);
    const cmin = p.min([r, g, b]);
    const delta = cmax - cmin;

    let h = 0;
    let s = 0;
    const v = cmax;

    // Hue calculation
    if (delta !== 0) {
      if (cmax === r) {
        h = 60 * (((g - b) / delta) % 6);
      } else if (cmax === g) {
        h = 60 * ((b - r) / delta + 2);
      } else {
        h = 60 * ((r - g) / delta + 4);
      }
    }
    if (h < 0) {
      h += 360;
    }
    // now scale h to [0, 255]
    h = (h / 360) * 255;

    // Saturation calculation
    if (cmax !== 0) {
      s = delta / cmax;
    }

    return {
      h: h,
      s: s,
      v: v,
    };
  };

  const extractChannelImage = (
    img: p5.Image,
    chan: ColorChannel,
    size: number
  ): p5.Image => {
    const channelImg = p.createImage(size, size);
    channelImg.loadPixels();
    img.loadPixels();
    const windowSize = p.min(img.width, img.height) / size;

    for (let outx = 0; outx < channelImg.width; outx++) {
      for (let outy = 0; outy < channelImg.height; outy++) {
        // outx, outy are the index of the pixel we're creating in the output
        // now we need to iterate over the base image at the
        // resolution of windowSize to get the pixels that map to this output pixel
        let total = 0;
        for (
          let basex = outx * windowSize;
          basex < (outx + 1) * windowSize;
          basex++
        ) {
          for (
            let basey = outy * windowSize;
            basey < (outy + 1) * windowSize;
            basey++
          ) {
            const in_ix = (basex + basey * img.width) * 4;
            if (
              chan in [ColorChannel.RED, ColorChannel.GREEN, ColorChannel.BLUE]
            ) {
              total += img.pixels[in_ix + chan];
            } else {
              const hsv = rgbToHsv(
                img.pixels[in_ix + 0],
                img.pixels[in_ix + 1],
                img.pixels[in_ix + 2]
              );
              if (chan === ColorChannel.HUE) {
                total += (hsv.h / 360) * 255;
              } else if (chan === ColorChannel.SATURATION) {
                total += hsv.s * 255;
              } else if (chan === ColorChannel.VALUE) {
                total += hsv.v * 255;
              }
            }
          }
        }
        const avg = total / (windowSize * windowSize);
        const out_ix = (outx + outy * channelImg.width) * 4;
        if (chan in [ColorChannel.RED, ColorChannel.GREEN, ColorChannel.BLUE]) {
          // Set only the selected channel
          channelImg.pixels[out_ix + chan] = avg;
        } else {
          // For HSV channels, set all RGB to the same avg value for grayscale
          channelImg.pixels[out_ix + 0] = avg;
          channelImg.pixels[out_ix + 1] = avg;
          channelImg.pixels[out_ix + 2] = avg;
        }
        channelImg.pixels[out_ix + 3] = 255;
      }
    }

    channelImg.updatePixels();
    return channelImg;
  };

  const restart = () => {
    // Reset sketch state here
    backgroundColor = 0;
    paused = false;

    baseImage = baseImages[p.int(p.random(baseImages.length))];
    imagePixels = p.random([16, 32, 64, 128, 256]);

    if (imageReady) {
      images = [
        extractChannelImage(baseImage, ColorChannel.RED, imagePixels),
        extractChannelImage(baseImage, ColorChannel.GREEN, imagePixels),
        extractChannelImage(baseImage, ColorChannel.BLUE, imagePixels),
        extractChannelImage(baseImage, ColorChannel.HUE, imagePixels),
        extractChannelImage(baseImage, ColorChannel.SATURATION, imagePixels),
        extractChannelImage(baseImage, ColorChannel.VALUE, imagePixels),
      ];
    }

    redHgt = 0;
    redVel = 0;
    greenHgt = 0;
    greenVel = 0;
    blueHgt = 0;
    blueVel = 0;
  };

  const randomizeColor = () => {
    backgroundColor = p.random(255);
  };

  const powerOfTwoLessThan = (n: number) => {
    let p = 1;
    while (p * 2 < n) {
      p *= 2;
    }
    return p;
  };

  // Ensure the images are loaded before setup/draw
  p.preload = () => {
    for (const imageUrl of imageUrls) {
      const img = p.loadImage(
        imageUrl,
        () => {
          // Image loaded successfully
          baseImages.push(img);
          imageReady = true;
        },
        () => {
          // Error loading image
          console.error("Error loading image:", imageUrl);
        }
      );
    }
  };

  p.windowResized = () => {
    const size = getCanvasSize();
    p.resizeCanvas(size, size);
    restart();
  };

  const randomJump = () => {
    const r = p.int(p.random(3));
    switch (r) {
      case 0:
        redVel += p.random(500, 1000);
        break;
      case 1:
        greenVel += p.random(500, 1000);
        break;
      case 2:
        blueVel += p.random(500, 1000);
        break;
    }
  };

  p.keyTyped = () => {
    switch (p.key) {
      case " ":
        paused = !paused;
        return false; // Prevent default browser behavior
      case "r":
        restart();
        return false;
      case "b": {
        randomJump();
        return false;
      }
    }
  };

  p.setup = () => {
    const size = getCanvasSize();
    p.createCanvas(size, size);
    restart();
  };

  p.draw = () => {
    p.clear();
    p.background(backgroundColor);
    const gravity = -750;
    const groundY = 0;
    const stopped = 50;

    const dt = p.deltaTime / 1000;

    if (!paused) {
      // Update positions
      redHgt += redVel * dt;
      greenHgt += greenVel * dt;
      blueHgt += blueVel * dt;

      if (redHgt != groundY) {
        redVel += gravity * dt;
      }
      if (greenHgt != groundY) {
        greenVel += gravity * dt;
      }
      if (blueHgt != groundY) {
        blueVel += gravity * dt;
      }

      // Check for ground collision
      if (p.abs(redHgt - groundY) < 1 && p.abs(redVel) < stopped) {
        redHgt = groundY;
        redVel = 0;
      } else if (redHgt <= groundY) {
        redHgt = groundY;
        redVel *= -0.7; // Reverse velocity with damping
      }

      if (p.abs(greenHgt - groundY) < 1 && p.abs(greenVel) < stopped) {
        greenHgt = groundY;
        greenVel = 0;
      } else if (greenHgt <= groundY) {
        greenHgt = groundY;
        greenVel *= -0.7; // Reverse velocity with damping
      }
      if (p.abs(blueHgt - groundY) < 1 && p.abs(blueVel) < stopped) {
        blueHgt = groundY;
        blueVel = 0;
      } else if (blueHgt <= groundY) {
        blueHgt = groundY;
        blueVel *= -0.7; // Reverse velocity with damping
      }
    }

    const imgSize = powerOfTwoLessThan(p.width) / 2;
    const ground = p.height - imgSize;
    p.blendMode(p.ADD);
    // for debugging:
    // p.image(baseImage, 0, 0, 64, 64);
    p.image(
      images[ColorChannel.RED],
      p.width / 2 - imgSize / 2,
      ground - redHgt,
      imgSize,
      imgSize
    );
    // p.blendMode(p.OVERLAY);
    p.image(
      images[ColorChannel.GREEN],
      p.width / 2 - imgSize / 2,
      ground - greenHgt,
      imgSize,
      imgSize
    );
    // p.blendMode(p.OVERLAY);
    p.image(
      images[ColorChannel.BLUE],
      p.width / 2 - imgSize / 2,
      ground - blueHgt,
      imgSize,
      imgSize
    );
    // p.image(images[ColorChannel.HUE], 0, 512, 256, 256);
    // p.image(images[ColorChannel.SATURATION], 256, 512, 256, 256);
    // p.image(images[ColorChannel.VALUE], 512, 512, 256, 256);
  };

  // Return control functions that React can call
  return {
    restart,
    randomizeColor,
    randomJump,
  };
}
