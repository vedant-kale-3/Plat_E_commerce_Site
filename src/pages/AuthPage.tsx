import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

type Mode = 'login' | 'register';

interface FormState {
  name: string;
  email: string;
  password: string;
}

interface Errors {
  name?: string;
  email?: string;
  password?: string;
}

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [form, setForm] = useState<FormState>({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const { setUserSession } = useApp();
  const navigate = useNavigate();

  const validate = (): boolean => {
    const newErrors: Errors = {};
    if (mode === 'register' && !form.name.trim()) {
      newErrors.name = 'Full name is required.';
    }
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Enter a valid email address.';
    }
    if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSuccess(true);
    setTimeout(() => {
      setUserSession({ name: form.name || form.email.split('@')[0], email: form.email });
      navigate('/');
    }, 900);
  };

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const switchMode = () => {
    setMode(m => (m === 'login' ? 'register' : 'login'));
    setErrors({});
    setForm({ name: '', email: '', password: '' });
    setSuccess(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      {/* Visual banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-forest-800 relative overflow-hidden flex-col justify-between p-12">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/1_da069a19-bb37-40a4-b196-7d0610a89582.jpg')" }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-12">
            <img src="/image.png" alt="Fiona logo" className="w-9 h-9 object-contain" />
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-semibold text-white tracking-tight">Fiona</span>
              <span className="text-[11px] text-forest-400 font-medium tracking-wide">your floral dreams</span>
            </div>
          </div>
          <h2 className="text-4xl font-light text-white leading-snug mb-5">
            Live your <br />
            <span className="font-semibold text-forest-300">floral dreams.</span>
          </h2>
          <p className="text-forest-300 text-base leading-relaxed max-w-xs">
            Join thousands of plant lovers who trust Fiona for hand-picked indoor plants, curated care guides, and same-week delivery.
          </p>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { value: '10K+', label: 'Happy Customers' },
            { value: '200+', label: 'Plant Species' },
            { value: '4.9', label: 'Average Rating' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-forest-300">{stat.value}</div>
              <div className="text-xs text-forest-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-[#f8f9fa]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <img src="/image.png" alt="Fiona logo" className="w-8 h-8 object-contain" />
            <div className="flex flex-col leading-none">
              <span className="text-xl font-semibold text-forest-800">Fiona</span>
              <span className="text-[10px] text-forest-500 font-medium tracking-wide">your floral dreams</span>
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-forest-800 mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            {mode === 'login'
              ? "Sign in to your Fiona account."
              : "Start your floral journey with Fiona."}
          </p>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: 'Google', icon: 'G' },
              { label: 'Apple', icon: '' },
            ].map(({ label, icon }) => (
              <button
                key={label}
                type="button"
                className="flex items-center justify-center gap-2.5 px-4 py-2.5 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-all shadow-sm hover:shadow"
              >
                {label === 'Apple' ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                ) : (
                  <span className="w-4 h-4 text-sm font-bold leading-none">{icon}</span>
                )}
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or continue with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={handleChange('name')}
                  placeholder="Jane Doe"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-forest-800 placeholder-gray-400 bg-white transition-all focus:outline-none focus:ring-2 ${
                    errors.name
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-gray-200 focus:ring-forest-300 focus:border-forest-400'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.name}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="you@example.com"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-forest-800 placeholder-gray-400 bg-white transition-all focus:outline-none focus:ring-2 ${
                  errors.email
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-gray-200 focus:ring-forest-300 focus:border-forest-400'
                }`}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange('password')}
                  placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
                  className={`w-full px-4 py-2.5 pr-11 rounded-xl border text-sm text-forest-800 placeholder-gray-400 bg-white transition-all focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-gray-200 focus:ring-forest-300 focus:border-forest-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={success}
              className={`w-full py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                success
                  ? 'bg-forest-500 text-white cursor-default'
                  : 'bg-forest-800 hover:bg-forest-700 text-white shadow-sm hover:shadow-md'
              }`}
            >
              {success ? (
                <>
                  <CheckCircle2 size={18} />
                  {mode === 'login' ? 'Signed in!' : 'Account created!'}
                </>
              ) : mode === 'login' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-6">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={switchMode}
              className="text-forest-600 hover:text-forest-500 font-medium transition-colors"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
