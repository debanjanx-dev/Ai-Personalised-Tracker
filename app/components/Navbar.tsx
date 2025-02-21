"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { usePathname } from 'next/navigation';

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu";
import Button from "./ui/Button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Logo */}
          <Link href="/" className="text-xl font-bold text-white">
            StudySync
          </Link>

          {/* Desktop Menu */}
          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              className={`text-sm ${pathname === '/' ? 'text-white' : 'text-gray-300 hover:text-white'} transition-colors`}
            >
              Home
            </Link>
            <Link 
              href="/dashboard" 
              className={`text-sm ${pathname === '/dashboard' ? 'text-white' : 'text-gray-300 hover:text-white'} transition-colors`}
            >
              Dashboard
            </Link>
            <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg transition-colors">
              Sign In
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-200 hover:text-blue-500 transition-colors p-2" 
            onClick={() => setIsOpen(!isOpen)}
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
            <Link href="/" className="block py-2.5 text-gray-200 hover:text-blue-500 transition-colors">Home</Link>
            <Link href="/features" className="block py-2.5 text-gray-200 hover:text-blue-500 transition-colors">Features</Link>
            <Link href="/dashboard" className="block py-2.5 text-gray-200 hover:text-blue-500 transition-colors">Dashboard</Link>
            <Link href="/about" className="block py-2.5 text-gray-200 hover:text-blue-500 transition-colors">About</Link>
            <Link href="/contact" className="block py-2.5 text-gray-200 hover:text-blue-500 transition-colors">Contact</Link>
          </div>
          <div className="px-4 py-4">
            <Link href="/login" className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2.5 rounded-md transition-colors">
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
