
import { Shield } from 'lucide-react';

const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Shield className="h-8 w-8 text-primary-blue" />
      <span className="font-bold text-xl">Griev Ease</span>
    </div>
  );
};

export default Logo;
