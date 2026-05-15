# Track Platform - Frontend Design System

This document outlines the core design tokens, structural patterns, and UI conventions used across the Track platform's frontend. All new components and pages MUST adhere to these guidelines to ensure a cohesive and professional user experience.

## 1. Color Palette

### Primary Colors
- **Brand Navy (Main Primary)**: `#0B3B91` (Used for primary buttons, active states, progress bars, logos, icons).
- **Brand Navy Hover**: `#082d70` (Used for hover states on primary buttons).
- **Brand Blue (Alternative Primary)**: `#0052CC` (Used specifically in high-converting landing pages).

### Backgrounds
- **Main App Background**: `#f8f8f8` or `#F9FAFB` (Provides a soft, off-white contrast to white cards).
- **Surface / Card Background**: `#ffffff` (Pure white for forms, cards, and inputs).
- **Subtle Highlight**: `#f7f9ff` (Used for selected states, e.g., selected role cards).

### Typography Colors
- **Headings & Primary Text**: `text-black` (Pure black for maximum contrast and readability).
- **Secondary Text (Subtitles/Descriptions)**: `text-gray-500`.
- **Tertiary Text (Placeholders/Footers)**: `text-gray-400`.

### Borders & Dividers
- **Standard Border**: `border-gray-200` or `#ececec`.
- **Active / Focus Border**: `border-[#0B3B91]`.

## 2. Typography

- **Font Family**: Standard sans-serif (`font-sans`).
- **Headings**: Highly legible, often using `tracking-[-0.5px]` or `tracking-[-1px]` for a modern, tight look. Sizes range from `text-[22px]` to `text-[36px]`.
- **Body Text**: Typically `text-[14px]` with a line-height of `leading-[22px]` or `leading-[24px]`.
- **Tiny Text**: Labels and footers use `text-[11px]` or `text-[12px]`.
- **Weights**: 
  - Normal: `font-normal`
  - Medium: `font-medium` (Used heavily for buttons and labels)
  - Semibold: `font-semibold` (Used for page titles)

## 3. UI Components

### Buttons
- **Primary Button**: 
  - Background: `bg-[#0B3B91]`
  - Text: `text-white font-medium text-[13px]` or `text-[14px]`
  - Height: `h-[44px]`, `h-[46px]`, or `h-[48px]`
  - Border Radius: `rounded-[4px]` or `rounded-md`
  - Effects: `shadow-md transition hover:bg-[#082d70]`
- **Secondary/Ghost Button (e.g., "Sign In" header button)**:
  - Background: `bg-white`
  - Border: `border border-gray-200`
  - Text: `text-gray-500 text-[11px]` or `text-[12px]`
  - Border Radius: `rounded-md`
  - Effects: `shadow-sm hover:bg-gray-50`

### Inputs
- **Standard Input**:
  - Background: `bg-white`
  - Border: `border border-gray-200`
  - Text: `text-[13px] text-black`
  - Placeholder: `placeholder:text-gray-400`
  - Height: `h-[42px]` or `h-[46px]`
  - Padding: `px-4`
  - Focus State: `outline-none focus:border-[#0B3B91]`
  - Border Radius: `rounded-[4px]` or `rounded-md`

### Layout Patterns
- **Authentication / Onboarding Screens**:
  - Often split into two columns on desktop (`lg:w-1/2` split).
  - Left side contains the form, centered vertically and horizontally.
  - Right side contains a subtle patterned background (`radial-gradient` or grid lines) with a testimonial or branding image.
- **Top Header Bar**:
  - Contains a small square brand logo (`h-7 w-7 rounded-sm bg-[#0B3B91]`).
  - Right side often has a "Sign In" CTA.
- **Navigation Aids**:
  - "Go Back" button using `lucide-react`'s `<ArrowLeft size={15} />` paired with `text-[13px] text-gray-500`.
  - Progress bars using `h-[4px] rounded-full bg-[#ececec]` with an inner div of `bg-[#0B3B91]` indicating progress.

## 4. Spacing & Sizing
- Form maximum widths are typically capped at `max-w-[420px]` or `max-w-md` to maintain readability and prevent inputs from stretching too wide.
- Generous padding around the main content blocks (e.g., `py-12`, `px-5 sm:px-8`).

## 5. Implementation Rules for AI
1. **Never use generic Tailwind colors** (like red-500 or blue-500) for core branding unless it's a specific success/error state. Always stick to the defined hex codes.
2. **Always include transition effects** (`transition-all`, `transition`) on interactive elements like buttons and inputs.
3. **Maintain subtle shadows** (`shadow-sm`, `shadow-md`) on primary buttons to give depth.
4. **Icons** must be sourced from `lucide-react` with consistent stroke widths (usually `1.5` or default).
