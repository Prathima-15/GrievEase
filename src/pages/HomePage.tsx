
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, CheckCircle } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-bg-light-blue bg-dot-pattern py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-10 lg:mb-0 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Make Your Voice Heard
              </h1>
              <p className="text-xl mb-8 text-gray-700 max-w-lg">
                Create petitions that matter, gather support from your community, and drive real change with Grieve Ease.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  as={Link}
                  to="/petitions/create"
                  className="bg-primary-blue hover:bg-blue-600 text-white px-8 py-6 text-lg"
                >
                  Create a Petition
                </Button>
                <Button
                  as={Link}
                  to="/petitions"
                  variant="outline"
                  className="border-primary-blue text-primary-blue hover:bg-blue-50 px-8 py-6 text-lg"
                >
                  Browse Petitions
                </Button>
              </div>
            </div>
            <div className="lg:w-1/2 flex justify-center lg:justify-end">
              <img 
                src="https://images.unsplash.com/photo-1531297484001-80022131f5a1" 
                alt="People collaborating" 
                className="rounded-lg shadow-xl max-w-full h-auto"
                width="500"
                height="350"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-soft-blue p-4 rounded-full mb-6">
                <MessageSquare size={32} className="text-primary-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Create</h3>
              <p className="text-gray-600">
                Create a detailed petition with our easy-to-use tools. Add text, photos, and location details to make your case clear.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-soft-blue p-4 rounded-full mb-6">
                <Users size={32} className="text-primary-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Gather Support</h3>
              <p className="text-gray-600">
                Share your petition with your community, collect signatures, and build momentum for your cause.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-soft-blue p-4 rounded-full mb-6">
                <CheckCircle size={32} className="text-primary-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Create Change</h3>
              <p className="text-gray-600">
                Your petition will be reviewed by the relevant authorities, with updates provided throughout the process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-blue text-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to make a difference?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of citizens who have successfully created change in their communities.
          </p>
          <Button
            as={Link}
            to="/sign-up"
            variant="outline"
            className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
          >
            Get Started Today
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
