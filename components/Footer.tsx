import Link from "next/link"
import { Logo } from "@/components/Logo"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <Logo showText={true} size="sm" variant="light" />
            </div>
            <p className="text-sm">
              Tools That Help Founders Make Progress
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/tools" className="hover:text-white">Tools</Link></li>
              <li><Link href="/books" className="hover:text-white">Books & Resources</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/blogs" className="hover:text-white">Blogs</Link></li>
              <li><Link href="/podcasts" className="hover:text-white">Podcasts</Link></li>
              <li><Link href="/consultation" className="hover:text-white">Free Consultation</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Tools</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/tools/framework-navigator" className="hover:text-white">Framework Navigator</Link></li>
              <li><Link href="/tools/business-model-generator" className="hover:text-white">Business Model Generator</Link></li>
              <li><Link href="/tools/start-smart-os" className="hover:text-white">Start Smart OS</Link></li>
              <li><Link href="/tools/templates" className="hover:text-white">Templates</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>Copyright © {new Date().getFullYear()} All rights reserved. ToolThinker.com</p>
        </div>
      </div>
    </footer>
  )
}

