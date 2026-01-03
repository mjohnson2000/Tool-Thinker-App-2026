"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Logo } from "@/components/Logo"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  
  // Close menu when route changes and scroll to top
  useEffect(() => {
    setIsMenuOpen(false)
    // Scroll to top on route change
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  
  // Helper function to handle link clicks
  const handleLinkClick = () => {
    setIsMenuOpen(false)
    // Scroll to top immediately
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
  
  const isActive = (path: string) => pathname === path
  const isToolsActive = pathname?.startsWith('/tools') || pathname === '/tools' || pathname === '/tools/frameworks' || pathname === '/consultation'
  const isMoreActive = pathname === '/podcasts' || pathname === '/books' || pathname === '/contact'

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Logo />

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
              className={`${isActive('/') ? 'text-gray-900 font-semibold border-b-2 border-gray-900' : 'text-gray-700'} hover:text-gray-900 pb-1`}
            >
              Home
            </Link>
            
            {/* Tools Dropdown */}
            <div className="relative group">
              <Link 
                href="/tools"
                className={`px-4 py-2 rounded-md flex items-center ${
                  isToolsActive 
                    ? 'bg-gray-900 text-white hover:bg-gray-800' 
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                Tools
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-1">
                  <Link href="/tools" onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })} className={`block px-4 py-2 text-sm hover:bg-gray-100 ${isActive('/tools') ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700'}`}>View All Tools</Link>
                  <div className="border-t border-gray-200 my-1"></div>
                  <Link href="/tools/frameworks" onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })} className={`block px-4 py-2 text-sm hover:bg-gray-100 ${isActive('/tools/frameworks') ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700'}`}>Framework Tools</Link>
                  <Link href="/tools/framework-navigator" onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })} className={`block px-4 py-2 text-sm hover:bg-gray-100 ${isActive('/tools/framework-navigator') ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700'}`}>Framework Navigator</Link>
                  <Link href="/tools/business-model-generator" onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })} className={`block px-4 py-2 text-sm hover:bg-gray-100 ${isActive('/tools/business-model-generator') ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700'}`}>Business Model Generator</Link>
                  <Link href="/tools/start-smart-os" onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })} className={`block px-4 py-2 text-sm hover:bg-gray-100 ${isActive('/tools/start-smart-os') || pathname?.startsWith('/tools/start-smart-os') ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700'}`}>Start Smart OS</Link>
                  <Link href="/tools/templates" onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })} className={`block px-4 py-2 text-sm hover:bg-gray-100 ${isActive('/tools/templates') ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700'}`}>Downloadable Templates</Link>
                  <Link href="/consultation" onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })} className={`block px-4 py-2 text-sm hover:bg-gray-100 ${isActive('/consultation') ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700'}`}>Free Consultation</Link>
                  <a href="https://alphahustler.tech/" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Alpha Hustler <span className="text-xs">↗</span>
                  </a>
                </div>
              </div>
            </div>

            <Link 
              href="/blogs" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
              className={`${isActive('/blogs') ? 'text-gray-900 font-semibold border-b-2 border-gray-900' : 'text-gray-700'} hover:text-gray-900 pb-1`}
            >
              Blogs
            </Link>
            <Link 
              href="/about" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
              className={`${isActive('/about') ? 'text-gray-900 font-semibold border-b-2 border-gray-900' : 'text-gray-700'} hover:text-gray-900 pb-1`}
            >
              About Us
            </Link>
            
            {/* More Dropdown */}
            <div className="relative group">
              <button className={`text-gray-700 hover:text-gray-900 flex items-center pb-1 ${
                isMoreActive ? 'text-gray-900 font-semibold border-b-2 border-gray-900' : ''
              }`}>
                More
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-1">
                  <Link href="/podcasts" onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })} className={`block px-4 py-2 text-sm hover:bg-gray-100 ${isActive('/podcasts') ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700'}`}>Podcasts</Link>
                  <Link href="/books" onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })} className={`block px-4 py-2 text-sm hover:bg-gray-100 ${isActive('/books') ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700'}`}>Books & Resources</Link>
                  <Link href="/contact" onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })} className={`block px-4 py-2 text-sm hover:bg-gray-100 ${isActive('/contact') ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700'}`}>Contact Us</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            className="md:hidden text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 rounded-md p-1"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-200 bg-white">
            <Link 
              href="/" 
              onClick={handleLinkClick}
              className={`block px-4 py-2 hover:bg-gray-100 ${isActive('/') ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700'}`}
            >
              Home
            </Link>
            <div className="px-4 py-2">
              <Link 
                href="/tools"
                onClick={handleLinkClick}
                className={`block font-semibold px-4 py-2 rounded-md mb-2 ${
                  isToolsActive && pathname === '/tools' ? 'bg-gray-100 text-gray-900' : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                Tools
              </Link>
              <div className="pl-4 space-y-1">
                <Link href="/tools" onClick={handleLinkClick} className={`block py-2 hover:bg-gray-100 ${isActive('/tools') ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700'}`}>View All Tools</Link>
                <Link href="/tools/frameworks" onClick={handleLinkClick} className={`block py-2 hover:bg-gray-100 ${isActive('/tools/frameworks') ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700'}`}>Framework Tools</Link>
                <Link href="/tools/framework-navigator" onClick={handleLinkClick} className={`block py-2 hover:bg-gray-100 ${isActive('/tools/framework-navigator') ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700'}`}>Framework Navigator</Link>
                <Link href="/tools/business-model-generator" onClick={handleLinkClick} className={`block py-2 hover:bg-gray-100 ${isActive('/tools/business-model-generator') ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700'}`}>Business Model Generator</Link>
                <Link href="/tools/start-smart-os" onClick={handleLinkClick} className={`block py-2 hover:bg-gray-100 ${isActive('/tools/start-smart-os') || pathname?.startsWith('/tools/start-smart-os') ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700'}`}>Start Smart OS</Link>
                <Link href="/tools/templates" onClick={handleLinkClick} className={`block py-2 hover:bg-gray-100 ${isActive('/tools/templates') ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700'}`}>Downloadable Templates</Link>
                <Link href="/consultation" onClick={handleLinkClick} className={`block py-2 hover:bg-gray-100 ${isActive('/consultation') ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700'}`}>Free Consultation</Link>
                <a href="https://alphahustler.tech/" target="_blank" rel="noopener noreferrer" onClick={handleLinkClick} className="block py-2 text-gray-700 hover:bg-gray-100">
                  Alpha Hustler <span className="text-xs">↗</span>
                </a>
              </div>
            </div>
            <Link 
              href="/blogs" 
              onClick={handleLinkClick}
              className={`block px-4 py-2 hover:bg-gray-100 ${isActive('/blogs') ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700'}`}
            >
              Blogs
            </Link>
            <Link 
              href="/about" 
              onClick={handleLinkClick}
              className={`block px-4 py-2 hover:bg-gray-100 ${isActive('/about') ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700'}`}
            >
              About Us
            </Link>
            <div className="px-4 py-2">
              <div className={`font-semibold px-4 py-2 rounded-md mb-2 ${
                isMoreActive ? 'bg-gray-100 text-gray-900' : 'text-gray-900'
              }`}>
                More
              </div>
              <div className="pl-4 space-y-1">
                <Link href="/podcasts" onClick={handleLinkClick} className={`block py-2 hover:bg-gray-100 ${isActive('/podcasts') ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700'}`}>Podcasts</Link>
                <Link href="/books" onClick={handleLinkClick} className={`block py-2 hover:bg-gray-100 ${isActive('/books') ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700'}`}>Books & Resources</Link>
                <Link href="/contact" onClick={handleLinkClick} className={`block py-2 hover:bg-gray-100 ${isActive('/contact') ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700'}`}>Contact Us</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

