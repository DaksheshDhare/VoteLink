import React from 'react';
import { Vote, Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  userEmail?: string;
  onLogout?: () => void;
  showUserInfo?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  userEmail, 
  onLogout, 
  showUserInfo = false 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-black/10 backdrop-blur-lg border-b border-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Vote className="text-black" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-black"></h1>
              <p className="text-xs text-black/60 hidden sm:block">Secure Digital Voting Platform</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-black/80">
              <Shield size={16} />
              <span className="text-sm">Secure Session</span>
            </div>
            
            {showUserInfo && userEmail && (
              <div className="text-black/80 text-sm">
                <span className="hidden lg:inline">Logged in as: </span>
                <span className="font-medium">{userEmail}</span>
              </div>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-500/20 border border-red-500/30 
                         text-red-200 rounded-lg font-medium
                         hover:bg-red-500/30 transition-all duration-300 text-sm"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-black/80 hover:text-black transition-colors duration-300"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-black/20 py-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-black/80 px-2">
                <Shield size={16} />
                <span className="text-sm">Secure Session</span>
              </div>
              
              {showUserInfo && userEmail && (
                <div className="text-black/80 text-sm px-2">
                  <p>Logged in as:</p>
                  <p className="font-medium">{userEmail}</p>
                </div>
              )}

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="w-full text-left px-2 py-2 bg-red-500/20 border border-red-500/30 
                           text-red-200 rounded-lg font-medium
                           hover:bg-red-500/30 transition-all duration-300 text-sm"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};