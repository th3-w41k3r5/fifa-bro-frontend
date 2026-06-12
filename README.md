# FIFA Bro Frontend

Premium FIFA World Cup 2026 companion app frontend.

## Stack

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **Icons:** Lucide React

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── (routes)/           # Page routes
├── components/
│   ├── common/             # Reusable components
│   │   ├── Badge.tsx
│   │   ├── Flag.tsx
│   │   ├── TeamLogo.tsx
│   │   ├── SectionTitle.tsx
│   │   ├── LoadingState.tsx
│   │   ├── EmptyState.tsx
│   │   └── index.ts
│   ├── layout/             # Layout components
│   │   ├── Navbar.tsx
│   │   ├── MobileNav.tsx
│   │   ├── Footer.tsx
│   │   ├── PageContainer.tsx
│   │   └── index.ts
│   └── index.ts
├── styles/
│   └── globals.css         # Global styles & CSS variables
├── lib/
│   └── utils.ts            # Utility functions
├── public/                 # Static assets
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json
```

## Design System

See [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) for comprehensive design documentation including:
- Color palette & tokens
- Typography scale
- Spacing system
- Component specifications
- Responsive breakpoints
- Accessibility guidelines

## Components

### Common Components

#### Badge
Display match classifications with Lucide icons.

**Variants:** `opening-match`, `must-watch`, `featured`, `group-of-death`, `revenge-match`

```tsx
import { Badge } from '@/components';

<Badge variant="must-watch" label="Must Watch" size="md" />
```

#### Flag
Display country flags with intelligent sizing and fallback.

```tsx
import { Flag } from '@/components';

<Flag flagCode="fr" size="md" variant="rounded" />
```

#### TeamLogo
Display team logos with flag fallback.

```tsx
import { TeamLogo } from '@/components';

<TeamLogo logoUrl="..." flagCode="br" teamName="Brazil" size="lg" />
```

#### SectionTitle
Consistent section headings with optional icon and action.

```tsx
import { SectionTitle } from '@/components';
import { Trophy } from 'lucide-react';

<SectionTitle 
  title="Upcoming Matches" 
  subtitle="Next 7 days"
  icon={<Trophy />}
/>
```

#### LoadingState
Display loading indicators in multiple variants.

```tsx
import { LoadingState } from '@/components';

<LoadingState variant="spinner" message="Loading..." />
```

#### EmptyState
Display empty states with optional action.

```tsx
import { EmptyState } from '@/components';

<EmptyState 
  title="No matches found"
  description="Try adjusting your filters"
  variant="search"
  action={{ label: 'Clear Filters', onClick: () => {} }}
/>
```

### Layout Components

#### Navbar
Desktop navigation with search and user menu.

```tsx
import { Navbar } from '@/components';

<Navbar 
  currentPage="matches"
  onSearch={(query) => {}}
  userMenu={{
    profile: 'user@example.com',
    onLogout: () => {}
  }}
/>
```

#### MobileNav
Mobile-optimized bottom navigation and drawer.

```tsx
import { MobileNav } from '@/components';

<MobileNav 
  currentPage="matches"
  onNavigate={(page) => {}}
/>
```

#### Footer
Page footer with links and social media.

```tsx
import { Footer } from '@/components';

<Footer season="2026" />
```

#### PageContainer
Main page wrapper with responsive layout.

```tsx
import { PageContainer } from '@/components';

<PageContainer
  variant="default"
  padding="md"
  header={{
    title: "Matches",
    subtitle: "FIFA World Cup 2026"
  }}
>
  {/* Page content */}
</PageContainer>
```

## Setup & Development

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Scripts

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run type-check   # Check TypeScript
```

## Styling

### Using Design Tokens

All colors, spacing, and typography are defined in Tailwind config and available as utility classes:

```tsx
// Colors
<div className="bg-primary text-text-primary border-border">
  Premium content
</div>

// Spacing (8px base unit)
<div className="p-6 gap-4 mb-8">
  Items with 24px padding, 16px gaps, 32px margin-bottom
</div>

// Typography
<h1 className="text-3xl font-bold text-text-primary">
  Page Title
</h1>
```

### Global Styles

Global styles, CSS variables, and utility classes defined in `styles/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom utilities and global styles */
```

## Responsive Design

Mobile-first approach with breakpoints:

- **Mobile:** 320px - 640px
- **Tablet:** 641px - 1024px
- **Desktop:** 1025px+

```tsx
<div className="
  grid grid-cols-1      /* Mobile: 1 column */
  md:grid-cols-2        /* Tablet: 2 columns */
  lg:grid-cols-3        /* Desktop: 3 columns */
  gap-4 md:gap-6        /* Responsive gap */
">
  {/* Grid items */}
</div>
```

## Accessibility

Components follow WCAG 2.1 Level AA standards:

- Semantic HTML structure
- ARIA labels and attributes
- Keyboard navigation support
- Focus indicators
- Color contrast ≥ 4.5:1
- Screen reader friendly

## API Integration

The frontend connects to the FIFA Bro backend API. Configure in `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://api.fifabro.com
```

## Component Development

### Adding a New Component

1. Create component file in appropriate directory (`common/` or `layout/`)
2. Export from directory index file
3. Add to main components index
4. Update DESIGN_SYSTEM.md if needed
5. Test on mobile and desktop

### Component Template

```tsx
import React from 'react';

interface MyComponentProps {
  // Props
}

export const MyComponent: React.FC<MyComponentProps> = ({ }) => {
  return (
    <div>
      {/* Component content */}
    </div>
  );
};

MyComponent.displayName = 'MyComponent';
```

## Performance

- Image optimization with Next.js Image component
- Responsive design reduces data transfer
- Tailwind CSS purges unused styles
- Component-level code splitting
- Strategic use of `memo()` for expensive components

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- iOS Safari 12+
- Android Chrome (latest)

## Contributing

1. Follow design system guidelines
2. Use TypeScript for type safety
3. Maintain responsive mobile-first design
4. Test components across breakpoints
5. Follow accessibility standards
6. Use semantic HTML structure

## Documentation

- [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) - Complete design documentation
- [API Integration](./docs/api.md) - Backend API documentation (when available)

---

**Status:** Design system and components ready for page implementation.
