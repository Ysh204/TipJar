"use client";

import { useState, useEffect } from "react";
import RequireAuth from "../../../components/RequireAuth";
import { getProfile, updateProfile, UserProfile } from "../../../lib/api";
import ScrollReveal from "../../../components/ScrollReveal";

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  const [status, setStatus] = useState<{ kind: 'success' | 'error' | 'loading' | '', msg: string }>({ kind: '', msg: '' });

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const data = await getProfile(token);
        if (data.user) {
          setProfile(data.user);
          setDisplayName(data.user.displayName || "");
          setBio(data.user.bio || "");
          setAvatarUrl(data.user.avatarUrl || "");
        }
      } catch (e) {
        console.error("Failed to load profile", e);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: 'loading', msg: 'Updating profile...' });
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await updateProfile(token, { 
        displayName, 
        bio: bio ? bio : undefined, 
        avatarUrl: avatarUrl ? avatarUrl : undefined 
      });
      setStatus({ kind: 'success', msg: 'Profile updated successfully!' });
      
      // Update local state to reflect changes without reload
      if (profile) {
        setProfile({ ...profile, displayName, bio, avatarUrl });
      }
    } catch (err: any) {
      setStatus({ kind: 'error', msg: err?.message || 'Failed to update profile' });
    } finally {
      setTimeout(() => setStatus({ kind: '', msg: '' }), 4000);
    }
  }

  return (
    <RequireAuth>
      <div className="max-w-4xl mx-auto w-full" id="settings-page">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl landing-gradient">
            Profile Settings
          </h1>
          <p className="text-slate-400 mt-2 font-medium text-lg">Personalize your creator or fan profile</p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="w-12 h-12 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-teal-400">Loading Profile...</span>
          </div>
        ) : (
          <ScrollReveal>
             <div className="card">
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-indigo-400 flex items-center justify-center border border-white/10 overflow-hidden shadow-inner">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-white">
                        {(displayName || "?").slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Public Appearance</h2>
                    <p className="text-sm text-slate-400">This is how you will appear to the community.</p>
                  </div>
               </div>

               <form onSubmit={handleSave} className="flex flex-col gap-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-2">Display Name</label>
                    <input
                      className="input w-full bg-black/30 shadow-inner"
                      placeholder="e.g. Satoshi Nakamoto"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      required
                      minLength={1}
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-2">Bio</label>
                    <textarea
                      className="input w-full bg-black/30 shadow-inner min-h-[120px] resize-y"
                      style={{ fontFamily: 'var(--sans)' }}
                      placeholder="Tell the community about yourself or the content you create..."
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      maxLength={500}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-2">Avatar URL (Optional)</label>
                    <input
                      className="input w-full bg-black/30 shadow-inner"
                      type="url"
                      placeholder="https://example.com/my-avatar.png"
                      value={avatarUrl}
                      onChange={e => setAvatarUrl(e.target.value)}
                    />
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                     <span className={`text-sm font-medium ${status.kind === 'error' ? 'text-red-400' : status.kind === 'success' ? 'text-emerald-400' : 'text-teal-400'}`}>
                        {status.msg}
                     </span>
                     <button 
                       type="submit" 
                       disabled={status.kind === 'loading'}
                       className="btn btn-primary px-8"
                     >
                       {status.kind === 'loading' ? 'Saving...' : 'Save Changes'}
                     </button>
                  </div>
               </form>
             </div>
          </ScrollReveal>
        )}
      </div>
    </RequireAuth>
  );
}
