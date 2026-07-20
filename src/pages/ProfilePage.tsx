import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, Package, LogOut, ChevronRight, Leaf } from 'lucide-react';
import { useApp } from '../context/AppContext';

const statusStyles: Record<string, string> = {
  Delivered: 'bg-forest-100 text-forest-700',
  Shipped: 'bg-blue-100 text-blue-700',
  Processing: 'bg-amber-100 text-amber-700',
};

export default function ProfilePage() {
  const { userSession, setUserSession } = useApp();
  const navigate = useNavigate();

  if (!userSession) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-20">
        <div className="w-20 h-20 bg-forest-100 rounded-3xl flex items-center justify-center mb-6">
          <User size={36} className="text-forest-500" />
        </div>
        <h2 className="text-2xl font-semibold text-forest-800 mb-2">You're not signed in</h2>
        <p className="text-gray-500 text-sm mb-8 text-center max-w-xs">
          Sign in to your Fiona account to view your profile, track orders, and manage your details.
        </p>
        <button
          onClick={() => navigate('/auth')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-forest-800 hover:bg-forest-700 text-white rounded-xl font-medium text-sm transition-colors"
        >
          <Leaf size={16} />
          Sign In
        </button>
      </div>
    );
  }

  const handleSignOut = () => {
    setUserSession(null);
    navigate('/');
  };

  const { firstName, lastName, email, phone, address, joined, orders } = userSession;
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header card */}
      <div className="bg-gradient-to-br from-forest-800 to-forest-600 rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{ backgroundImage: "url('/1_da069a19-bb37-40a4-b196-7d0610a89582.jpg')" }}
        />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-2xl font-bold text-white shrink-0">
            {initials || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-white">{fullName || 'Fiona Member'}</h1>
            <p className="text-forest-200 text-sm mt-1 truncate">{email}</p>
            <p className="text-forest-300 text-xs mt-2 inline-flex items-center gap-1.5">
              <Calendar size={12} /> Member since {joined}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-sm font-medium transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile details */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-lg font-semibold text-forest-800 mb-5 flex items-center gap-2">
              <User size={18} className="text-forest-600" />
              Profile Details
            </h2>
            <div className="space-y-5">
              <DetailRow icon={<User size={15} />} label="First Name" value={firstName || '—'} />
              <DetailRow icon={<User size={15} />} label="Last Name" value={lastName || '—'} />
              <DetailRow icon={<Mail size={15} />} label="Email" value={email} />
              <DetailRow icon={<Phone size={15} />} label="Phone" value={phone || '—'} />
              <div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
                  <MapPin size={15} />
                  <span>Address</span>
                </div>
                <p className="text-sm text-forest-800 leading-relaxed">
                  {address.street || '—'}
                  <br />
                  {[address.city, address.state, address.zip].filter(Boolean).join(', ') || '—'}
                  <br />
                  {address.country || '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order history */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-forest-800 flex items-center gap-2">
                <Package size={18} className="text-forest-600" />
                Order History
              </h2>
              <span className="text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'}
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-forest-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Package size={28} className="text-forest-400" />
                </div>
                <p className="text-sm text-gray-500 mb-1">No orders yet</p>
                <p className="text-xs text-gray-400">Your past purchases will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between px-5 py-3 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-forest-800">#{order.id}</span>
                        <span className="text-xs text-gray-400">Placed on {order.date}</span>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="p-5 space-y-3">
                      {order.items.map(item => (
                        <div key={item.name} className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-forest-800 truncate">{item.name}</p>
                            <p className="text-xs text-gray-400">Qty {item.quantity} · ₹{item.price.toFixed(2)}</p>
                          </div>
                          <span className="text-sm font-semibold text-forest-800">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                      <span className="text-sm font-semibold text-forest-800">Total</span>
                      <span className="text-base font-bold text-forest-800">₹{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => navigate('/')}
              className="mt-5 w-full flex items-center justify-center gap-1.5 py-3 border border-forest-200 text-forest-700 hover:bg-forest-50 rounded-xl font-medium text-sm transition-colors"
            >
              Continue Shopping
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-sm text-forest-800">{value}</p>
    </div>
  );
}
