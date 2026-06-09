'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BookOpen, Zap, TrendingUp, Shield, Users, Clock } from 'lucide-react';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <main className="flex flex-1 flex-col items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-b from-sakura-100/40 to-transparent blur-3xl rounded-full" />
        <div className="absolute bottom-1/3 right-10 w-80 h-80 bg-indigo-100/30 blur-3xl rounded-full animate-pulse" />
        <div className="absolute top-1/2 left-10 w-64 h-64 bg-sage-100/30 blur-3xl rounded-full animate-pulse delay-700" />
      </div>

      {/* Hero Section */}
      <section className="relative w-full px-4 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="mx-auto max-w-5xl">
          {/* Badge */}
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/60 backdrop-blur-md border border-sakura-200/50 px-4 py-2 shadow-lg">
              <span className="flex h-2 w-2 rounded-full bg-sakura-500 animate-pulse" />
              <span className="text-sm font-medium text-gray-700">
                Welcome to the future of learning
              </span>
            </div>
          </div>

          {/* Main Heading */}
          <div className="space-y-6 text-center mb-12">
            <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-sakura-600 via-indigo-600 to-sage-600 bg-clip-text text-transparent">
                Kenmei
              </span>
            </h1>
            
            <p className="font-display text-2xl md:text-3xl font-semibold text-gray-800">
              Wisdom Through Learning
            </p>
            
            <p className="mx-auto max-w-2xl text-lg md:text-xl text-gray-600 leading-relaxed">
              Transform your learning journey with intelligent flashcards, spaced repetition,
              and real-time progress tracking. Designed for K-12 students and educators who
              want smarter, more effective studying.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center items-center mb-20">
            {isLoading ? (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-sakura-600 animate-spin" />
              </div>
            ) : isLoggedIn ? (
              <Link
                href="/dashboard"
                className="group relative inline-block"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-sakura-600 to-indigo-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
                <div className="relative px-8 py-4 bg-white rounded-xl font-semibold text-gray-900 group-hover:bg-gray-50 transition">
                  Go to Dashboard →
                </div>
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signup"
                  className="group relative inline-block"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-sakura-600 to-indigo-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
                  <div className="relative px-8 py-4 bg-white rounded-xl font-semibold text-gray-900 group-hover:bg-gray-50 transition">
                    Get Started Free →
                  </div>
                </Link>
                <Link
                  href="/auth/login"
                  className="px-8 py-4 rounded-xl border-2 border-gray-300 font-semibold text-gray-700 hover:bg-gray-50/80 transition-all duration-300 hover:border-sakura-400"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto mb-16">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-sakura-600">100%</div>
              <p className="text-sm md:text-base text-gray-600 mt-1">Secure & Private</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-indigo-600">AI-Powered</div>
              <p className="text-sm md:text-base text-gray-600 mt-1">Learning</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-sage-600">K-12</div>
              <p className="text-sm md:text-base text-gray-600 mt-1">Focused</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative w-full px-4 py-20 md:py-32">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Learn Better
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful tools designed to make studying more effective, engaging, and enjoyable
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-sakura-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sakura-100 to-sakura-50 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-sakura-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Flashcards</h3>
                <p className="text-gray-600">
                  Create beautiful, interactive flashcards with images, text, and multimedia. Our
                  intelligent system learns your pace.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Spaced Repetition</h3>
                <p className="text-gray-600">
                  Based on scientific research (SM-2 algorithm), our system optimizes when you
                  review cards for maximum retention.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-sage-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sage-100 to-sage-50 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-sage-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Track Progress</h3>
                <p className="text-gray-600">
                  Detailed analytics show your learning journey with memory growth scores and
                  mastery levels for every subject.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Teacher Tools</h3>
                <p className="text-gray-600">
                  Powerful classroom management. Create classes, assign decks, monitor progress,
                  and provide feedback all in one place.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Study Sessions</h3>
                <p className="text-gray-600">
                  Focused, timed study sessions keep you on track. Review only the cards due
                  today for optimal learning efficiency.
                </p>
              </div>
            </div>

            {/* Feature 6 - Data Privacy */}
            <div className="group relative lg:col-span-1">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Data Privacy</h3>
                <p className="text-gray-600">
                  <strong>Full compliance with Ohio Senate Bill 29.</strong> Your data is secure, private,
                  and never sold. Learn with complete peace of mind.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="relative w-full px-4 py-16 md:py-24 bg-gradient-to-r from-slate-900/5 to-slate-900/10">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-3 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-2 mb-8">
            <Shield className="w-5 h-5 text-emerald-600" />
            <span className="font-medium text-emerald-900">Trusted & Secure</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Your Privacy is Our Priority
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Kenmei is fully compliant with Ohio Senate Bill 29, ensuring complete data protection
            and privacy for students and educators. We never sell your data and maintain industry-leading
            security standards.
          </p>
          <div className="grid grid-cols-3 gap-4 md:gap-8 py-8 border-y border-gray-200/50">
            <div>
              <div className="text-2xl font-bold text-emerald-600">256-bit</div>
              <p className="text-sm text-gray-600 mt-1">Encryption</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">GDPR</div>
              <p className="text-sm text-gray-600 mt-1">Compliant</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">SB 29</div>
              <p className="text-sm text-gray-600 mt-1">Certified</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative w-full px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl">
          <div className="bg-gradient-to-br from-sakura-600 via-indigo-600 to-sage-600 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-white blur-3xl rounded-full animate-pulse" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of students mastering their subjects with Kenmei's intelligent
                learning system.
              </p>

              {isLoading ? (
                <div className="inline-flex gap-2">
                  <div className="w-8 h-8 rounded-full border-4 border-white border-t-transparent animate-spin" />
                </div>
              ) : isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="inline-block px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold hover:bg-gray-50 transition-all duration-300 hover:shadow-2xl"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/auth/signup"
                    className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold hover:bg-gray-50 transition-all duration-300 hover:shadow-2xl"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    href="/auth/login"
                    className="px-8 py-4 border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition-all duration-300"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative w-full px-4 py-12 border-t border-gray-200/50 bg-white/50 backdrop-blur-md">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-sakura-600 transition">Features</Link></li>
                <li><Link href="#" className="hover:text-sakura-600 transition">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-sakura-600 transition">About</Link></li>
                <li><Link href="#" className="hover:text-sakura-600 transition">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-sakura-600 transition">Privacy</Link></li>
                <li><Link href="#" className="hover:text-sakura-600 transition">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Community</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-sakura-600 transition">Twitter</Link></li>
                <li><Link href="#" className="hover:text-sakura-600 transition">Discord</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200/50 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
              <div>
                <p className="font-semibold text-gray-900 mb-1">Kenmei</p>
                <p className="text-sm text-gray-600">
                  Secure learning platform for K-12 education. <span className="font-semibold">Ohio SB 29 Compliant.</span>
                </p>
              </div>
              <p className="text-sm text-gray-500 mt-4 md:mt-0">
                © 2024 Kenmei. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
