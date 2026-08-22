'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, Heart, Bell, User } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Home', href: '/dashboard', icon: House },
    { name: 'Saved', href: '/saved', icon: Heart },
    { name: 'Alerts', href: '/alerts', icon: Bell },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-light-blue-gray">
      {/* Header */}
      <header className="hidden md:flex items-center justify-between px-6 py-4 bg-white border-b sticky top-0 z-10 shadow-sm">
        <Link href="/dashboard" className="flex items-center">
          <Logo size="md" />
        </Link>
        <nav className="flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-2 font-medium transition-colors ${isActive ? 'text-primary-blue' : 'text-gray-500 hover:text-dark-navy'}`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Main Content */}
      <main className="pb-24 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex items-center justify-around px-2 z-50 safe-area-bottom">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-primary-blue' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <item.icon className={`w-6 h-6 ${isActive ? 'fill-current opacity-20' : ''}`} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
