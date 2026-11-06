"use client"

import { useCallback, useRef, useState, type CSSProperties } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Observer } from "gsap/Observer"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger, Observer, useGSAP)

/** Geometry for stacking the parts into one wheel, in the order they are fitted to the car. Renders are hub-centred. */
export type AssemblyFit = {
  /** Diameter relative to the next part, which is mounted over it (e.g. brake disc inside the rim). */
  fit: number
  /** Rotates with the hub once mounted. */
  spins?: boolean
}

export type ShopSystem = AssemblyFit & {
  id: string
  name: string
  blurb: string
  href: string
  image: string
  badge?: string
}

type ShopBySystemProps = {
  title: string
  systems: ShopSystem[]
  scrollHint?: string
  /** Element whose height the pinned frame should clear, e.g. a sticky site header. */
  offsetSelector?: string
  /** Fixed element along the bottom edge (e.g. a mobile tab bar) the frame should clear. */
  bottomOffsetSelector?: string
}

const ENTER = 1
const HOLD = 0.7
const HANDOFF = 1.15
const TEXT_SWAP_AT = 0.5
const HOLD_SPIN = 14
/** Seconds for one swipe to carry the page to the next step on touch devices. */
const STEP_SCROLL = 0.9
/** Milliseconds after leaving the scene during which drifting back into it does not re-lock it. */
const REENTRY_PAUSE = 900

const LINES_BG =
  "repeating-linear-gradient(135deg, rgba(255,255,255,0.028) 0 1px, transparent 1px 34px), repeating-linear-gradient(135deg, rgba(255,255,255,0.018) 0 1px, transparent 1px 170px)"

const FRAME = "absolute inset-x-0 bottom-[6%] mx-auto aspect-square w-[min(84cqw,90cqh)]"

const ROLL_TRAVEL: CSSProperties = { transform: "translate3d(calc(var(--roll, 0) * var(--roll-x, 0px)), 0, 0)" }
const ROLL_TURN: CSSProperties = { transform: "rotate(calc(var(--roll, 0) * var(--roll-turn, 0) * 1deg))" }

export function ShopBySystem({ title, systems, scrollHint, offsetSelector, bottomOffsetSelector }: ShopBySystemProps) {
  const root = useRef<HTMLElement>(null)
  const trigger = useRef<ScrollTrigger | null>(null)
  const holdTimes = useRef<number[]>([])
  const stepTo = useRef<((i: number) => boolean) | null>(null)
  const activeRef = useRef(0)
  const [active, setActive] = useState(0)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const section = root.current!
        const q = gsap.utils.selector(section)
        const carriers = q<HTMLElement>("[data-carrier]")
        const fits = q<HTMLElement>("[data-fit]")
        const rotors = q<HTMLElement>("[data-rotor]")
        const panels = q<HTMLElement>("[data-panel]")
        const ambience = q<HTMLElement>("[data-glow], [data-floor-shadow]")
        const offsetEl = offsetSelector ? document.querySelector<HTMLElement>(offsetSelector) : null
        const bottomEl = bottomOffsetSelector ? document.querySelector<HTMLElement>(bottomOffsetSelector) : null

        // Pixel travel and the matching rotation are rewritten on every refresh, so the roll stays
        // slip-free after resizes without re-recording the timeline.
        const measure = () => {
          section.style.setProperty("--sbs-offset", `${offsetEl?.offsetHeight ?? 0}px`)
          section.style.setProperty("--sbs-bottom", `${bottomEl?.offsetHeight ?? 0}px`)
          carriers.forEach((el) => {
            const stage = el.parentElement!.getBoundingClientRect()
            const d = el.offsetWidth
            const travel = -(stage.left + (stage.width + d) / 2 + 32)
            el.style.setProperty("--roll-x", `${travel}px`)
            el.style.setProperty("--roll-turn", `${(travel / (Math.PI * d)) * 360}`)
          })
        }
        measure()
        gsap.set(carriers, { autoAlpha: 1, "--roll": 1 })

        const tl = gsap.timeline({ defaults: { ease: "none" } })
        const scales = systems.map(() => 1)
        const angles = systems.map(() => 0)

        // Every part fitted so far shrinks to sit concentrically inside part k, hub on hub.
        const nestInside = (k: number, at: number) => {
          for (let j = 0; j < k; j++) {
            const to = systems.slice(j, k).reduce((size, s) => size * s.fit, 1)
            tl.fromTo(
              fits[j],
              { scale: scales[j] },
              { scale: to, duration: ENTER, ease: "power3.inOut", immediateRender: false },
              at,
            )
            scales[j] = to
          }
        }

        // Each part rolls in from beyond the left edge; travel and rotation share --roll, so it never slips.
        const enter = (k: number, at: number) => {
          tl.fromTo(carriers[k], { "--roll": 1 }, { "--roll": 0, duration: ENTER, ease: "power3.out" }, at)
          if (k === 0) {
            tl.fromTo(ambience, { autoAlpha: 0 }, { autoAlpha: 1, duration: ENTER, ease: "power2.out" }, at)
          }
          nestInside(k, at)
        }

        const hold = (i: number, at: number) => {
          tl.to({}, { duration: HOLD }, at)
          systems.forEach((s, j) => {
            if (j > i || !s.spins) return
            tl.fromTo(
              rotors[j],
              { rotation: angles[j] },
              { rotation: angles[j] + HOLD_SPIN, duration: HOLD, immediateRender: false },
              at,
            )
            angles[j] += HOLD_SPIN
          })
          tl.addLabel(`system-${i}`, at + HOLD / 2)
          holdTimes.current[i] = at + HOLD / 2
        }

        const showText = (i: number, at: number) => {
          const parts = panels[i].querySelectorAll("[data-reveal]")
          tl.fromTo(panels[i], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, immediateRender: false }, at)
          tl.fromTo(
            parts,
            { y: 0, yPercent: 110, autoAlpha: 0 },
            { y: 0, yPercent: 0, autoAlpha: 1, duration: 0.45, stagger: 0.06, ease: "power3.out" },
            at,
          )
        }

        const hideText = (i: number, at: number) => {
          const parts = panels[i].querySelectorAll("[data-reveal]")
          tl.fromTo(
            parts,
            { y: 0, yPercent: 0, autoAlpha: 1 },
            { y: 0, yPercent: -60, autoAlpha: 0, duration: 0.3, stagger: 0.03, ease: "power2.in", immediateRender: false },
            at,
          )
          tl.fromTo(panels[i], { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.01, immediateRender: false }, at + 0.42)
        }

        tl.fromTo(q("[data-hint]"), { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -8, duration: 0.35 }, 0)
        enter(0, 0)
        showText(0, ENTER * TEXT_SWAP_AT)
        let cursor = ENTER
        const swaps = [0]
        systems.forEach((_, i) => {
          hold(i, cursor)
          cursor += HOLD
          if (i === systems.length - 1) return
          enter(i + 1, cursor)
          hideText(i, cursor)
          showText(i + 1, cursor + HANDOFF * TEXT_SWAP_AT)
          swaps.push(cursor + HANDOFF * TEXT_SWAP_AT)
          cursor += HANDOFF
        })
        tl.fromTo(q("[data-progress]"), { scaleX: 0 }, { scaleX: 1, duration: tl.duration() }, 0)

        // Touch momentum would fling through every step in one swipe, so on touch screens the pinned
        // range is gesture-driven: native scrolling is blocked and each swipe advances exactly one step.
        const html = document.documentElement
        const touch = window.matchMedia("(pointer: coarse)").matches
        const last = systems.length - 1
        let step = 0
        let consumed = false
        let releasing = false
        let releasedAt = -Infinity
        let scrollTween: gsap.core.Tween | null = null
        let resumeCheck: gsap.core.Tween | null = null

        // Mobile browsers resize the viewport as the address bar slides; only an orientation change
        // (width change) may move the pin's end, otherwise the exit point drifts under the user's finger.
        let baseWidth = window.innerWidth
        let baseHeight = window.innerHeight
        const stableVh = () => {
          if (window.innerWidth !== baseWidth) {
            baseWidth = window.innerWidth
            baseHeight = window.innerHeight
          }
          return baseHeight
        }

        const stepTop = (i: number) => {
          const st = trigger.current!
          return st.start + (holdTimes.current[i] / tl.duration()) * (st.end - st.start)
        }

        const nearestStep = () => {
          let best = 0
          for (let i = 1; i <= last; i++) {
            if (Math.abs(stepTop(i) - window.scrollY) < Math.abs(stepTop(best) - window.scrollY)) best = i
          }
          return best
        }

        const scrollToY = (y: number, onDone?: () => void) => {
          scrollTween?.kill()
          const proxy = { y: window.scrollY }
          scrollTween = gsap.to(proxy, {
            y,
            duration: STEP_SCROLL,
            ease: "power2.inOut",
            onUpdate: () => window.scrollTo(0, proxy.y),
            onComplete: () => {
              scrollTween = null
              onDone?.()
            },
          })
        }

        const unlock = () => {
          gestures?.disable()
          html.removeAttribute("data-scroll-lock")
        }

        // Carry the page well clear of the pin before handing scrolling back; a couple of pixels of
        // momentum or address-bar jitter would otherwise re-enter it and snap the user back a step.
        const release = (dir: 1 | -1) => {
          const st = trigger.current!
          const gap = stableVh() * 0.35
          releasing = true
          gestures?.disable()
          scrollToY(dir > 0 ? st.end + gap : st.start - gap, () => {
            releasing = false
            releasedAt = performance.now()
            html.removeAttribute("data-scroll-lock")
            resumeCheck?.kill()
            resumeCheck = gsap.delayedCall(REENTRY_PAUSE / 1000, () => {
              if (trigger.current?.isActive) lock(nearestStep())
            })
          })
        }

        const go = (dir: 1 | -1) => {
          if (scrollTween || consumed) return
          consumed = true
          const next = step + dir
          if (next < 0 || next > last) {
            release(dir)
            return
          }
          step = next
          scrollToY(stepTop(step))
        }

        const gestures = touch
          ? Observer.create({
              target: window,
              type: "touch,wheel",
              // A touch-first device may also have a trackpad; invert the wheel so both read like a swipe.
              wheelSpeed: -1,
              preventDefault: true,
              allowClicks: true,
              tolerance: 10,
              onStopDelay: 0.2,
              onPress: () => {
                consumed = false
              },
              onStop: () => {
                consumed = false
              },
              onUp: () => go(1),
              onDown: () => go(-1),
            })
          : null
        gestures?.disable()

        function lock(i: number) {
          if (!gestures || gestures.isEnabled || releasing) return
          if (performance.now() - releasedAt < REENTRY_PAUSE) return
          resumeCheck?.kill()
          step = i
          // The swipe that carried the page here must not also advance it; wait for a fresh touch.
          consumed = true
          html.setAttribute("data-scroll-lock", "")
          window.scrollTo(0, window.scrollY)
          gestures.enable()
          scrollToY(stepTop(i))
        }

        stepTo.current = touch
          ? (i: number) => {
              if (!gestures?.isEnabled) return false
              step = i
              scrollToY(stepTop(i))
              return true
            }
          : null

        trigger.current = ScrollTrigger.create({
          trigger: section,
          animation: tl,
          start: "top top",
          end: () => `+=${stableVh() * systems.length * 1.15}`,
          pin: true,
          scrub: 0.9,
          anticipatePin: 1,
          snap: touch
            ? undefined
            : {
                snapTo: "labelsDirectional",
                duration: { min: 0.25, max: 0.7 },
                delay: 0.12,
                ease: "power2.inOut",
                inertia: false,
              },
          onRefresh: measure,
          onEnter: () => lock(0),
          onEnterBack: () => lock(last),
          onLeave: () => {
            if (!releasing) unlock()
          },
          onLeaveBack: () => {
            if (!releasing) unlock()
          },
          onToggle: (self) => document.documentElement.toggleAttribute("data-immersive", self.isActive),
          onUpdate: (self) => {
            // Safety net: if the page ever comes to rest inside the pin unlocked (restored scroll
            // position, a late layout refresh), settle it on the nearest step instead of free-scrolling.
            // Deferred so a same-frame onEnter/onEnterBack picks the directional step first.
            if (touch && self.isActive && !scrollTween && !releasing && !gestures?.isEnabled) {
              queueMicrotask(() => {
                if (trigger.current?.isActive) lock(nearestStep())
              })
            }
            const time = self.progress * tl.duration()
            let next = 0
            swaps.forEach((t, i) => {
              if (time >= t) next = i
            })
            if (next !== activeRef.current) {
              activeRef.current = next
              setActive(next)
            }
          },
        })

        return () => {
          scrollTween?.kill()
          resumeCheck?.kill()
          gestures?.kill()
          stepTo.current = null
          trigger.current = null
          html.removeAttribute("data-scroll-lock")
          html.removeAttribute("data-immersive")
        }
      })
      return () => mm.revert()
    },
    { scope: root, dependencies: [systems.length] },
  )

  const jumpTo = useCallback((i: number) => {
    if (stepTo.current?.(i)) return
    const st = trigger.current
    const anim = st?.animation
    if (!st || !anim) return
    const top = st.start + (holdTimes.current[i] / anim.duration()) * (st.end - st.start)
    window.scrollTo({ top, behavior: "smooth" })
  }, [])

  const count = String(systems.length).padStart(2, "0")

  return (
    <>
      <section
        ref={root}
        aria-labelledby="shop-by-system-title"
        className="relative isolate h-svh overflow-hidden bg-[#050505] text-white motion-reduce:hidden"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ backgroundImage: LINES_BG }} />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_30%_55%,transparent_0%,#050505_72%)]"
        />

        <div className="mx-auto flex h-full max-w-7xl flex-col px-4 pt-[calc(var(--sbs-offset,0px)+1.25rem)] pb-[calc(var(--sbs-bottom,0px)+1rem)] md:px-6 md:pt-[calc(var(--sbs-offset,0px)+2.5rem)] md:pb-[calc(var(--sbs-bottom,0px)+2rem)]">
          <header className="flex items-end justify-between gap-4">
            <h2
              id="shop-by-system-title"
              className="font-expanded text-[clamp(1.75rem,min(7.5vw,9svh),6.5rem)] leading-[0.88] font-extrabold tracking-tight text-balance uppercase"
            >
              {title}
            </h2>
            <p aria-hidden="true" className="shrink-0 pb-1 font-mono text-xs tracking-[0.2em] text-white/50 tabular-nums md:text-sm">
              <span className="text-white">{String(active + 1).padStart(2, "0")}</span> / {count}
            </p>
          </header>

          <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] gap-4 py-4 landscape:grid-cols-[1.15fr_0.85fr] landscape:grid-rows-1 landscape:items-center landscape:gap-6 md:py-6 landscape:md:gap-10">
            <div className="relative h-full min-h-0 [container-type:size]">
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-[6%] h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
              />
              <div
                data-glow
                aria-hidden="true"
                className="invisible absolute inset-0 m-auto size-[min(80cqw,80cqh)] rounded-full bg-primary/30 blur-3xl"
              />
              <div data-floor-shadow aria-hidden="true" className={`invisible ${FRAME}`}>
                <div className="absolute -bottom-3 left-1/2 h-6 w-[78%] -translate-x-1/2 rounded-[50%] bg-black/80 blur-md" />
              </div>
              {systems.map((s, i) => (
                <div key={s.id} data-carrier style={ROLL_TRAVEL} className={`invisible ${FRAME} will-change-transform`}>
                  <div data-fit className="size-full will-change-transform">
                    <div style={ROLL_TURN} className="size-full will-change-transform">
                      <div data-rotor className="relative size-full will-change-transform">
                        <Image
                          src={s.image || "/placeholder.svg"}
                          alt=""
                          fill
                          sizes="(min-width: 768px) 40vw, 72vw"
                          className="object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)]"
                          priority={i === 0}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {scrollHint && (
                <p
                  data-hint
                  className="absolute inset-x-0 bottom-[calc(6%+1rem)] flex items-center justify-center gap-3 font-mono text-[11px] tracking-[0.24em] text-white/45 uppercase"
                >
                  <span aria-hidden="true" className="h-px w-8 bg-white/30" />
                  {scrollHint}
                  <span aria-hidden="true" className="h-px w-8 bg-white/30" />
                </p>
              )}
            </div>

            <div className="relative z-10 grid min-h-[11.5rem] landscape:min-h-0">
              {systems.map((s, i) => (
                <div key={s.id} data-panel className="invisible col-start-1 row-start-1 self-center">
                  <Link
                    href={s.href}
                    className="group block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-primary"
                  >
                    <p className="overflow-hidden font-mono text-[11px] tracking-[0.24em] text-white/45 uppercase md:text-xs">
                      <span data-reveal className="block">
                        {String(i + 1).padStart(2, "0")} — {count}
                      </span>
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 overflow-hidden py-1 md:mt-4 md:gap-4">
                      <h3
                        data-reveal
                        className="font-expanded text-[clamp(1.75rem,min(6vw,9svh),4.75rem)] leading-none font-extrabold tracking-tight uppercase"
                      >
                        {s.name}
                      </h3>
                      {s.badge && (
                        <span
                          data-reveal
                          className="rounded-md border border-white/15 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] tracking-[0.16em] text-white/75 uppercase md:text-xs"
                        >
                          {s.badge}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-end justify-between gap-6 overflow-hidden md:mt-5">
                      <p data-reveal className="max-w-sm text-sm leading-relaxed text-pretty text-white/60 md:text-base">
                        {s.blurb}
                      </p>
                      <span
                        data-reveal
                        aria-hidden="true"
                        className="grid size-11 shrink-0 place-items-center rounded-full border border-white/20 transition-colors group-hover:border-primary group-hover:bg-primary md:size-14"
                      >
                        <ArrowUpRight className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 md:size-6" />
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <nav aria-label={title} className="relative pt-3">
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-white/12">
              <div data-progress className="h-full origin-left scale-x-0 bg-primary" />
            </div>
            <ol className="grid auto-cols-fr grid-flow-col gap-2">
              {systems.map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => jumpTo(i)}
                    aria-current={active === i ? "step" : undefined}
                    className={`w-full py-1 text-left font-mono text-[10px] tracking-[0.2em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:text-xs ${
                      active === i ? "text-white" : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    <span className="ml-2">{s.name}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </section>

      <StaticSystems title={title} systems={systems} />
    </>
  )
}

function StaticSystems({ title, systems }: Pick<ShopBySystemProps, "title" | "systems">) {
  return (
    <section
      aria-labelledby="shop-by-system-static-title"
      className="hidden bg-[#050505] px-4 py-12 text-white motion-reduce:block md:px-6"
    >
      <div className="mx-auto max-w-7xl">
        <h2 id="shop-by-system-static-title" className="font-expanded text-3xl font-extrabold uppercase md:text-5xl">
          {title}
        </h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {systems.map((s) => (
            <li key={s.id}>
              <Link
                href={s.href}
                className="group flex h-full flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-5 hover:border-white/30"
              >
                <div className="relative aspect-square w-full">
                  <Image src={s.image || "/placeholder.svg"} alt="" fill sizes="(min-width: 640px) 30vw, 90vw" className="object-contain" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="font-expanded text-xl font-extrabold uppercase">{s.name}</h3>
                  {s.badge && <span className="font-mono text-[11px] tracking-wider text-white/60 uppercase">{s.badge}</span>}
                  <ArrowUpRight className="ml-auto size-5" aria-hidden="true" />
                </div>
                <p className="text-sm leading-relaxed text-white/60">{s.blurb}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
