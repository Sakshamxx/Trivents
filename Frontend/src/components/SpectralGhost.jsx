"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

export default function SpectralGhost() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    // Cap DPR lower on small screens to keep the fullscreen
    // bloom pipeline cheap. The ghost is a soft glow effect,
    // so this has no visible impact on its appearance.
    const getCappedPixelRatio = () =>
      Math.min(
        window.devicePixelRatio || 1,
        window.innerWidth < 768 ? 1.5 : 2
      );

    // =========================================================
    // SCENE
    // =========================================================

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    camera.position.z = 20;

    // =========================================================
    // RENDERER
    // =========================================================

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      alpha: true,
      premultipliedAlpha: false,
      stencil: false,
      depth: true,
      preserveDrawingBuffer: false,
    });

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    renderer.setPixelRatio(
      getCappedPixelRatio()
    );

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    renderer.setClearColor(0x000000, 0);

    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.zIndex = "5";
    renderer.domElement.style.pointerEvents = "none";
    renderer.domElement.style.background = "transparent";

    container.appendChild(renderer.domElement);

    // =========================================================
    // BLOOM
    // =========================================================

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(
        window.innerWidth,
        window.innerHeight
      ),
      0.3,
      1.25,
      0.0
    );

    const composer = new EffectComposer(renderer);

    const renderPass = new RenderPass(
      scene,
      camera
    );

    composer.addPass(renderPass);
    composer.addPass(bloomPass);

    // =========================================================
    // ANALOG DECAY SHADER
    // =========================================================

    const analogDecayShader = {
      uniforms: {
        tDiffuse: {
          value: null,
        },

        uTime: {
          value: 0,
        },

        uResolution: {
          value: new THREE.Vector2(
            window.innerWidth,
            window.innerHeight
          ),
        },

        uAnalogGrain: {
          value: 0.4,
        },

        uAnalogBleeding: {
          value: 1.0,
        },

        uAnalogVSync: {
          value: 1.0,
        },

        uAnalogScanlines: {
          value: 1.0,
        },

        uAnalogVignette: {
          value: 1.0,
        },

        uAnalogJitter: {
          value: 0.4,
        },

        uAnalogIntensity: {
          value: 0.6,
        },

        uLimboMode: {
          value: 0.0,
        },
      },

      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;

          gl_Position =
            projectionMatrix *
            modelViewMatrix *
            vec4(position, 1.0);
        }
      `,

      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uTime;
        uniform vec2 uResolution;

        uniform float uAnalogGrain;
        uniform float uAnalogBleeding;
        uniform float uAnalogVSync;
        uniform float uAnalogScanlines;
        uniform float uAnalogVignette;
        uniform float uAnalogJitter;
        uniform float uAnalogIntensity;
        uniform float uLimboMode;

        varying vec2 vUv;

        float random(vec2 st) {
          return fract(
            sin(dot(st.xy, vec2(12.9898, 78.233)))
            * 43758.5453123
          );
        }

        float gaussian(
          float z,
          float u,
          float o
        ) {
          return (
            1.0 /
            (o * sqrt(2.0 * 3.1415))
          )
          *
          exp(
            -(
              ((z - u) * (z - u)) /
              (2.0 * (o * o))
            )
          );
        }

        vec3 grain(
          vec2 uv,
          float time,
          float intensity
        ) {
          float seed =
            dot(
              uv,
              vec2(12.9898, 78.233)
            );

          float noise =
            fract(
              sin(seed)
              * 43758.5453
              + time * 2.0
            );

          noise =
            gaussian(
              noise,
              0.0,
              0.25
            );

          return vec3(noise) * intensity;
        }

        void main() {
          vec2 uv = vUv;

          float time = uTime * 1.8;

          // =================================================
          // JITTER
          // =================================================

          vec2 jitteredUV = uv;

          if (uAnalogJitter > 0.01) {
            float jitterAmount =
              (
                random(
                  vec2(
                    floor(time * 60.0)
                  )
                ) - 0.5
              )
              *
              0.003
              *
              uAnalogJitter
              *
              uAnalogIntensity;

            jitteredUV.x += jitterAmount;

            jitteredUV.y +=
              (
                random(
                  vec2(
                    floor(time * 30.0) + 1.0
                  )
                ) - 0.5
              )
              *
              0.001
              *
              uAnalogJitter
              *
              uAnalogIntensity;
          }

          // =================================================
          // VHS VERTICAL SYNC
          // =================================================

          if (uAnalogVSync > 0.01) {
            float vsyncRoll =
              sin(
                time * 2.0 +
                uv.y * 100.0
              )
              *
              0.02
              *
              uAnalogVSync
              *
              uAnalogIntensity;

            float vsyncChance =
              step(
                0.95,
                random(
                  vec2(
                    floor(time * 4.0)
                  )
                )
              );

            jitteredUV.y +=
              vsyncRoll * vsyncChance;
          }

          // =================================================
          // BASE COLOR
          // =================================================

          vec4 color =
            texture2D(
              tDiffuse,
              jitteredUV
            );

          // =================================================
          // COLOR BLEEDING
          // =================================================

          if (uAnalogBleeding > 0.01) {
            float bleedAmount =
              0.012
              *
              uAnalogBleeding
              *
              uAnalogIntensity;

            float offsetPhase =
              time * 1.5 +
              uv.y * 20.0;

            vec2 redOffset =
              vec2(
                sin(offsetPhase) *
                  bleedAmount,
                0.0
              );

            vec2 blueOffset =
              vec2(
                -sin(offsetPhase * 1.1)
                  * bleedAmount
                  * 0.8,
                0.0
              );

            float r =
              texture2D(
                tDiffuse,
                jitteredUV + redOffset
              ).r;

            float g =
              texture2D(
                tDiffuse,
                jitteredUV
              ).g;

            float b =
              texture2D(
                tDiffuse,
                jitteredUV + blueOffset
              ).b;

            color =
              vec4(
                r,
                g,
                b,
                color.a
              );
          }

          // =================================================
          // FILM GRAIN
          // =================================================

          if (uAnalogGrain > 0.01) {
            vec3 grainEffect =
              grain(
                uv,
                time,
                0.075
                *
                uAnalogGrain
                *
                uAnalogIntensity
              );

            grainEffect *=
              (1.0 - color.rgb);

            color.rgb += grainEffect;
          }

          // =================================================
          // SCANLINES
          // =================================================

          if (uAnalogScanlines > 0.01) {
            float scanlineFreq =
              600.0 +
              uAnalogScanlines * 400.0;

            float scanlinePattern =
              sin(
                uv.y * scanlineFreq
              )
              *
              0.5
              +
              0.5;

            float scanlineIntensity =
              0.1
              *
              uAnalogScanlines
              *
              uAnalogIntensity;

            color.rgb *=
              1.0 -
              scanlinePattern *
              scanlineIntensity;

            float horizontalLines =
              sin(
                uv.y *
                scanlineFreq *
                0.1
              )
              *
              0.02
              *
              uAnalogScanlines
              *
              uAnalogIntensity;

            color.rgb *=
              1.0 -
              horizontalLines;
          }

          // =================================================
          // VIGNETTE
          // =================================================

          if (uAnalogVignette > 0.01) {
            vec2 vignetteUV =
              (uv - 0.5) * 2.0;

            float vignette =
              1.0 -
              dot(
                vignetteUV,
                vignetteUV
              )
              *
              0.3
              *
              uAnalogVignette
              *
              uAnalogIntensity;

            color.rgb *= vignette;
          }

          // =================================================
          // LIMBO
          // =================================================

          if (uLimboMode > 0.5) {
            float gray =
              dot(
                color.rgb,
                vec3(
                  0.299,
                  0.587,
                  0.114
                )
              );

            color.rgb =
              vec3(gray);
          }

          gl_FragColor = color;
        }
      `,
    };

    const analogDecayPass =
      new ShaderPass(
        analogDecayShader
      );

    composer.addPass(analogDecayPass);

    const outputPass =
      new OutputPass();

    composer.addPass(outputPass);

    // =========================================================
    // GHOST PARAMETERS
    // =========================================================

    const params = {
      bodyColor: 0x0f2027,

      glowColor: "orange",
      eyeGlowColor: "violet",

      ghostOpacity: 0.50,
      ghostScale: 0.3,

      emissiveIntensity: 9.8,

      pulseSpeed: 2,
      pulseIntensity: 1,

      eyeGlowIntensity: 1.5,
      eyeGlowDecay: 0.95,
      eyeGlowResponse: 0.31,

      rimLightIntensity: 1.8,

      // Movement
      followSpeed: 0.25,
      wobbleAmount: 0.35,
      floatSpeed: 1.6,
      movementThreshold: 0.07,

      // Particles
      particleCount: 450,
      particleDecayRate: 0.5,
      particleColor: "red",
      createParticlesOnlyWhenMoving: true,
      particleCreationRate: 5,

      // Background reveal
      revealRadius: 400,
      fadeStrength: 4,
      baseOpacity: 0.35,
      revealOpacity: 0.01,

      // Fireflies
      fireflyGlowIntensity: 2.6,
      fireflySpeed: 0.04,

      // Analog
      analogIntensity: 0.6,
      analogGrain: 0.4,
      analogBleeding: 1.0,
      analogVSync: 1.0,
      analogScanlines: 1.0,
      analogVignette: 1.0,
      analogJitter: 0.4,

      limboMode: false,
    };

    const fluorescentColors = {
      cyan: 0x00ffff,
      lime: 0x00ff00,
      magenta: 0xff00ff,
      yellow: 0xffff00,
      orange: 0xff4500,
      pink: 0xff1493,
      purple: 0x9400d3,
      blue: 0x0080ff,
      green: 0x00ff80,
      red: 0xff0040,
      teal: 0x00ffaa,
      violet: 0x8a2be2,
    };

    // =========================================================
    // ATMOSPHERE
    // =========================================================

    const atmosphereGeometry =
      new THREE.PlaneGeometry(300, 300);

    const atmosphereMaterial =
      new THREE.ShaderMaterial({
        uniforms: {
          ghostPosition: {
            value: new THREE.Vector3(0, 0, 0),
          },

          revealRadius: {
            value: params.revealRadius,
          },

          fadeStrength: {
            value: params.fadeStrength,
          },

          baseOpacity: {
            value: params.baseOpacity,
          },

          revealOpacity: {
            value: params.revealOpacity,
          },

          time: {
            value: 0,
          },
        },

        vertexShader: `
          varying vec2 vUv;
          varying vec3 vWorldPosition;

          void main() {
            vUv = uv;

            vec4 worldPos =
              modelMatrix *
              vec4(position, 1.0);

            vWorldPosition =
              worldPos.xyz;

            gl_Position =
              projectionMatrix *
              modelViewMatrix *
              vec4(position, 1.0);
          }
        `,

        fragmentShader: `
          uniform vec3 ghostPosition;
          uniform float revealRadius;
          uniform float fadeStrength;
          uniform float baseOpacity;
          uniform float revealOpacity;
          uniform float time;

          varying vec2 vUv;
          varying vec3 vWorldPosition;

          void main() {
            float dist =
              distance(
                vWorldPosition.xy,
                ghostPosition.xy
              );

            float dynamicRadius =
              revealRadius +
              sin(time * 2.0) * 5.0;

            float reveal =
              smoothstep(
                dynamicRadius * 0.2,
                dynamicRadius,
                dist
              );

            reveal =
              pow(
                reveal,
                fadeStrength
              );

            float opacity =
              mix(
                revealOpacity,
                baseOpacity,
                reveal
              );

            gl_FragColor =
              vec4(
                0.001,
                0.001,
                0.002,
                opacity
              );
          }
        `,

        transparent: true,
        depthWrite: false,
      });

    const atmosphere =
      new THREE.Mesh(
        atmosphereGeometry,
        atmosphereMaterial
      );

    atmosphere.position.z = -50;
    atmosphere.renderOrder = -100;

    scene.add(atmosphere);

    // =========================================================
    // LIGHTING
    // =========================================================

    const ambientLight =
      new THREE.AmbientLight(
        0x0a0a2e,
        0.08
      );

    scene.add(ambientLight);

    const rimLight1 =
      new THREE.DirectionalLight(
        0x4a90e2,
        params.rimLightIntensity
      );

    rimLight1.position.set(
      -8,
      6,
      -4
    );

    scene.add(rimLight1);

    const rimLight2 =
      new THREE.DirectionalLight(
        0x50e3c2,
        params.rimLightIntensity * 0.7
      );

    rimLight2.position.set(
      8,
      -4,
      -6
    );

    scene.add(rimLight2);

    // =========================================================
    // GHOST GROUP
    // =========================================================

    const ghostGroup =
      new THREE.Group();

    ghostGroup.scale.setScalar(
      params.ghostScale
    );

    scene.add(ghostGroup);

    // =========================================================
    // GHOST BODY
    // =========================================================

    const ghostGeometry =
      new THREE.SphereGeometry(
        2,
        40,
        40
      );

    const positionAttribute =
      ghostGeometry.getAttribute(
        "position"
      );

    const positions =
      positionAttribute.array;

    for (
      let i = 0;
      i < positions.length;
      i += 3
    ) {
      if (positions[i + 1] < -0.2) {
        const x = positions[i];
        const z = positions[i + 2];

        const noise1 =
          Math.sin(x * 5) * 0.35;

        const noise2 =
          Math.cos(z * 4) * 0.25;

        const noise3 =
          Math.sin((x + z) * 3) * 0.15;

        positions[i + 1] =
          -2.0 +
          noise1 +
          noise2 +
          noise3;
      }
    }

    ghostGeometry.computeVertexNormals();

    const ghostMaterial =
      new THREE.MeshStandardMaterial({
        color: params.bodyColor,
        transparent: true,
        opacity: params.ghostOpacity,

        emissive:
          fluorescentColors[
            params.glowColor
          ],

        emissiveIntensity:
          params.emissiveIntensity,

        roughness: 0.02,
        metalness: 0.0,

        side: THREE.DoubleSide,
        alphaTest: 0.1,
      });

    const ghostBody =
      new THREE.Mesh(
        ghostGeometry,
        ghostMaterial
      );

    ghostGroup.add(ghostBody);

    // =========================================================
    // EYES
    // =========================================================

    function createEyes() {
      const eyeGroup =
        new THREE.Group();

      ghostGroup.add(eyeGroup);

      const socketGeometry =
        new THREE.SphereGeometry(
          0.45,
          16,
          16
        );

      const socketMaterial =
        new THREE.MeshBasicMaterial({
          color: 0x000000,
          transparent: false,
        });

      const leftSocket =
        new THREE.Mesh(
          socketGeometry,
          socketMaterial
        );

      leftSocket.position.set(
        -0.7,
        0.6,
        1.9
      );

      leftSocket.scale.set(
        1.1,
        1.0,
        0.6
      );

      eyeGroup.add(leftSocket);

      const rightSocket =
        new THREE.Mesh(
          socketGeometry,
          socketMaterial
        );

      rightSocket.position.set(
        0.7,
        0.6,
        1.9
      );

      rightSocket.scale.set(
        1.1,
        1.0,
        0.6
      );

      eyeGroup.add(rightSocket);

      // -------------------------------------------------------
      // Inner eyes
      // -------------------------------------------------------

      const eyeGeometry =
        new THREE.SphereGeometry(
          0.3,
          12,
          12
        );

      const leftEyeMaterial =
        new THREE.MeshBasicMaterial({
          color:
            fluorescentColors[
              params.eyeGlowColor
            ],

          transparent: true,
          opacity: 0,
        });

      const leftEye =
        new THREE.Mesh(
          eyeGeometry,
          leftEyeMaterial
        );

      leftEye.position.set(
        -0.7,
        0.6,
        2.0
      );

      eyeGroup.add(leftEye);

      const rightEyeMaterial =
        new THREE.MeshBasicMaterial({
          color:
            fluorescentColors[
              params.eyeGlowColor
            ],

          transparent: true,
          opacity: 0,
        });

      const rightEye =
        new THREE.Mesh(
          eyeGeometry,
          rightEyeMaterial
        );

      rightEye.position.set(
        0.7,
        0.6,
        2.0
      );

      eyeGroup.add(rightEye);

      // -------------------------------------------------------
      // Outer glow
      // -------------------------------------------------------

      const outerGlowGeometry =
        new THREE.SphereGeometry(
          0.525,
          12,
          12
        );

      const leftOuterGlowMaterial =
        new THREE.MeshBasicMaterial({
          color:
            fluorescentColors[
              params.eyeGlowColor
            ],

          transparent: true,
          opacity: 0,

          side: THREE.BackSide,
        });

      const leftOuterGlow =
        new THREE.Mesh(
          outerGlowGeometry,
          leftOuterGlowMaterial
        );

      leftOuterGlow.position.set(
        -0.7,
        0.6,
        1.95
      );

      eyeGroup.add(leftOuterGlow);

      const rightOuterGlowMaterial =
        new THREE.MeshBasicMaterial({
          color:
            fluorescentColors[
              params.eyeGlowColor
            ],

          transparent: true,
          opacity: 0,

          side: THREE.BackSide,
        });

      const rightOuterGlow =
        new THREE.Mesh(
          outerGlowGeometry,
          rightOuterGlowMaterial
        );

      rightOuterGlow.position.set(
        0.7,
        0.6,
        1.95
      );

      eyeGroup.add(rightOuterGlow);

      return {
        leftEye,
        rightEye,

        leftEyeMaterial,
        rightEyeMaterial,

        leftOuterGlow,
        rightOuterGlow,

        leftOuterGlowMaterial,
        rightOuterGlowMaterial,
      };
    }

    const eyes = createEyes();

    // =========================================================
    // FIREFLIES
    // =========================================================

    const fireflies = [];
    const fireflyGroup =
      new THREE.Group();

    scene.add(fireflyGroup);

    function createFireflies() {
      for (let i = 0; i < 20; i++) {
        const fireflyGeometry =
          new THREE.SphereGeometry(
            0.02,
            2,
            2
          );

        const fireflyMaterial =
          new THREE.MeshBasicMaterial({
            color: 0xffff44,
            transparent: true,
            opacity: 1,
          });

        const firefly =
          new THREE.Mesh(
            fireflyGeometry,
            fireflyMaterial
          );

        firefly.position.set(
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 20
        );

        const glowGeometry =
          new THREE.SphereGeometry(
            0.08,
            8,
            8
          );

        const glowMaterial =
          new THREE.MeshBasicMaterial({
            color: 0xffff88,
            transparent: true,
            opacity: 1,
            side: THREE.BackSide,
          });

        const glow =
          new THREE.Mesh(
            glowGeometry,
            glowMaterial
          );

        firefly.add(glow);

        const fireflyLight =
          new THREE.PointLight(
            0xffff44,
            0.8,
            3,
            2
          );

        firefly.add(fireflyLight);

        firefly.userData = {
          velocity:
            new THREE.Vector3(
              (Math.random() - 0.5) *
                params.fireflySpeed,

              (Math.random() - 0.5) *
                params.fireflySpeed,

              (Math.random() - 0.5) *
                params.fireflySpeed
            ),

          phase:
            Math.random() *
            Math.PI *
            2,

          pulseSpeed:
            2 +
            Math.random() * 3,

          glow,
          glowMaterial,
          fireflyMaterial,
          light: fireflyLight,
        };

        fireflyGroup.add(firefly);
        fireflies.push(firefly);
      }
    }

    createFireflies();

    // =========================================================
    // PARTICLES
    // =========================================================

    const particles = [];
    const particlePool = [];

    const particleGroup =
      new THREE.Group();

    scene.add(particleGroup);

    const particleGeometries = [
      new THREE.SphereGeometry(
        0.05,
        6,
        6
      ),

      new THREE.TetrahedronGeometry(
        0.04,
        0
      ),

      new THREE.OctahedronGeometry(
        0.045,
        0
      ),
    ];

    const particleBaseMaterial =
      new THREE.MeshBasicMaterial({
        color:
          fluorescentColors[
            params.particleColor
          ],

        transparent: true,
        opacity: 0,
        alphaTest: 0.1,
      });

    function initParticlePool(count) {
      for (let i = 0; i < count; i++) {
        const geomIndex =
          Math.floor(
            Math.random() *
              particleGeometries.length
          );

        const geometry =
          particleGeometries[
            geomIndex
          ];

        const material =
          particleBaseMaterial.clone();

        const particle =
          new THREE.Mesh(
            geometry,
            material
          );

        particle.visible = false;

        particleGroup.add(particle);
        particlePool.push(particle);
      }
    }

    initParticlePool(100);

    function createParticle() {
      let particle = null;

      if (particlePool.length > 0) {
        particle =
          particlePool.pop();

        particle.visible = true;
      } else if (
        particles.length <
        params.particleCount
      ) {
        const geomIndex =
          Math.floor(
            Math.random() *
              particleGeometries.length
          );

        const geometry =
          particleGeometries[
            geomIndex
          ];

        const material =
          particleBaseMaterial.clone();

        particle =
          new THREE.Mesh(
            geometry,
            material
          );

        particleGroup.add(
          particle
        );
      }

      if (!particle) {
        return null;
      }

      const particleColor = tmpColor.set(
        fluorescentColors[
          params.particleColor
        ]
      );

      particleColor.offsetHSL(
        Math.random() * 0.1 - 0.05,
        0,
        0
      );

      particle.material.color.copy(
        particleColor
      );

      particle.position.copy(
        ghostGroup.position
      );

      particle.position.z -=
        0.8 +
        Math.random() * 0.6;

      const scatterRange = 3.5;

      particle.position.x +=
        (Math.random() - 0.5) *
        scatterRange;

      particle.position.y +=
        (Math.random() - 0.5) *
          scatterRange -
        0.8;

      const sizeVariation =
        0.6 +
        Math.random() * 0.7;

      particle.scale.set(
        sizeVariation,
        sizeVariation,
        sizeVariation
      );

      particle.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      particle.userData.life = 1;

      particle.userData.decay =
        Math.random() * 0.003 +
        params.particleDecayRate;

      particle.userData.rotationSpeed = {
        x:
          (Math.random() - 0.5) *
          0.015,

        y:
          (Math.random() - 0.5) *
          0.015,

        z:
          (Math.random() - 0.5) *
          0.015,
      };

      particle.userData.velocity = {
        x:
          (Math.random() - 0.5) *
          0.012,

        y:
          (Math.random() - 0.5) *
            0.012 -
          0.002,

        z:
          (Math.random() - 0.5) *
            0.012 -
          0.006,
      };

      particle.material.opacity =
        Math.random() * 0.9;

      particles.push(particle);

      return particle;
    }

    // =========================================================
    // MOUSE
    // =========================================================
    //
    // IMPORTANT:
    // The mouse variables are created BEFORE the animation
    // function, so targetX/targetY can always access them.
    // =========================================================

    const mouse =
      new THREE.Vector2(0, 0);

    const mouseSpeed =
      new THREE.Vector2(0, 0);

    let previousMouseX = 0;
    let previousMouseY = 0;

    let lastMouseUpdate = 0;

    let isMouseMoving = false;

    let mouseMovementTimer = null;

    const handleMouseMove = (event) => {
      const now =
        performance.now();

      if (
        now -
          lastMouseUpdate <
        16
      ) {
        return;
      }

      // -----------------------------------------------
      // Normalize browser coordinates
      //
      // X:
      // left  = -1
      // center = 0
      // right = +1
      //
      // Y:
      // bottom = -1
      // center = 0
      // top = +1
      // -----------------------------------------------

      const nextX =
        (event.clientX /
          window.innerWidth) *
          2 -
        1;

      const nextY =
        -(event.clientY /
          window.innerHeight) *
          2 +
        1;

      mouseSpeed.x =
        nextX -
        previousMouseX;

      mouseSpeed.y =
        nextY -
        previousMouseY;

      previousMouseX = nextX;
      previousMouseY = nextY;

      mouse.x = nextX;
      mouse.y = nextY;

      isMouseMoving = true;

      if (mouseMovementTimer) {
        clearTimeout(
          mouseMovementTimer
        );
      }

      mouseMovementTimer =
        setTimeout(() => {
          isMouseMoving = false;
        }, 80);

      lastMouseUpdate = now;
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove,
      { passive: true }
    );

    // Start from center
    mouse.x = 0;
    mouse.y = 0;

    // =========================================================
    // RESIZE
    // =========================================================

    let resizeTimeout = null;

    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(
          resizeTimeout
        );
      }

      resizeTimeout =
        setTimeout(() => {
          const width =
            window.innerWidth;

          const height =
            window.innerHeight;

          camera.aspect =
            width / height;

          camera.updateProjectionMatrix();

          renderer.setSize(
            width,
            height
          );

          renderer.setPixelRatio(
            getCappedPixelRatio()
          );

          // Keep the composer's internal buffers in sync with
          // the renderer so post-processing stays sharp after
          // resizes / display changes.
          composer.setPixelRatio(
            getCappedPixelRatio()
          );

          composer.setSize(
            width,
            height
          );

          bloomPass.setSize(
            width,
            height
          );

          analogDecayPass.uniforms
            .uResolution.value.set(
              width,
              height
            );
        }, 100);
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    // =========================================================
    // ANIMATION STATE
    // =========================================================

    let animationFrameId = 0;

    let lastFrameTime =
      performance.now();

    let time = 0;

    let currentMovement = 0;

    let frameCount = 0;

    let lastParticleTime = 0;

    // Reusable scratch objects — avoids allocating a new
    // Vector2/Vector3/Color on every animation frame.
    const prevGhostPos = new THREE.Vector3();
    const tmpDirection = new THREE.Vector2();
    const tmpColor = new THREE.Color();

    // =========================================================
    // SEED INITIAL PARTICLES
    // =========================================================

    for (let i = 0; i < 12; i++) {
      createParticle();
    }

    // =========================================================
    // FULL WINDOW WORLD-SPACE MAPPING
    // =========================================================
    //
    // This converts the camera's actual visible area into
    // Three.js world coordinates.
    //
    // This is much better than:
    //
    // mouse.x * 18
    //
    // because the visible world changes depending on
    // browser aspect ratio.
    // =========================================================

    const getVisibleWorldSize = () => {
      const ghostDepth =
        Math.abs(
          camera.position.z -
            ghostGroup.position.z
        );

      const visibleHeight =
        2 *
        ghostDepth *
        Math.tan(
          THREE.MathUtils.degToRad(
            camera.fov * 0.5
          )
        );

      const visibleWidth =
        visibleHeight *
        camera.aspect;

      return {
        width: visibleWidth,
        height: visibleHeight,
      };
    };

    // =========================================================
    // ANIMATION
    // =========================================================

    const animate = (timestamp) => {
      animationFrameId =
        requestAnimationFrame(
          animate
        );

      const deltaTime =
        timestamp -
        lastFrameTime;

      lastFrameTime =
        timestamp;

      if (deltaTime > 100) {
        return;
      }

      const timeIncrement =
        (deltaTime / 16.67) *
        0.01;

      time += timeIncrement;
      frameCount++;

      // -------------------------------------------------------
      // SHADER TIME
      // -------------------------------------------------------

      atmosphereMaterial.uniforms.time.value =
        time;

      analogDecayPass.uniforms.uTime.value =
        time;

      analogDecayPass.uniforms.uLimboMode.value =
        params.limboMode
          ? 1
          : 0;

      // -------------------------------------------------------
      // GHOST MOVEMENT
      // -------------------------------------------------------

      const visibleSize =
        getVisibleWorldSize();

      // Small margin so the Ghost does not disappear
      // completely beyond the browser edge.
      const horizontalMargin = 1.0;
      const verticalMargin = 1.0;

      const maxX =
        Math.max(
          0,
          visibleSize.width * 0.5 -
            horizontalMargin
        );

      const maxY =
        Math.max(
          0,
          visibleSize.height * 0.5 -
            verticalMargin
        );

      // Mouse:
      // -1 -> left/bottom
      //  0 -> center
      // +1 -> right/top

      const targetX =
        mouse.x * maxX;

      const targetY =
        mouse.y * maxY;

      const previousGhostPosition =
        prevGhostPos.copy(
          ghostGroup.position
        );

      // Smooth follow
      ghostGroup.position.x +=
        (targetX -
          ghostGroup.position.x) *
        params.followSpeed;

      ghostGroup.position.y +=
        (targetY -
          ghostGroup.position.y) *
        params.followSpeed;

      // -------------------------------------------------------
      // ATMOSPHERE FOLLOW
      // -------------------------------------------------------

      atmosphereMaterial.uniforms
        .ghostPosition.value.copy(
          ghostGroup.position
        );

      // -------------------------------------------------------
      // MOVEMENT AMOUNT
      // -------------------------------------------------------

      const movementAmount =
        previousGhostPosition.distanceTo(
          ghostGroup.position
        );

      currentMovement =
        currentMovement *
          params.eyeGlowDecay +
        movementAmount *
          (1 - params.eyeGlowDecay);

      // -------------------------------------------------------
      // FLOATING
      // -------------------------------------------------------

      const float1 =
        Math.sin(
          time *
            params.floatSpeed *
            1.5
        ) * 0.03;

      const float2 =
        Math.cos(
          time *
            params.floatSpeed *
            0.7
        ) * 0.018;

      const float3 =
        Math.sin(
          time *
            params.floatSpeed *
            2.3
        ) * 0.008;

      ghostGroup.position.y +=
        float1 +
        float2 +
        float3;

      // -------------------------------------------------------
      // PULSE
      // -------------------------------------------------------

      const pulse1 =
        Math.sin(
          time *
            params.pulseSpeed
        ) *
        params.pulseIntensity;

      const breathe =
        Math.sin(
          time * 0.6
        ) * 0.12;

      ghostMaterial.emissiveIntensity =
        params.emissiveIntensity +
        pulse1 +
        breathe;

      // -------------------------------------------------------
      // FIREFLIES
      // -------------------------------------------------------

      fireflies.forEach(
        (firefly) => {
          const data =
            firefly.userData;

          const pulsePhase =
            time +
            data.phase;

          const pulse =
            Math.sin(
              pulsePhase *
                data.pulseSpeed
            ) *
              0.4 +
            0.6;

          data.glowMaterial.opacity =
            params.fireflyGlowIntensity *
            0.4 *
            pulse;

          data.fireflyMaterial.opacity =
            params.fireflyGlowIntensity *
            0.9 *
            pulse;

          data.light.intensity =
            params.fireflyGlowIntensity *
            0.8 *
            pulse;

          data.velocity.x +=
            (Math.random() - 0.5) *
            0.001;

          data.velocity.y +=
            (Math.random() - 0.5) *
            0.001;

          data.velocity.z +=
            (Math.random() - 0.5) *
            0.001;

          data.velocity.clampLength(
            0,
            params.fireflySpeed
          );

          firefly.position.add(
            data.velocity
          );

          if (
            Math.abs(
              firefly.position.x
            ) > 30
          ) {
            data.velocity.x *= -0.5;
          }

          if (
            Math.abs(
              firefly.position.y
            ) > 20
          ) {
            data.velocity.y *= -0.5;
          }

          if (
            Math.abs(
              firefly.position.z
            ) > 15
          ) {
            data.velocity.z *= -0.5;
          }
        }
      );

      // -------------------------------------------------------
      // BODY ORIENTATION
      // -------------------------------------------------------

      const direction =
        tmpDirection.set(
          targetX -
            ghostGroup.position.x,

          targetY -
            ghostGroup.position.y
        );

      if (
        direction.lengthSq() >
        0.000001
      ) {
        direction.normalize();
      }

      const tiltStrength =
        0.1 *
        params.wobbleAmount;

      const tiltDecay = 0.95;

      ghostBody.rotation.z =
        ghostBody.rotation.z *
          tiltDecay +
        -direction.x *
          tiltStrength *
          (1 - tiltDecay);

      ghostBody.rotation.x =
        ghostBody.rotation.x *
          tiltDecay +
        direction.y *
          tiltStrength *
          (1 - tiltDecay);

      ghostBody.rotation.y =
        Math.sin(
          time * 1.4
        ) *
        0.05 *
        params.wobbleAmount;

      // -------------------------------------------------------
      // BREATHING SCALE
      // -------------------------------------------------------

      const scaleVariation =
        1 +
        Math.sin(
          time * 2.1
        ) *
          0.025 *
          params.wobbleAmount +
        pulse1 *
          0.015;

      const scaleBreath =
        1 +
        Math.sin(
          time * 0.8
        ) *
          0.012;

      const finalScale =
        scaleVariation *
        scaleBreath;

      ghostBody.scale.set(
        finalScale,
        finalScale,
        finalScale
      );

      // -------------------------------------------------------
      // EYE GLOW
      // -------------------------------------------------------

      const normalizedMouseSpeed =
        Math.sqrt(
          mouseSpeed.x *
            mouseSpeed.x +
          mouseSpeed.y *
            mouseSpeed.y
        ) * 8;

      const isMoving =
        currentMovement >
        params.movementThreshold;

      const targetGlow =
        isMoving ? 1 : 0;

      const glowChangeSpeed =
        isMoving
          ? params.eyeGlowResponse * 2
          : params.eyeGlowResponse;

      const currentEyeOpacity =
        eyes.leftEyeMaterial.opacity;

      const newOpacity =
        currentEyeOpacity +
        (targetGlow -
          currentEyeOpacity) *
          glowChangeSpeed;

      const eyeIntensity =
        params.eyeGlowIntensity;

      const visibleEyeIntensity =
        Math.min(
          eyeIntensity / 4.5,
          1
        );

      eyes.leftEyeMaterial.opacity =
        newOpacity *
        visibleEyeIntensity;

      eyes.rightEyeMaterial.opacity =
        newOpacity *
        visibleEyeIntensity;

      eyes.leftOuterGlowMaterial.opacity =
        newOpacity * 0.3;

      eyes.rightOuterGlowMaterial.opacity =
        newOpacity * 0.3;

      // -------------------------------------------------------
      // PARTICLE CREATION
      // -------------------------------------------------------

      const shouldCreateParticles =
        params.createParticlesOnlyWhenMoving
          ? currentMovement > 0.005 &&
            isMouseMoving
          : currentMovement > 0.005;

      if (
        shouldCreateParticles &&
        timestamp -
          lastParticleTime >
          100
      ) {
        const speedRate =
          Math.floor(
            normalizedMouseSpeed * 3
          );

        const particleRate =
          Math.min(
            params.particleCreationRate,
            Math.max(
              1,
              speedRate
            )
          );

        for (
          let i = 0;
          i < particleRate;
          i++
        ) {
          createParticle();
        }

        lastParticleTime =
          timestamp;
      }

      // -------------------------------------------------------
      // PARTICLE UPDATE
      // -------------------------------------------------------

      for (
        let i =
          particles.length - 1;

        i >= 0;

        i--
      ) {
        const particle =
          particles[i];

        if (!particle) continue;

        particle.userData.life -=
          particle.userData.decay;

        particle.material.opacity =
          particle.userData.life *
          0.85;

        const velocity =
          particle.userData.velocity;

        if (velocity) {
          particle.position.x +=
            velocity.x;

          particle.position.y +=
            velocity.y;

          particle.position.z +=
            velocity.z;

          const swirl =
            Math.cos(
              time * 1.8 +
              particle.position.y
            ) *
            0.0008;

          particle.position.x +=
            swirl;
        }

        const rotationSpeed =
          particle.userData
            .rotationSpeed;

        if (rotationSpeed) {
          particle.rotation.x +=
            rotationSpeed.x;

          particle.rotation.y +=
            rotationSpeed.y;

          particle.rotation.z +=
            rotationSpeed.z;
        }

        if (
          particle.userData.life <=
          0
        ) {
          particle.visible = false;

          particle.material.opacity =
            0;

          particlePool.push(
            particle
          );

          particles.splice(
            i,
            1
          );
        }
      }

      // -------------------------------------------------------
      // RENDER
      // -------------------------------------------------------

      composer.render();
    };

    animate(performance.now());

    // =========================================================
    // CLEANUP
    // =========================================================

    return () => {
      cancelAnimationFrame(
        animationFrameId
      );

      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      window.removeEventListener(
        "resize",
        handleResize
      );

      if (mouseMovementTimer) {
        clearTimeout(
          mouseMovementTimer
        );
      }

      if (resizeTimeout) {
        clearTimeout(
          resizeTimeout
        );
      }

      scene.traverse(
        (object) => {
          if (!object.isMesh) {
            return;
          }

          object.geometry?.dispose();

          if (
            Array.isArray(
              object.material
            )
          ) {
            object.material.forEach(
              (material) =>
                material?.dispose()
            );
          } else {
            object.material?.dispose();
          }
        }
      );

      atmosphereMaterial.dispose();
      particleBaseMaterial.dispose();

      particleGeometries.forEach(
        (geometry) =>
          geometry.dispose()
      );

      renderer.dispose();
      composer.dispose();

      if (
        renderer.domElement &&
        container.contains(
          renderer.domElement
        )
      ) {
        container.removeChild(
          renderer.domElement
        );
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="spectral-ghost-container"
      aria-hidden="true"
    />
  );
}