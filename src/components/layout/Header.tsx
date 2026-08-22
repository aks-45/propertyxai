'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, User } from 'lucide-react';
import { Logo } from '../ui/Logo';

export const Header: React.FC = () => {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Analyze', path: '/analyze' },
    { name: 'Saved', path: '/saved' },
    { name: 'Alerts', path: '/alerts' },
    { name: 'Profile', path: '/profile' },
  ];

  return (
    <header className="hidden md:flex h-20 bg-white border-b border-gray-200 sticky top-0 z-40 px-8 items-center justify-between shadow-xs">
      <div className="flex items-center space-x-8">
        <Link href="/" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue rounded-md flex items-center">
          <Logo size="md" />
        </Link>
        <nav className="flex items-center space-x-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.path || (link.path !== '/' && pathname?.startsWith(`${link.path}/`));
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue ${
                  isActive
                    ? 'bg-primary-blue/10 text-primary-blue'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-dark-navy'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center space-x-3">
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors focus:ring-2 focus:ring-primary-blue focus:outline-none">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-red rounded-full border border-white"></span>
        </button>
        <button className="flex items-center justify-center w-8 h-8 rounded-full bg-light-blue-gray text-dark-navy hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-primary-blue focus:outline-none">
          <User className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
