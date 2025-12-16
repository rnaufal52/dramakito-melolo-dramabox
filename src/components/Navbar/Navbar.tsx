"use client";

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import SearchModal from "@/components/Search/SearchModal";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [isSearchOpen]); // Close mobile menu if search opens, though logic might differ. 
  // Actually better to hook into pathname changes? Router doesn't expose generic listener easily in app dir client component without usePathname.
  // Let's just close it on link click.

  return (
    <>
      <nav className={`fixed top-0 z-9999 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl supports-[backdrop-filter]:bg-black/60 transition-all duration-300 ${isScrolled ? 'bg-black/90 shadow-lg' : ''}`}>
        <div className="container flex h-20 items-center px-4 md:px-8">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center">
                {/* Mobile Hamburger */}
                <button 
                  className="mr-4 md:hidden text-gray-300 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {isMobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>

                <Link href="/" className="mr-8 flex items-center space-x-2">
                    <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-red-600 via-red-500 to-rose-500 bg-clip-text text-transparent drop-shadow-sm">
                    DRAMAKITO
                    </span>
                </Link>
                
                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-8 text-base font-medium">
                <Link 
                    href="/" 
                    className={`transition-all hover:scale-105 ${isActive('/') ? 'text-red-500 font-bold' : 'text-gray-300 hover:text-white'}`}
                >
                    Home
                </Link>
                <Link 
                    href="/favorites" 
                    className={`transition-all hover:scale-105 ${isActive('/favorites') ? 'text-red-500 font-bold' : 'text-gray-300 hover:text-white'}`}
                >
                    My List
                </Link>
                </nav>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-6">
                 {/* Search Trigger */}
                 <button 
                    onClick={() => setIsSearchOpen(true)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                    aria-label="Open Search"
                 >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                 </button>

                 {/* Profile Removed as requested */}
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
            <div className="absolute top-20 left-0 w-full bg-black/95 border-b border-gray-800 p-4 md:hidden flex flex-col space-y-4 animate-in slide-in-from-top-4">
                <Link 
                  href="/" 
                  className={`text-lg font-medium py-2 border-b border-gray-800 ${isActive('/') ? 'text-red-500' : 'text-gray-300 hover:text-white'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                    Home
                </Link>
                <Link 
                  href="/favorites" 
                  className={`text-lg font-medium py-2 border-b border-gray-800 ${isActive('/favorites') ? 'text-red-500' : 'text-gray-300 hover:text-white'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                    My List
                </Link>
            </div>
        )}
      </nav>
      
      {/* Search Modal */}
      {isSearchOpen && (
          <SearchModal onClose={() => setIsSearchOpen(false)} />
      )}
    </>
  );
};

export default Navbar;
