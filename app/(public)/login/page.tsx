'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/navigation/Navbar';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/auth.service';
import { Shield, User, Lock, Mail } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function submit(e: any) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const user: any = await authService.login({ email, password });
      
      // Redirect based on role
      if (user.role === 'POLICE' || user.role === 'ADMIN') {
        router.push('/police');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center p-6 relative overflow-hidden">
        
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] -z-10" />

        <Card className="w-full max-w-md p-8 shadow-2xl border-slate-800 bg-slate-900/60 backdrop-blur-xl">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Welcome Back</h1>
            <p className="text-sm text-slate-400 mt-2">Sign in to the Smart Policing Portal</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input 
                  type="email"
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="Enter your email"
                  className="pl-10 bg-slate-950/50 border-slate-800 focus:border-blue-500/50 transition-colors"
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
                  placeholder="Enter your password"
                  className="pl-10 bg-slate-950/50 border-slate-800 focus:border-blue-500/50 transition-colors"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-blue-500/25 transition-all"
              disabled={isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Secure Login'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400 border-t border-slate-800 pt-6">
            <p>Are you a citizen without an account?</p>
            <Link href="/register" className="text-blue-400 hover:text-blue-300 hover:underline mt-1 inline-block transition-colors font-medium">
              Register for the Citizen Portal
            </Link>
          </div>
        </Card>
      </main>
    </>
  );
}
