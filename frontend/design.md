---
version: alpha
name: Agoda เว็บไซต์อย่างเป็นทางการ
description: Design system extracted from https://www.agoda.com/th-th/?cid=1720055&ds=s9sK5Nnjjb30AIGa
colors:
  text-primary: "#252c38"
  text-secondary: "#5392f9"
  surface-base: "#000000"
  text-inverse: "#5e6b82"
  surface-muted: "#ffffff"
  surface-raised: "#2067da"
  surface-strong: "#e5efff"
typography:
  xs:
    fontFamily: thonburi
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
  sm:
    fontFamily: thonburi
    fontSize: 13.47px
    fontWeight: 400
    lineHeight: 1.5
  md:
    fontFamily: thonburi
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  lg:
    fontFamily: thonburi
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  xl:
    fontFamily: thonburi
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.5
  2xl:
    fontFamily: thonburi
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  xs: 2px
  sm: 4px
  md: 24px
  lg: 999px
spacing:
  1: 1px
  2: 2px
  3: 4px
  4: 5px
  5: 6px
  6: 8px
  7: 10.67px
  8: 10.81px
  9: 12px
  10: 16px
  11: 24px
components:
  button-primary:
    backgroundColor: "{colors.text-primary}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: 12px
---

# Agoda เว็บไซต์อย่างเป็นทางการ

## Mission
Create implementation-ready, token-driven UI guidance for Agoda เว็บไซต์อย่างเป็นทางการ that is optimized for consistency, accessibility, and fast delivery across e-commerce storefront.

## Brand
- Product/brand: Agoda เว็บไซต์อย่างเป็นทางการ
- URL: https://www.agoda.com/th-th/?cid=1720055&ds=s9sK5Nnjjb30AIGa
- Audience: online shoppers and consumers
- Product surface: e-commerce storefront

## Style Foundations
- Visual style: clean, functional, implementation-oriented
- Main font style: `font.family.primary=thonburi`, `font.family.stack=thonburi, tahoma, sans-serif`, `font.size.base=13.47px`, `font.weight.base=400`, `font.lineHeight.base=19.2428px`
- Typography scale: `font.size.xs=13px`, `font.size.sm=13.47px`, `font.size.md=14px`, `font.size.lg=16px`, `font.size.xl=20px`, `font.size.2xl=24px`
- Color palette: `color.text.primary=#252c38`, `color.text.secondary=#5392f9`, `color.surface.base=#000000`, `color.text.inverse=#5e6b82`, `color.surface.muted=#ffffff`, `color.surface.raised=#2067da`, `color.surface.strong=#e5efff`
- Spacing scale: `space.1=1px`, `space.2=2px`, `space.3=4px`, `space.4=5px`, `space.5=6px`, `space.6=8px`, `space.7=10.67px`, `space.8=10.81px`
- Radius/shadow/motion tokens: `radius.xs=2px`, `radius.sm=4px`, `radius.md=24px`, `radius.lg=999px` | `shadow.1=rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(4, 7, 10, 0.24) 0px 2px 7px 0px` | `motion.duration.instant=100ms`

## Overview

A clean, functional, implementation-oriented interface designed for Agoda เว็บไซต์อย่างเป็นทางการ.

**Target Audience:** online shoppers and consumers

**Product Surface:** e-commerce storefront

This design system prioritizes accessibility, consistency, and implementation efficiency. All components follow WCAG 2.2 AA standards with keyboard-first interactions and clear focus indicators.

## Colors

The color palette is organized into semantic categories for consistent application across the interface.

**Text Colors:**
- **text.primary** (`#252c38`): Primary text and headlines
- **text.secondary** (`#5392f9`): Secondary text and captions
- **text.inverse** (`#5e6b82`): Semantic color token

**Surface Colors:**
- **surface.base** (`#000000`): Base background surface
- **surface.muted** (`#ffffff`): Semantic color token
- **surface.raised** (`#2067da`): Elevated surface elements
- **surface.strong** (`#e5efff`): Semantic color token

## Typography

**Primary Font:** thonburi

The typography scale provides a consistent hierarchy for all text elements.

- **xs** (`13px`): Weight 400, Line height 1.5
- **sm** (`13.47px`): Weight 400, Line height 1.5
- **md** (`14px`): Weight 400, Line height 1.5
- **lg** (`16px`): Weight 400, Line height 1.5
- **xl** (`20px`): Weight 400, Line height 1.5
- **2xl** (`24px`): Weight 400, Line height 1.5


## Layout

The layout system uses a consistent spacing scale for margins, padding, and gaps.

**Spacing Scale:**
- **1:** 1px
- **2:** 2px
- **3:** 4px
- **4:** 5px
- **5:** 6px
- **6:** 8px
- **7:** 10.67px
- **8:** 10.81px
- **9:** 12px
- **10:** 16px
- **11:** 24px

**Grid System:** Use a responsive grid with consistent gutters and margins. Mobile layouts should stack vertically with appropriate spacing.

## Elevation & Depth

Depth is conveyed through a layered shadow system:

- **Level 1:** `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(4, 7, 10, 0.24) 0px 2px 7px 0px` - Subtle elevation for cards and containers


## Shapes

All interactive elements use consistent corner radii:

- **xs:** 2px - Corner radius token
- **sm:** 4px - Subtle rounding for small elements
- **md:** 24px - Standard rounding for buttons and inputs
- **lg:** 999px - Larger rounding for cards


## Components

**Detected Components:** buttons (98), links (84), inputs (4), lists (3), navigation (2)

### Component Guidelines

**Buttons:**
- Use primary style for main actions
- Secondary style for alternative actions
- Maintain minimum 44×44px touch target
- Include default, hover, focus-visible, active, disabled, loading, and error states

**Inputs:**
- Clear focus indicators required
- Label positioning must be consistent
- Error states with descriptive messages
- Support for keyboard navigation

**Cards:**
- Consistent padding and spacing
- Optional elevation for hierarchy
- Responsive behavior for different viewports

All components must define:
- Default, hover, focus-visible, active, disabled, loading, and error states
- Keyboard interaction patterns
- Touch target sizes (minimum 44×44px)
- Responsive behavior
- Accessibility requirements

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required
- Focus-visible rules required
- Contrast constraints required (4.5:1 for normal text, 3:1 for large text)
- Touch targets minimum 44×44px
- Screen reader compatibility with proper ARIA labels

## Writing Tone
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values, in component guidance
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error
- Component behavior should specify responsive and edge-case handling
- Interactive components must document keyboard, pointer, and touch behavior
- Accessibility acceptance criteria must be testable in implementation
- Maintain WCAG AA contrast ratios
- Provide clear focus indicators for all interactive elements

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators
- Do not introduce one-off spacing or typography exceptions
- Do not use ambiguous labels or non-descriptive actions
- Do not ship component guidance without explicit state rules
- Do not mix different corner radius values in the same component
- Do not create touch targets smaller than 44×44px
- Do not use color alone to convey information

## Guideline Authoring Workflow
1. Restate design intent in one sentence
2. Define foundations and semantic tokens
3. Define component anatomy, variants, interactions, and state behavior
4. Add accessibility acceptance criteria with pass/fail checks
5. Add anti-patterns, migration notes, and edge-case handling
6. End with a QA checklist

## Required Output Structure
- Context and goals
- Design tokens and foundations (YAML front matter + descriptions)
- Component-level rules (anatomy, variants, states, responsive behavior)
- Accessibility requirements and testable acceptance criteria
- Content and tone standards with examples
- Anti-patterns and prohibited implementations
- QA checklist

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior
- Include spacing and typography token requirements
- Include long-content, overflow, and empty-state handling
- Include known page component density: buttons (98), links (84), inputs (4), lists (3), navigation (2)


## Quality Gates
- Every non-negotiable rule must use "must"
- Every recommendation should use "should"
- Every accessibility rule must be testable in implementation
- Teams should prefer system consistency over local visual exceptions

---

**Extraction Metadata:**
- Source: https://www.agoda.com/th-th/?cid=1720055&ds=s9sK5Nnjjb30AIGa
- Extracted: 2026-09-21T03:18:48.261Z
- Elements sampled: 280 of 1830
