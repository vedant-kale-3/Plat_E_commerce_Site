import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowDown,
  Star,
  Truck,
  ShieldCheck,
  Recycle,
  Headphones,
  Leaf,
  Sprout,
  Heart,
  Quote,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import StarRating from '../components/StarRating';

const values = [
  {
    icon: Sprout,
    title: 'Hand-Grown & Hand-Picked',
    desc: 'Every plant is nurtured from seedling to shipping day by our small team of growers. No mass production, just careful cultivation.',
  },
  {
    icon: Recycle,
    title: 'Sustainable to the Roots',
    desc: 'Biodegradable pots, recycled-paper sleeves, and carbon-neutral shipping. We leave the planet greener than we found it.',
  },
  {
    icon: Heart,
    title: 'Plants That Thrive, Guaranteed',
    desc: 'If your plant doesn’t make it 30 days, we replace it free. We care about your plant’s life as much as you do.',
  },
];

const stats = [
  { value: '10,000+', label: 'Happy plant parents' },
  { value: '50+', label: 'Curated varieties' },
  { value: '4.9/5', label: 'Average rating' },
  { value: '5 yrs', label: 'Bringing green home' },
];

const reviews = [
  {
    name: 'Maya Chen',
    location: 'Chicago, IL',
    rating: 5,
    text: 'My Monstera arrived in perfect condition — the packaging was beautiful and completely plastic-free. The care guide actually helped me keep it alive, which is a first for me!',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  },
  {
    name: 'Jake Amiri',
    location: 'San Francisco, CA',
    rating: 5,
    text: 'Ordered three plants and every single one was healthier than anything I’ve seen at the local nursery. The Bird of Paradise is now the centerpiece of my living room.',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  },
  {
    name: 'Priya Nair',
    location: 'Austin, TX',
    rating: 5,
    text: 'The support team answered my questions within hours and helped me pick plants for my low-light apartment. My ZZ plant is thriving six months later. Truly a company that cares.',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  },
  {
    name: 'Daniel Osei',
    location: 'Portland, OR',
    rating: 4.5,
    text: 'The netted ficus is a sculptural work of art. I get compliments on it constantly. Shipping was a day late but the plant was pristine. Will be a customer for life.',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  },
  {
    name: 'Sofia Marchetti',
    location: 'Brooklyn, NY',
    rating: 5,
    text: 'I’m a notorious plant killer and even I haven’t managed to kill the Pothos I ordered. The beginner-friendly labels on the site made choosing painless. Thank you, Fiona!',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  },
  {
    name: 'Liam Foster',
    location: 'Seattle, WA',
    rating: 5,
    text: 'The whole experience felt personal — from the handwritten note in the box to the follow-up email checking on my plant. This is how every online shop should feel.',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  },
];

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .limit(3)
      .then(({ data, error }) => {
        if (!error && data) setFeatured(data as Product[]);
      });
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-forest-800 overflow-hidden min-h-[88vh] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: "url('/1_da069a19-bb37-40a4-b196-7d0610a89582.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-900/80 via-forest-800/60 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-forest-500/20 border border-forest-400/30 rounded-full text-forest-300 text-xs font-medium mb-6 backdrop-blur-sm">
              <Star size={12} className="fill-forest-400 text-forest-400" />
              Rated 4.9/5 by 10,000+ plant lovers
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-white leading-[1.1] mb-6">
              Bring{' '}
              <span className="font-semibold text-forest-300">Nature</span>
              <br />
              Indoors
            </h1>
            <p className="text-lg text-forest-200/80 leading-relaxed mb-10 max-w-lg">
              We’re Fiona — a small studio on a mission to make homes greener, one thoughtfully grown plant at a time. Curated by growers, loved by thousands.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-forest-500 hover:bg-forest-400 text-white font-medium rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-base"
              >
                Shop Plants
                <ArrowRight size={18} />
              </Link>
              <a
                href="#story"
                className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/30 text-white hover:bg-white/10 font-medium rounded-2xl transition-all text-base"
              >
                Our Story
                <ArrowDown size={18} />
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 mt-12">
              {[
                { icon: Truck, label: 'Free delivery over ₹60' },
                { icon: ShieldCheck, label: '30-day health guarantee' },
                { icon: Recycle, label: 'Eco-friendly packaging' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-forest-300 text-sm">
                  <Icon size={16} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Free Delivery', desc: 'On orders over ₹60' },
              { icon: ShieldCheck, title: 'Health Guarantee', desc: '30-day plant guarantee' },
              { icon: Recycle, title: 'Eco Packaging', desc: '100% sustainable materials' },
              { icon: Headphones, title: 'Expert Support', desc: 'Plant care advice 7 days/week' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-forest-100 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-forest-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-forest-800">{title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section id="story" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-card">
              <img
                src="/A_image_10_06ce6eee-f675-41b8-b461-efb57f8c42a2.webp"
                alt="A greenhouse full of healthy plants"
                className="w-full h-[460px] object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-2 sm:right-6 bg-white rounded-2xl shadow-card-hover p-5 flex items-center gap-4 max-w-[230px]">
              <div className="w-12 h-12 bg-forest-100 rounded-xl flex items-center justify-center shrink-0">
                <Leaf size={24} className="text-forest-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-forest-800">Grown with care</div>
                <div className="text-xs text-gray-500 mt-0.5">No pesticides, ever</div>
              </div>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-forest-500 uppercase tracking-widest mb-3 block">Our Story</span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-forest-800 leading-tight mb-5">
              A tiny greenhouse with a big dream
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Fiona started in 2019 as a single backyard greenhouse in Portland, where our founder Elena spent her evenings rescuing neglected houseplants. What began as a passion project quickly grew into a belief: that everyone deserves to live with plants, and that plants deserve to be grown and shipped with real care.
              </p>
              <p>
                Today we’re a small team of growers, designers, and plant-whisperers. We don’t sell thousands of varieties — we grow fifty, and we grow them properly. Every plant is health-checked by hand, packed in plastic-free materials, and backed by a guarantee most nurseries won’t offer.
              </p>
              <p>
                We believe a plant isn’t a product — it’s the start of a calmer, greener home. That’s why we pair every order with a real care guide and a team you can actually talk to.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-forest-800 hover:bg-forest-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Explore our plants
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 px-6 py-3 border border-forest-200 text-forest-800 hover:bg-forest-50 text-sm font-medium rounded-xl transition-colors"
              >
                Join the community
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-forest-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-semibold text-forest-300">{s.value}</div>
                <div className="text-xs text-forest-400 mt-1.5 uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold text-forest-500 uppercase tracking-widest mb-3 block">What we stand for</span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-forest-800 leading-tight">
            More than a plant shop
          </h2>
          <p className="text-gray-500 mt-4 leading-relaxed">
            Three principles guide everything we grow, pack, and ship.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover p-8 transition-all duration-300 border border-gray-50"
            >
              <div className="w-14 h-14 bg-forest-100 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-forest-500 transition-colors">
                <Icon size={26} className="text-forest-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-semibold text-forest-800 text-lg mb-3">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured plants */}
      <section className="bg-forest-50 border-y border-forest-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-semibold text-forest-500 uppercase tracking-widest mb-3 block">Best Sellers</span>
              <h2 className="text-3xl sm:text-4xl font-semibold text-forest-800 leading-tight">
                Loved by our community
              </h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm font-medium text-forest-700 hover:text-forest-500 transition-colors"
            >
              View all plants
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Customer reviews */}
      <section id="reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold text-forest-500 uppercase tracking-widest mb-3 block">Customer love</span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-forest-800 leading-tight">
            10,000+ thriving homes
          </h2>
          <div className="flex items-center justify-center gap-2 mt-5">
            <StarRating rating={4.9} size={18} />
            <span className="text-sm text-gray-500">4.9 out of 5 from 2,300+ reviews</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map(r => (
            <div
              key={r.name}
              className="bg-white rounded-2xl shadow-card hover:shadow-card-hover p-7 flex flex-col transition-all duration-300"
            >
              <Quote size={28} className="text-forest-200 mb-4" />
              <p className="text-sm text-gray-600 leading-relaxed flex-1">{r.text}</p>
              <div className="mt-5 pt-5 border-t border-gray-100 flex items-center gap-3">
                <img
                  src={r.avatar}
                  alt={r.name}
                  className="w-11 h-11 rounded-full object-cover"
                  loading="lazy"
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-forest-800">{r.name}</div>
                  <div className="text-xs text-gray-400">{r.location}</div>
                </div>
                <StarRating rating={r.rating} size={13} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-forest-800 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: "url('/1_69c03517-6f5a-4f05-baa1-06df9db2c9d2.jpg')" }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <Leaf size={32} className="text-forest-400 mx-auto mb-5" />
          <h2 className="text-3xl sm:text-4xl font-light text-white leading-tight mb-4">
            Ready to bring a little{' '}
            <span className="font-semibold text-forest-300">green</span> home?
          </h2>
          <p className="text-forest-200/80 mb-8 max-w-lg mx-auto leading-relaxed">
            Browse our hand-curated collection and find a plant that fits your space, your light, and your life.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-forest-500 hover:bg-forest-400 text-white font-medium rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-base"
          >
            Start shopping
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Newsletter banner */}
      <section className="bg-forest-100 border-t border-forest-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-semibold text-forest-800 mb-2">Get plant care tips in your inbox</h2>
          <p className="text-sm text-forest-600 mb-6">Join 8,000+ plant parents. No spam, just green goodness.</p>
          <form
            onSubmit={e => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-xl border border-forest-300 text-sm bg-white text-forest-800 placeholder-forest-400 focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-forest-800 text-white text-sm font-medium rounded-xl hover:bg-forest-700 transition-colors whitespace-nowrap"
            >
              Subscribe Free
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
