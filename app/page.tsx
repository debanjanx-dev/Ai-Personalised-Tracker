import Navbar from './components/Navbar';
import Button from './components/ui/Button';
import { WavyBackground } from './components/ui/wavy-background';
import { FeaturesSectionDemo } from './components/Features-Section';
import { Timeline } from './components/ui/timeline';
import { Spotlight } from './components/ui/spotlight-new';

const timelineData = [
  {
    title: "Sign Up",
    content: (
      <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-lg p-6">
        <h4 className="text-xl font-semibold mb-3 text-blue-400">Create Your Account</h4>
        <p className="text-gray-300">
          Get started by creating your StudySync account. It only takes a minute, and you'll have access to all our AI-powered learning tools.
        </p>
      </div>
    ),
  },
  {
    title: "Set Goals",
    content: (
      <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-lg p-6">
        <h4 className="text-xl font-semibold mb-3 text-blue-400">Define Your Learning Objectives</h4>
        <p className="text-gray-300">
          Tell us what you want to achieve. Our AI will help create a personalized learning path tailored to your goals and schedule.
        </p>
      </div>
    ),
  },
  {
    title: "Track Progress",
    content: (
      <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-lg p-6">
        <h4 className="text-xl font-semibold mb-3 text-blue-400">Monitor Your Journey</h4>
        <p className="text-gray-300">
          Watch your progress in real-time. Get detailed analytics and insights about your learning patterns and achievements.
        </p>
      </div>
    ),
  },
  {
    title: "Get Insights",
    content: (
      <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-lg p-6">
        <h4 className="text-xl font-semibold mb-3 text-blue-400">AI-Powered Recommendations</h4>
        <p className="text-gray-300">
          Receive personalized suggestions and tips to optimize your learning strategy based on your performance data.
        </p>
      </div>
    ),
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24">
        <WavyBackground className="max-w-6xl mx-auto px-4">
          <div className="text-center space-y-8">
            <div className="relative">
              <Spotlight>
                <h1 className="text-5xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100">
                  Supercharge Your Learning with AI-Powered Insights
                </h1>
              </Spotlight>
            </div>
            <p className="text-xl font-medium text-gray-300 max-w-2xl mx-auto">
              Track your progress, get personalized recommendations, and achieve your learning goals faster with AI assistance.
            </p>
            <div className="flex justify-center gap-4 pb-12">
              <button className="relative inline-flex h-14 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-6 py-1 text-base font-medium text-white backdrop-blur-3xl hover:bg-slate-900 transition-colors">
                  Get Started
                </span>
              </button>
              <button className="relative inline-flex h-14 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-white px-6 py-1 text-base font-medium text-slate-950 backdrop-blur-3xl hover:bg-gray-50 transition-colors">
                  Learn More
                </span>
              </button>
            </div>
          </div>
        </WavyBackground>
      </section>

      {/* Features Section */}
      <section className="w-full -mt-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400">
            Features You Won't Find Anywhere Else
          </h2>
          <p className="mt-4 text-gray-400 text-lg">
            Discover our unique set of tools designed to transform your learning experience
          </p>
        </div>
        <FeaturesSectionDemo />
      </section>

      {/* Timeline Section */}
      <section className="pt-20 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400">
            How to Use StudySync
          </h2>
          <p className="mt-4 text-gray-400 text-lg">
            Follow these simple steps to get started with your AI-powered learning journey
          </p>
        </div>
        <div className="max-w-7xl mx-auto">
          <Timeline data={timelineData} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Ready to Transform Your Learning Journey?
          </h2>
          <p className="text-xl text-gray-300 mb-8 font-medium">
            Join thousands of learners who are already benefiting from AI-powered insights.
          </p>
          <button className="relative inline-flex h-14 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-8 py-1 text-base font-medium text-white backdrop-blur-3xl hover:bg-slate-900 transition-colors">
              Start Free Trial
            </span>
          </button>
        </div>
      </section>

      {/* Footer Section */}
      
    </main>
  );
}