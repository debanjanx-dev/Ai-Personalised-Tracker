"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Home, BookOpen, StickyNote, BarChart } from "lucide-react";
import { usePathname } from 'next/navigation';
import { SignInButton, UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navItems = [
    { name: 'Home', path: '/', icon: <Home className="h-5 w-5" /> },
    { name: 'Dashboard', path: '/dashboard', icon: <BarChart className="h-5 w-5" /> },
    { name: 'Exams', path: '/exams', icon: <BookOpen className="h-5 w-5" /> },
    { name: 'Notes', path: '/notes', icon: <StickyNote className="h-5 w-5" /> },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-black border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Logo */}
          <Link href="/" className="text-xl font-bold text-white">
            StudySync
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-sm flex items-center ${isActive(item.path) ? 'text-white' : 'text-gray-300 hover:text-white'} transition-colors`}
              >
                <span className="inline-block mr-2">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
            {isSignedIn ? (
              <div className="flex items-center gap-4">
                <Link 
                  href="/user-profile" 
                  className={`text-sm flex items-center ${pathname === '/user-profile' ? 'text-white' : 'text-gray-300 hover:text-white'} transition-colors`}
                >
                  <span>Profile</span>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <div className="flex items-center">
                <SignInButton mode="modal">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg transition-colors">
                    Sign In
                  </button>
                </SignInButton>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-200 hover:text-blue-500 transition-colors p-2" 
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black dark:bg-gray-900 border-t border-gray-800 py-2">
          <div className="space-y-1 px-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center px-3 py-2 text-base font-medium ${
                  isActive(item.path)
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={closeMenu}
              >
                <span className="inline-block mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
          <div className="px-4 py-4 space-y-2">
            {isSignedIn ? (
              <>
                <Link href="/dashboard" className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2.5 rounded-md transition-colors">
                  Dashboard
                </Link>
                <Link href="/user-profile" className="block w-full bg-gray-800 hover:bg-gray-700 text-white text-center py-2.5 rounded-md transition-colors">
                  My Profile
                </Link>
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2.5 rounded-md transition-colors">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
