import { Link } from 'react-router-dom';
import { Sprout, ArrowLeft } from 'lucide-react';

interface Props {
  title: string;
  description: string;
}

export default function UnderConstruction({ title, description }: Props) {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-20">
      <div className="text-center max-w-md">
        {/* Illustration */}
        <div className="relative mx-auto mb-8 w-36 h-36">
          <div className="absolute inset-0 bg-forest-100 rounded-full opacity-60 animate-ping" style={{ animationDuration: '3s' }} />
          <div className="relative w-full h-full bg-gradient-to-br from-forest-200 to-forest-100 rounded-full flex items-center justify-center shadow-card">
            <Sprout size={56} className="text-forest-600" />
          </div>
        </div>

        <span className="inline-block px-3 py-1.5 bg-forest-100 text-forest-600 text-xs font-semibold uppercase tracking-widest rounded-full mb-4">
          Coming Soon
        </span>

        <h1 className="text-3xl font-semibold text-forest-800 mb-3">{title}</h1>
        <p className="text-gray-500 leading-relaxed mb-8">{description}</p>

        {/* Progress indicator */}
        <div className="bg-white border border-forest-100 rounded-2xl p-5 mb-8 shadow-card text-left">
          <p className="text-xs font-semibold text-forest-600 uppercase tracking-wider mb-3">Development Progress</p>
          <div className="space-y-3">
            {[
              { label: 'UI Design', pct: 90 },
              { label: 'Backend Integration', pct: 45 },
              { label: 'Testing', pct: 20 },
            ].map(({ label, pct }) => (
              <div key={label}>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{label}</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-forest-500 to-forest-400 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-forest-800 hover:bg-forest-700 text-white rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow-md"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
