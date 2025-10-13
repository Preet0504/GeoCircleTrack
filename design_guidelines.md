# Design Guidelines: Real-Time Geolocation Tracking Application

## Design Approach

**Selected Approach**: Design System-Based with Material Design principles, optimized for map-centric applications
**Justification**: This utility-focused application prioritizes clarity, real-time feedback, and efficient spatial data visualization. The interface must not compete with the map content while providing precise controls for admin operations and clear status indicators for users.

**Key Design Principles**:
- Content-first: Map takes visual priority, UI recedes into supporting role
- Instant feedback: All real-time events (location updates, coordinate changes) have clear visual confirmation
- Spatial clarity: Distinguish admin controls from map interactions
- Accessibility: High contrast controls, clear state indicators for location permissions

---

## Core Design Elements

### A. Color Palette

**Dark Mode Primary** (recommended default for map applications):
- Background: 220 15% 12% (deep slate)
- Surface: 220 15% 18% (elevated panels)
- Primary: 210 100% 60% (crisp blue for active coordinates)
- Secondary: 160 60% 50% (teal for user location/radius circles)
- Accent: 280 70% 65% (purple for admin-generated coordinates)
- Success: 142 71% 45% (green for "inside radius" state)
- Error: 0 72% 51% (red for location disabled/errors)
- Text Primary: 0 0% 98%
- Text Secondary: 220 10% 70%

**Light Mode Alternative**:
- Background: 0 0% 100%
- Surface: 220 15% 96%
- Primary: 210 100% 50%
- Secondary: 160 60% 45%
- Keep accent/success/error consistent
- Text Primary: 220 15% 15%
- Text Secondary: 220 10% 40%

### B. Typography

**Font Stack**: 
- Primary: 'Inter' (Google Fonts) for UI elements, coordinates, controls
- Monospace: 'JetBrains Mono' for coordinate display (lat/long precision)

**Hierarchy**:
- H1 (Mode Headers): text-2xl font-semibold
- H2 (Section Labels): text-lg font-medium  
- Body (Controls/Lists): text-base font-normal
- Coordinates: text-sm font-mono (tabular-nums for alignment)
- Captions (Status): text-xs font-medium uppercase tracking-wide

### C. Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 8, 12, 16 for consistent rhythm
- Compact spacing: p-2, gap-2 (within controls)
- Standard spacing: p-4, gap-4 (between elements)
- Section spacing: p-8, gap-8 (panel separation)
- Large spacing: p-12, p-16 (outer containers)

**Layout Structure**:
- Map Container: Absolute positioning, fills viewport (100vh, 100vw)
- Control Panels: Fixed positioning, slide-in from sides
  - Admin Panel: Left side, w-80 to w-96, full-height
  - User Panel: Right side, w-72, compact height
- Top Bar: Fixed header, h-16, full-width for mode switcher + location status
- Bottom Sheet (Mobile): Drawer component for controls on touch devices

### D. Component Library

**Navigation & Mode Selection**:
- Mode Toggle: Segmented control (Admin/User) in top bar, pill-shaped with slide indicator
- Location Status Indicator: Icon + text in top-right, color-coded (green=active, red=disabled, amber=acquiring)

**Map Components**:
- Coordinate Markers: 
  - Admin-placed: Blue pins with drop animation
  - Random k coordinates: Purple pins with pulse effect
  - User location: Teal dot with accuracy circle (fading border)
- Radius Circles: Semi-transparent fills (opacity-20) with solid borders (opacity-60)
- Coordinate Labels: White text on dark semi-transparent badge (backdrop-blur-sm)

**Admin Controls** (Left Panel):
- Section Cards: Rounded-lg surface with border, p-6 spacing
- "Add Coordinates" Button: Primary solid button with map cursor icon
- Coordinate List: Scrollable area (max-h-64), each item with coordinate + remove icon button
- "Generate Random k" Controls:
  - Number input with label (k value)
  - Primary action button with shuffle icon
- Radius Control: Slider input (0-5000m) with live value display
- Time Interval Control: Number input (seconds) + start/stop toggle button

**User Interface** (Right Panel - Compact):
- Status Card: Shows "Inside/Outside Radius" with visual indicator (dot)
- Visible Coordinates List: Appears only when inside radius, animated slide-in
- Distance Display: Shows proximity to nearest coordinate

**Form Elements**:
- Inputs: h-10, rounded-md, border with focus ring
- Buttons: h-10, rounded-md, font-medium
  - Primary: bg-primary text-white
  - Secondary: border variant, bg-transparent
  - Danger: bg-error text-white (for remove actions)
- Sliders: Custom track with prominent thumb, live value tooltip

**Data Display**:
- Coordinate Cards: Flexbox layout, justify-between, coordinate on left (mono font), actions on right
- Real-time Indicators: Animated dots (pulse) for active tracking, static for inactive
- Distance Metrics: Large numbers (text-3xl) with unit labels (text-sm, text-muted)

**Overlays & Modals**:
- Permission Request: Centered modal with icon, clear message, single action button
- Confirmation Dialogs: For removing coordinates, changing modes while tracking
- Toast Notifications: Bottom-right, slide-in, 4-second duration for events ("Coordinate added", "User entered radius")

### E. Animations & Interactions

**Essential Animations Only**:
- Map marker drop-in: 300ms ease-out on new coordinate placement
- Panel slide: 250ms ease-in-out for opening/closing side panels
- Real-time pulse: 2s infinite for active tracking indicators
- Radius circle expand: 400ms on creation/value change
- Toast slide: 200ms ease-out entrance, 150ms fade exit

**Interaction States**:
- Hover: Subtle scale (1.02) on interactive map markers
- Active: Scale (0.98) on buttons, brightness increase on map controls
- Focus: 2px ring in primary color for keyboard navigation
- Disabled: opacity-50 with not-allowed cursor

---

## Images

No hero images needed - this is a map-first application. The map itself is the primary visual content.

**Icon Usage**: Use Heroicons via CDN for all UI icons (location pin, plus, minus, shuffle, clock, etc.)

---

## Real-Time Specific Design Elements

**Live Status Indicators**:
- Pulsing dot animation for "currently tracking" state
- Coordinate count badges update instantly
- Map marker animations synchronized with database updates

**Radius Visualization**:
- Circle overlays use gradient fills (center transparent → edge semi-opaque)
- Active circles have animated dashed borders for emphasis
- User's proximity shown with dynamic color intensity

**Mode-Specific Visual Language**:
- Admin mode: Blue accent throughout, comprehensive controls visible
- User mode: Teal accent, minimal UI, focus on location status
- Clear visual distinction prevents mode confusion