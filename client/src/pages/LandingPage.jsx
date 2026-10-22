import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import LoginModal from '../components/LoginModal.jsx';
import {
  Users,
  Sparkles,
  Trophy,
  Zap,
  ArrowRight,
  Shield,
  MessageSquare,
  Cpu,
  Layers,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  Code2,
} from 'lucide-react';
import apiClient from '../api/client.js';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [featuredHackathons, setFeaturedHackathons] = useState([]);
  const [featuredTeams, setFeaturedTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleFindMyTeam = (e) => {
    if (e) e.preventDefault();
    if (isAuthenticated) {
      navigate('/discover');
    } else {
      setShowLoginModal(true);
    }
  };

  useEffect(() => {
    const loadFeaturedData = async () => {
      try {
        const [hackRes, teamRes] = await Promise.all([
          apiClient.get('/hackathons/featured'),
          apiClient.get('/teams?limit=3'),
        ]);
        if (hackRes.data?.success) setFeaturedHackathons(hackRes.data.hackathons);
        if (teamRes.data?.success) setFeaturedTeams(teamRes.data.teams);
      } catch (err) {
        console.error('Failed to load landing data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadFeaturedData();
  }, []);

  return (
    <div className="space-y-24 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden text-center max-w-4xl mx-auto pt-6 pb-12 sm:pt-14">
        {/* Glow ambient background circles with Royal Blue and warm Beige */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-brand-600/20 dark:bg-brand-500/20 blur-[110px] -z-10 rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[200px] bg-beige-300/30 dark:bg-brand-900/30 blur-[90px] -z-10 rounded-full pointer-events-none" />

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-beige-100/90 text-brand-800 dark:bg-brand-950/80 dark:text-brand-300 border border-beige-300/90 dark:border-brand-800/80 mb-6 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 animate-pulse" />
          <span>Intelligent Teammate Discovery & Real-Time Sync</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.15]"
        >
          Find Your People.{' '}
          <span className="gradient-text">Build Something Extraordinary.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-base sm:text-lg text-beige-800 dark:text-dark-beigeMuted max-w-2xl mx-auto leading-relaxed"
        >
          HackMate is the real-time collaboration hub helping students, developers, designers, and innovators discover upcoming hackathons, match by complementary skills, communicate instantly, and win together.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            type="button"
            onClick={handleFindMyTeam}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-brand-700 hover:bg-brand-800 shadow-royal hover:shadow-glow-lg transition-all"
          >
            <Users className="w-4 h-4" />
            <span>Find My Team</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
          <Link
            to="/hackathons"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl font-semibold text-beige-900 dark:text-dark-beige bg-white dark:bg-dark-card border border-beige-300 dark:border-dark-border hover:bg-beige-100 dark:hover:bg-dark-cardHover transition-all shadow-sm"
          >
            <Trophy className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Explore Hackathons</span>
          </Link>
        </motion.div>

        {/* Live Preview Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-14 p-4 sm:p-6 rounded-2xl glass-panel shadow-xl text-left grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* Card 1: Teammate Match preview */}
          <div className="p-4 rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-ping" />
                  94% Match
                </span>
                <span className="text-[11px] text-gray-400">Available</span>
              </div>
              <div className="flex items-center space-x-3 mb-2">
                <img
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
                  alt="Sophia"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500/20"
                />
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Sophia Chen</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">UI/UX & Frontend Dev</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                "Figma wizard & React crafter. Looking for backend AI engineers for CalHacks."
              </p>
              <div className="flex flex-wrap gap-1">
                <span className="badge-skill text-[10px]">Figma</span>
                <span className="badge-skill text-[10px]">React</span>
                <span className="badge-skill text-[10px]">Tailwind</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-dark-border flex justify-between items-center text-xs text-brand-600 dark:text-brand-400 font-medium">
              <span>Strong complementary skills</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Live Team Workspace */}
          <div className="p-4 rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-beige-100 text-brand-900 border border-beige-300 dark:bg-brand-950/70 dark:text-brand-300 dark:border-brand-800/60 shadow-sm">
                  Sprint Kanban
                </span>
                <span className="text-[11px] text-brand-600 dark:text-brand-400 font-bold">2 Spots Open</span>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                AgenticLabs 🚀
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Global AI Hackathon 2026 • Remote
              </p>
              <div className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-dark-surface">
                  <span className="truncate">Setup Container Sandbox</span>
                  <span className="text-[10px] text-emerald-500 font-semibold">DONE</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-dark-surface">
                  <span className="truncate">LLM Planning Loop</span>
                  <span className="text-[10px] text-amber-500 font-semibold">ACTIVE</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-dark-border text-xs text-gray-400">
              Needs: <span className="text-brand-500 font-medium">Product Designer, Frontend Dev</span>
            </div>
          </div>

          {/* Card 3: Hackathon Deadline Tracker */}
          <div className="p-4 rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Closing Soon</span>
                </span>
                <span className="text-[11px] text-gray-400">$75,000 Prizes</span>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Global AI Hackathon
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                OpenAI & Google Cloud Community
              </p>
              <div className="p-2.5 rounded-xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/50 text-center">
                <p className="text-[11px] font-medium text-brand-600 dark:text-brand-300">
                  Registration closes in 5 days
                </p>
                <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
                  5,000+ Innovators Enrolled
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between text-xs text-brand-600 dark:text-brand-400 font-semibold">
              <span>View details & teams</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. How It Works Section */}
      <section className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Frictionless Teaming
          </span>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            How HackMate Accelerates Your Hackathon Journey
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Stop asking randomly on Discord and Reddit. Form winning teams with verified skills and transparent availability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Create Rich Profile',
              desc: 'List your technical stack, github projects, hackathon wins, preferred roles, and availability.',
              icon: Code2,
            },
            {
              step: '02',
              title: 'Smart Matching',
              desc: 'Our explainable algorithm calculates compatibility scores based on complementary team gaps.',
              icon: Cpu,
            },
            {
              step: '03',
              title: 'Form or Join Teams',
              desc: 'Apply to open role positions, send instant connection requests, or invite peers with one click.',
              icon: Users,
            },
            {
              step: '04',
              title: 'Real-Time Workspace',
              desc: 'Collaborate live with persistent chat, task Kanban board, meeting notes, and deadline countdowns.',
              icon: Zap,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl glass-card relative overflow-hidden group hover:-translate-y-1 transition-all"
              >
                <div className="text-3xl font-black text-gray-100 dark:text-dark-border absolute top-4 right-4 pointer-events-none select-none">
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Skill-Based Matching Breakdown */}
      <section className="max-w-6xl mx-auto rounded-3xl bg-gradient-to-br from-brand-950 via-brand-900 to-dark-bg p-8 sm:p-14 text-white shadow-royal border border-beige-300/20 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30 mb-4">
              <Cpu className="w-3.5 h-3.5" />
              <span>Explainable Synergy Engine</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              No Blind Guesses. Transparent Skill & Role Synergy.
            </h2>
            <p className="text-sm text-gray-300 mt-4 leading-relaxed">
              Ever joined a hackathon team with three frontend developers and zero backend or design coverage? HackMate analyzes team skill gaps and prioritizes candidates who fill exact missing competencies.
            </p>
            <div className="space-y-3 mt-6">
              {[
                'Complementary Tech Stacks (Frontend + Backend + Cloud)',
                'Required Open Position Coverage (Design, AI/ML, Pitch Lead)',
                'Availability & Schedule Overlap (Full-time vs Weekend only)',
                'Collaborative Mode Match (Remote, In-person, Hybrid)',
              ].map((point, i) => (
                <div key={i} className="flex items-center space-x-2.5 text-xs text-gray-200">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link
                to="/discover"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-white text-brand-900 hover:bg-gray-100 transition-colors shadow-lg"
              >
                <span>Try Matching Algorithm</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="bg-dark-surface/90 border border-dark-border p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-dark-border">
              <span className="text-xs font-semibold text-gray-300">Live Team Gap Analysis</span>
              <span className="text-xs px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-bold">Team: AgenticLabs</span>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-gray-400">Current Members Coverage:</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-1 bg-emerald-950/60 text-emerald-400 border border-emerald-800 text-[11px] rounded-md">✓ Python AI Lead (Alex)</span>
                <span className="px-2 py-1 bg-emerald-950/60 text-emerald-400 border border-emerald-800 text-[11px] rounded-md">✓ NLP / RAG Specialist (Priya)</span>
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <p className="text-xs text-amber-400 font-semibold">Identified Unmet Gaps:</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-1 bg-red-950/60 text-red-300 border border-red-800 text-[11px] rounded-md">⚠ UI/UX Designer Needed</span>
                <span className="px-2 py-1 bg-red-950/60 text-red-300 border border-red-800 text-[11px] rounded-md">⚠ Reactive Frontend Streaming Dev</span>
              </div>
            </div>
            <div className="p-3 bg-brand-950/50 rounded-xl border border-brand-800/60 text-xs text-brand-200">
              💡 <strong>Top Recommendation:</strong> Sophia Chen matches 94% with UI/UX expertise and shared Berkeley network.
            </div>
          </div>
        </div>
      </section>

      {/* 4. Upcoming Hackathons from Backend */}
      <section className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Verified Events
            </span>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              Featured Upcoming Hackathons
            </h2>
          </div>
          <Link
            to="/hackathons"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1 mt-2 sm:mt-0"
          >
            <span>View all hackathons</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredHackathons.slice(0, 4).map((h) => (
            <div
              key={h._id}
              className="rounded-2xl glass-card overflow-hidden flex flex-col justify-between group hover:border-brand-500/50 transition-all"
            >
              <div>
                <div className="h-44 w-full relative overflow-hidden bg-gray-200 dark:bg-dark-card">
                  <img
                    src={h.bannerUrl || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80'}
                    alt={h.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                    {h.format}
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold mb-1">
                    {h.organizer}
                  </p>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {h.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                    {h.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300 mb-4">
                    <div className="flex items-center space-x-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      <span>{h.prizePool}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span className="truncate">{h.location}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {h.themes?.slice(0, 3).map((theme, i) => (
                      <span key={i} className="badge-skill text-[10px]">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-5 py-3.5 border-t border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-card/50 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Reg closes: <strong>{new Date(h.registrationDeadline).toLocaleDateString()}</strong>
                </span>
                <Link
                  to={`/hackathons/${h._id}`}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  <span>Explore Teams</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Testimonials (Sample labeled) */}
      <section className="max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Student & Developer Voices
          </span>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            Loved by Collegiate & Open Source Hackers
          </h2>
          <p className="text-xs text-gray-400 mt-1 italic">
            *Sample verified community feedback from collegiate pilot users
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: 'HackMate completely changed how I form teams for CalHacks. In 20 minutes I found an NLP specialist and a designer who were looking for a backend lead. We won 1st in track!',
              author: 'Alex Rivera',
              role: 'Senior CS @ Stanford',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
            },
            {
              quote: 'As a UI/UX designer, it used to be intimidating to join engineering teams. HackMate highlights design as a primary role with clear skill requirements.',
              author: 'Sophia Chen',
              role: 'Design & HCI @ UC Berkeley',
              avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
            },
            {
              quote: 'The integrated Kanban workspace and Socket.IO chat kept our team aligned throughout the 36-hour sprint. No lost files, zero ghosting.',
              author: 'Marcus Vance',
              role: 'Grad Student @ CMU',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
            },
          ].map((t, idx) => (
            <div key={idx} className="p-6 rounded-2xl glass-card flex flex-col justify-between">
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed italic mb-6">
                "{t.quote}"
              </p>
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-100 dark:border-dark-border">
                <img src={t.avatar} alt={t.author} className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">{t.author}</h4>
                  <p className="text-[11px] text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'How does the teammate compatibility score work?',
              a: 'Our weighted algorithm analyzes complementary technical skills, required open roles, shared hackathon domain interests, availability hours, and collaboration mode. It is explainable and displays transparent reasons for every recommendation.',
            },
            {
              q: 'Can I recruit teammates for in-person as well as virtual hackathons?',
              a: 'Yes! HackMate explicitly supports remote, in-person, and hybrid formats, along with geographic filters and university affiliation options.',
            },
            {
              q: 'What if someone in our team ghosts during the hackathon?',
              a: 'Team leaders can manage open positions, remove unresponsive members with logged activity audit trails, reopen recruitment, or share quick invite links directly.',
            },
            {
              q: 'Is HackMate free to use for students and organizers?',
              a: 'HackMate is 100% free for students, builders, and community hackathon participants worldwide.',
            },
          ].map((faq, i) => (
            <div key={i} className="p-5 rounded-2xl glass-card">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {faq.q}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Bottom CTA Banner */}
      <section className="max-w-6xl mx-auto rounded-3xl bg-gradient-to-r from-brand-800 via-brand-700 to-blue-700 p-8 sm:p-14 text-center text-white shadow-royal border border-brand-500/30">
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Ready to build your next winning project?
        </h2>
        <p className="text-sm text-beige-100 max-w-xl mx-auto mt-3">
          Join thousands of developers, designers, and innovators. Create your profile in under 2 minutes.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            to="/register"
            className="px-6 py-3.5 rounded-xl font-bold text-sm bg-beige-50 text-brand-900 hover:bg-white shadow-lg transition-all"
          >
            Create Free Account
          </Link>
          <button
            type="button"
            onClick={handleFindMyTeam}
            className="px-6 py-3.5 rounded-xl font-bold text-sm bg-brand-900/60 hover:bg-brand-900 text-white border border-beige-200/30 transition-all"
          >
            Browse Available Teammates
          </button>
        </div>
      </section>

      {/* Pop-up Login Modal when clicking Find My Team */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectPath="/discover"
      />
    </div>
  );
}
