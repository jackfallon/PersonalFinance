import { useState } from "react";
import { Alert, AlertDescription, AlertTitle, } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const SignupPage = () => {
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState({
        email: '', 
        password: '', 
        confirmPassword: '',
        fullName: '',
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (userDetails.password !== userDetails.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            const response = await fetch('http://localhost:5454/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userDetails.email, password: userDetails.password, fullName: userDetails.fullName })
            });
            if (!response.ok){
                const errorData = await response.json();
                throw new Error(errorData.message ||'Signup failed');
            }
            //redirect to login page on success
            navigate('/auth/signin');
            
        } catch (err) {
            setError(err.message ||'Signup failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
                <h2 className="text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        onChange={e => setUserDetails({...userDetails, fullName: e.target.value})}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        onChange={e => setUserDetails({ ...userDetails, email: e.target.value })}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        onChange={e => setUserDetails({ ...userDetails, password: e.target.value })}
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        onChange={e => setUserDetails({ ...userDetails, confirmPassword: e.target.value })}
                    />
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Sign up
                    </button>
                </form>
            </div>
        </div>
    );
};
