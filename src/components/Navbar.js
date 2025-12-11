export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-white font-bold text-xl">
            <a href="/">
              Caleb Han
            </a>
          </div>
          <div className="flex space-x-8">
            <a href="/code" className="text-white hover:text-gray-300 transition-colors">
              Code
            </a>
            <a href="/photography" className="text-white hover:text-gray-300 transition-colors">
              Photography
            </a>
            <a href="/about" className="text-white hover:text-gray-300 transition-colors">
              About Me
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}