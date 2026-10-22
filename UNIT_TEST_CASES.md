# Fiona — Unit Test Cases for Exception Handling

> **Purpose:** This document specifies critical test cases specifically for **exception handling, edge cases, error resilience, and graceful fallbacks** across the Fiona plant e-commerce architecture. Once reviewed and approved, these test suites will be implemented.

---

## 1. Testing Strategy & Philosophy

In an e-commerce platform like **Fiona**, client crashes, checkout freezes, or blank screens due to backend/network errors degrade user trust and conversions. 

Our testing strategy focuses on:
1. **Network & Backend Resilience:** The frontend must never crash when Supabase is sleeping, offline, rate-limited, or returns unexpected payloads.
2. **State & Mutation Integrity:** The cart state engine must resist corruption from illegal operations, negative numbers, missing IDs, or rapid clicks.
3. **Financial & Numerical Accuracy:** Pricing calculations (subtotals, tax percentages, shipping limits) must prevent floating-point inaccuracies and divide-by-zero/NaN states.
4. **Form & Security Boundary Robustness:** Authentication flows must gracefully present human-readable messages for all API errors and reject malformed inputs.
5. **Component Boundary Safety:** Components must render fallbacks rather than unmounting the entire page tree when encountering missing or partial data.

---

## 2. Architecture Vulnerability Map

```
┌────────────────────────────────────────────────────────────────────────┐
│                        USER / BROWSER INTERACTION                      │
└──────┬─────────────────────────┬───────────────────────────────┬───────┘
       │                         │                               │
       ▼                         ▼                               ▼
┌──────────────┐          ┌──────────────┐               ┌──────────────┐
│  Auth Forms  │          │ Catalog / UI │               │  Cart Engine │
│ (AuthPage)   │          │ (Shop/Guide) │               │ (AppContext) │
└──────┬───────┘          └──────┬───────┘               └──────┬───────┘
       │                         │                              │
       │ Error: 401/429          │ Error: DB Offline/Timeout    │ Error: Delta <= 0,
       │ Invalid Credentials     │ Malformed JSON               │ Non-existent ID,
       │ Network Disconnect      │ Empty arrays                 │ Float precision
       ▼                         ▼                              ▼
┌───────────────────────────────────────────────────────────────────────┐
│                    DATA LAYER & RESILIENCE HANDLERS                   │
│         - fetchProducts() fallback to fallbackProducts                │
│         - fetchGuides() fallback to plantGuides                       │
│         - Error boundaries & defensive state reducers                 │
└──────────────────────────────────┬────────────────────────────────────┘
                                   │
                                   ▼
┌───────────────────────────────────────────────────────────────────────┐
│                       EXTERNAL SUPABASE SERVICES                      │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 3. Prioritized Unit Test Cases (Exception Handling)

### Legend
- **P0 (Critical):** Core shopping loop, crashes, data corruption, authentication failures.
- **P1 (High):** Degraded network, unexpected payload shapes, missing environmental configs.
- **P2 (Medium):** Edge UI interactions, non-fatal query param parsing, display truncations.

---

### Category A: Data Layer & Supabase API Resilience

**Target File:** `src/data/products.ts`  
**Test File Location:** `src/data/__tests__/products.test.ts`

| Test ID | Priority | Status | Function Under Test | Scenario / Exception Trigger | Expected Behavior & Assertions |
|---|---|---|---|---|---|
| **EX-DATA-01** | **P0** | **Fixed** | `fetchProducts()` | Supabase query returns an explicit error (`{ data: null, error: { message: 'Database connection refused' } }`) | Logs a warning via `console.warn`; does **not** throw; returns full `fallbackProducts` array (length 10). |
| **EX-DATA-02** | **P0** | **Not Fixed** | `fetchProducts()` | Supabase client throws an unhandled Promise rejection (e.g. DNS timeout, CORS blocked, offline `TypeError: Failed to fetch`) | Caught by `try...catch` block; warns to console; returns `fallbackProducts` safely. |
| **EX-DATA-03** | **P1** | **Not Fixed** | `fetchProducts()` | Supabase query succeeds but returns an empty list (`{ data: [], error: null }`) | Does not leave the shop blank; recognizes `data.length === 0` and serves `fallbackProducts`. |
| **EX-DATA-04** | **P1** | **Not Fixed** | `fetchFeaturedProducts(limit)` | Called with unusual limits: `0`, `-1`, or `NaN` | Returns safe slice without crashing or throwing range exceptions. |
| **EX-DATA-05** | **P1** | **Not Fixed** | `fetchFeaturedProducts(limit)` | Supabase throws a network error | Gracefully catches error and returns `fallbackProducts.slice(0, limit)`. |
| **EX-DATA-06** | **P1** | **Not Fixed** | `fetchProducts()` | Database returns rows with partial missing fields (e.g. `tag` is `null`, `review_count` missing) | Validates that consumer components don't crash when optional fields are null. |

---

### Category B: Cart & State Management Exceptions

**Target File:** `src/context/AppContext.tsx`  
**Test File Location:** `src/context/__tests__/AppContext.test.tsx`

| Test ID | Priority | Status | Function / Hook | Scenario / Exception Trigger | Expected Behavior & Assertions |
|---|---|---|---|---|---|
| **EX-CTX-01** | **P0** | **Fixed** | `useApp()` | Hook invoked in a component rendered outside of `<AppProvider>` | Throws descriptive error: `"useApp must be used within an AppProvider"`. |
| **EX-CTX-02** | **P0** | **Fixed** | `addToCart(product)` | Product with duplicate ID added repeatedly in rapid succession | Existing cart item quantity increments without creating duplicate keys or race conditions. |
| **EX-CTX-03** | **P0** | **Fixed** | `updateQuantity(id, delta)` | `updateQuantity` called with `delta = -1` when current quantity is `1` | Automatically removes the item from `cartItems` instead of setting quantity to 0 or negative. |
| **EX-CTX-04** | **P0** | **Fixed** | `updateQuantity(id, delta)` | `delta` is large negative number (e.g. `-50`) on item with quantity `2` | Drops below 1; cleanly removes item without negative quantity artifacts. |
| **EX-CTX-05** | **P1** | **Not Fixed** | `removeFromCart(id)` | Called with a non-existent or malformed string `id` (e.g. `""`, `"unknown-999"`) | State remains unchanged; does not crash or throw unhandled exceptions. |
| **EX-CTX-06** | **P1** | **Not Fixed** | `updateQuantity(id, delta)` | Called on a non-existent `id` | No-op; cart items and `cartCount` remain consistent. |
| **EX-CTX-07** | **P1** | **Not Fixed** | `cartCount` | Multiple products added and removed | `cartCount` correctly recomputes sum of quantities; never drops below 0 or displays `NaN`. |
| **EX-CTX-08** | **P1** | **Not Fixed** | `onAuthStateChange` | Supabase fires `SIGNED_OUT` event while user session is active | Clears `userSession` to `null` cleanly without stale user references. |

---

### Category C: Financial & Checkout Calculations

**Target File:** `src/pages/CartPage.tsx`  
**Test File Location:** `src/pages/__tests__/CartPage.test.tsx`

| Test ID | Priority | Status | Module / Area | Scenario / Exception Trigger | Expected Behavior & Assertions |
|---|---|---|---|---|---|
| **EX-FIN-01** | **P0** | **Not Fixed** | Price Calculation | Subtotal has recurring floating point decimals (e.g., $19.99 * 3 = $59.97 + 8% tax) | Total and tax are formatted to exactly 2 decimal places without IEEE 754 precision bugs (e.g., `$64.7676...`). |
| **EX-FIN-02** | **P0** | **Not Fixed** | Shipping Threshold | Boundary conditions: Subtotal = `$59.99` vs `$60.00` | At `$59.99`, shipping is `$8.95` and progress shows remaining `$0.01`. At `$60.00`, shipping becomes `$0.00` (Free). |
| **EX-FIN-03** | **P1** | **Not Fixed** | Empty Cart State | Cart has 0 items | Renders friendly empty state with "Your cart is empty" and "Start Shopping" button; does not calculate tax on empty array or crash. |
| **EX-FIN-04** | **P2** | **Not Fixed** | Promo Code Form | Submitting empty string, whitespace, or invalid code | Prevents page reload; displays polite feedback or no-op without resetting user inputs. |

---

### Category D: Authentication & Security Boundary Exceptions

**Target File:** `src/pages/AuthPage.tsx`  
**Test File Location:** `src/pages/__tests__/AuthPage.test.tsx`

| Test ID | Priority | Status | Flow | Scenario / Exception Trigger | Expected Behavior & Assertions |
|---|---|---|---|---|---|
| **EX-AUTH-01** | **P0** | **Not Fixed** | Login | Supabase Auth returns `400 Invalid login credentials` | Catches error; sets `error` state; displays inline alert: `"Invalid email or password"`; leaves form populated. |
| **EX-AUTH-02** | **P0** | **Not Fixed** | Login / Register | Network completely offline during form submission | Catches error; does not crash; shows user-friendly message (`"Network error. Please try again."`). |
| **EX-AUTH-03** | **P0** | **Not Fixed** | Register | Email already registered (`User already registered`) | Displays inline warning stating the email already has an account. |
| **EX-AUTH-04** | **P1** | **Not Fixed** | Register | Name contains single word or multiple spaces (e.g., `"Cher"` or `"Mary   Jane   Watson"`) | `name.split(' ')` correctly assigns `firstName` and gracefully handles empty `lastNameParts` without throwing `undefined`. |
| **EX-AUTH-05** | **P1** | **Not Fixed** | Form Validation | User inputs invalid email format (e.g. `user@`, `notanemail`) | Regex catches error before calling Supabase API; shows immediate inline error. |
| **EX-AUTH-06** | **P1** | **Not Fixed** | Form Submission | User clicks submit button multiple times in rapid succession | `loading` state disables button and prevents duplicate inflight API calls. |

---

### Category E: Dynamic UI & Fallback Hydration

**Target Files:** `src/pages/HomePage.tsx`, `src/pages/ShopPage.tsx`, `src/pages/CareGuidePage.tsx`  
**Test File Location:** `src/pages/__tests__/PageHydration.test.tsx`

| Test ID | Priority | Status | Page | Scenario / Exception Trigger | Expected Behavior & Assertions |
|---|---|---|---|---|---|
| **EX-PAGE-01** | **P0** | **Not Fixed** | `CareGuidePage.tsx` | Supabase `care_guides` query fails or network drops | `catch` block catches error; page renders smoothly using default `plantGuides` without empty carousel. |
| **EX-PAGE-02** | **P0** | **Not Fixed** | `ShopPage.tsx` | `fetchProducts` resolves with fallback data due to DB timeout | Shop grid renders 10 fallback products; filters (Light, Size, Price) function normally. |
| **EX-PAGE-03** | **P1** | **Not Fixed** | `CareGuidePage.tsx` | `tips` field in DB returns empty array or null | Card layout gracefully renders without throwing `tips.map is not a function`. |
| **EX-PAGE-04** | **P1** | **Not Fixed** | `ShopPage.tsx` | URL query has malformed search encoding (e.g. `/shop?search=%E0%A4%A`) | Page decodes query safely without unhandled URI exception. |
| **EX-PAGE-05** | **P2** | **Not Fixed** | `ShopPage.tsx` | Search term contains special regex characters (e.g. `Monstera (Large) [Sale]`) | Search does literal substring match without throwing syntax error in RegExp. |

---

### Category F: Component Rendering & Edge Input Exceptions

**Target Files:** `src/components/ProductCard.tsx`, `src/components/StarRating.tsx`, `src/pages/ProfilePage.tsx`  
**Test File Location:** `src/components/__tests__/Components.test.tsx`

| Test ID | Priority | Status | Component | Scenario / Exception Trigger | Expected Behavior & Assertions |
|---|---|---|---|---|---|
| **EX-CMP-01** | **P1** | **Not Fixed** | `StarRating.tsx` | `rating` is `0`, negative, or > 5 (out of range) | Clamps safely or renders 0-5 stars without crashing. |
| **EX-CMP-02** | **P1** | **Not Fixed** | `ProductCard.tsx` | `product.tag` is `null` or `undefined` | Does not render tag badge element; layout spacing remains intact. |
| **EX-CMP-03** | **P1** | **Not Fixed** | `ProfilePage.tsx` | User is unauthenticated (`userSession` is `null`) | Renders login CTA banner; does not attempt to read `userSession.name` (prevents null pointer exception). |
| **EX-CMP-04** | **P1** | **Not Fixed** | `ProfilePage.tsx` | User is logged in but `orders` array is empty (`orders: []`) | Shows "No orders yet" message; does not crash mapping over items. |

---

## 4. Test Suite Implementation Tooling

Test harness configuration:
- Test runner: `vitest` (`vitest.config.ts`)
- Environment: `jsdom`
- Setup file: `src/test/setup.ts` (includes `@testing-library/jest-dom` and browser API mocks)
- Test script: `npm test` (`vitest run`)

---

## 5. Review & Progress Tracking

- **Total Test Cases Defined:** 27
- **Fixed & Verified:** 5 (EX-DATA-01, EX-CTX-01, EX-CTX-02, EX-CTX-03, EX-CTX-04)
- **Not Fixed / Pending Implementation:** 22

