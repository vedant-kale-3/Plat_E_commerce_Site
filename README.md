# Fiona — Plant E-Commerce Storefront

**Fiona** is a beautifully designed, modern e-commerce storefront for indoor plants. The application provides a seamless shopping experience for plant lovers, offering everything from browsing a curated catalog to managing a shopping cart and accessing expert plant care guides.

---

##  Key Features

###  Plant Catalog & Shopping Experience
- **Browse & Filter:** Explore a diverse catalog of indoor plants. Filter plants easily by light requirements, size, and price range to find the perfect fit for your space.
- **Search:** Quickly find specific plants by name or category.
- **Shopping Cart:** Add plants to your cart, adjust quantities, and view a dynamic order summary. The cart automatically calculates taxes and tracks progress toward free shipping.
- **Responsive Design:** A fully responsive, mobile-friendly interface ensures a great shopping experience across all devices.

###  User Accounts & Profiles
- **Authentication:** Secure login and registration powered by Supabase.
- **User Dashboard:** Logged-in users can view their profile details and track their order history, complete with color-coded status badges for past orders.

###  Plant Care Guides
- **Care Articles:** Access a dedicated Care Guide section featuring comprehensive tips on watering, lighting, humidity, and fertilizing to help your plants thrive.

###  Dynamic UI/UX
- **Glassmorphic Navigation:** A stylish, sticky top navigation bar with a live cart counter and mobile menu.
- **Interactive Product Cards:** Product listings feature image zoom on hover, star ratings, and smooth animations when adding items to the cart.
- **Animations:** Subtle fade-in animations on page transitions to enhance the premium feel of the storefront.

---

##  Technology Stack

Fiona is built as a fast, client-side Single Page Application (SPA):
- **Frontend:** React 18, TypeScript, and Vite.
- **Styling:** TailwindCSS with a custom "forest" brand color palette for a lush, botanical aesthetic.
- **Routing:** React Router v7.
- **Backend Services:** Supabase for secure authentication and dynamic data (Care Guides).

---

##  Getting Started

To run Fiona locally on your machine:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Copy the `.env.example` file to `.env` and add your Supabase project credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173` by default.
