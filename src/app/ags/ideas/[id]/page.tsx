/**
 * /ags/ideas/[id] - AI-Generated Startup Idea Detail
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface IdeaDetail {
  id: string;
  name: string;
  tagline: string;
  problem: string;
  solution: string;
  market: {
    tam: string;
    growth: string;
    segment: string;
  };
  moat: string;
  revenueModel: string;
  targetCustomer: string;
  metrics: Array<{ key: string; target: string; timeline: string }>;
  timeline: Array<{ month: number; milestone: string }>;
  techStack: string[];
  competitiveAdvantage: string;
  score: number;
  generatedAt: string;
  status: string;
  applicationsCount: number;
}

export default function IdeaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [idea, setIdea] = useState<IdeaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchIdea(params.id as string);
    }
  }, [params.id]);

  async function fetchIdea(id: string) {
    try {
      setLoading(true);
      const response = await fetch(`/api/ags/ideas/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Idea not found');
        }
        throw new Error('Failed to fetch idea');
      }

      const data = await response.json();
      setIdea(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading idea...</p>
        </div>
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error || 'Idea not found'}</p>
          <button
            onClick={() => router.push('/ags/ideas')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
          >
            Back to Ideas
          </button>
        </div>
      </div>
    );
  }

  if (showApplicationForm) {
    return <ApplicationForm ideaId={idea.id} ideaName={idea.name} onBack={() => setShowApplicationForm(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push('/ags/ideas')}
            className="text-purple-300 hover:text-purple-200 mb-4 flex items-center gap-2"
          >
            ← Back to Ideas
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">{idea.name}</h1>
              <p className="text-xl text-gray-300">{idea.tagline}</p>
            </div>
            <div className="bg-purple-600 text-white px-4 py-2 rounded-full text-xl font-bold">
              {idea.score}/100
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Apply CTA */}
        <div className="bg-purple-900 border-2 border-purple-500 rounded-lg p-8 mb-12 text-center">
          <h2 className="text-2xl font-bold mb-4">🚀 Apply to Build This Startup</h2>
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <div className="text-3xl mb-2">💰</div>
              <div className="font-bold">$500K Funding</div>
              <div className="text-sm text-gray-400">Day 1</div>
            </div>
            <div>
              <div className="text-3xl mb-2">✅</div>
              <div className="font-bold">Pre-Validated</div>
              <div className="text-sm text-gray-400">Score {idea.score}/100</div>
            </div>
            <div>
              <div className="text-3xl mb-2">🤖</div>
              <div className="font-bold">AI Co-Founder</div>
              <div className="text-sm text-gray-400">24/7 Advisor</div>
            </div>
          </div>
          <button
            onClick={() => setShowApplicationForm(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors"
          >
            Apply Now →
          </button>
          <p className="text-sm text-gray-400 mt-4">{idea.applicationsCount} {idea.applicationsCount === 1 ? 'founder has' : 'founders have'} applied</p>
        </div>

        {/* Problem */}
        <Section title="❓ Problem" content={idea.problem} />

        {/* Solution */}
        <Section title="💡 Solution" content={idea.solution} />

        {/* Market */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">📈 Market</h2>
          <div className="bg-gray-800 rounded-lg p-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Addressable Market (TAM):</span>
              <span className="font-bold">{idea.market.tam}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Annual Growth Rate:</span>
              <span className="font-bold text-green-400">{idea.market.growth}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Target Segment:</span>
              <span className="font-bold">{idea.market.segment}</span>
            </div>
          </div>
        </div>

        {/* Moat */}
        <Section title="🏰 Competitive Moat" content={idea.moat} />

        {/* Revenue Model */}
        <Section title="💰 Revenue Model" content={idea.revenueModel} />

        {/* Target Customer */}
        <Section title="🎯 Target Customer" content={idea.targetCustomer} />

        {/* Metrics */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">📊 Key Metrics (12-Month Targets)</h2>
          <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            {idea.metrics.map((metric, i) => (
              <div key={i}>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-purple-400">{metric.key}</span>
                  <span className="text-2xl font-bold">{metric.target}</span>
                </div>
                <p className="text-sm text-gray-400">{metric.timeline}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">🗓️ Roadmap</h2>
          <div className="bg-gray-800 rounded-lg p-6">
            {idea.timeline.map((item, i) => (
              <div key={i} className="flex gap-4 mb-4 last:mb-0">
                <div className="flex-shrink-0 w-20 text-right">
                  <span className="bg-purple-600 text-white px-3 py-1 rounded font-bold text-sm">
                    Month {item.month}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-300">{item.milestone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">🛠️ Tech Stack</h2>
          <div className="flex flex-wrap gap-3">
            {idea.techStack.map(tech => (
              <span key={tech} className="bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Competitive Advantage */}
        <Section title="🏆 Why You'll Win" content={idea.competitiveAdvantage} />

        {/* Bottom CTA */}
        <div className="bg-purple-900 border-2 border-purple-500 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Build This?</h2>
          <button
            onClick={() => setShowApplicationForm(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors"
          >
            Apply Now →
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}

function ApplicationForm({ ideaId, ideaName, onBack }: { ideaId: string; ideaName: string; onBack: () => void }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    linkedIn: '',
    github: '',
    twitter: '',
    bio: '',
    experience: '',
    commitment: 'Full-time'
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/ags/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId,
          ...formData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Application failed');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center px-6">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-4xl font-bold mb-4">Application Submitted!</h1>
          <p className="text-xl text-gray-300 mb-8">
            Thank you for applying to build <strong>{ideaName}</strong>.
            We'll review your application and contact you within 48 hours.
          </p>
          <button
            onClick={() => router.push('/ags/ideas')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold"
          >
            Browse More Ideas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button
          onClick={onBack}
          className="text-purple-300 hover:text-purple-200 mb-6 flex items-center gap-2"
        >
          ← Back to Idea
        </button>

        <h1 className="text-3xl font-bold mb-2">Apply to Build {ideaName}</h1>
        <p className="text-gray-400 mb-8">Tell us why you're the right founder for this idea.</p>

        {error && (
          <div className="bg-red-900 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">LinkedIn</label>
            <input
              type="url"
              placeholder="https://linkedin.com/in/yourprofile"
              value={formData.linkedIn}
              onChange={e => setFormData({ ...formData, linkedIn: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">GitHub</label>
            <input
              type="url"
              placeholder="https://github.com/yourusername"
              value={formData.github}
              onChange={e => setFormData({ ...formData, github: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Twitter</label>
            <input
              type="text"
              placeholder="@yourhandle"
              value={formData.twitter}
              onChange={e => setFormData({ ...formData, twitter: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Why are you the right founder? * (50-2000 chars)</label>
            <textarea
              required
              minLength={50}
              maxLength={2000}
              rows={4}
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:border-purple-500 focus:outline-none"
              placeholder="Tell us about your passion, vision, and why you're uniquely positioned to build this..."
            />
            <p className="text-sm text-gray-500 mt-1">{formData.bio.length} / 2000 characters</p>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Relevant Experience * (100-5000 chars)</label>
            <textarea
              required
              minLength={100}
              maxLength={5000}
              rows={6}
              value={formData.experience}
              onChange={e => setFormData({ ...formData, experience: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:border-purple-500 focus:outline-none"
              placeholder="Describe your technical skills, industry experience, previous startups, relevant achievements..."
            />
            <p className="text-sm text-gray-500 mt-1">{formData.experience.length} / 5000 characters</p>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Commitment Level *</label>
            <select
              required
              value={formData.commitment}
              onChange={e => setFormData({ ...formData, commitment: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:border-purple-500 focus:outline-none"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Nights & Weekends">Nights & Weekends</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-bold text-lg transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}
