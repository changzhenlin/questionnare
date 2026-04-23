'use client'

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { initParticlesEngine } from "@tsparticles/react";
import type { ISourceOptions } from "@tsparticles/engine";
import { loadFull } from "tsparticles";

const Particles = dynamic(() => import("@tsparticles/react"), {
  ssr: false,
});

let particlesEngineInitPromise: Promise<void> | undefined;

function ensureParticlesEngine() {
  if (!particlesEngineInitPromise) {
    particlesEngineInitPromise = initParticlesEngine(async (engine) => {
      await loadFull(engine);
    });
  }

  return particlesEngineInitPromise;
}

function observeReducedMotion(callback: (isReduced: boolean) => void) {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const legacyMediaQuery = mediaQuery as MediaQueryList & {
    addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
    removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
  };
  const updatePreference = () => callback(mediaQuery.matches);

  updatePreference();

  if ("addEventListener" in mediaQuery) {
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }

  legacyMediaQuery.addListener?.(updatePreference);

  return () => legacyMediaQuery.removeListener?.(updatePreference);
}

export function InteractiveParticleBackground() {
  const [isReady, setIsReady] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    let isMounted = true;

    ensureParticlesEngine().then(() => {
      if (isMounted) {
        setIsReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return observeReducedMotion(setPrefersReducedMotion);
  }, []);

  const options = useMemo<ISourceOptions>(() => {
    const particleCount = prefersReducedMotion ? 30 : 72;
    const linkDistance = prefersReducedMotion ? 112 : 168;

    return {
      background: {
        color: {
          value: "transparent",
        },
      },
      detectRetina: true,
      fpsLimit: 60,
      fullScreen: {
        enable: false,
      },
      interactivity: {
        detectsOn: "window",
        events: {
          onClick: {
            enable: false,
          },
          onHover: {
            enable: !prefersReducedMotion,
            mode: ["trail", "grab", "bubble"],
          },
          resize: {
            enable: true,
          },
        },
        modes: {
          bubble: {
            distance: 180,
            duration: 1.8,
            opacity: 0.55,
            size: 6,
          },
          grab: {
            distance: prefersReducedMotion ? 132 : 190,
            links: {
              opacity: 0.34,
            },
          },
          trail: {
            delay: prefersReducedMotion ? 0.06 : 0.012,
            pauseOnStop: true,
            quantity: prefersReducedMotion ? 0 : 4,
            particles: {
              color: {
                value: ["#d4d4d8", "#e4e4e7", "#f8fafc"],
              },
              links: {
                enable: false,
              },
              move: {
                direction: "none",
                enable: true,
                outModes: {
                  default: "destroy",
                },
                speed: prefersReducedMotion ? 0.22 : 0.8,
                straight: false,
              },
              opacity: {
                value: {
                  min: 0.12,
                  max: 0.42,
                },
                animation: {
                  enable: true,
                  speed: 1.4,
                  startValue: "max",
                  destroy: "min",
                },
              },
              shadow: {
                blur: 18,
                color: "#ffffff",
                enable: true,
              },
              shape: {
                type: "circle",
              },
              size: {
                value: {
                  min: 1,
                  max: 4.5,
                },
                animation: {
                  enable: true,
                  speed: 3,
                  startValue: "max",
                  destroy: "min",
                },
              },
            },
          },
        },
      },
      particles: {
        color: {
          value: ["#d4d4d8", "#e4e4e7", "#f4f4f5", "#ffffff"],
        },
        links: {
          color: "#e4e4e7",
          distance: linkDistance,
          enable: true,
          opacity: prefersReducedMotion ? 0.14 : 0.26,
          width: prefersReducedMotion ? 1 : 1.2,
        },
        move: {
          direction: "none",
          enable: true,
          outModes: {
            default: "out",
          },
          parallax: {
            enable: !prefersReducedMotion,
            force: 28,
            smooth: 14,
          },
          random: true,
          speed: {
            min: prefersReducedMotion ? 0.18 : 0.28,
            max: prefersReducedMotion ? 0.3 : 0.95,
          },
          straight: false,
          trail: {
            enable: !prefersReducedMotion,
            fill: {
              color: "#fafafa",
            },
            length: 10,
          },
        },
        number: {
          density: {
            enable: true,
            area: 900,
          },
          value: particleCount,
        },
        opacity: {
          value: {
            min: 0.16,
            max: 0.46,
          },
          animation: {
            enable: true,
            speed: prefersReducedMotion ? 0.35 : 0.65,
            sync: false,
          },
        },
        shadow: {
          blur: prefersReducedMotion ? 8 : 16,
          color: "#ffffff",
          enable: true,
        },
        shape: {
          type: "circle",
        },
        size: {
          value: {
            min: 1,
            max: prefersReducedMotion ? 3 : 5.5,
          },
          animation: {
            enable: !prefersReducedMotion,
            speed: 1.2,
            sync: false,
          },
        },
        twinkle: {
          particles: {
            enable: !prefersReducedMotion,
            frequency: 0.025,
            opacity: 0.5,
          },
        },
      },
      pauseOnBlur: true,
      pauseOnOutsideViewport: true,
      responsive: [
        {
          maxWidth: 768,
          options: {
            interactivity: {
              modes: {
                grab: {
                  distance: prefersReducedMotion ? 96 : 140,
                },
                trail: {
                  quantity: prefersReducedMotion ? 0 : 2,
                },
              },
            },
            particles: {
              links: {
                distance: prefersReducedMotion ? 96 : 128,
                opacity: prefersReducedMotion ? 0.1 : 0.16,
              },
              number: {
                value: prefersReducedMotion ? 20 : 40,
              },
            },
          },
        },
      ],
      style: {
        backgroundColor: "transparent",
      },
    };
  }, [prefersReducedMotion]);

  if (!isReady) {
    return null;
  }

  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(255,255,255,0.85),transparent_24%),radial-gradient(circle_at_78%_20%,rgba(228,228,231,0.45),transparent_22%),radial-gradient(circle_at_52%_72%,rgba(250,250,250,0.7),transparent_30%)] opacity-85" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,transparent_46%,rgba(255,255,255,0.28)_100%)]" />
      <Particles
        id="home-particles"
        className="pointer-events-none absolute inset-0 h-full w-full"
        options={options}
      />
    </>
  );
}
