"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ClosingParticleImage() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer = null;
    let scene = null;
    let camera = null;
    let points = null;
    let geometry = null;
    let material = null;
    let raf = null;
    let destroyed = false;

    // Smoothed animation progress (0 → 1). Chases the scroll target slowly.
    let smoothP = 0;

    // Cached DOM references — re-queried cheaply every ~60 frames
    // in case sections mount late. Avoids getBoundingClientRect
    // query churn on unrelated nodes every frame.
    let whyUs = null;
    let contact = null;
    let imageBox = null;
    let realImage = null;
    let domRefreshCounter = 0;

    const refreshDomRefs = () => {
      whyUs = document.querySelector("#why-us");
      contact = document.querySelector("#contact");
      imageBox = document.querySelector(".contact-image-box");
      realImage = imageBox
        ? imageBox.querySelector("img")
        : null;
    };

    refreshDomRefs();

    // =========================================================
    // EASY SETTINGS
    // =========================================================

    // Lower = fewer image pixels
    const SAMPLE_WIDTH = 180;

    // Max opacity of the particles (1 = fully visible)
    const MAX_OPACITY = 0.5;

    // How far the image pixels scatter
    const SCATTER_DISTANCE = 1000;

    // Pixel size multiplier
    const PIXEL_SIZE_MULTIPLIER = 0.5;

    // ---- TIMING (tune these) ----

    // START: how far into the Why Us section the build begins.
    // 0 = when Why Us reaches the top of the screen,
    // 0.5 = halfway through Why Us, -0.5 = starts a half-screen earlier.
    // (measured in screen heights)
    const START_VIEWPORTS_FROM_WHY_US = 0;

    // END: finish this many screen-heights BEFORE Contact's top edge
    // reaches the top of the screen.
    // 0.25 = done as Contact scrolls into view (recommended, since the
    //        smoothing makes the animation trail your scroll slightly)
    // 0    = done exactly when Contact's top hits the top of the screen
    const END_VIEWPORTS_BEFORE_CONTACT = 0.25;

    // How quickly the animation catches up to your scroll.
    // Lower = slower and smoother (0.03 slow, 0.05 default, 0.1 snappy)
    const SMOOTHING = 0.05;

    // =========================================================
    // HELPERS
    // =========================================================

    const clamp = (value, min, max) =>
      Math.max(min, Math.min(max, value));

    const ease = (value) => {
      const t = clamp(value, 0, 1);
      return t * t * (3 - 2 * t);
    };

    const randomFromIndex = (index) => {
      const x = Math.sin(index * 12.9898) * 43758.5453123;
      return x - Math.floor(x);
    };

    // =========================================================
    // THREE SETUP
    // =========================================================

    const setup = () => {
      scene = new THREE.Scene();

      camera = new THREE.OrthographicCamera(
        -window.innerWidth / 2,
        window.innerWidth / 2,
        window.innerHeight / 2,
        -window.innerHeight / 2,
        -3000,
        3000
      );

      camera.position.z = 1000;

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);

      renderer.domElement.style.position = "absolute";
      renderer.domElement.style.inset = "0";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.pointerEvents = "none";

      container.appendChild(renderer.domElement);
    };

    // =========================================================
    // BUILD IMAGE PIXELS
    // =========================================================

    const buildParticles = (image) => {
      const imageBox = document.querySelector(".contact-image-box");
      if (!imageBox) return;

      const boxRect = imageBox.getBoundingClientRect();
      const boxAspect = boxRect.width / Math.max(1, boxRect.height);
      const sourceAspect = image.width / Math.max(1, image.height);

      const sampleWidth = SAMPLE_WIDTH;
      const sampleHeight = Math.max(1, Math.round(sampleWidth / boxAspect));

      const canvas = document.createElement("canvas");
      canvas.width = sampleWidth;
      canvas.height = sampleHeight;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      // MATCH OBJECT-FIT: COVER
      let sx = 0;
      let sy = 0;
      let sw = image.width;
      let sh = image.height;

      if (sourceAspect > boxAspect) {
        // Crop left/right
        sw = image.height * boxAspect;
        sx = (image.width - sw) / 2;
      } else {
        // Crop top/bottom
        sh = image.width / boxAspect;
        sy = (image.height - sh) / 2;
      }

      ctx.drawImage(image, sx, sy, sw, sh, 0, 0, sampleWidth, sampleHeight);

      const pixelData = ctx.getImageData(0, 0, sampleWidth, sampleHeight).data;

      const targetPositions = [];
      const scatteredPositions = [];
      const colors = [];

      // ONE PARTICLE = ONE IMAGE PIXEL
      for (let y = 0; y < sampleHeight; y += 1) {
        for (let x = 0; x < sampleWidth; x += 1) {
          const index = (y * sampleWidth + x) * 4;

          const r = pixelData[index] / 255;
          const g = pixelData[index + 1] / 255;
          const b = pixelData[index + 2] / 255;
          const a = pixelData[index + 3] / 255;

          if (a < 0.05) continue;

          // Exact image position (0..1)
          targetPositions.push(
            x / (sampleWidth - 1),
            y / (sampleHeight - 1)
          );

          // Exact color from the photograph
          colors.push(r, g, b);

          // Scatter this same image pixel
          const seed = index + 1;
          const rx = randomFromIndex(seed + 11);
          const ry = randomFromIndex(seed + 73);
          const rz = randomFromIndex(seed + 137);

          const angle = rx * Math.PI * 2;
          const radius = 180 + Math.pow(ry, 0.55) * SCATTER_DISTANCE;

          scatteredPositions.push(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            (rz - 0.5) * 800
          );
        }
      }

      const count = targetPositions.length / 2;

      // CLEAN OLD OBJECTS
      if (geometry) geometry.dispose();
      if (material) material.dispose();
      if (points) scene.remove(points);

      // GEOMETRY
      geometry = new THREE.BufferGeometry();

      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(new Float32Array(count * 3), 3)
      );

      geometry.setAttribute(
        "aTarget",
        new THREE.Float32BufferAttribute(targetPositions, 2)
      );

      geometry.setAttribute(
        "aScatter",
        new THREE.Float32BufferAttribute(scatteredPositions, 3)
      );

      geometry.setAttribute(
        "aColor",
        new THREE.Float32BufferAttribute(colors, 3)
      );

      // PIXEL MATERIAL
      material = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,

        uniforms: {
          uOpacity: { value: 0 },
          uPixelSize: { value: 1 },
        },

        vertexShader: `
          precision highp float;

          attribute vec3 aColor;

          uniform float uPixelSize;

          varying vec3 vColor;

          void main() {
            vColor = aColor;

            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

            gl_Position = projectionMatrix * mvPosition;

            // Square pixel, no circular falloff
            gl_PointSize = uPixelSize;
          }
        `,

        fragmentShader: `
          precision highp float;

          varying vec3 vColor;

          uniform float uOpacity;

          void main() {
            // Hard square image pixel
            gl_FragColor = vec4(vColor, uOpacity);
          }
        `,
      });

      points = new THREE.Points(geometry, material);
      scene.add(points);
    };

    // =========================================================
    // LOAD IMAGE
    // =========================================================

    const loadImage = () => {
      const imageElement = document.querySelector(".contact-image-box img");

      if (!imageElement) {
        return;
      }

      const src = imageElement.currentSrc || imageElement.src;

      const image = new Image();

      image.onload = () => {
        if (destroyed) return;
        buildParticles(image);
      };

      image.onerror = () => {
        // Image failed to load — the particle layer simply stays hidden.
      };

      image.src = src;
    };

    // =========================================================
    // UPDATE (runs every frame)
    // =========================================================

    // Last applied visual state — avoids touching the DOM and
    // re-uploading uniforms when nothing changed.
    let lastAppliedOpacity = -1;
    let lastImageOpacity = -1;

    const update = () => {
      if (destroyed || !renderer) return;

      // Keep the loop alive while the image loads, without
      // paying for a render of an empty scene.
      if (!geometry) {
        raf = requestAnimationFrame(update);
        return;
      }

      // Refresh cached section refs occasionally (cheap) so
      // late-mounted sections are still picked up.
      domRefreshCounter += 1;
      if (domRefreshCounter % 60 === 0) {
        refreshDomRefs();
      }

      if (!contact || !imageBox) {
        raf = requestAnimationFrame(update);
        return;
      }

      const contactRect = contact.getBoundingClientRect();
      const imageRect = imageBox.getBoundingClientRect();

      // =======================================================
      // PROGRESS — tied to the Contact section, then smoothed
      // =======================================================

      const vh = window.innerHeight;
      const contactDocumentTop = window.scrollY + contactRect.top;

      // START: inside the Why Us section
      // (falls back to 3 screens above Contact if #why-us is missing)
      const whyDocumentTop = whyUs
        ? window.scrollY + whyUs.getBoundingClientRect().top
        : contactDocumentTop - vh * 3;

      const start = whyDocumentTop + vh * START_VIEWPORTS_FROM_WHY_US;

      // END: as Contact arrives, long before the footer
      const end = contactDocumentTop - vh * END_VIEWPORTS_BEFORE_CONTACT;

      const range = Math.max(1, end - start);
      const targetP = clamp((window.scrollY - start) / range, 0, 1);

      // Chase the target gradually so it never snaps on fast scrolls
      smoothP += (targetP - smoothP) * SMOOTHING;
      const p = smoothP;

      // Fully settled before the effect starts: nothing is visible,
      // so skip the per-particle math and the render entirely.
      // The canvas keeps its last (transparent) frame.
      if (targetP === 0 && p < 0.0005) {
        if (lastAppliedOpacity !== 0) {
          material.uniforms.uOpacity.value = 0;
          lastAppliedOpacity = 0;
        }
        if (realImage && lastImageOpacity !== 0) {
          realImage.style.opacity = "0";
          lastImageOpacity = 0;
        }
        raf = requestAnimationFrame(update);
        return;
      }

      // =======================================================
      // PARTICLE VISIBILITY
      //
      // 0.00 - 0.15  invisible
      // 0.15 - 0.35  fade in
      // 0.35 - 0.82  full
      // 0.82 - 1.00  fade out (real image takes over)
      // =======================================================

      let particleOpacity = 0;

      if (p >= 0.15 && p < 0.35) {
        particleOpacity = ease((p - 0.15) / 0.2) * MAX_OPACITY;
      } else if (p >= 0.35 && p < 0.82) {
        particleOpacity = MAX_OPACITY;
      } else if (p >= 0.82 && p <= 1) {
        particleOpacity = (1 - ease((p - 0.82) / 0.18)) * MAX_OPACITY;
      }

      material.uniforms.uOpacity.value = particleOpacity;
      lastAppliedOpacity = particleOpacity;

      // =======================================================
      // PIXEL SIZE
      // =======================================================

      const pixelScale = imageRect.width / SAMPLE_WIDTH;
      const dpr = renderer.getPixelRatio();

      material.uniforms.uPixelSize.value = Math.max(
        1,
        pixelScale * dpr * PIXEL_SIZE_MULTIPLIER
      );

      // =======================================================
      // REAL IMAGE (fades in after reconstruction)
      // =======================================================

      if (realImage) {
        let imageOpacity = 0;

        if (p >= 0.86) {
          imageOpacity = ease((p - 0.86) / 0.14);
        }

        const clamped = clamp(imageOpacity, 0, 1);
        if (clamped !== lastImageOpacity) {
          realImage.style.opacity = String(clamped);
          lastImageOpacity = clamped;
        }
      }

      // =======================================================
      // RECONSTRUCTION
      //
      // 0.00 - 0.20  stay scattered
      // 0.20 - 1.00  slowly return to exact image coordinates
      // =======================================================

      const reconstruction = ease(clamp((p - 0.2) / 0.8, 0, 1));

      const positionAttribute = geometry.getAttribute("position");
      const targetAttribute = geometry.getAttribute("aTarget");
      const scatterAttribute = geometry.getAttribute("aScatter");

      const positions = positionAttribute.array;
      const targets = targetAttribute.array;
      const scatters = scatterAttribute.array;

      // MOVE PIXELS
      for (let i = 0, j = 0; i < targets.length; i += 2, j += 3) {
        const u = targets[i];
        const v = targets[i + 1];

        // Exact position inside the actual Contact image
        const targetX =
          imageRect.left + u * imageRect.width - window.innerWidth / 2;

        const targetY =
          -(imageRect.top + v * imageRect.height) + window.innerHeight / 2;

        // Scatter → image
        positions[j] = scatters[j] + (targetX - scatters[j]) * reconstruction;

        positions[j + 1] =
          scatters[j + 1] + (targetY - scatters[j + 1]) * reconstruction;

        // Z returns to the image plane
        positions[j + 2] = scatters[j + 2] * (1 - reconstruction);
      }

      positionAttribute.needsUpdate = true;

      // RENDER
      renderer.render(scene, camera);

      raf = requestAnimationFrame(update);
    };

    // =========================================================
    // RESIZE (debounced — rebuilding pixels is expensive)
    // =========================================================

    let resizeTimer = null;

    const resize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (destroyed || !renderer || !camera) return;

        camera.left = -window.innerWidth / 2;
        camera.right = window.innerWidth / 2;
        camera.top = window.innerHeight / 2;
        camera.bottom = -window.innerHeight / 2;

        camera.updateProjectionMatrix();

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);

        // Re-sample the image because the Contact box size may have changed
        refreshDomRefs();
        loadImage();
      }, 180);
    };

    // =========================================================
    // START
    // =========================================================

    setup();
    loadImage();
    update();

    window.addEventListener("resize", resize);

    // =========================================================
    // CLEANUP
    // =========================================================

    return () => {
      destroyed = true;

      if (raf) cancelAnimationFrame(raf);
      if (resizeTimer) clearTimeout(resizeTimer);

      window.removeEventListener("resize", resize);

      geometry?.dispose();
      material?.dispose();
      renderer?.dispose();

      if (
        renderer?.domElement &&
        renderer.domElement.parentNode === container
      ) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="closing-particle-image"
      aria-hidden="true"
    />
  );
}