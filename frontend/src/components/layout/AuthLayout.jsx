import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";

export const AuthenticatedLayout = ({ children, title }) => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('jwt');
    navigate('/auth/signin');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">

            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleSignOut}
            >
              <LogOut size={18} />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
      <div className="container mx-auto p-6">
        {children}
      </div>
    </div>
  );
};