/**
 * app/settings/page.tsx
 * Settings — saves preferences to Firebase Firestore user profile.
 */

"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import {
  Globe, Bell, Wifi, ShieldCheck,
  Download, CheckCircle2, MessageSquare,
  Send, MessageCircle, Loader2, Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/firebase/auth-context";
import { getUserProfile, updateUserProfile } from "@/lib/firebase/user-profile";

const LANGUAGES = [
  { code: "hi", label: "Hindi"     },
  { code: "pa", label: "Punjabi"   },
  { code: "mr", label: "Marathi"   },
  { code: "te", label: "Telugu"    },
  { code: "ta", label: "Tamil"     },
  { code: "kn", label: "Kannada"   },
  { code: "ml", label: "Malayalam" },
  { code: "bn", label: "Bengali"   },
];

const LANG_LABELS: Record<string, string> = {
  en:"English", hi:"Hindi", pa:"Punjabi", mr:"Marathi",
  te:"Telugu", ta:"Tamil", kn:"Kannada", ml:"Malayalam", bn:"Bengali",
};

export default function SettingsPage() {
  const { user } = useAuth();

  // Language
  const [language, setLanguage] = useState("hi");

  // Notifications
  const [appNotifications, setAppNotifications] = useState(false);
  const [emailReports,     setEmailReports]     = useState(false);

  // Connectivity
  const [whatsapp,  setWhatsapp]  = useState(true);
  const [telegram,  setTelegram]  = useState(false);
  const [smsAlerts, setSmsAlerts] = useState(true);

  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [loading, setLoading] = useState(true);

  // Load preferences from Firebase
  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then((profile) => {
      if (profile?.preferredLanguage) setLanguage(profile.preferredLanguage);
      setLoading(false);
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        preferredLanguage: language as "en"|"hi"|"pa"|"mr"|"te"|"ta",
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  // Toggle switch component
  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button type="button" onClick={() => onChange(!value)}
      className={cn("relative w-10 h-6 rounded-full transition-colors", value ? "bg-[#2ea82e]" : "bg-[#2a3d2c]")}>
      <span className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm",
        value ? "translate-x-5" : "translate-x-1")} />
    </button>
  );

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#e8f5e9]">Settings</h1>
            <p className="text-sm text-[#5a7460] mt-1">Manage your farm preferences and digital agronomy experience.</p>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="btn-primary gap-2 disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? "Saved!" : "Save All Changes"}
          </button>
        </div>

        {/* Three-column settings grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Language Support */}
          <div className="rounded-xl bg-[#111d16] border border-[#2a3d2c] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4 text-[#4dc24d]" strokeWidth={2} />
              <h2 className="text-sm font-bold text-[#e8f5e9]">Language Support</h2>
            </div>
            <p className="text-xs text-[#5a7460] leading-relaxed mb-4">
              Choose your preferred language for all crop insights, weather reports, and AI advisor interactions.
            </p>
            {loading ? (
              <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-[#4dc24d]" /><span className="text-xs text-[#5a7460]">Loading...</span></div>
            ) : (
              <>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5a7460] mb-2">Current Language</p>
                <select value={language} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLanguage(e.target.value)}
                  className="input-field text-sm mb-4">
                  <option value="en">English</option>
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>

                <div className="grid grid-cols-2 gap-2">
                  {LANGUAGES.map(l => (
                    <button key={l.code} type="button" onClick={() => setLanguage(l.code)}
                      className={cn("flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors",
                        language === l.code ? "border-[#2ea82e] bg-[#2ea82e]/10 text-[#4dc24d]" : "border-[#2a3d2c] text-[#94a896] hover:border-[#3d5c40]")}>
                      <span>{l.label}</span>
                      {language === l.code && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Notifications */}
          <div className="rounded-xl bg-[#111d16] border border-[#2a3d2c] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-[#4dc24d]" strokeWidth={2} />
              <h2 className="text-sm font-bold text-[#e8f5e9]">Notifications</h2>
            </div>

            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#e8f5e9]">App Notifications</p>
                  <p className="text-xs text-[#5a7460] mt-0.5 leading-relaxed">Real-time pest alerts and sensor triggers.</p>
                </div>
                <Toggle value={appNotifications} onChange={setAppNotifications} />
              </div>

              <div className="h-px bg-[#1e2d20]" />

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#e8f5e9]">Email Reports</p>
                  <p className="text-xs text-[#5a7460] mt-0.5 leading-relaxed">Weekly farm performance summaries.</p>
                </div>
                <Toggle value={emailReports} onChange={setEmailReports} />
              </div>
            </div>
          </div>

          {/* Connectivity */}
          <div className="rounded-xl bg-[#111d16] border border-[#2a3d2c] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Wifi className="w-4 h-4 text-[#4dc24d]" strokeWidth={2} />
              <h2 className="text-sm font-bold text-[#e8f5e9]">Connectivity</h2>
            </div>

            <div className="space-y-3">
              {[
                { label: "WhatsApp Alerts",  icon: MessageSquare,  value: whatsapp,  onChange: setWhatsapp,  color: "text-green-400"  },
                { label: "Telegram Bot",     icon: Send,           value: telegram,  onChange: setTelegram,  color: "text-blue-400"   },
                { label: "SMS Alerts",       icon: MessageCircle,  value: smsAlerts, onChange: setSmsAlerts,  color: "text-amber-400"  },
              ].map(({ label, icon: Icon, value, onChange, color }) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-lg bg-[#0d1a10] border border-[#1e2d20]">
                  <div className="flex items-center gap-3">
                    <Icon className={cn("w-4 h-4", color)} strokeWidth={2} />
                    <span className="text-sm font-medium text-[#e8f5e9]">{label}</span>
                  </div>
                  <Toggle value={value} onChange={onChange} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security banner */}
        <div className="rounded-xl overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #1a4d1a 0%, #0c330c 100%)", border: "1px solid rgba(46,168,46,0.2)" }}>
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(rgba(77,194,77,1) 1px,transparent 1px),linear-gradient(90deg,rgba(77,194,77,1) 1px,transparent 1px)", backgroundSize: "24px 24px" }} />

          <div className="relative z-10 flex items-start justify-between gap-6 p-6">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">Securing Your Farm Data</h2>
              <p className="text-sm text-[#82d882]/70 leading-relaxed max-w-lg">
                CropWise AI uses military-grade encryption for all sensor data and personal configurations.
                Your settings are synced across all your devices in real-time via Firebase.
              </p>
              <div className="flex items-center gap-3 mt-4">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors">
                  <ShieldCheck className="w-4 h-4" /> Review Security
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors">
                  <Download className="w-4 h-4" /> Download Privacy Policy
                </button>
              </div>
            </div>
            <div className="flex-shrink-0 hidden sm:flex">
              <ShieldCheck className="w-20 h-20 text-[#2ea82e]/30" strokeWidth={1} />
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}