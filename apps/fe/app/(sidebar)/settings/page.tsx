"use client";

import { useEffect, useState } from "react";
import { ImageIcon, Save, Sparkles, UserRound } from "lucide-react";

import RequireAuth from "../../../components/RequireAuth";
import ScrollReveal from "../../../components/ScrollReveal";
import { getProfile, updateProfile, UserProfile } from "../../../lib/api";

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [status, setStatus] = useState<{
    kind: "success" | "error" | "loading" | "";
    msg: string;
  }>({ kind: "", msg: "" });

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
    setStatus({ kind: "loading", msg: "Updating profile..." });

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await updateProfile(token, {
        displayName,
        bio: bio || undefined,
        avatarUrl: avatarUrl || undefined,
      });

      setStatus({ kind: "success", msg: "Profile updated successfully." });

      if (profile) {
        setProfile({ ...profile, displayName, bio, avatarUrl });
      }
    } catch (err: any) {
      setStatus({ kind: "error", msg: err?.message || "Failed to update profile" });
    } finally {
      setTimeout(() => setStatus({ kind: "", msg: "" }), 4000);
    }
  }

  return (
    <RequireAuth>
      <div className="mx-auto w-full max-w-[1350px]" id="settings-page">
        <header className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="animate-float-staking">
            <div className="dashboard-chip dashboard-chip-strong mb-4">
              <Sparkles size={14} />
              Profile Center
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Profile <span className="landing-gradient">Settings</span>
            </h1>
            <p className="mt-3 max-w-2xl text-base text-[#8ba2aa]">
              The same account controls, redesigned into the darker dashboard language from your reference image.
            </p>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#49f0dd] border-t-transparent" />
            <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#49f0dd]">
              Loading profile
            </span>
          </div>
        ) : (
          <ScrollReveal>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.82fr_1.18fr]">
              <div className="dashboard-panel">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[1.4rem] border border-[#49f0dd]/16 bg-[#0d1d23]">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar preview" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-white">
                        {(displayName || "?").slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#71868d]">
                      Public appearance
                    </p>
                    <h2 className="text-2xl font-extrabold text-white">
                      {displayName || profile?.displayName || "Unnamed profile"}
                    </h2>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="dashboard-soft-panel rounded-[1.25rem] p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-white/75">
                        <UserRound size={17} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Profile identity</p>
                        <p className="text-xs text-[#80969e]">How other users will recognize you.</p>
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-[#8ba1a9]">
                      Keep your display name and avatar polished so creators and supporters immediately recognize your account.
                    </p>
                  </div>

                  <div className="dashboard-soft-panel rounded-[1.25rem] p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-white/75">
                        <ImageIcon size={17} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Avatar source</p>
                        <p className="text-xs text-[#80969e]">Image URL shown in the dashboard.</p>
                      </div>
                    </div>
                    <p className="break-all text-sm leading-6 text-[#8ba1a9]">
                      {avatarUrl || "No avatar URL added yet."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="dashboard-panel">
                <form onSubmit={handleSave} className="flex flex-col gap-5">
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.24em] text-[#71868d]">
                      Display name
                    </label>
                    <input
                      className="dashboard-input"
                      placeholder="e.g. Solana Builder"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      minLength={1}
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.24em] text-[#71868d]">
                      Bio
                    </label>
                    <textarea
                      className="dashboard-input min-h-[150px] resize-y"
                      style={{ fontFamily: "var(--sans)" }}
                      placeholder="Tell supporters about yourself, your project, or what you create..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      maxLength={500}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.24em] text-[#71868d]">
                      Avatar URL
                    </label>
                    <input
                      className="dashboard-input"
                      type="url"
                      placeholder="https://example.com/avatar.png"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-4 border-t border-white/6 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <span
                      className={`text-sm font-semibold ${
                        status.kind === "error"
                          ? "text-red-400"
                          : status.kind === "success"
                            ? "text-emerald-400"
                            : "text-[#49f0dd]"
                      }`}
                    >
                      {status.msg || "Changes will update your public profile immediately."}
                    </span>

                    <button
                      type="submit"
                      disabled={status.kind === "loading"}
                      className="btn btn-primary px-8"
                    >
                      <Save size={16} />
                      {status.kind === "loading" ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>
    </RequireAuth>
  );
}
