/**
 * motion.config.ts — QueueOS Animation Architecture
 * Swiss Triage / Critically Damped Springs / No Bounce
 * Rugas Technologies Queue Management System
 */

// ============================================================
// 1. SPRING PHYSICS PRESETS
// Critically damped — never bouncy
// ============================================================

export const springs = {
  // Primary spring for reordering, morphing, entrances
  default: {
    type: "spring" as const,
    stiffness: 500,
    damping: 38,
    mass: 0.8,
  },
  // Fast snap for sidebar indicator, hover states
  snap: {
    type: "spring" as const,
    stiffness: 700,
    damping: 45,
    mass: 0.6,
  },
  // Slower, deliberate for modal entrance
  modal: {
    type: "spring" as const,
    stiffness: 400,
    damping: 35,
    mass: 0.9,
  },
} as const;

// ============================================================
// 2. DURATION TOKENS (ms)
// ============================================================

export const durations = {
  instant:  120,   // Hover background tints, opacity shifts
  fast:     180,   // Token row entrance, form entrance, toast entry
  normal:   240,   // Drawer slide-in, modal entrance, row morph
  exit:     140,   // Row cancel/complete exit, modal dismiss
  route:    150,   // View Transitions API crossfade
  chart:    600,   // Chart line draw (strokeDashoffset)
  bar:      300,   // Chart bar scaleY on mount
  shake:    220,   // Login error micro-shake
} as const;

// ============================================================
// 3. EASING FUNCTIONS
// ============================================================

export const easings = {
  // For state transitions (UI entering)
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  // For exits (UI leaving)
  in:  [0.4, 0, 1, 0.6] as [number, number, number, number],
  // For symmetric transitions
  inOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
  // Linear (progress bars, timers)
  linear: [0, 0, 1, 1] as [number, number, number, number],
} as const;

// ============================================================
// 4. FRAMER MOTION VARIANTS
// ============================================================

// Login card entrance
export const loginCardVariants = {
  hidden:  { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: durations.fast / 1000, ease: easings.out } },
};

// Login error shake
export const loginShakeVariants = {
  shake: {
    x: [-4, 4, -3, 3, -2, 2, 0],
    transition: { duration: durations.shake / 1000, ease: easings.linear },
  },
};

// Token row entrance (new token added)
export const tokenRowEnterVariants = {
  hidden:  { opacity: 0, y: -10 },
  visible: { opacity: 1,  y: 0,
    transition: { duration: durations.fast / 1000, ease: easings.out },
  },
};

// Token row exit (cancelled or completed)
export const tokenRowExitVariants = {
  exit: {
    opacity: 0,
    x: 16,
    transition: { duration: durations.exit / 1000, ease: easings.in },
  },
};

// Modal entrance / exit
export const modalVariants = {
  hidden:  { opacity: 0, scale: 0.97, y: 4 },
  visible: { opacity: 1, scale: 1,    y: 0,
    transition: { duration: durations.normal / 1000, ease: easings.out },
  },
  exit: {
    opacity: 0, scale: 0.97,
    transition: { duration: durations.exit / 1000, ease: easings.in },
  },
};

// Overlay fade
export const overlayVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: durations.normal / 1000 } },
  exit:    { opacity: 0, transition: { duration: durations.exit / 1000 } },
};

// Dropdown menu (profile dropdown, filters)
export const dropdownVariants = {
  hidden:  { opacity: 0, y: -4, scale: 0.98 },
  visible: { opacity: 1, y:  0, scale: 1,
    transition: { duration: durations.instant / 1000, ease: easings.out },
  },
  exit:    { opacity: 0,
    transition: { duration: 100 / 1000, ease: easings.in },
  },
};

// Side drawer (token detail, mobile sidebar)
export const drawerVariants = {
  hidden:  { x: "100%" },
  visible: { x: 0,
    transition: { duration: durations.normal / 1000, ease: easings.out },
  },
  exit:    { x: "100%",
    transition: { duration: durations.fast / 1000, ease: easings.in },
  },
};

// Analytics KPI stagger
export const kpiContainerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.04 } },
};

export const kpiItemVariants = {
  hidden:  { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0,
    transition: { duration: durations.fast / 1000, ease: easings.out },
  },
};

// Toast notification
export const toastVariants = {
  hidden:  { opacity: 0, y: 16, x: 0 },
  visible: { opacity: 1, y:  0,
    transition: { duration: 220 / 1000, ease: easings.out },
  },
  exit:    { opacity: 0, x: 16,
    transition: { duration: durations.exit / 1000, ease: easings.in },
  },
};

// Empty state entrance
export const emptyStateVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1,
    transition: { duration: durations.fast / 1000, delay: 0.05 },
  },
};

// ============================================================
// 5. GSAP CONFIG (for GSAP + Flip usage)
// ============================================================

export const gsapConfig = {
  // Default ease for queue row reordering
  flipEase: "power3.out",
  // Duration for GSAP Flip row swap
  flipDuration: 0.24,
  // Duration for token → serving banner morph
  morphDuration: 0.28,
  // Stagger for analytics bars
  barStagger: 0.025,
  // Bar scaleY animation duration
  barDuration: 0.3,
  // Chart line draw duration
  lineDuration: 0.6,
  // Row exit (cancel/complete)
  exitDuration: 0.14,
  // Sidebar indicator slide
  indicatorDuration: 0.2,
};

// ============================================================
// 6. NUMBERFLOW CONFIG
// ============================================================

export const numberFlowConfig = {
  // For wait timers (seconds counting up)
  timer: {
    format: { minimumIntegerDigits: 2 },
    trend: 1, // always counting up
    animated: true,
    respectMotionPreference: true,
  },
  // For KPI values (can go up or down)
  kpi: {
    format: { maximumFractionDigits: 1 },
    animated: true,
    respectMotionPreference: true,
  },
  // For queue count badges (integer only)
  count: {
    format: { maximumFractionDigits: 0 },
    animated: true,
    respectMotionPreference: true,
  },
};

// ============================================================
// 7. VIEW TRANSITIONS (CSS view-transition-name values)
// ============================================================

export const viewTransitionNames = {
  mainWorkspace:   "main-workspace",
  activeNavBar:    "active-nav-bar",
  queuePanel:      "queue-panel-content",
  servingBanner:   "serving-banner",
  // Per-token morph IDs are dynamic: `token-${token._id}`
} as const;

// ============================================================
// 8. REDUCED MOTION SAFE VERSIONS
// ============================================================

export const reducedMotionVariants = {
  // Replace all animated variants with instant state change
  instant: {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.001 } },
    exit:    { opacity: 0, transition: { duration: 0.001 } },
  },
};

// Usage: check window.matchMedia('(prefers-reduced-motion: reduce)').matches
// If true, substitute reducedMotionVariants.instant for all animated variants above.

// ============================================================
// END — motion.config.ts — QueueOS v1.0
// ============================================================

