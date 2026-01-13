"use client";

import { useState } from "react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-white font-bold text-xl">
            <a href="/">
              Caleb Han
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-4 md:space-x-8">
            <a href="/code" className="text-white hover:text-gray-300 transition-colors">
              Code
            </a>
            <a href="/photography" className="text-white hover:text-gray-300 transition-colors">
              Photography
            </a>
            <a href="/#about" className="text-white hover:text-gray-300 transition-colors">
              About Me
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-gray-300 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-700/50">
            <div className="flex flex-col space-y-4">
              <a
                href="/code"
                className="text-white hover:text-gray-300 transition-colors py-2 px-2 hover:bg-white/5 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Code
              </a>
              <a
                href="/photography"
                className="text-white hover:text-gray-300 transition-colors py-2 px-2 hover:bg-white/5 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Photography
              </a>
              <a
                href="/#about"
                className="text-white hover:text-gray-300 transition-colors py-2 px-2 hover:bg-white/5 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Me
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}