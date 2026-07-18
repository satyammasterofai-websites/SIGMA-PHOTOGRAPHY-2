import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { Camera, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthStore } from '../store/useAuthStore';
import { ADMIN_EMAILS } from '../components/AuthProvider';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = location.state?.redirectTo || searchParams.get('redirect');
  const template = location.state?.template;

  const handleCustomRedirect = async (user: any) => {
    try {
      const isAdminEmail = user.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (redirectTo) {
         navigate(redirectTo, { state: { template } });
         return;
      }
      
      if (isAdminEmail || (userDoc.exists() && userDoc.data().role === 'admin')) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Permission error redirecting:", error);
      // Fallback
      if (redirectTo) {
         navigate(redirectTo, { state: { template } });
         return;
      }
      if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Successfully logged in');
      await handleCustomRedirect(userCred.user);
    } catch (error: any) {
      toast.error(error.message || 'Password or Email Incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(auth, provider);
      toast.success('Successfully logged in with Google');
      await handleCustomRedirect(userCred.user);
    } catch (error: any) {
      toast.error(error.message || 'Failed to log in with Google');
      console.error('Google login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF0F5] via-[#FFE4E1] to-[#FFC0CB] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative text-brand-navy">
      <div className="absolute top-6 left-6 md:top-8 md:left-8">
        <Link to="/" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brand-purple transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
          <ArrowLeft className="w-4 h-4" /> Go Back to Site
        </Link>
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Link to="/">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-premium text-white shadow-xl shadow-brand-purple/20 transition-transform hover:scale-110">
              <Camera className="w-8 h-8 absolute z-10" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent animate-[spin_3s_linear_infinite]" />
            </div>
          </Link>
        </div>
        <h2 className="mt-2 text-center text-4xl font-display font-extrabold text-brand-navy">
          Welcome Back
        </h2>
        <p className="mt-2 text-center text-sm font-medium text-brand-slate">
          Sign in to access your luxury cinematic templates.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-brand-purple/5 sm:rounded-3xl sm:px-10 border border-brand-purple/10">
          <form className="space-y-6" onSubmit={handleEmailLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm bg-gray-50"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm bg-gray-50"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-premium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple transition-all disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple transition-colors disabled:opacity-50"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google logo" />
                Sign in with Google
              </button>
            </div>
          </div>

          <div className="mt-8 text-center bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-bold text-brand-purple hover:text-brand-indigo">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
