# Syntropy Design Specification

---

# BRAND FOUNDATION

### Positioning Statement

Syntropy is the enterprise sustainability operating system that helps organizations measure, manage, and improve ESG performance through real time insights, automated workflows, and employee engagement, all in one unified platform.

---

### Voice and Tone

Professional. Modern. Confident. Clear.

Writing should feel like Stripe, Linear, Vercel, or Notion.

Avoid:

* Corporate buzzwords
* Marketing fluff
* Long paragraphs
* Exaggerated claims

Prefer:

* Short sentences
* Clear explanations
* Action oriented copy
* Data first messaging

Examples:

Correct: "Track carbon emissions across every department."

Correct: "Generate ESG reports in minutes."

Incorrect: "Empowering organizations to unlock the next generation of sustainable innovation."

---

### Brand Personality

Modern. Trustworthy.

Every design decision should answer:

"Would this feel at home next to Stripe Dashboard or Linear?"

---

### Product Name

Syntropy

---

### Tagline

Sustainability, operationalized.

Alternative options:

* Build Better Businesses.
* ESG, Simplified.
* Sustainability Starts Here.
* Measure. Improve. Report.
* Sustainability Built Into Operations.

---

# COLOR SYSTEM

Syntropy is dark mode only. There is a single visual identity: a deep, near black workspace with a bright green accent. No light theme exists and none should be built. This is a deliberate choice, not a placeholder state.

### Primary Background

```
#0B0F0D
```

Deep near black. Used for the page background.

---

### Card Background

```
#111815
```

Slightly lifted from the page background so cards read as distinct surfaces.

---

### Hover / Section Background

```
#0F1512
```

Used for alternating section backgrounds and hover states.

---

### Primary Brand Green

```
#22C55E
```

Used for:

* Icons
* Primary buttons
* Links
* Active navigation
* Charts (Environmental)

---

### Heading Text

```
#4ADE80
```

A brighter green for headings, tuned for contrast against the dark background.

---

### Primary Text

```
#F3F4F1
```

Near white.

---

### Secondary Text

```
#9CA3AF
```

Gray.

---

### Borders

```
#232B27
```

Low contrast hairline borders that stay quiet against dark surfaces.

---

### Success

```
#22C55E
```

### Warning

```
#F59E0B
```

### Error

```
#EF4444
```

### Info

```
#3B82F6
```

---

# TYPOGRAPHY

### Font Family

Geist (sans) for interface and copy.

Geist Mono for code blocks.

No secondary display font.

---

### Font Weights

500: Labels

600: Section titles

700: Page titles

---

### Type Scale

Hero: 64px

Section Title: 36px

Card Title: 20 to 24px

Body: 16px

Small: 14px

Caption: 12 to 13px

---

# LOGO

Simple wordmark.

```
Syntropy
```

Green icon mark, a leaf silhouette held inside a rounded square.

White wordmark on dark backgrounds.

Minimal. Flat. No gradients. No 3D.

---

# ICON SET

Lucide style icons, hand drawn as inline SVG in the build.

Style:

* Outline
* 2px stroke
* Rounded joins and caps

Icons are green by default. Chart categories use their own accent color (see Charts, below).

---

# MOTION PRINCIPLE

Motion should feel subtle and purposeful.

Animations:

* Fade
* Slide
* Scale (96 to 98% up to 100%)

Duration: 150 to 800ms depending on context (interaction feedback is fast, section reveals are slower).

No bounce. No exaggerated motion. `prefers-reduced-motion` is respected everywhere: reveals, staggers, counters, and parallax all disable themselves when the user has that preference set.

---

# LANDING PAGE

This section documents the landing page as built.

## Overall Layout

Minimal. Large whitespace. Centered content. Max content width: 1280px.

---

## Navigation Bar

Floating glass navigation, centered horizontally, not attached to screen edges. Roughly 78% viewport width, capped at 980px. Rounded full pill shape.

Style:

* Glass effect, `backdrop-filter: blur(20px) saturate(1.4)`
* Dark surface at roughly 72% opacity
* Thin low contrast border
* Soft shadow
* Rounded full pill shape

Navigation items:

* Features
* Solutions
* Pricing
* Documentation
* About

Right side:

* Login (ghost button)
* Get Started (primary green button)

### Navbar Scroll Behavior

* Remains fixed while scrolling
* Slightly reduces top offset and internal padding after roughly 80px of scroll
* Transitions smoothly over 200ms

---

## Hero Section

### Headline

The Enterprise ESG Operating System.

### Supporting Text

Track carbon emissions, automate compliance, engage employees, and generate ESG reports, all from one modern platform.

### Primary CTA

Get Started

### Secondary CTA

Book a Demo

### Hero Visual

A dashboard preview inside a browser style frame, centered below the headline. The frame has a subtle continuous float (6 to 8px vertical movement, 7 second loop, ease in out). Behind the content, two soft blurred green radial gradients and a faint dot grid provide depth, masked so they fade out toward the edges. The gradients drift slightly with scroll (parallax), while the headline, subtext, and buttons never receive parallax movement.

### Stats Strip

Below the hero CTAs, three counters:

* 500+ Companies
* 95% Compliance rate
* 1.2M Carbon transactions

Counters animate from 0 to their target value once, when scrolled into view, over roughly 1 second with an ease out curve.

---

## Product Pillars

Three cards, one per ESG category, each with a colored icon tile and a category tag:

* Environmental: track emissions and sustainability goals
* Social: drive engagement and CSR initiatives
* Governance: manage compliance, audits, and policies

Cards lift 4px on hover with a soft shadow.

---

## Problem Section

Title: "Sustainability shouldn't live in spreadsheets."

Four problems, each in its own bordered card with a warning icon:

* Manual reporting
* Disconnected systems
* Low employee engagement
* Compliance complexity

Followed by a single resolving statement: "Syntropy centralizes everything."

Section sits on the alternate (slightly lighter) dark background to separate it from the sections above and below.

---

## Features Section

A four column grid (collapsing to two, then one, on smaller screens) of eight feature cards:

* Carbon Accounting
* ESG Dashboards
* CSR Activities
* Governance Tracking
* Challenges and Rewards
* Reporting
* Department Scores
* AI Insights, marked with a "Coming soon" badge since it is not yet available

Each card: icon, title, one line description. Cards lift on hover.

---

## Architecture Section

A vertical, single column flow diagram showing how data moves through the system:

```
ERP Systems
     |
Carbon Engine
     |
Environmental
     |
Social
     |
Governance
     |
Gamification
     |
ESG Scoring
     |
Dashboards and Reports
```

Each stage is a bordered pill with a colored dot matching its category. Connectors are thin vertical lines with a small arrow.

---

## Integrations Section

A row of wrapping chips, each with an icon and a name:

* SAP
* Oracle
* Microsoft Dynamics
* Odoo
* CSV Import
* REST API

Chips lift slightly and pick up a green border on hover. There is no auto scrolling logo marquee in the current build; the list is static.

---

## Security Section

A five column grid (collapsing responsively) of security capabilities, each with an icon and a label, no supporting paragraph:

* Role-Based Access Control
* Audit Logs
* Enterprise Authentication
* Secure Data Storage
* API Security

---

## Pricing Section

Three cards:

* Starter: for small teams beginning their ESG journey
* Professional: for growing organizations, marked Recommended with a highlighted border and elevated shadow
* Enterprise: for large organizations, custom pricing

Each card lists its price, a short description, a CTA button, and a feature checklist.

---

## Developer Section

Two column layout on an alternate dark background.

Left: a short pitch, a row of four labeled tabs (REST API, SDK, Webhooks, CLI), and a list of four capabilities, each with an icon:

* REST API
* SDKs
* Webhooks
* CLI

Right: a code window styled like a terminal, showing a short REST API example that fetches an ESG score. Syntax highlighting uses green, blue, amber, and gray tones consistent with the rest of the palette.

---

## FAQ Section

A single column accordion, one question open at a time:

* How is ESG calculated?
* Can I integrate with my ERP?
* Can departments have different ESG weights?
* How are reports generated?
* Does Syntropy support custom workflows?

Opening a question rotates its plus icon 45 degrees and expands the answer over 300ms.

---

## Final CTA

Headline: "Ready to operationalize sustainability?"

A rounded panel with a subtle green tinted gradient background, containing the headline and both primary and secondary CTA buttons, centered.

---

## Footer

Five columns: brand and tagline, Product, Resources, Company, Legal. A bottom row holds the copyright line and social links (GitHub, LinkedIn, X).

---

# SCROLL EXPERIENCE (LANDING PAGE ONLY)

These interactions are exclusive to the marketing landing page and are not used inside the dashboard application.

## Motion Philosophy

* Smooth, understated, premium
* Motion reinforces hierarchy and storytelling
* Every animation has a purpose
* Never flashy or gimmicky

## Scroll Reveal

Each major section fades in and translates upward as it enters the viewport (0 to 100% opacity, roughly 32px upward translation, 700ms, ease out). Each section animates once per session using an intersection observer; it does not repeat on repeated scrolling.

## Staggered Cards

Grouped cards (pillars, features, integrations, security, pricing) fade and rise in sequence, offset by roughly 80ms per item.

## Hero Load Sequence

On page load, the hero text fades in first, followed shortly by the dashboard preview. The full sequence completes within about 1.2 seconds.

## Floating Dashboard Preview

The hero dashboard mockup moves vertically by 6 to 8px on a continuous 6 to 8 second ease in out loop. Movement is intentionally subtle.

## Parallax

Applied only to the two decorative background gradients in the hero, never to text or interactive elements. Movement is proportional to scroll position and stays small.

## Number Counters

Hero statistics count up from 0 to their target value once, when scrolled into view, over roughly 1 second.

## Hover Motion

Cards lift 4px with a slightly stronger shadow. Buttons scale to roughly 102%. Both transition over 150ms.

## Performance Requirements

* GPU accelerated properties only (`transform`, `opacity`)
* `prefers-reduced-motion` disables reveals, staggers, counters, and parallax
* Animations are deferred until their element enters the viewport

---

# DASHBOARD APPLICATION

The dashboard is the authenticated product surface. It has not been built yet; this section is the specification to build against, and it deliberately differs from the landing page in how it moves.

## Guiding Principle

The landing page sells the product through motion. The dashboard sells the product through speed and clarity. There is no scroll storytelling inside the application: no scroll reveals, no staggered card entrances, no parallax, no floating elements.

## What the Dashboard Should Prioritize

* Instant page transitions
* Subtle hover states, consistent with the landing page's hover motion
* Drawer and modal animations that open and close quickly and predictably
* Toast notifications for confirmations and errors
* Skeleton loaders while data is fetching, never blank screens or spinners as the default
* Table row highlights on hover and on selection
* Chart transitions when the underlying data updates, not on scroll

## Visual Language

The dashboard inherits every token from the landing page: the same dark background, card surface, border, text, and green accent colors, the same Geist typography, and the same button, form, table, and chart component styles defined in the Design System section below. Nothing about the dashboard should look like a different product.

## Layout Expectations

* Fixed sidebar or top navigation, not a floating glass pill like the marketing site. The dashboard nav is functional and stays out of the way.
* Data dense views are acceptable here in a way they are not on the landing page. Whitespace still matters, but density and speed of scanning take priority over storytelling.
* Every list view supports search, filtering, sorting, and pagination, consistent with the Tables section of the Design System.

---

# DESIGN SYSTEM

## Overall Style

Modern enterprise SaaS on a dark surface.

Inspired by Stripe, Linear, Vercel, Notion, and Attio, adapted to a dark palette.

## UI Principles

* Dark first interface
* Large whitespace
* Minimal visual noise
* Consistent spacing
* Data first layouts
* Flat design with subtle depth
* Green used as a brand accent, not as a dominant fill color

## Cards

* Card background token, one step lighter than the page background
* 16px border radius
* Low contrast border
* Soft shadow
* 24 to 32px padding

## Buttons

Primary: green background, dark text or white text depending on contrast, currently white.

Secondary: transparent or card background, green border, green text.

Ghost: transparent, green text, no border.

Destructive: red.

## Forms

* Rounded inputs
* Card background
* Green focus ring
* Clear labels
* Inline validation

## Tables

* Sticky headers
* Row hover state
* Search
* Filters
* Sorting
* Pagination
* Bulk actions
* CSV export
* Minimal borders

## Charts

Clean, minimal charts on the dark surface.

* Environmental: green
* Social: blue
* Governance: purple
* Gamification: orange

All charts share the same visual language and remain consistent with the dark interface.

---

# NOTES ON REUSE ACROSS PRODUCT LINES

### Invariant Layer

* Syntropy branding
* Dark first color system
* Geist typography
* Glass centered navigation (marketing site only)
* Green accent color
* Lucide style icon set
* Motion principles
* Footer structure
* Component library

### Variable Layer

* Hero headline
* Hero visual
* Problem framing
* Feature emphasis
* Integrations
* Pricing details
* CTA text
* Industry specific messaging

---

## Before Building a New Product Line

1. Who is the target audience? (ESG Manager, HR Lead, Compliance Officer, Executive, and so on)
2. What primary problem does this product solve?
3. What proof matters most to this audience? (Efficiency, compliance, engagement, cost reduction, visibility)
4. What is the primary CTA? (Get Started, Book a Demo, Contact Sales, Request a Trial)

This specification defines a single, consistent visual identity: a dark first interface, green branding, Geist typography, and a centered floating glass navigation bar on the marketing site, giving Syntropy a modern enterprise SaaS aesthetic that feels premium, trustworthy, and focused on sustainability.