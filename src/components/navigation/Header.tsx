'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { dentalStore } from '@/lib/store';
import { 
  Calendar, 
  Users, 
  Clock, 
  BarChart3, 
  Settings, 
  Plus, 
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import AddPatientModal from '@/components/patients/AddPatientModal';

export default function Header() {
  const pathname = usePathname();
  const [todayCount, setTodayCount] = useState(0);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);

  useEffect(() => {
    const updateCount = () => {
      const items = dentalStore.getTodayFollowUps();
      setTodayCount(items.length);
    };

    updateCount();
    const unsubscribe = dentalStore.subscribe(updateCount);
    return () => unsubscribe();
  }, []);

  const navItems = [
    {
      href: '/',
      label: 'Today',
      icon: CheckCircle2,
      badge: todayCount > 0 ? todayCount : undefined,
    },
    {
      href: '/patients',
      label: 'Patients',
      icon: Users,
    },
    {
      href: '/appointments',
      label: 'Appointments',
      icon: Calendar,
    },
    {
      href: '/follow-ups',
      label: 'Follow-ups',
      icon: Clock,
    },
    {
      href: '/summary',
      label: 'Summary',
      icon: BarChart3,
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Clinic Brand */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-emerald-800 transition-colors">
                  +
                </div>
                <div>
                  <h1 className="font-semibold text-slate-900 leading-tight text-base">
                    Lucky Dental Care
                  </h1>
                  <p className="text-xs text-slate-500 font-normal">Proddatur, AP</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-emerald-800 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-emerald-700 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Quick Actions & Staff Profile */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsAddPatientOpen(true)}
                className="btn-primary text-sm py-2 px-3.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Patient</span>
              </button>

              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-medium text-xs">
                  P
                </div>
                <div className="text-left leading-tight">
                  <div className="text-xs font-medium text-slate-900">Pooja</div>
                  <div className="text-[10px] text-slate-500">Receptionist</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Row */}
          <div className="md:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-100 space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-0.5 px-1 py-0.2 text-[10px] font-bold text-white bg-emerald-700 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Global Add Patient Modal */}
      {isAddPatientOpen && (
        <AddPatientModal isOpen={isAddPatientOpen} onClose={() => setIsAddPatientOpen(false)} />
      )}
    </>
  );
}
