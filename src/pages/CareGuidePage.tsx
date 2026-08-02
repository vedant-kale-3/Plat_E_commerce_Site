import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Leaf,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Calendar,
  Stethoscope,
  Sun,
  Droplets,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  careBasics,
  troubleshooting,
  seasonalGuide,
} from '../data/careGuide';

interface CareGuide {
  id: string;
  category: string;
  image: string;
  light: string;
  water: string;
  difficulty: 'Easy' | 'Moderate' | 'Expert';
  summary: string;
  tips: string[];
}

const difficultyStyles: Record<CareGuide['difficulty'], string> = {
  Easy: 'bg-forest-100 text-forest-700',
  Moderate: 'bg-amber-100 text-amber-700',
  Expert: 'bg-rose-100 text-rose-700',
};

export default function CareGuidePage() {
  const [openIssue, setOpenIssue] = useState<number | null>(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [guides, setGuides] = useState<CareGuide[]>([]);

  useEffect(() => {
    supabase
      .from('care_guides')
      .select('id, category, image, light, water, difficulty, summary, tips')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setGuides(data as CareGuide[]);
      });
  }, []);

  return (
    <div>
      {/* Header */}
      <section className="bg-forest-800 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/DSC_0263.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-900/80 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <nav className="flex items-center gap-2 text-xs text-forest-300 mb-4">
            <Link to="/" className="hover:text-forest-100 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white font-medium">Care Guide</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-light text-white leading-tight">
            Plant <span className="font-semibold text-forest-300">Care Guide</span>
          </h1>
          <p className="text-forest-200/80 mt-3 max-w-lg text-sm leading-relaxed">
            Everything you need to keep your green friends thriving — from watering basics to seasonal routines and a troubleshooting clinic.
          </p>
        </div>
      </section>

      {/* Care Basics */}
      <section id="basics" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-forest-500 uppercase tracking-widest mb-3">
            <BookOpen size={14} />
            The Essentials
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-forest-800 leading-tight">
            Master the four pillars of plant care
          </h2>
          <p className="text-gray-500 mt-4 leading-relaxed">
            Get these fundamentals right and almost any houseplant will reward you with healthy growth.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {careBasics.map(({ icon: Icon, title, tips }) => (
            <div
              key={title}
              className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover p-7 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-forest-100 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-forest-500 transition-colors">
                <Icon size={22} className="text-forest-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-semibold text-forest-800 text-lg mb-4">{title}</h3>
              <ul className="space-y-2.5">
                {tips.map(tip => (
                  <li key={tip} className="flex gap-2.5 text-sm text-gray-500 leading-relaxed">
                    <CheckCircle2 size={15} className="text-forest-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Plant-Specific Guides */}
      <section id="plant-guides" className="bg-forest-50 border-y border-forest-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-forest-500 uppercase tracking-widest mb-3">
              <Leaf size={14} />
              By Plant Type
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-forest-800 leading-tight">
              Care guides for every kind of plant
            </h2>
            <p className="text-gray-500 mt-4 leading-relaxed">
              Pick a plant type to see the light, water, and routine it loves.
            </p>
          </div>

          {/* Infinite horizontal scroll strip */}
          <div className="relative overflow-hidden">
            {/* fade edges */}
            <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-forest-50 to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-forest-50 to-transparent z-10" />

            <div
              ref={scrollRef}
              className="flex gap-6 w-max animate-scroll-x hover:[animation-play-state:paused]"
              style={{ animationDuration: `${guides.length * 8}s` }}
            >
              {[...guides, ...guides, ...guides].map((guide, idx) => (
                <div
                  key={`${guide.category}-${idx}`}
                  className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover overflow-hidden transition-all duration-300 flex flex-col w-[320px] shrink-0"
                >
                  <div className="relative overflow-hidden h-44">
                    <img
                      src={guide.image}
                      alt={guide.category}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <span
                      className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold rounded-full ${difficultyStyles[guide.difficulty]}`}
                    >
                      {guide.difficulty}
                    </span>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-semibold text-forest-800 text-lg mb-2">{guide.category} Plants</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">{guide.summary}</p>

                    <div className="flex flex-wrap gap-3 mb-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-forest-700 bg-forest-50 px-2.5 py-1.5 rounded-lg">
                        <Sun size={13} />
                        {guide.light}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-forest-700 bg-forest-50 px-2.5 py-1.5 rounded-lg">
                        <Droplets size={13} />
                        {guide.water}
                      </span>
                    </div>

                    <ul className="space-y-2 mb-5">
                      {guide.tips.map(tip => (
                        <li key={tip} className="flex gap-2.5 text-sm text-gray-500 leading-relaxed">
                          <CheckCircle2 size={15} className="text-forest-400 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      to="/shop"
                      className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-forest-700 hover:text-forest-500 transition-colors"
                    >
                      Browse {guide.category} plants
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Troubleshooting Clinic */}
      <section id="troubleshoot" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-forest-500 uppercase tracking-widest mb-3">
            <Stethoscope size={14} />
            Troubleshooting
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-forest-800 leading-tight">
            What's wrong with my plant?
          </h2>
          <p className="text-gray-500 mt-4 leading-relaxed">
            Tap a symptom to reveal the likely cause and a step-by-step fix.
          </p>
        </div>

        <div className="space-y-3">
          {troubleshooting.map((issue, idx) => {
            const isOpen = openIssue === idx;
            return (
              <div
                key={issue.symptom}
                className={`bg-white rounded-2xl shadow-card overflow-hidden transition-all duration-300 ${
                  isOpen ? 'shadow-card-hover' : ''
                }`}
              >
                <button
                  onClick={() => setOpenIssue(isOpen ? null : idx)}
                  className="w-full flex items-center gap-4 p-5 text-left"
                >
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                    <AlertCircle size={20} className="text-amber-600" />
                  </div>
                  <span className="flex-1 font-semibold text-forest-800">{issue.symptom}</span>
                  <ChevronDown
                    size={20}
                    className={`text-forest-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 pl-[4.25rem]">
                      <p className="text-sm text-gray-600 leading-relaxed mb-4 bg-amber-50 rounded-xl p-4 border border-amber-100">
                        <span className="font-semibold text-amber-800">Likely cause: </span>
                        {issue.cause}
                      </p>
                      <h4 className="text-xs font-semibold text-forest-600 uppercase tracking-wider mb-3">How to fix it</h4>
                      <ol className="space-y-2.5">
                        {issue.fix.map((step, i) => (
                          <li key={step} className="flex gap-3 text-sm text-gray-600 leading-relaxed">
                            <span className="w-5 h-5 bg-forest-100 text-forest-700 text-xs font-semibold rounded-full flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Seasonal Care Calendar */}
      <section id="seasonal" className="bg-forest-50 border-y border-forest-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-forest-500 uppercase tracking-widest mb-3">
              <Calendar size={14} />
              Year-Round Care
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-forest-800 leading-tight">
              A seasonal care calendar
            </h2>
            <p className="text-gray-500 mt-4 leading-relaxed">
              Plant needs shift with the seasons. Here's what to do, and when.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {seasonalGuide.map(({ season, icon: Icon, accent, checklist, tip }) => (
              <div
                key={season}
                className="bg-white rounded-2xl shadow-card hover:shadow-card-hover p-7 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 ${accent} rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-forest-800 text-lg">{season}</h3>
                </div>

                <ul className="space-y-2.5 mb-5">
                  {checklist.map(task => (
                    <li key={task} className="flex gap-2.5 text-sm text-gray-500 leading-relaxed">
                      <CheckCircle2 size={15} className="text-forest-400 shrink-0 mt-0.5" />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex gap-2.5 text-sm text-forest-700 bg-forest-50 rounded-xl p-3.5 border border-forest-100">
                  <Sparkles size={16} className="text-forest-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{tip}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-forest-800 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: "url('/A_image_12_75a15381-4701-4eca-a435-ce855c9437cb.jpg')" }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <Leaf size={32} className="text-forest-400 mx-auto mb-5" />
          <h2 className="text-3xl sm:text-4xl font-light text-white leading-tight mb-4">
            Find a plant that fits your <span className="font-semibold text-forest-300">life</span>
          </h2>
          <p className="text-forest-200/80 mb-8 max-w-lg mx-auto leading-relaxed">
            Browse our collection and filter by light, size, and difficulty to find your perfect match.
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
    </div>
  );
}
