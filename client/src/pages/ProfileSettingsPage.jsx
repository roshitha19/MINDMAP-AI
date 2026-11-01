import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import {
  Settings,
  User,
  Lock,
  Sparkles,
  Shield,
  Save,
  LogOut,
  Palette,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const AVATARS = [
  { id: 'cosmic-avatar-1', label: 'Cosmic Voyager', gradient: 'from-violet-600 to-indigo-600' },
  { id: 'cosmic-avatar-2', label: 'Quantum Scholar', gradient: 'from-cyan-600 to-blue-600' },
  { id: 'cosmic-avatar-3', label: 'Neural Pioneer', gradient: 'from-emerald-600 to-teal-600' },
  { id: 'cosmic-avatar-4', label: 'Stellar Architect', gradient: 'from-fuchsia-600 to-pink-600' },
];

const ProfileSettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const { showToast } = useNotification();

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || 'cosmic-avatar-1');
  const [interests, setInterests] = useState((user?.learningInterests || []).join(', '));
  const [goals, setGoals] = useState((user?.learningGoals || []).join(', '));
  const [isUpdating, setIsUpdating] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await authAPI.updateProfile({
        name,
        bio,
        avatar,
        learningInterests: interests.split(',').map(i => i.trim()).filter(Boolean),
        learningGoals: goals.split(',').map(g => g.trim()).filter(Boolean),
      });

      updateUser(res.data.user);
      showToast('Profile configuration updated successfully!', 'success');
    } catch (err) {
      showToast('Error updating profile', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setIsChangingPass(true);
    try {
      await authAPI.changePassword({ currentPassword, newPassword });
      showToast('Security password successfully changed!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Password update failed', 'error');
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cosmic-violet/20 border border-cosmic-violet/30 text-cosmic-violet text-xs font-semibold mb-2">
          <Settings className="w-3.5 h-3.5" />
          <span>User & Laboratory Settings</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Profile & Preferences</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Customize your academic identity, learning interests, and security credentials.
        </p>
      </div>

      {/* Profile Form */}
      <div className="cosmic-panel p-6 sm:p-8 rounded-3xl border border-cosmic-border shadow-2xl space-y-6">
        <h3 className="text-base font-bold text-white flex items-center space-x-2 pb-4 border-b border-slate-800">
          <User className="w-4 h-4 text-cosmic-violet" />
          <span>Identity & Academic Interests</span>
        </h3>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Cosmic Avatar</label>
            <div className="flex items-center space-x-4">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setAvatar(av.id)}
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${av.gradient} p-0.5 border-2 transition-transform ${
                    avatar === av.id ? 'scale-110 border-white shadow-cosmic-sm' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cosmic-violet text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800/60 text-xs text-slate-500 cursor-not-allowed outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Bio</label>
            <textarea
              rows="2"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. 3rd-year CS student focusing on Operating Systems & Deep Learning."
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-cosmic-violet text-xs text-white outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Learning Interests (comma-separated)</label>
              <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="Data Structures, Operating Systems, ML"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Learning Goals (comma-separated)</label>
              <input
                type="text"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="Pass Semester Exams, Crack FAANG"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cosmic-indigo to-cosmic-violet text-white shadow-cosmic-sm hover:scale-105 transition-all flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isUpdating ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password */}
      <div className="cosmic-panel p-6 sm:p-8 rounded-3xl border border-cosmic-border shadow-2xl space-y-6">
        <h3 className="text-base font-bold text-white flex items-center space-x-2 pb-4 border-b border-slate-800">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Security & Password</span>
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isChangingPass}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
            >
              {isChangingPass ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Session Sign Out */}
      <div className="cosmic-panel p-6 rounded-3xl border border-rose-500/20 flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-white">Sign Out of Session</div>
          <div className="text-xs text-slate-400 mt-0.5">Securely terminate the active JWT authentication token.</div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-950/60 text-rose-300 border border-rose-500/40 hover:bg-rose-900/80 transition-colors flex items-center space-x-1.5"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
