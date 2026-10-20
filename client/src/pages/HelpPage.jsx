import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  HelpCircle,
  Shield,
  MessageSquare,
  Sparkles,
  Send,
  CheckCircle2,
} from 'lucide-react';

export default function HelpPage() {
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState('feature');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setSubmitted(true);
    toast.success('Thank you! Your feedback has been sent to our development team.');
    setFeedback('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center space-x-2">
          <span>Community Guidelines & Help Center</span>
          <HelpCircle className="w-6 h-6 text-brand-500" />
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Everything you need to know about teaming up and collaborating respectfully.
        </p>
      </div>

      {/* Community Guidelines */}
      <div className="p-6 rounded-2xl glass-card space-y-4">
        <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-dark-border">
          <Shield className="w-5 h-5 text-emerald-500" />
          <span>HackMate Community Core Values</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border space-y-1.5">
            <h4 className="font-bold text-gray-900 dark:text-white">1. Authentic Profile Information</h4>
            <p className="text-gray-500 leading-relaxed">
              Represent your actual skills, experience level, and availability honestly so your teammates can plan appropriately.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border space-y-1.5">
            <h4 className="font-bold text-gray-900 dark:text-white">2. No Ghosting Culture</h4>
            <p className="text-gray-500 leading-relaxed">
              If your schedule changes or you cannot participate, communicate with your team lead immediately rather than disappearing mid-sprint.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border space-y-1.5">
            <h4 className="font-bold text-gray-900 dark:text-white">3. Inclusive & Welcoming</h4>
            <p className="text-gray-500 leading-relaxed">
              Welcome teammates of all backgrounds, degrees, and seniority levels. Great hacks come from cross-disciplinary perspectives.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border space-y-1.5">
            <h4 className="font-bold text-gray-900 dark:text-white">4. Fair Credit & Open Collaboration</h4>
            <p className="text-gray-500 leading-relaxed">
              Honor open-source licenses, acknowledge all team contributors during submissions, and celebrate each other’s wins.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div id="faq" className="p-6 rounded-2xl glass-card space-y-4">
        <h2 className="text-base font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-dark-border">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3 text-xs">
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
              How do I invite a teammate directly to my team?
            </h4>
            <p className="text-gray-500 leading-relaxed">
              First connect with the user via their profile or the Discover page. Once connected, open your Team Detail page and click "+ Invite Teammate". You can also send them your team's shareable join code!
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
              What does the compatibility score mean?
            </h4>
            <p className="text-gray-500 leading-relaxed">
              It calculates the mathematical synergy between your skills, preferred team roles, and hackathon domain interests. It is designed to pair complementary disciplines (like frontend + backend or design + AI).
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
              Can I change my team leader if someone is unavailable?
            </h4>
            <p className="text-gray-500 leading-relaxed">
              Yes, current team leaders can transfer leadership to any existing team member directly from the Team Detail page.
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Form */}
      <div id="feedback" className="p-6 rounded-2xl glass-card space-y-4">
        <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-dark-border">
          <MessageSquare className="w-5 h-5 text-brand-500" />
          <span>Send Feedback or Request Features</span>
        </h2>

        <form onSubmit={handleSubmitFeedback} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Feedback Category
            </label>
            <select
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-xs"
            >
              <option value="feature">Feature Request</option>
              <option value="bug">Report a Bug</option>
              <option value="organizer">Hackathon Organizer Inquiry</option>
              <option value="general">General Suggestion</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Your Message / Suggestion
            </label>
            <textarea
              required
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What can we improve on HackMate? Let us know what features you want next..."
              className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-xs resize-none"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-glow"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Feedback</span>
          </button>
        </form>
      </div>
    </div>
  );
}
