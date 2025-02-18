import Button from './components/ui/Button';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Supercharge Your Learning with AI-Powered Insights
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Track your progress, get personalized recommendations, and achieve your learning goals faster with AI assistance.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="primary" size="lg">
                Get Started
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                📊
              </div>
              <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
              <p className="text-gray-600">
                Monitor your learning journey with detailed analytics and insights.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                🤖
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Recommendations</h3>
              <p className="text-gray-600">
                Get personalized suggestions based on your learning patterns.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                🎯
              </div>
              <h3 className="text-xl font-semibold mb-2">Goal Setting</h3>
              <p className="text-gray-600">
                Set and achieve your learning objectives with smart goal tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Learning Journey?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of learners who are already benefiting from AI-powered insights.
          </p>
          <Button variant="primary" size="lg">
            Start Free Trial
          </Button>
        </div>
      </section>
    </main>
  );
}
