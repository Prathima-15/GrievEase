
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from './Logo';
import { useAuth } from '@/contexts/AuthContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, isAdmin, user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/petitions?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const commonNavItems = [
    { to: '/', label: 'Home' },
    { to: '/petitions', label: 'Browse Petitions' },
    { to: '/about', label: 'About' },
  ];

  const userNavItems = isAuthenticated && !isAdmin
    ? [
        { to: '/petitions/create', label: 'Create Petition' },
        { to: '/petitions/my-petitions', label: 'My Petitions' },
      ]
    : [];

  const adminNavItems = isAdmin
    ? [{ to: '/dashboard', label: 'Dashboard' }]
    : [];

  const navItems = [...commonNavItems, ...userNavItems, ...adminNavItems];

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Logo />
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <ul className="flex space-x-8">
              {navItems.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-gray-700 hover:text-primary-blue transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search petitions..."
                className="py-2 pl-10 pr-4 rounded-full border border-blue-border focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </form>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">
                  Hi, {user?.firstName}
                </span>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link to="/sign-in">
                <Button
                  variant="default"
                  className="bg-primary-blue hover:bg-blue-600 text-white"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-500 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden px-4 py-2 pb-4 border-t border-gray-200">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search petitions..."
                className="w-full py-2 pl-10 pr-4 rounded-full border border-blue-border focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </form>
          
          <ul className="space-y-4">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="block text-gray-700 hover:text-primary-blue transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="flex flex-col space-y-4">
                <span className="text-sm font-medium">
                  Hi, {user?.firstName}
                </span>
                <Button variant="outline" onClick={handleSignOut} className="w-full">
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link to="/sign-in" onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant="default"
                  className="w-full bg-primary-blue hover:bg-blue-600 text-white"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
