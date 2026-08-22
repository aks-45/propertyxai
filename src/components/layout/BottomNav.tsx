'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, Bell, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const tabs = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Saved', path: '/saved', icon: Heart },
    { name: 'Alerts', path: '/alerts', icon: Bell },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-dark-navy border-t border-gray-200 dark:border-gray-800 z-40 flex items-center justify-around pb-safe px-2">
      {tabs.map((tab) => {
        const isActive = pathname === tab.path || (tab.path !== '/' && pathname?.startsWith(tab.path));
        const Icon = tab.icon;
        
        return (
          <Link
            key={tab.path}
            href={tab.path}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue rounded-lg mx-1 ${
              isActive ? 'text-primary-blue dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            }`}
          >
            <Icon className={`w-6 h-6 ${isActive ? 'fill-primary-blue/20' : ''}`} />
            <span className="text-[10px] font-medium">{tab.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};
