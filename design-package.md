# Design Package: ZONIC

Tier 1 build. One 6-second hero journey, one continuous shot.

## 1. The brand premise

Budget earbud buyers live inside a wall of inflated claims: batteries that quit by evening, sound like a tin can, buds dead within a week. ZONIC sells the opposite promise: **tested, not promised**. Every number on the page is stated as a claim we stand behind, and every section exists to prove one. The whole site teaches one idea: these are the specs you actually get.

## 2. The palette as CSS tokens

Direction from the footage world: deep space navy-black, electric cyan rim light, soft silver particles. Final values sampled from approved footage after the video gate. Starting points:

```css
:root{
  --canvas:#0a0e14;
  --panel:#121826;
  --accent:#00e5ff;
  --accent-hover:#5df3ff;
  --accent-muted:rgba(0,229,255,.13);
  --text-secondary:#8b96a8;
  --text-primary:#f2f6fc;
}
```

## 3. The type trio

- Display: **Space Grotesk**, weights 500 and 700. Techy geometry, characterful without shouting.
- Body: **Manrope**, weights 400 and 600. Quiet, rounded, easy at small sizes.
- Mono: **JetBrains Mono**, weights 400 and 500, for spec labels and small caps.

All three load from Google Fonts with `display=swap`.

## 4. The band map

Hero journey: an airbud descends through dark space, streaks past silver particles, crosses a layer of glowing mist (lens blur beat), and settles into its charging case, which rests centered in the lower third. Composed ending: generous margin above and below the case, rim-lit in cyan.

| Band | Range (starting point) | Footage moment | Copy (verbatim) | Entrance |
|---|---|---|---|---|
| 1 | 0.00 to 0.14 | bud hangs high in frame, first light streaks | "Cheap earbuds lie." | fade up, slight rise |
| 2 | 0.16 to 0.34 | descent starts, particles streak past | "Dead batteries. Tin-can sound. Dead in a week." | words fall in with the drop |
| 3 | 0.36 to 0.58 | mist crossing, blur beat | "ZONIC doesn't." | sharp cut-in as focus returns |
| 4 | 0.60 to 0.80 | case approaches from below, rim light grows | "40-hour battery. 13mm bass. Tested, not promised." | lines assemble left of the action lane |
| 5 | 0.84 to 1.00 | settle into case, composed rest | "Rs 2,999. Delivered to your door." + CTA "Order on WhatsApp" | CTA rises last, glow settles |

Action lane: center vertical third during bands 1 to 3, center lower third at settle. Captions flank it.

## 5. The static-hero copy block

Shown on phones, reduced motion, and file:// fallback over the poster frame:

- Headline: "Cheap earbuds lie. ZONIC doesn't."
- Subline: "40-hour battery. 13mm bass. Tested, not promised."
- CTA: "Order on WhatsApp"

## 6. The below-fold outline

One call-to-action anchor: the WhatsApp order button. It repeats at the close of every section.

1. **Spec ticker strip.** Mono labels, whisper-level marquee: "IPX5 WATERPROOF / 13MM DRIVERS / 45MS GAME MODE / USB-C FAST CHARGE / BLUETOOTH 5.3"
2. **Proof section: "Tested, not promised."** Three equal cards, each with a generated still in the hero's world plus verbatim copy:
   - Card 1: "40 hours, counted." Body: "Ten minutes of charge buys two hours of music. The case refills both buds four times."
   - Card 2: "13mm of bass." Body: "Deep desi bass lands chest-deep. Vocals stay clean above it."
   - Card 3: "45ms game mode." Body: "PUBG footsteps arrive when they happen, not half a second late."
   - **The interactive moment lives here:** press and hold the drawn earbud SVG and concentric EQ rings pulse outward while a low hum of bass ripple moves through the card grid. Release and it eases back.
3. **Order steps: "Three taps to your door."** Steps with verbatim copy:
   - "1. Tap WhatsApp. Tell us where to send it."
   - "2. We confirm your address in chat."
   - "3. Cash on delivery. Pay when it reaches you."
4. **Trust strip.** Verbatim: "7-day replacement. 1-year warranty. Real humans on WhatsApp."
5. **FAQ, in the buyers' own objections:**
   - Q: "Battery sach mein 40 hours chalti hai?" A: "The buds play 6 to 8 hours on one charge. The case refills them four times. Heavy users reach for the cable around day four."
   - Q: "Agar kharab ho gaya toh?" A: "Seven days to swap it, one year on manufacturing faults. Message us on WhatsApp and a human replies."
   - Q: "Payment online karni padegi?" A: "No. Cash on delivery comes standard. Pay only when the box is in your hand."
   - Q: "Delivery kitne din mein?" A: "Two to four days in Karachi, Lahore and Islamabad, up to a week elsewhere in Pakistan. Tracking comes on WhatsApp."
   - Q: "Calls mein awaaz saaf aati hai?" A: "Four mics with noise cleanup. Metro platform test passed."
6. **Final CTA section.** Headline: "Stop gambling on earbuds." Sub: "Your first pair of honest buds is one message away." Button: "Order on WhatsApp". Price beside it: "Rs 2,999. COD available."
7. **Footer.** Verbatim disclosure: "Product visuals on this page are AI generated. Your actual ZONIC buds may look slightly different." Plus: "© 2026 ZONIC. All rights reserved."

No web form. The WhatsApp button is the single conversion path everywhere.

## 7. The vector layer plan

- Hand-drawn SVG soundwave line under each section heading; draws itself on scroll, reverses upward.
- Whisper-level drifting particles in the hero background only, CSS keyframes, opacity under 0.15.
- EQ-bar divider motif between sections; five thin bars that ease to random heights once when scrolled into view.
- Outlined giant "ZONIC" watermark behind the proof cards, clipped, opacity 0.04.
- All motion honors reduced motion: final states shown, drives stopped.

## 8. The engineering list

Full standard from `scrub-pipeline.md`: Blob fetch behind the loading ring, dt-normalized lerp with idle rest, gated seeks, delta-gated DOM writes, band pacing validated by the flick test, four-layer legibility system checked against each band's worst frame, five static-hero gates kept live with change listeners, page complete and beautiful if the video never arrives, quality floor throughout. Whole-site-animated standard applies: every section carries one living element at whisper level, everything eases, nothing snaps.

## 9. The copy gate line

Every viewer-facing line above ships verbatim into the build. Before anyone sees the page: zero em dashes, zero stock words (leverage, seamless, empower, unlock, robust, actionable, data-driven, solutions), body-copy swept for AI tells. Designed devices written here (the staccato pain list in band 2, "Tested, not promised") are craft and stay.
