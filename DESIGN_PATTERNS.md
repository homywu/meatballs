# Design Patterns & Principles

## 潮·作 | CRAFT & CHAO UI Mockup Analysis

---

## 🎨 Design Theme Overview

This mockup follows a **warm, premium, food-focused design system** that emphasizes:

- **Authenticity** through rich imagery and storytelling
- **Premium quality** through refined typography and spacing
- **Delightful interactions** through smooth animations and micro-interactions
- **Mobile-first** approach with centered, focused layouts

---

## 🎨 Color System

### Primary Palette

- **Orange-Red Gradient**: `from-orange-500 to-red-600`
  - Used for: Primary CTAs, price highlights, brand accents
  - Purpose: Creates warmth and appetite appeal
  
- **Orange Tints**: `orange-50`, `orange-100`, `orange-400`, `orange-500`, `orange-600`
  - Used for: Backgrounds, borders, hover states, tags
  - Purpose: Subtle brand reinforcement

### Neutral Palette

- **Slate Scale**: `slate-50` through `slate-900`
  - Used for: Text, backgrounds, borders, form inputs
  - Purpose: Provides clean, readable contrast

### Semantic Colors

- **Green**: `green-100`, `green-500`, `green-600`, `green-700`
  - Used for: Success states, status indicators (e.g., "接單中")
  - Purpose: Positive feedback and availability signals

- **Red**: `red-50`, `red-100`, `red-500`, `red-600`, `red-700`
  - Used for: Warnings, important notices, gradient accents
  - Purpose: Attention and urgency

### Background Colors

- **Base**: `#FDFBF7` (warm off-white)
  - Purpose: Creates a soft, paper-like foundation
  
- **Success Page**: `orange-50/50` (semi-transparent)
  - Purpose: Maintains brand warmth while providing focus

### Color Usage Principles

1. **Gradient for Emphasis**: Large numbers and CTAs use gradients for visual impact
2. **Opacity Layers**: Uses `/90`, `/50`, `/30` for depth and layering
3. **Contrast Hierarchy**: Dark text on light backgrounds, white text on dark/colored backgrounds
4. **Brand Consistency**: Orange appears consistently as the primary brand color

---

## 📐 Layout & Spacing

### Container Strategy

- **Max Width**: `max-w-md` (448px) - Mobile-optimized, centered
- **Padding**: `px-4` (16px) horizontal padding for content
- **Centering**: `mx-auto` for horizontal centering

### Spacing Scale

- **Section Spacing**: `space-y-8` (32px) between major sections
- **Card Spacing**: `gap-6` (24px) between product cards
- **Internal Padding**:
  - Cards: `p-5` (20px) or `p-6` (24px)
  - Forms: `p-6` (24px)
  - Buttons: `px-5 py-2.5` or `px-6 py-4`

### Vertical Rhythm

- **Hero Height**: `h-[420px]` - Immersive, full-viewport experience
- **Product Image**: `h-48` (192px) - Consistent card proportions
- **Bottom Padding**: `pb-32` (128px) - Accommodates sticky footer

### Layout Principles

1. **Mobile-First**: Single column, touch-friendly targets
2. **Centered Content**: All content centered within max-width container
3. **Generous Whitespace**: Ample breathing room between elements
4. **Z-Index Layering**: Clear stacking order (header: 50, hero content: 20, main: 30, footer: 50)

---

## 🔤 Typography

### Font Families

- **Sans-Serif**: Default `font-sans` for body text and UI
- **Serif**: `font-serif` for price display (adds premium feel)

### Font Weights

- **Extrabold** (`font-extrabold`): Headings, prices, important numbers
- **Bold** (`font-bold`): Labels, buttons, emphasis
- **Medium** (`font-medium`): Secondary text, descriptions
- **Regular**: Body text

### Font Sizes

- **Hero Heading**: `text-4xl` (36px) - Large, impactful
- **Section Headings**: `text-xl` (20px) or `text-2xl` (24px)
- **Product Names**: `text-lg` (18px)
- **Body Text**: `text-sm` (14px) or `text-base` (16px)
- **Labels**: `text-xs` (12px) with uppercase tracking
- **Price Display**: `text-5xl` (48px) for success page, `text-xl` (20px) for products

### Typography Principles

1. **Clear Hierarchy**: Size and weight create distinct levels
2. **Readability**: Sufficient contrast, appropriate line heights
3. **Brand Voice**: Bold, confident typography reflects premium quality
4. **Price Emphasis**: Large, gradient text for prices creates visual impact

---

## 🧩 Component Patterns

### Cards

**Pattern**: White background, rounded corners, subtle shadows, hover elevation

```tsx
className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100"
```

**Characteristics**:

- **Border Radius**: `rounded-3xl` (24px) - Very rounded, friendly
- **Shadow**: `shadow-sm` default, `shadow-xl` on hover
- **Border**: `border-slate-100` - Subtle definition
- **Hover Effect**: Shadow elevation + image scale

### Buttons

#### Primary CTA

```tsx
className="bg-gradient-to-r from-orange-500 to-red-600 hover:scale-105 active:scale-95"
```

- Gradient background
- Scale on hover/active
- Bold text, rounded-full

#### Secondary Action

```tsx
className="bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-full"
```

- Light background, darker on hover
- Rounded-full shape
- Icon + text combination

#### Quantity Controls

```tsx
className="bg-slate-900 rounded-full p-1"
```

- Dark container with light/dark button contrast
- Circular buttons
- Clear visual hierarchy

### Form Inputs

**Pattern**: Soft backgrounds, clear focus states, rounded corners

```tsx
className="bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white"
```

**Characteristics**:

- **Background**: `slate-50` default, `white` on focus
- **Border**: `slate-200` default, `orange-500` ring on focus
- **Radius**: `rounded-xl` (12px)
- **Labels**: Uppercase, small, bold, with tracking

### Toggle/Segmented Control

**Pattern**: Background container with active state highlighting

```tsx
className="bg-slate-100 p-1.5 rounded-2xl"
// Active: bg-white text-slate-900 shadow-md ring-1 ring-black/5
```

**Characteristics**:

- Container with padding creates "pill" effect
- Active state: white background with shadow
- Smooth transitions between states

### Badges/Tags

**Pattern**: Rounded-full, colored backgrounds, small text

```tsx
className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100"
```

**Characteristics**:

- **Shape**: `rounded-full` for pill shape
- **Size**: Small padding, `text-xs`
- **Colors**: Match semantic meaning (orange for tags, green for status)

### Hero Section

**Pattern**: Full-bleed image with gradient overlay and curved divider

**Characteristics**:

- **Height**: Fixed `h-[420px]` for consistency
- **Overlay**: Gradient from `black/70` → `black/10` → `black/80`
- **Divider**: SVG curved wave for organic transition
- **Content**: Absolute positioned at bottom with z-index layering

### Sticky Footer

**Pattern**: Fixed bottom, dark background, rounded pill shape

```tsx
className="fixed bottom-0 bg-slate-900/95 backdrop-blur-lg rounded-[2rem]"
```

**Characteristics**:

- **Position**: Fixed with safe-area-bottom consideration
- **Background**: Dark with transparency and blur
- **Shape**: `rounded-[2rem]` (32px) - Very rounded pill
- **Animation**: Slide-in from bottom

---

## ✨ Animation & Interaction Patterns

### Transitions

- **Duration**: `duration-300` (300ms) for most interactions
- **Long Animations**: `duration-700` (700ms) for image zooms, `duration-1000` (1s) for hero fade-in
- **Easing**: Default Tailwind easing (smooth, natural)

### Hover Effects

#### Scale Transform

```tsx
hover:scale-105 // Buttons
hover:scale-110 // Product images
active:scale-95 // Button press feedback
```

#### Shadow Elevation

```tsx
shadow-sm → hover:shadow-xl // Cards
shadow-lg → hover:shadow-xl // Buttons
```

#### Color Transitions

```tsx
hover:bg-orange-100 // Background color changes
hover:text-orange-600 // Text color changes
hover:border-orange-300 // Border color changes
```

### Scroll-Based Animations

- **Header Transformation**: Transparent → White with backdrop blur on scroll
- **State Changes**: Text color, background, icon fills adapt to scroll position

### Entry Animations

- **Success Page**: `animate-in fade-in zoom-in duration-300`
- **Form Section**: `animate-in slide-in-from-bottom-8 duration-700`
- **Sticky Footer**: `animate-in slide-in-from-bottom-full duration-500`

### Micro-Interactions

- **Pulse Animation**: Status indicator dot (`animate-pulse`)
- **Copy Feedback**: Icon change + text change on clipboard copy
- **Image Zoom**: Product images scale on card hover (`group-hover:scale-110`)

### Interaction Principles

1. **Immediate Feedback**: All interactive elements provide visual response
2. **Smooth Transitions**: No jarring state changes
3. **Progressive Disclosure**: Forms appear when cart has items
4. **State Persistence**: Visual state reflects user actions clearly

---

## 🖼️ Imagery & Visual Elements

### Image Strategy

- **Hero Image**: Full-bleed, high-quality food photography
- **Product Images**: `h-48` (192px), `object-cover`, centered
- **Image Overlays**: Gradient overlays for text readability
- **Hover Effects**: Scale transform on product images

### Image Treatment

```tsx
className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
```

### Visual Hierarchy

- **Layered Overlays**: Multiple z-index layers for depth
- **Gradient Overlays**: Dark gradients ensure text readability
- **Backdrop Blur**: `backdrop-blur-md` for modern glass-morphism effect

### Decorative Elements

- **Curved SVG Divider**: Organic wave shape separating hero from content
- **Gradient Text**: `bg-clip-text` for price display
- **Rounded Shapes**: Consistent use of rounded corners throughout

---

## 🎯 State Management Patterns

### Visual States

#### Disabled State

```tsx
disabled={!formData.name || !formData.phone}
className="bg-slate-700 text-slate-400 cursor-not-allowed"
```

#### Active/Selected State

- Toggle buttons: White background with shadow
- Cart items: Dark container with quantity controls
- Form inputs: Orange ring on focus

#### Success State

- Green checkmark icon
- Success message with confirmation
- Clear next steps

### Conditional Rendering

- **Cart Visibility**: Footer and form only show when `totalQty > 0`
- **Delivery Address**: Only shows when `deliveryType === 'delivery'`
- **Quantity Controls**: Different UI for `cart[product.id] > 0` vs. empty

### State Feedback Principles

1. **Clear Visual Distinction**: Each state is visually distinct
2. **Progressive Enhancement**: Features appear as user progresses
3. **Error Prevention**: Disabled states prevent invalid submissions
4. **Success Confirmation**: Clear success state with actionable next steps

---

## 📱 Responsive & Mobile Patterns

### Mobile-First Approach

- **Single Column**: All content in vertical stack
- **Touch Targets**: Minimum 44px height for buttons
- **Safe Areas**: `safe-area-bottom` for notched devices
- **Fixed Positioning**: Header and footer use fixed positioning

### Scroll Behavior

- **Header Adaptation**: Changes appearance based on scroll position
- **Smooth Scrolling**: `window.scrollTo(0, 0)` on navigation
- **Z-Index Management**: Proper layering prevents overlap issues

### Mobile Optimizations

- **Centered Layout**: `max-w-md mx-auto` ensures comfortable reading width
- **Generous Padding**: Prevents edge-to-edge content
- **Large Text**: Readable font sizes for mobile screens
- **Thumb-Friendly**: Bottom-aligned CTAs for easy thumb access

---

## 🎭 Design Principles Summary

### 1. **Warmth & Authenticity**

- Warm color palette (oranges, reds)
- Rich food imagery
- Personal brand voice ("潮·作 | CRAFT & CHAO")

### 2. **Premium Quality**

- Refined typography (serif for prices)
- Generous spacing
- High-quality imagery
- Subtle shadows and depth

### 3. **Delightful Interactions**

- Smooth animations
- Hover effects
- Micro-interactions
- Visual feedback

### 4. **Clarity & Focus**

- Clear visual hierarchy
- Progressive disclosure
- Centered, focused layout
- Minimal distractions

### 5. **Mobile Excellence**

- Touch-friendly targets
- Single-column layout
- Fixed navigation elements
- Optimized for small screens

### 6. **Brand Consistency**

- Orange as primary brand color
- Consistent rounded corners
- Unified spacing system
- Cohesive component styles

---

## 🔧 Implementation Notes

### Tailwind CSS Classes

- Heavy use of Tailwind utility classes
- Custom colors: `bg-[#FDFBF7]` for base background
- Custom border radius: `rounded-[2rem]` for specific values
- Opacity modifiers: `/90`, `/50`, `/30` for transparency

### Icon System

- **Lucide React**: Consistent icon library
- **Icon Sizes**: `size={14}`, `size={18}`, `size={20}` for hierarchy
- **Icon Colors**: Match text/background context
- **Filled Icons**: `fill-` classes for emphasis (Flame, Star)

### Accessibility Considerations

- Semantic HTML structure
- Clear labels for form inputs
- Disabled states prevent errors
- Visual feedback for all actions
- Sufficient color contrast

---

## 📋 Component Checklist

When creating new components following this design system:

- [ ] Use warm color palette (orange/red gradients)
- [ ] Apply generous rounded corners (`rounded-xl` or `rounded-3xl`)
- [ ] Include hover states with smooth transitions
- [ ] Use appropriate shadows for depth
- [ ] Maintain consistent spacing scale
- [ ] Ensure mobile-friendly touch targets
- [ ] Add visual feedback for interactions
- [ ] Use semantic colors for states
- [ ] Apply backdrop blur for modern effects
- [ ] Include proper z-index layering

---

*This design system creates a cohesive, premium, and delightful user experience that reflects the quality and warmth of the brand.*
