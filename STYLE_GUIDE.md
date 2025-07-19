# ASR Evaluation App - Style Guide

This document outlines the design system and styling decisions for the ASR Evaluation application to ensure consistency across all pages and future development.

## Layout Structure

### Main Container
- Use `min-h-screen p-6` for all main page containers
- Avoid centered/justified layouts in favor of top-aligned content
- Use standard padding instead of large spacing (e.g., `p-6` instead of `p-24`)

### Content Width
- Standard content: `max-w-4xl mx-auto`
- Wide content (like sample previews): `max-w-6xl mx-auto`
- Forms: `max-w-md mx-auto`

## Top Section Layout

### Structure
All pages should follow this consistent top section pattern:

```jsx
{/* Top section with consistent layout */}
<div className="w-full max-w-4xl mx-auto mb-8">
    <div className="flex items-center justify-between mb-6">
        {/* Back button on left */}
        <Link/button className="text-sm text-gray-600 hover:text-gray-800 hover:underline">
            ← Back to [Context]
        </Link>
        
        {/* Centered title */}
        <h1 className="text-2xl font-semibold text-black">[Page Title]</h1>
        
        {/* Empty right space for consistency */}
        <div className="w-20"></div>
    </div>
</div>
```

### Back Button
- **Position**: Always top-left
- **Styling**: `text-sm text-gray-600 hover:text-gray-800 hover:underline`
- **Text**: Use arrow `←` followed by contextual text (e.g., "← Back to Projects")
- **Implementation**: Use `Link` for navigation or `button` with `onClick` for client components

### Page Title
- **Position**: Centered using flexbox
- **Styling**: `text-2xl font-semibold text-black`
- **Color**: Always black (`text-black`), never colored
- **Size**: Consistent `text-2xl` across all pages

### Right Space
- Use empty `<div className="w-20"></div>` to maintain centering balance

## Typography

### Hierarchy
- **Main titles**: `text-2xl font-semibold text-black`
- **Section headings**: `text-xl font-medium text-black`
- **Subsection headings**: `font-medium text-black`
- **Body text**: Default Tailwind text styling
- **Secondary text**: `text-gray-600` or `text-gray-500`

### Color Rules
- **All headings and titles**: Use `text-black` only
- **No colored headings**: Avoid `text-blue-600`, `text-purple-600`, etc.
- **Hierarchy through weight**: Use `font-semibold`, `font-medium`, `font-normal` for differentiation
- **Secondary information**: Use gray variants (`text-gray-600`, `text-gray-500`)

## Spacing

### Margins
- **Top section bottom margin**: `mb-8`
- **Title bottom margin**: `mb-6`
- **Section spacing**: `mb-4` for standard sections
- **Content spacing**: `space-y-4` for lists/grids

### Padding
- **Page container**: `p-6`
- **Card/section padding**: `p-4` or `p-6` depending on content
- **Form elements**: Standard Tailwind padding (`px-3 py-2`)

## Components

### Buttons
- **Primary actions**: `bg-indigo-600 hover:bg-indigo-700` with white text
- **Secondary actions**: `bg-blue-600 hover:bg-blue-700` or `bg-yellow-600 hover:bg-yellow-700`
- **Standard button classes**: Include focus states and proper padding

### Cards/Sections
- **Border**: `border rounded-lg`
- **Background**: `bg-white` with optional `shadow-sm`
- **Padding**: `p-4` or `p-6` based on content density

### Forms
- **Labels**: `text-sm font-medium text-black`
- **Inputs**: Standard Tailwind form styling with indigo focus colors
- **Container width**: `max-w-md mx-auto` for form pages

## Navigation Patterns

### Breadcrumb-style Navigation
- Use back buttons instead of traditional breadcrumbs
- Context-aware back button text
- Consistent positioning and styling

### Page Flow
- Home → Projects → Samples → Sample Details/Edit
- Each level provides clear navigation back to parent

## Responsive Design

### Breakpoints
- Use standard Tailwind breakpoints (`md:`, `lg:`)
- **Grid layouts**: `grid-cols-1 md:grid-cols-2` for two-column layouts
- **Maintain consistency**: Ensure back button and title positioning works on all screen sizes

## Content Organization

### Section Headers
- Use consistent heading hierarchy
- Maintain black color scheme
- Include proper spacing between sections

### Lists and Grids
- **Spacing**: `space-y-4` for vertical lists
- **Gap**: `gap-8` for grid layouts
- **Item styling**: Consistent border and padding for list items

## Future Development Guidelines

### When Adding New Pages
1. Start with the standard top section layout
2. Use appropriate content width container
3. Follow typography hierarchy
4. Implement proper back navigation
5. Maintain black color scheme for headings

### When Modifying Existing Pages
1. Ensure consistency with this style guide
2. Test responsive behavior
3. Verify navigation flow
4. Check typography hierarchy

### Component Creation
- Extract reusable patterns into components
- Maintain styling consistency
- Document any deviations from this guide

## Tools and Technologies

### CSS Framework
- **Tailwind CSS**: Primary styling framework
- **Default classes**: Prefer Tailwind defaults over custom styles
- **Consistency**: Use established Tailwind patterns

### Color Palette
- **Primary**: Indigo (`indigo-600`, `indigo-700`)
- **Secondary**: Blue, Yellow for specific actions
- **Text**: Black for headings, gray variants for secondary text
- **Backgrounds**: White, gray variants for subtle backgrounds

This style guide should be referenced for all future development to maintain visual consistency and user experience quality across the ASR Evaluation application.
