# Fiona — Codebase Documentation

> **Purpose:** This document gives every developer on the team a complete mental model of the project — where things live, what they do, how they connect, and where to make changes.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Directory Structure](#3-directory-structure)
4. [Routing](#4-routing)
5. [Global State — AppContext](#5-global-state--appcontext)
6. [TypeScript Interfaces & Data Models](#6-typescript-interfaces--data-models)
7. [Components](#7-components)
8. [Pages](#8-pages)
9. [Data Layer](#9-data-layer)
10. [Styling System](#10-styling-system)
11. [Known Stubs & Incomplete Pages](#11-known-stubs--incomplete-pages)
12. [Developer Conventions](#12-developer-conventions)
13. [Where to Make Changes](#13-where-to-make-changes)

---

## 1. Project Overview

**Fiona** is a plant e-commerce storefront. Users can:
- Browse and filter a catalog of indoor plants
- Add products to a shopping cart
- Log in / register (backed by **Supabase Auth**)
- View their profile and order history
- Read plant care guides (backed by **Supabase Database**)

The project is a **Vite + React + TypeScript** SPA (Single Page Application) using **TailwindCSS** for styling and **React Router v7** for client-side routing.

---

## 2. Tech Stack

| Technology | Version | Role |
|---|---|---|
| React | ^18.3.1 | UI framework |
| TypeScript | ^5.5.3 | Type safety |
| Vite | ^5.4.2 | Build tool & dev server |
| React Router DOM | ^7.17.0 | Client-side routing |
| TailwindCSS | ^3.4.1 | Utility-first CSS |
| Lucide React | ^0.344.0 | Icon library |
| @supabase/supabase-js | ^2.57.4 | Backend (Auth & Database) |

**Dev server:** `npm run dev`
**Type check:** `npm run typecheck`
**Lint:** `npm run lint`

---

## 3. Directory Structure

```
Plat_E_commerce_Site/
├── public/                   # Static assets (images, logo)
│   └── image.png             # Fiona brand logo used in Navbar & Footer
├── src/
│   ├── main.tsx              # React app entry point
│   ├── App.tsx               # Root component — router setup
│   ├── index.css             # Global styles, custom utilities, animations
│   ├── vite-env.d.ts         # Vite environment type declarations
│   │
│   ├── lib/                  # External service clients
│   │   └── supabase.ts       # Supabase client initialization
│   │
│   ├── context/
│   │   └── AppContext.tsx    # Global state: cart + user session (syncs with Supabase)
│   │
│   ├── components/           # Reusable UI components
│   │   ├── Layout.tsx        # Page shell (Navbar + Outlet + Footer)
│   │   ├── Navbar.tsx        # Sticky top navigation bar
│   │   ├── Footer.tsx        # Site-wide footer
│   │   ├── ProductCard.tsx   # Product tile used in shop grid
│   │   └── StarRating.tsx    # Star rating display (filled/partial/empty)
│   │
│   ├── pages/                # One file per route
│   │   ├── HomePage.tsx          # / — Landing page
│   │   ├── ShopPage.tsx          # /shop — Product catalog + filters
│   │   ├── ProductDetailPage.tsx # /product/:id — Stub (Under Construction)
│   │   ├── CartPage.tsx          # /cart — Cart review + order summary
│   │   ├── CheckoutPage.tsx      # /checkout — Order confirmation screen
│   │   ├── AuthPage.tsx          # /auth — Login / Register
│   │   ├── ProfilePage.tsx       # /profile — User info + order history
│   │   ├── CareGuidePage.tsx     # /care-guide — Plant care articles
│   │   └── UnderConstruction.tsx # Reusable "coming soon" placeholder
│   │
│   └── data/                 # Static data files (replaces a real API for now)
│       ├── products.ts       # Array of all 10 Product objects
│       ├── mockUsers.ts      # Array of 3 mock users + findUser() helper
│       └── careGuide.ts      # Care tips content + plant guide articles
│
├── .env                      # Real Supabase credentials (gitignored)
├── .env.example              # Safe template for env vars
├── tailwind.config.js        # Tailwind theme — colors, shadows, fonts
├── tsconfig.app.json         # TypeScript config for the app source
├── tsconfig.json             # Root TS config (references app + node)
├── tsconfig.node.json        # TypeScript config for Vite config file
├── vite.config.ts            # Vite build configuration
├── postcss.config.js         # PostCSS (used by Tailwind)
├── eslint.config.js          # ESLint rules
└── package.json              # Dependencies and npm scripts
```

---

## 4. Routing

All routes are defined in `src/App.tsx`. The app uses a **nested route layout pattern** — all routes share a single `<Layout>` parent which wraps every page in the Navbar and Footer.

```
AppProvider                   <- Global state wrapper
  └── BrowserRouter
        └── Routes
              └── Route (element=<Layout />)   <- Shared shell
                    ├── /                      -> HomePage
                    ├── /shop                  -> ShopPage
                    ├── /care-guide            -> CareGuidePage
                    ├── /auth                  -> AuthPage
                    ├── /cart                  -> CartPage
                    ├── /product/:id           -> ProductDetailPage (stub)
                    ├── /profile               -> ProfilePage
                    └── /checkout              -> CheckoutPage
```

**To add a new route:**
1. Create `src/pages/YourPage.tsx`
2. Import it in `src/App.tsx`
3. Add `<Route path="/your-path" element={<YourPage />} />` inside the existing `<Route element={<Layout />}>` block

---

## 5. Global State — AppContext

**File:** `src/context/AppContext.tsx`

This is the **single source of truth** for app-wide state. It is provided at the root of the tree (`AppProvider` wraps the whole app in `App.tsx`) so any component can access it.

### Consuming the context

```tsx
import { useApp } from '../context/AppContext';

function MyComponent() {
  const { cartItems, addToCart, userSession } = useApp();
}
```

> **Note:** `useApp()` will throw if called outside of `AppProvider`. This is intentional — it catches wiring mistakes early.

### What the context provides

| Property / Method | Type | Description |
|---|---|---|
| `cartItems` | `CartItem[]` | All items currently in the cart |
| `addToCart(product)` | `(Product) => void` | Adds a product; increments quantity if already in cart |
| `removeFromCart(id)` | `(number) => void` | Removes a product by its id |
| `updateQuantity(id, delta)` | `(number, number) => void` | Increases or decreases quantity; removes item if drops to 0 |
| `cartCount` | `number` | Derived total number of individual items (sum of all quantities) |
| `userSession` | `UserSession \| null` | The logged-in user, or `null` if not signed in |
| `setUserSession` | `(UserSession \| null) => void` | Set after login / clear on sign-out |

### State persistence

Cart state is **in-memory only** (React `useState`) and resets on refresh.
User session state is **persistent**, automatically syncing with Supabase Auth via `supabase.auth.onAuthStateChange`. It populates profile details (name, etc.) directly from `user_metadata` in Supabase.

---

## 6. TypeScript Interfaces & Data Models

All core interfaces are exported from `src/context/AppContext.tsx` and `src/data/mockUsers.ts`.

### `Product`

Defined in `AppContext.tsx`. Every plant in the store is a `Product`.

```ts
interface Product {
  id: number;              // Unique numeric ID
  name: string;            // Display name, e.g. "Monstera Deliciosa"
  price: number;           // Price in INR (Indian Rupees)
  image: string;           // Path to image in /public, or a full URL
  category: string;        // e.g. "Tropical", "Succulent", "Hanging"
  light: 'Low Light' | 'Bright Indirect' | 'Full Sun';
  size: 'Small' | 'Medium' | 'Large';
  rating: number;          // 0-5, supports .5 increments
  reviewCount: number;     // Number of reviews shown alongside rating
  description: string;     // Short product description
  tag?: string;            // Optional badge: "Best Seller", "New Arrival", "Premium"
}
```

### `CartItem`

Extends `Product` with a quantity field.

```ts
interface CartItem extends Product {
  quantity: number;
}
```

### `UserSession`

The shape of the currently logged-in user stored in context. Populated from `MockUser` after login.

```ts
interface UserSession {
  name: string;          // Full display name (firstName + lastName)
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  joined: string;        // e.g. "March 2024"
  orders: Order[];       // Past orders (see Order below)
}
```

### `MockUser` (in `mockUsers.ts`)

Same shape as `UserSession`, plus a `password` field. Never expose this in the UI.

### `Order` (in `mockUsers.ts`)

```ts
interface Order {
  id: string;                        // e.g. "FNA-2041"
  date: string;                      // e.g. "Jul 12, 2026"
  status: 'Delivered' | 'Shipped' | 'Processing';
  total: number;
  items: {
    name: string;
    image: string;
    quantity: number;
    price: number;
  }[];
}
```

### `CareBasic` (in `careGuide.ts`)

```ts
interface CareBasic {
  icon: LucideIcon;   // A Lucide icon component
  title: string;
  tips: string[];
}
```

---

## 7. Components

All reusable components live in `src/components/`.

---

### `Layout.tsx`

**Route:** Wraps all pages via React Router's nested routing

The page shell. Renders `<Navbar />`, then `<Outlet />` (where the current page renders), then `<Footer />`. Also scrolls to the top on every route change via a `useEffect`.

```
<div (min-h-screen flex-col bg-[#f8f9fa])>
  <Navbar />
  <main class="page-enter">   <- fade-in animation on route change
    <Outlet />                <- active page renders here
  </main>
  <Footer />
</div>
```

**When to edit:** If you need to add a global UI element visible on every page (e.g. a toast container, a cookie banner), add it here.

---

### `Navbar.tsx`

**Uses context:** `cartCount`, `userSession`

Sticky top navigation bar with glassmorphism effect. Contains:
- Logo (links to `/`)
- Desktop nav links (Shop, About, Reviews, Care Guide)
- Cart icon with live badge showing `cartCount`
- User icon — links to `/auth` when not logged in, `/profile` when logged in
- Mobile hamburger menu that collapses nav links

**Nav links array** (edit this to add/remove top nav items):
```ts
const navLinks = [
  { label: 'Shop', to: '/shop' },
  { label: 'About', to: '/#story' },
  { label: 'Reviews', to: '/#reviews' },
  { label: 'Care Guide', to: '/care-guide' },
];
```

**When to edit:** Add a nav link, change the logo, update cart badge behavior, or change mobile menu behavior.

---

### `Footer.tsx`

Four-column footer with brand info, shop links, help links, and a contact section with newsletter subscribe input (subscribe button is currently UI-only, not wired to any action).

**When to edit:** Update contact details, add/remove footer links, wire up the newsletter form.

---

### `ProductCard.tsx`

**Props:** `{ product: Product }`
**Uses context:** `addToCart`

A single product tile used in the shop grid. Features:
- Image with lazy loading and hover zoom effect
- Optional tag badge (e.g. "Best Seller")
- Size badge (top-right overlay)
- Category label, product name, truncated description
- `StarRating` component
- "Add to Cart" button with a 1.4s confirmation flash state

**When to edit:** Update the product card layout, add a wishlist button, change the "added" animation duration.

---

### `StarRating.tsx`

**Props:** `{ rating: number; reviewCount?: number; size?: number }`

Renders 5 stars. Supports full, partial (half-star at rating >= star - 0.5), and empty states. `size` defaults to `14` (pixels).

```tsx
<StarRating rating={4.8} reviewCount={142} />
<StarRating rating={3.5} size={18} />   // larger stars, no count
```

**When to edit:** Only if you want to support interactive (clickable) ratings or change the color scheme.

---

## 8. Pages

All pages are in `src/pages/`. Each file exports a single default component.

---

### `HomePage.tsx` — `/`

The landing page. A long-form marketing page with multiple sections. This is the largest file (~18 KB). Sections include:
- Hero section with CTA
- Featured products marquee / showcase
- Brand story (`id="story"` — linked from Navbar "About")
- Customer reviews (`id="reviews"` — linked from Navbar "Reviews")
- Category browse section

**When to edit:** Marketing copy, hero image, featured product selection, review content.

---

### `ShopPage.tsx` — `/shop`

**Uses data:** `products` array from `src/data/products.ts`
**Uses component:** `ProductCard`

Full product catalog with:
- Sidebar filter panel (light needs, plant size, price range, search)
- URL search param integration (`?search=monstera` syncs with the search box)
- `useMemo` for filtered product list — recalculates only when filters change
- Active filter count badge on mobile filter button
- Empty state with "Clear Filters" CTA

**Filter types:**

| Filter | State var | Options |
|---|---|---|
| Light | `lightFilter` | All, Low Light, Bright Indirect |
| Size | `sizeFilter` | All, Small, Medium, Large |
| Price | `priceRangeIdx` | 5 pre-set ranges defined in `priceRanges[]` |
| Search | `searchInput` / URL param | Free text, matches name and category |

**When to edit:** Add a new filter type (e.g. category), change price ranges, modify search behavior, change grid column count.

---

### `CartPage.tsx` — `/cart`

**Uses context:** `cartItems`, `removeFromCart`, `updateQuantity`

Displays all cart items with quantity controls and a sticky order summary sidebar. Pricing logic:
- **Shipping:** Free if subtotal >= 60, otherwise 8.95
- **Tax:** 8% of subtotal
- **Total:** subtotal + shipping + tax

Shows a free-shipping progress bar when subtotal < 60.
The promo code input is UI-only (not wired to any discount logic).

**When to edit:** Add promo code logic, change the tax rate or shipping threshold, add a save-for-later feature.

---

### `CheckoutPage.tsx` — `/checkout`

**Uses context:** `cartItems`, `removeFromCart`

Currently acts as an **order confirmation page**, not a real checkout form. When this page mounts, it clears the cart via `useEffect`. It shows the order summary and two CTAs (Continue Shopping, View Orders).

> **Important:** This page reads `cartItems` and then immediately clears them in `useEffect`. The order summary render relies on the items being available in the first render tick before the effect runs.

**When to edit:** Replace with a real multi-step checkout form (shipping address, payment). The clearing logic will need to be moved to a post-payment callback.

---

### `AuthPage.tsx` — `/auth`

**Uses context:** `setUserSession`
**Uses service:** `supabase.auth`

Handles both **Login** and **Register** in a single component, toggled by `mode: 'login' | 'register'` state.

**Login flow:**
1. Calls `supabase.auth.signInWithPassword(email, password)`
2. On success, `AppContext` automatically detects the session change and redirects user
3. Error messages (e.g. invalid credentials) are shown inline

**Register flow:**
1. Calls `supabase.auth.signUp(email, password)` and injects `full_name` into `user_metadata`
2. Automatically logs the user in upon success

**Form validation:**
- Name: required (register only)
- Email: simple regex match
- Password: minimum 6 characters (enforced by Supabase)

**When to edit:** Add password strength validation, add "Forgot Password" flow, wire up the social login buttons.

---

### `ProfilePage.tsx` — `/profile`

**Uses context:** `userSession`, `setUserSession`

Two-panel layout:
- **Left:** Profile details (name, email, phone, address) via `DetailRow` helper component defined at the bottom of the same file
- **Right:** Order history with status badges color-coded per status

If no user is logged in, shows a prompt to sign in.

Sign out calls `setUserSession(null)` and navigates to `/`.

**When to edit:** Add an edit-profile form, add address management, connect order status to a real order tracking API.

---

### `CareGuidePage.tsx` — `/care-guide`

**Uses service:** `supabase.from('care_guides')`
**Uses component:** local helper components to render content

A dynamic content page fetching from Supabase:
- Contains a loading spinner state while fetching
- Groups fetched guides by `section` (e.g. Basics, Light, Water)
- Renders expandable/collapsible details

**When to edit:** Modify UI layout. To add new plant guides, just insert a new row in the Supabase `care_guides` table.

---

### `ProductDetailPage.tsx` — `/product/:id`

Currently renders `<UnderConstruction />`. This page is **not yet built**.

**When to build:** Fetch the product from the `products` array by `id` param, display full product info, care tips, reviews, related products. Use `useParams()` to get the `:id`.

---

### `UnderConstruction.tsx` — (shared placeholder)

**Props:** `{ title: string; description: string }`

Reusable "coming soon" screen with an animated Sprout icon and a fake progress bar. Used currently by `ProductDetailPage`. Use it for any new page that's been routed but not yet built.

---

## 9. Data Layer

Products and Orders are still driven by static TypeScript files. Authentication and Care Guides have been migrated to the **Supabase backend**.

---

### `products.ts`

Exports: `products: Product[]`

An array of 10 `Product` objects. Images are either local files in `/public` or Unsplash URLs.

**To add a new product:**
1. Add an image to the `/public` folder
2. Append a new object to the `products` array following the `Product` interface
3. Give it the next sequential `id`

---

### `mockUsers.ts`

Exports: `mockUsers: MockUser[]`, `findUser(email, password): MockUser | null`

Three hardcoded test accounts:

| Email | Password | Name |
|---|---|---|
| `Example@gmail.com` | `12345` | Jake Amy |
| `admin@gmail.com` | `admin@123` | Sam Rivera |
| `Customer@gmail.com` | `Pass123` | Maya Chen |

> **Security Warning:** Passwords are stored in plain text. This is only acceptable for mock/demo data. When connecting a real backend, never store plain-text passwords.

`findUser` does a case-insensitive email match and an exact password match.

**When to edit:** Add a test user, or replace entirely when connecting to Supabase Auth.

---

### `careGuide.ts`

Exports: `careBasics: CareBasic[]`, plus plant-specific guide data consumed by `CareGuidePage`.

`careBasics` contains 4 care category objects (Watering, Light, Humidity & Temperature, Fertilizing), each with an icon and a list of tips.

**To add a new plant care article:** Edit this file and append to the plant guide array that `CareGuidePage` consumes.

---

## 10. Styling System

The project uses **TailwindCSS** with a custom `forest` color palette and custom box shadows.

### Custom Color Palette (`tailwind.config.js`)

The brand color scale is named `forest`:

| Token | Hex | Typical Use |
|---|---|---|
| `forest-50` | `#ecfdf5` | Very light backgrounds |
| `forest-100` | `#d8f3dc` | Hover backgrounds, badges |
| `forest-200` | `#b7e4c7` | Borders, light accents |
| `forest-300` | `#95d5b2` | Scrollbar thumb |
| `forest-400` | `#74c69d` | Secondary icons |
| `forest-500` | `#52b788` | Cart badge, primary accents |
| `forest-600` | `#40916c` | Links, icons |
| `forest-700` | `#2d6a4f` | Text, borders |
| `forest-800` | `#1b4332` | Primary buttons, headings |
| `forest-900` | `#081c15` | Darkest accent |

### Custom Shadows

```js
shadow-card       // Soft green tint — cards at rest
shadow-card-hover // Stronger green tint — cards on hover
```

### Global CSS (`src/index.css`)

| Class / Rule | Description |
|---|---|
| `.glassmorphic` | Frosted-glass effect used on the Navbar |
| `.page-enter` | Fade-up animation applied to `<main>` in Layout on every route change |
| `.line-clamp-2` | Truncate text to 2 lines (used on product description in ProductCard) |
| `::-webkit-scrollbar` rules | Custom thin green scrollbar styling |

### Typography

The project uses **Inter** (from Google Fonts) as the primary sans-serif font, loaded in `index.css`. The Tailwind config explicitly sets `Inter` as the default `sans` font family.

---

## 11. Known Stubs & Incomplete Features

| Feature | Status | Notes |
|---|---|---|
| `/product/:id` detail page | Stub | Renders UnderConstruction; needs full build |
| Checkout form | Partial | Shows confirmation only; no real payment or address form |
| Newsletter signup (Footer) | UI only | Input and button render but do nothing |
| Social login (Google/Apple) | UI only | Buttons render but do nothing |
| Promo code (Cart) | UI only | Input and Apply button render but do nothing |
| Supabase integration | Partially Done | Auth and Care Guides connected, missing Products/Orders |

---

## 12. Developer Conventions

### File naming
- **Pages:** `PascalCase` + `Page.tsx` suffix (e.g. `ShopPage.tsx`)
- **Components:** `PascalCase.tsx` (e.g. `ProductCard.tsx`)
- **Data files:** `camelCase.ts` (e.g. `products.ts`)

### Component structure
- One default export per file (the component)
- Small private helper components (like `DetailRow` in `ProfilePage.tsx`) may live in the same file if they are only used there
- Prefer named props interfaces over inline types for non-trivial components

### Context consumption
- Always use the `useApp()` hook — never import `AppContext` directly
- Only read from context; never mutate data outside the provided action functions

### Imports order (preferred)
1. React / framework imports
2. Third-party libraries
3. Internal context / hooks
4. Internal components
5. Data imports
6. Types

### Styling
- Use Tailwind utility classes exclusively — avoid inline `style={{}}` except for truly dynamic values (e.g. percentage widths for progress bars)
- Use the `forest-*` palette for all brand colours — do not use raw hex values in JSX
- Use `shadow-card` and `shadow-card-hover` for card components

---

## 13. Where to Make Changes

Use this as a quick lookup for common tasks:

| Task | File(s) to edit |
|---|---|
| Add a new product | `src/data/products.ts` |
| Add a new plant care article | `src/data/careGuide.ts` |
| Add a test user account | `src/data/mockUsers.ts` |
| Add a new page / route | `src/pages/NewPage.tsx` + `src/App.tsx` |
| Add a top nav link | `src/components/Navbar.tsx` — `navLinks` array |
| Add a footer link | `src/components/Footer.tsx` |
| Change brand colors | `tailwind.config.js` — `forest` color palette |
| Add a global animation or utility CSS class | `src/index.css` |
| Add global state (e.g. wishlist) | `src/context/AppContext.tsx` |
| Change cart pricing logic (shipping/tax) | `src/pages/CartPage.tsx` |
| Fix auth / login behavior | `src/pages/AuthPage.tsx` + `src/data/mockUsers.ts` |
| Build out the product detail page | `src/pages/ProductDetailPage.tsx` |
| Connect Supabase backend | Done for Auth & Care Guides — update Products/Orders next |
| Change the page-load animation | `src/index.css` — `.page-enter` / `@keyframes fadeInUp` |
| Change scroll-to-top behavior | `src/components/Layout.tsx` — `useEffect` |
