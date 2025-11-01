
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MessageSquare, Users, CheckCircle, Shield } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-bg-light-blue text-black py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Griev Ease</h1>
          <p className="text-xl opacity-90 mb-0 max-w-2xl mx-auto">
            We're building a platform that connects citizens with authorities to resolve grievances efficiently and transparently.
          </p>
        </div>
      </section>
      
      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Griev Ease aims to transform the way citizens interact with government agencies by providing a streamlined platform for submitting, tracking, and resolving grievances.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-soft-blue p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={24} className="text-primary-blue" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Accessibility</h3>
              <p className="text-gray-600">
                Making it easy for all citizens, regardless of technical proficiency, to voice their concerns.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-soft-blue p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield size={24} className="text-primary-blue" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Transparency</h3>
              <p className="text-gray-600">
                Ensuring that citizens can track the progress of their grievances at every step.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-soft-blue p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={24} className="text-primary-blue" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Accountability</h3>
              <p className="text-gray-600">
                Holding authorities accountable for timely resolution of citizen concerns.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 px-4 bg-gray-100">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
          
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center bg-white p-6 rounded-lg shadow-md">
              <div className="md:w-1/4 text-center mb-4 md:mb-0">
                <div className="w-12 h-12 rounded-full bg-primary-blue text-white text-xl font-bold flex items-center justify-center mx-auto">
                  1
                </div>
              </div>
              <div className="md:w-3/4">
                <h3 className="text-xl font-semibold mb-2">Create a Petition</h3>
                <p className="text-gray-600">
                  Users can easily create petitions by providing details about their issues, including descriptions, locations, and supporting media. Our speech-to-text feature makes it accessible for everyone.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center bg-white p-6 rounded-lg shadow-md">
              <div className="md:w-1/4 text-center mb-4 md:mb-0">
                <div className="w-12 h-12 rounded-full bg-primary-blue text-white text-xl font-bold flex items-center justify-center mx-auto">
                  2
                </div>
              </div>
              <div className="md:w-3/4">
                <h3 className="text-xl font-semibold mb-2">Gather Support</h3>
                <p className="text-gray-600">
                  Public petitions can be shared with the community to gather signatures and support. This collective action amplifies the voice of citizens and demonstrates the importance of addressing the issue.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center bg-white p-6 rounded-lg shadow-md">
              <div className="md:w-1/4 text-center mb-4 md:mb-0">
                <div className="w-12 h-12 rounded-full bg-primary-blue text-white text-xl font-bold flex items-center justify-center mx-auto">
                  3
                </div>
              </div>
              <div className="md:w-3/4">
                <h3 className="text-xl font-semibold mb-2">Review and Assignment</h3>
                <p className="text-gray-600">
                  Administrators review each petition and assign it to the appropriate department. This ensures that the right authorities are handling each issue based on their jurisdiction and expertise.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center bg-white p-6 rounded-lg shadow-md">
              <div className="md:w-1/4 text-center mb-4 md:mb-0">
                <div className="w-12 h-12 rounded-full bg-primary-blue text-white text-xl font-bold flex items-center justify-center mx-auto">
                  4
                </div>
              </div>
              <div className="md:w-3/4">
                <h3 className="text-xl font-semibold mb-2">Resolution and Updates</h3>
                <p className="text-gray-600">
                  As the petition progresses, users receive regular updates on its status. Once resolved, the petition is marked as completed with details about the actions taken by authorities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto ">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Team</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7"
                alt="Team Member"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="font-semibold text-lg">Sindhu L</h3>
              <p className="text-gray-600">Mentor</p>
            </div>
            
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
                alt="Team Member"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="font-semibold text-lg">Sadhasivam Arumugam</h3>
              <p className="text-gray-600">JMAN</p>
            </div>
            
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
                alt="Team Member"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="font-semibold text-lg">Praveen Raj M A</h3>
              <p className="text-gray-600">Data Corp</p>
            </div>

            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
                alt="Team Member"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="font-semibold text-lg">Sri Rama Krishnan</h3>
              <p className="text-gray-600">Capgemini</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-bg-light-blue text-black py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to make your voice heard?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of citizens who are creating meaningful change in their communities.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/petitions/create">
              <Button
                variant="outline"
                className="bg-primary-blue hover:bg-blue-600 text-white px-8 py-6 text-lg"
              >
                Create a Petition
              </Button>
            </Link>
            <Link to="/petitions">
              <Button
                variant="outline"
                className="border-primary-blue text-primary-blue hover:bg-blue-50 px-8 py-6 text-lg"
              >
                Browse Petitions
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
