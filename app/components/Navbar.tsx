"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu";
import Button from "./ui/Button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-black dark:bg-gray-900 shadow-md w-full fixed top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left Side - Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-white flex-shrink-0">
            StudySync 🚀
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 flex-grow justify-center">
            <Link href="/" className="text-gray-200 hover:text-blue-500 transition-colors font-medium">Home</Link>
            <Link href="/features" className="text-gray-200 hover:text-blue-500 transition-colors font-medium">Features</Link>
            <Link href="/dashboard" className="text-gray-200 hover:text-blue-500 transition-colors font-medium">Dashboard</Link>

            {/* Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="transparent" className="flex items-center gap-1 text-gray-200">
                  More <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem>
                  <Link href="/about" className="w-full py-1">About</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/contact" className="w-full py-1">Contact</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Side - Login Button */}
          <div className="hidden md:flex items-center flex-shrink-0">
          <button className="px-6 py-2 rounded-xl border border-neutral-600 text-black bg-white hover:bg-gray-100 transition duration-200">
       Login
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
