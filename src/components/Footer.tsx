
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Logo className="mb-4" />
            <p className="text-gray-600 mb-4 max-w-md">
              Griev Ease is a platform that helps citizens create and submit grievance petitions to the appropriate authorities.
            </p>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Griev Ease. All rights reserved.
            </p>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-medium text-gray-900 mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/help" className="text-gray-600 hover:text-primary-blue transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/guides" className="text-gray-600 hover:text-primary-blue transition-colors">
                  Guides
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-primary-blue transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-primary-blue transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-medium text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-primary-blue transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-primary-blue transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-gray-600 hover:text-primary-blue transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/accessibility" className="text-gray-600 hover:text-primary-blue transition-colors">
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
