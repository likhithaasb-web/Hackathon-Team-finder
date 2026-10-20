import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Github, Twitter, Linkedin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                Hack<span className="text-brand-500">Mate</span>
              </span>
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Find your dream hackathon teammates, match by complementary skills, communicate in real time, and ship extraordinary projects together.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
              <li><Link to="/discover" className="hover:text-brand-500 transition-colors">Find Teammates</Link></li>
              <li><Link to="/hackathons" className="hover:text-brand-500 transition-colors">Explore Hackathons</Link></li>
              <li><Link to="/teams" className="hover:text-brand-500 transition-colors">Browse Teams</Link></li>
              <li><Link to="/teams/create" className="hover:text-brand-500 transition-colors">Create a Team</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-3">
              Resources
            </h4>
            <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
              <li><Link to="/help" className="hover:text-brand-500 transition-colors">Community Guidelines</Link></li>
              <li><Link to="/help#faq" className="hover:text-brand-500 transition-colors">Frequently Asked Questions</Link></li>
              <li><a href="http://localhost:5000/api/v1/docs" target="_blank" rel="noreferrer" className="hover:text-brand-500 transition-colors">REST API Docs</a></li>
              <li><Link to="/help#feedback" className="hover:text-brand-500 transition-colors">Send Feedback</Link></li>
            </ul>
          </div>

          {/* Legal & Social */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-3">
              Connect & Legal
            </h4>
            <div className="flex space-x-3 mb-4">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-dark-card flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-dark-card flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-dark-card flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Privacy Policy • Terms of Service
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 dark:border-dark-border flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 dark:text-gray-500">
          <p>© {new Date().getFullYear()} HackMate Inc. All rights reserved.</p>
          <p className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
            <span>for developers & innovators worldwide</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
