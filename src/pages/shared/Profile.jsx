import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useMutation } from 'react-query';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile, uploadAvatar } from '../../api/analyticsApi';
import { setCredentials } from '../../store/slices/authSlice';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';
import {
  User, Mail, MapPin, Briefcase, DollarSign, Star,
  Camera, Save, Tag, Calendar, Shield,
} from 'lucide-react';

// ── Skill tag input ────────────────────────────────────────────────────────────
function SkillsInput({ skills, onChange }) {
  const [input, setInput] = useState('');

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
    }
    setInput('');
  };

  const remove = (skill) => onChange(skills.filter((s) => s !== skill));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2 min-h-[2rem]">
        {skills.map((s) => (
          <span
            key={s}
            className="flex items-center gap-1 bg-primary-50 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full"
          >
            {s}
            <button
              type="button"
              onClick={() => remove(s)}
              className="ml-0.5 text-primary-400 hover:text-primary-700 leading-none"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="input flex-1 text-sm"
          placeholder="Add a skill (e.g. React, Node.js) and press Enter"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        />
        <button type="button" onClick={add} className="btn-outline text-sm px-3">
          Add
        </button>
      </div>
    </div>
  );
}

// ── Main Profile page ──────────────────────────────────────────────────────────
export default function Profile() {
  const { user, isFreelancer, isClient } = useAuth();
  const dispatch = useDispatch();
  const fileRef = useRef();

  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    hourlyRate: user?.hourlyRate || '',
    skills: user?.skills || [],
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Save profile mutation
  const saveMutation = useMutation(
    () => updateProfile({
      name: form.name,
      bio: form.bio,
      location: form.location,
      skills: form.skills,
      ...(isFreelancer && { hourlyRate: Number(form.hourlyRate) }),
    }),
    {
      onSuccess: (res) => {
        const updated = res.data.data.user;
        dispatch(setCredentials({ user: updated, accessToken: null }));
        toast.success('Profile saved!');
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to save profile'),
    }
  );

  // Avatar upload mutation
  const avatarMutation = useMutation(
    (file) => {
      const fd = new FormData();
      fd.append('avatar', file);
      return uploadAvatar(fd);
    },
    {
      onSuccess: (res) => {
        const avatarUrl = res.data.data.avatar;
        dispatch(setCredentials({ user: { ...user, avatar: avatarUrl }, accessToken: null }));
        toast.success('Avatar updated!');
      },
      onError: () => toast.error('Avatar upload failed'),
    }
  );

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Avatar + stats ─────────────────────────────── */}
        <div className="space-y-4">

          {/* Avatar card */}
          <div className="card text-center animate-fade-in-up">
            <div className="relative inline-block mb-3">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-primary-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-indigo-500 flex items-center justify-center ring-4 ring-primary-100">
                  <User size={36} className="text-white" />
                </div>
              )}
              <button
                onClick={() => fileRef.current.click()}
                disabled={avatarMutation.isLoading}
                className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
              >
                <Camera size={13} className="text-gray-600" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files[0] && avatarMutation.mutate(e.target.files[0])}
              />
            </div>
            <p className="font-bold text-gray-900 text-lg">{user?.name}</p>
            <p className="text-sm text-gray-400 capitalize">{user?.role}</p>
            {user?.location && (
              <p className="text-xs text-gray-400 flex items-center justify-center gap-1 mt-1">
                <MapPin size={11} /> {user.location}
              </p>
            )}
          </div>

          {/* Account info */}
          <div className="card animate-fade-in-up animate-delay-100 space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Account</h3>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Mail size={14} className="text-gray-400 flex-shrink-0" />
              <span className="truncate">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Calendar size={14} className="text-gray-400 flex-shrink-0" />
              <span>Member since {memberSince}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield size={14} className="text-gray-400 flex-shrink-0" />
              <span className={`font-medium ${user?.subscriptionStatus === 'pro' ? 'text-amber-600' : 'text-gray-500'}`}>
                {user?.subscriptionStatus === 'pro' ? '⭐ Pro Member' : 'Free Plan'}
              </span>
            </div>
          </div>

          {/* Freelancer earnings summary */}
          {isFreelancer && (
            <div className="card animate-fade-in-up animate-delay-200 stat-card-green">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Earnings</h3>
              <div className="space-y-2">
                {[
                  { label: 'Total Earned', val: user?.earnings?.total || 0 },
                  { label: 'Pending',      val: user?.earnings?.pending || 0 },
                  { label: 'Withdrawn',    val: user?.earnings?.withdrawn || 0 },
                ].map(({ label, val }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Edit form ──────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="card animate-fade-in-up">
            <h2 className="font-semibold text-gray-900 mb-5">Edit Profile</h2>

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <User size={14} className="inline mr-1.5 text-gray-400" />Full Name
                </label>
                <input className="input" value={form.name} onChange={set('name')} placeholder="Your full name" />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Briefcase size={14} className="inline mr-1.5 text-gray-400" />Bio
                </label>
                <textarea
                  rows={4}
                  className="input resize-none"
                  value={form.bio}
                  onChange={set('bio')}
                  placeholder="Tell clients about yourself, your experience, and what you specialise in..."
                  maxLength={500}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{form.bio.length}/500</p>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <MapPin size={14} className="inline mr-1.5 text-gray-400" />Location
                </label>
                <input className="input" value={form.location} onChange={set('location')} placeholder="e.g. Mumbai, India" />
              </div>

              {/* Hourly rate — freelancer only */}
              {isFreelancer && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <DollarSign size={14} className="inline mr-1.5 text-gray-400" />Hourly Rate (USD)
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={form.hourlyRate}
                    onChange={set('hourlyRate')}
                    placeholder="e.g. 35"
                    min={0}
                  />
                </div>
              )}

              {/* Skills — freelancer only */}
              {isFreelancer && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Tag size={14} className="inline mr-1.5 text-gray-400" />Skills
                  </label>
                  <SkillsInput
                    skills={form.skills}
                    onChange={(skills) => setForm((f) => ({ ...f, skills }))}
                  />
                </div>
              )}

              {/* Client: show skills read-only if any */}
              {isClient && user?.skills?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Star size={14} className="inline mr-1.5 text-gray-400" />Interests
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((s) => (
                      <span key={s} className="bg-primary-50 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Save button */}
              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {saveMutation.isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={15} />
                )}
                {saveMutation.isLoading ? 'Saving…' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
