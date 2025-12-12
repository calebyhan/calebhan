'use client';
import { useState, useRef, useEffect } from 'react';

export default function ProjectSearch({ value, onChange, onClear }) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  // Keyboard shortcut: "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative">
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200
        ${isFocused
          ? 'border-cyan-500/50 bg-gray-900 shadow-lg shadow-cyan-500/10'
          : 'border-gray-700/50 bg-gray-900/50'
        }
      `}>
        {/* Search icon */}
        <svg
          className={`w-5 h-5 transition-colors ${isFocused ? 'text-cyan-400' : 'text-gray-400'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search projects... (try 'React apps' or 'machine learning')"
          className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
        />

        {/* Clear button */}
        {value && (
          <button
            onClick={onClear}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Keyboard hint */}
        {!isFocused && !value && (
          <kbd className="hidden md:inline-flex items-center px-2 py-0.5 text-xs text-gray-500 bg-gray-800 rounded border border-gray-700">
            /
          </kbd>
        )}
      </div>

      {/* AI search hint */}
      {isFocused && (
        <p className="absolute mt-2 text-xs text-gray-500">
          Powered by semantic search — try natural language queries
        </p>
      )}
    </div>
  );
}
