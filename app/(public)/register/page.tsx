'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/navigation/Navbar';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/auth.service';
import { User, Lock, Mail, UserPlus } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CITIZEN' | 'POLICE'>('CITIZEN');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function submit(e: any) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await authService.register({ name, email, password, role });
      
      // Auto-login after registration
      await authService.login({ email, password });
      router.push(role === 'POLICE' ? '/police' : '/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Email might already exist.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center p-6 relative overflow-hidden">
        
        {/* Background glow effects */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] -z-10" />

        <Card className="w-full max-w-md p-8 shadow-2xl border-slate-800 bg-slate-900/60 backdrop-blur-xl">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-4 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <UserPlus className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">{role === 'CITIZEN' ? 'Citizen' : 'Police'} Portal</h1>
            <p className="text-sm text-slate-400 mt-2">Create an account to {role === 'CITIZEN' ? 'report incidents' : 'manage cases'}</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setRole('CITIZEN')}
                className={`p-3 rounded-xl border transition-all text-sm font-medium ${
                  role === 'CITIZEN' 
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                    : 'bg-slate-950/30 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                Citizen
              </button>
              <button
                type="button"
                onClick={() => setRole('POLICE')}
                className={`p-3 rounded-xl border transition-all text-sm font-medium ${
                  role === 'POLICE' 
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                    : 'bg-slate-950/30 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                Police
              </button>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input 
                  type="text"
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="John Doe"
                  className="pl-10 bg-slate-950/50 border-slate-800 focus:border-indigo-500/50 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input 
                  type="email"
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="Enter your email"
                  className="pl-10 bg-slate-950/50 border-slate-800 focus:border-indigo-500/50 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Choose a secure password"
                  className="pl-10 bg-slate-950/50 border-slate-800 focus:border-indigo-500/50 transition-colors"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium shadow-lg shadow-indigo-500/25 transition-all"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Register'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400 border-t border-slate-800 pt-6">
            <p>Already have an account?</p>
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 hover:underline mt-1 inline-block transition-colors font-medium">
              Sign in here
            </Link>
          </div>
        </Card>
      </main>
    </>
  );
}
