// @refresh reset
import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      <Navbar />
      <main className="flex-1 page-enter">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
