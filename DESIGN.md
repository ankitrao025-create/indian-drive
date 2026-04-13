# Design Brief

## Purpose & Context
Free-roam 3D sandbox driving game featuring Indian vehicles (cars, motorcycles, auto-rickshaws) with realistic physics and customization. Players navigate open world, complete challenges, modify vehicles, and compete on leaderboards.

## Tone
Urban street-culture energy with automotive precision. High-octane customization meets Mumbai street style—bold without juvenile gaminess.

## Color Palette

| Token | OKLCH | Role | Usage |
|-------|-------|------|-------|
| Primary | 0.62 0.22 22 (orange-red) | Accent, CTAs, vehicle highlights | Buttons, active states, speedometer, leaderboard rank |
| Secondary | 0.50 0.18 200 (teal) | Performance metrics | Upgrade chips, telemetry overlays, stats |
| Destructive | 0.58 0.24 20 (red) | Warning, damage states | Collision effects, low fuel |
| Neutral/Muted | 0.30 0 0 (deep grey) | Background surfaces, inactive UI | Sidebar, disabled controls, depth layer |
| Foreground | 0.92 0 0 (near-white) | Primary text | Dashboard text, HUD labels |

## Typography

| Layer | Font | Use |
|-------|------|-----|
| Display | Space Grotesk | Vehicle names, challenge titles, leaderboard headers—geometric strength |
| Body | Satoshi | UI labels, vehicle stats, customization descriptions |
| Mono | JetBrains Mono | RPM gauge, speed readout, engine specs, telemetry numbers |

## Elevation & Depth
- Card base: `bg-card` (0.16)
- Muted background: `bg-muted` (0.30)
- Raised surfaces: subtle inset shadows (dashboard gauges)
- No excessive depth—clarity and high contrast prioritized over layering

## Structural Zones

| Zone | Background | Treatment | Details |
|------|-----------|-----------|---------|
| Header | `bg-card` | Minimal border-bottom | Logo, player level, rupee balance, time |
| Canvas | `bg-background` (0.12) | Full-screen game viewport | 3D scene with HUD overlay |
| Left Sidebar | `bg-sidebar` (0.16) | Border-right subtle | Vehicle customization: paint, upgrades, suspension |
| Right Sidebar | `bg-sidebar` (0.16) | Border-left subtle | Leaderboard top 10, player rank, statistics |
| HUD Overlay | Transparent with text | Speedometer, RPM, gear, performance indicators | Positioned over canvas |

## Spacing & Rhythm
- Tight density for dashboard elements (8px base unit)
- Loose spacing in customization cards (16px)
- 4px gutters for visual separation of telemetry readouts

## Component Patterns
- **Vehicle Cards**: 2-column grid, dark card with orange-red accent stripe
- **Stats Display**: Monospace telemetry text with teal secondary accents
- **Buttons**: Sharp corners (sm/md radius), orange-red primary, teal secondary
- **Gauges**: Inset shadow with faint primary glow for dashboard feel
- **Input Fields**: `border-input` with `focus:ring-primary`

## Motion
- Smooth transition (0.3s cubic-bezier): all interactive state changes
- Gauge needle rotation: 0.2s ease-out
- HUD alerts: fade-in 0.15s, fade-out 0.3s
- Vehicle swap: cross-fade 0.4s

## Constraints
- High contrast for HUD readability during gameplay
- No heavy animations during active driving (performance critical)
- All orange-red CTAs must maintain AA+ contrast on dark backgrounds
- Telemetry text must remain ≤12px and monospace

## Signature Detail
Real-time vehicle performance telemetry integrated into UI chrome—RPM gauges, speed vectors, and modification impact visualizations rendered as dashboard elements, not decorative graphics. Every UI element serves gameplay clarity.
