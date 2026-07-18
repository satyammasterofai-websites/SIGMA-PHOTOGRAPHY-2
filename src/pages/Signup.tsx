import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { Camera, ImagePlus, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { fileToBase64 } from '../lib/utils';
import { ADMIN_EMAILS } from '../components/AuthProvider';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [photoBase64, setPhotoBase64] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCustomRedirect = (userEmail: string | null) => {
    if (userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase())) {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        setPhotoBase64(base64);
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== repeatPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName: name, photoURL: photoBase64 });
      
      try {
        await setDoc(doc(db, 'users', userCred.user.uid), {
          uid: userCred.user.uid,
          email,
          displayName: name,
          photoURL: photoBase64,
          role: 'user',
          createdAt: new Date().toISOString()
        });
      } catch (dbError) {
        console.error("Firestore error saving user: ", dbError);
      }

      toast.success('Successfully registered');
      handleCustomRedirect(userCred.user.email);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast.error('User already exists. Sign in?');
      } else {
        toast.error(error.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(auth, provider);
      
      try {
        const userDoc = await getDoc(doc(db, 'users', userCred.user.uid));
        if (!userDoc.exists()) {
          await setDoc(doc(db, 'users', userCred.user.uid), {
            uid: userCred.user.uid,
            email: userCred.user.email,
            displayName: userCred.user.displayName || '',
            photoURL: userCred.user.photoURL || '',
            role: 'user',
            createdAt: new Date().toISOString()
          });
        }
      } catch (dbError) {
        console.error("Firestore error with Google Sign up: ", dbError);
      }
      toast.success('Successfully registered with Google');
      handleCustomRedirect(userCred.user.email);
    } catch (error: any) {
      toast.error(error.message || 'Failed to register with Google');
      console.error('Google signup error:', error);
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
        <h2 className="mt-4 text-center text-4xl font-display font-extrabold text-brand-navy">
          Create an Account
        </h2>
        <p className="mt-2 text-center text-sm font-medium text-brand-slate">
          Join SIGMAPHOTOGRAPHY to start crafting your memories.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-brand-purple/5 sm:rounded-3xl sm:px-10 border border-brand-purple/10">
          <form className="space-y-4" onSubmit={handleSignup}>
            
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center group hover:border-brand-purple hover:bg-brand-purple/5 transition-all cursor-pointer">
                {photoBase64 ? (
                  <img src={photoBase64} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus className="w-8 h-8 text-gray-400 group-hover:text-brand-purple transition-colors" />
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <span className="text-xs text-brand-purple mt-2 font-medium">Upload Profile Photo</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm bg-gray-50"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm bg-gray-50"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm bg-gray-50"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Repeat Password</label>
                <div className="mt-1">
                  <input
                    type="password"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm bg-gray-50"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-premium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple transition-all disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create account'}
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
                onClick={handleGoogleSignup}
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
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-brand-purple hover:text-brand-indigo">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
