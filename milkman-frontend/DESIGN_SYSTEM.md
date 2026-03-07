# 🎨 Milkman App - Modern Design System

## Color Palette

### Primary Colors
- **Primary Orange**: `#FF6B35` - Main CTA, buttons, accents
- **Primary Orange Dark**: `#E55A2B` - Hover state
- **Secondary Blue**: `#004E89` - Headers, navbar, important info
- **Secondary Blue Dark**: `#003D6B` - Darker headers

### Accent Colors
- **Success Green**: `#1DD1A1` - Success states, confirmations
- **Success Green Dark**: `#16A085` - Hover state

### Neutral Colors
- **Background Light**: `#F8F9FA` - Light backgrounds
- **Background Lighter**: `#E8EEFF` - Gradient backgrounds
- **Text Dark**: `#1a1a1a` - Primary text
- **Text Light**: `#666` - Secondary text
- **Border**: `#E0E0E0` - Borders

## Design Features

### Typography
- **Font Stack**: 'Segoe UI', Tahoma, Geneva, sans-serif
- **Headers**: Bold (700), letter-spacing -0.3px
- **Body**: Regular (400), line-height 1.6

### Spacing
- **Padding**: 40px (containers), 20px (cards), 15px (table cells)
- **Margin**: 30px (sections), 20px (elements)
- **Gap**: 30px (grid gaps)

### Border Radius
- **Large**: 20px (auth cards)
- **Medium**: 15px (data tables)
- **Small**: 10px (inputs, buttons)
- **Micro**: 8px (small buttons)

### Shadows
- **Light**: `0 4px 12px rgba(0, 0, 0, 0.08)`
- **Medium**: `0 8px 24px rgba(0, 0, 0, 0.1)`
- **Heavy**: `0 12px 30px rgba(0, 0, 0, 0.15)`

### Transitions
- All interactive elements: `all 0.3s ease`
- Hover effects: Scale, translate, shadow changes

## Page-Specific Design

### Login/Signup (Auth.css)
- Gradient background: Orange to Blue
- Centered card with elevation
- Smooth animations on load
- Focus states with accent color

### Dashboard (Dashboard.css)
- Full-width navbar with brand
- Hero section with welcome message
- Category filter buttons with active states
- Grid layout for products (responsive)
- Hover effects with elevation

### Cart (Cart.css)
- Clean data table with colored headers
- Quantity controls with inline buttons
- Total summary section
- Radio button frequency selector
- Green CTA for subscribe

### Subscriptions (Subscriptions.css)
- Professional data table
- Orange delete buttons
- Green total value section
- Hover row highlighting

## Interactive States

### Buttons
- Default: Gradient colors
- Hover: Translate up 2px, enhanced shadow
- Active: Scale to 98%
- Focus: Border/shadow highlight

### Inputs
- Idle: Light gray background, borders
- Focus: Blue border, accent shadow, white background
- Error: Red indicators (can be added)

### Tables
- Rows hover: Light background change
- Headers: Bold, uppercase text
- Striped optional effect

## Responsive Design

### Grid Breakpoints
- Product cards: Mobile-first, `minmax(280px, 1fr)`
- Containers: Max-width 1200px
- Padding: 20px on mobile, 40px on desktop

## Accessibility

- **Contrast Ratios**: AAA compliant (7:1 or greater)
- **Letter Spacing**: Improved for readability
- **Focus States**: Clearly visible
- **Color Not Alone**: Icons and labels provided
- **Font Size**: 14px+ for all text

## Implementation

All styles are centralized in:
- `src/index.css` - Global styles and CSS variables
- `src/pages/Auth.css` - Login/Signup styling
- `src/pages/Dashboard.css` - Dashboard styling
- `src/pages/Cart.css` - Cart styling
- `src/pages/Subscriptions.css` - Subscriptions styling

Use the CSS variables from `:root` for consistent theming.
