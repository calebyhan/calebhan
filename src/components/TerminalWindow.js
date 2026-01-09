"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { animate, stagger, utils } from "animejs";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export default function TerminalWindow() {
  const lineRefs = useRef([]);
  const pathname = usePathname();
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      // Show all lines immediately without animation
      utils.set(lineRefs.current, { opacity: 1, translateY: 0 });
      return;
    }

    // Sequential animation with anime.js
    animate(lineRefs.current, {
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 400,
      delay: stagger(300),
      easing: 'easeOutQuad'
    });
  }, [prefersReducedMotion]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Terminal Window */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden">
        {/* Window Chrome - Title Bar */}
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 px-4 py-3 flex items-center border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="flex-1 text-center mr-[52px]">
            <span className="font-mono text-xs text-gray-400">bash — 80×24</span>
          </div>
        </div>

        {/* Terminal Content */}
        <div className="bg-black p-6 font-mono text-sm">
          {/* Line 1: cd command */}
          <div
            ref={el => lineRefs.current[0] = el}
            className="mb-2 opacity-0"
          >
            <span className="text-green-400">caleb@portfolio</span>
            <span className="text-white">:</span>
            <span className="text-blue-400">~</span>
            <span className="text-white">$ </span>
            <span className="text-cyan-300">cd {pathname}</span>
          </div>

          {/* Line 2: Error message */}
          <div
            ref={el => lineRefs.current[1] = el}
            className="mb-2 opacity-0"
          >
            <span className="text-red-400">bash: cd: {pathname}: No such file or directory</span>
          </div>

          {/* Line 3: find command */}
          <div
            ref={el => lineRefs.current[2] = el}
            className="mb-2 opacity-0"
          >
            <span className="text-green-400">caleb@portfolio</span>
            <span className="text-white">:</span>
            <span className="text-blue-400">~</span>
            <span className="text-white">$ </span>
            <span className="text-cyan-300">find . -name "page"</span>
          </div>

          {/* Line 4: Comment */}
          <div
            ref={el => lineRefs.current[3] = el}
            className="mb-2 opacity-0"
          >
            <span className="text-gray-500"># No results found</span>
          </div>

          {/* Line 5: echo command */}
          <div
            ref={el => lineRefs.current[4] = el}
            className="mb-2 opacity-0"
          >
            <span className="text-green-400">caleb@portfolio</span>
            <span className="text-white">:</span>
            <span className="text-blue-400">~</span>
            <span className="text-white">$ </span>
            <span className="text-cyan-300">echo $?</span>
          </div>

          {/* Line 6: 404 output */}
          <div
            ref={el => lineRefs.current[5] = el}
            className="mb-2 opacity-0"
          >
            <span className="text-purple-400">404</span>
          </div>

          {/* Line 7: cat command */}
          <div
            ref={el => lineRefs.current[6] = el}
            className="mb-2 opacity-0"
          >
            <span className="text-green-400">caleb@portfolio</span>
            <span className="text-white">:</span>
            <span className="text-blue-400">~</span>
            <span className="text-white">$ </span>
            <span className="text-cyan-300">cat error.log</span>
          </div>

          {/* Line 8: Error log output with cursor */}
          <div
            ref={el => lineRefs.current[7] = el}
            className="mb-6 opacity-0"
          >
            <span className="text-yellow-400">The page you're looking for seems to have wandered off...</span>
            <span className="inline-block w-2 h-4 bg-white ml-1 cursor-blink"></span>
          </div>

          {/* Suggestion Links */}
          <div
            ref={el => lineRefs.current[8] = el}
            className="pt-6 border-t border-gray-800 opacity-0"
          >
            <div className="text-gray-500 text-xs uppercase tracking-wider mb-4">Try these instead:</div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 bg-transparent border border-gray-700 rounded-md text-white hover:border-green-400 hover:bg-green-400/5 transition-all duration-200"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                ~/home
              </a>
              <a
                href="/code"
                className="inline-flex items-center gap-2 px-4 py-2 bg-transparent border border-gray-700 rounded-md text-white hover:border-green-400 hover:bg-green-400/5 transition-all duration-200"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6"/>
                  <polyline points="8 6 2 12 8 18"/>
                </svg>
                /code
              </a>
              <a
                href="/photography"
                className="inline-flex items-center gap-2 px-4 py-2 bg-transparent border border-gray-700 rounded-md text-white hover:border-green-400 hover:bg-green-400/5 transition-all duration-200"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                /photos
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
