import { useEffect, useState } from "react";
import { ImageIcon, LogOutIcon, MailIcon, ShieldCheckIcon, SparklesIcon, UserRoundIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../Dashboard/DashboardLayout";
import { getMyProfile, logoutUser } from "../../api/auth";

const profileStats = [
  { label: "Projects", value: "12" },
  { label: "Tasks Closed", value: "184" },
  { label: "Avg. Response", value: "1.8h" },
];

function MyProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getMyProfile();

        if (!ignore) {
          setProfile(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Unable to load your profile right now.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      ignore = true;
    };
  }, []);

  const handleLogout = () => {
    // Clear the local auth session before sending the user back to login.
    logoutUser();
    navigate("/login", { replace: true });
  };

  const displayName = profile?.name || "Loading profile...";
  const displayEmail = profile?.email || "No email available";
  const displayRole = profile?.role || "Workspace Member";
  const displayAvatar = profile?.avatar;
  const initials = (profile?.name || "TV")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="rounded-[32px] border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt={displayName}
                  className="h-20 w-20 rounded-3xl object-cover shadow-lg shadow-primary/10"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
                  {initials}
                </div>
              )}
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">My Profile</p>
                <h1 className="text-3xl font-bold tracking-tight">{displayName}</h1>
                <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                  {loading
                    ? "Loading your account details from the fake auth API."
                    : "This profile is now connected to the fake auth API session you used during login."}
                </p>
                {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {profileStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-border bg-slate-50 px-4 py-3 text-center">
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-5">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Profile Details</h2>
              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-slate-100 p-2 text-slate-700">
                    <UserRoundIcon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Role</p>
                    <p className="text-sm text-muted-foreground capitalize">{displayRole}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-slate-100 p-2 text-slate-700">
                    <MailIcon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{displayEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-slate-100 p-2 text-slate-700">
                    <ImageIcon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Avatar</p>
                    <p className="text-sm text-muted-foreground break-all">
                      {displayAvatar || "No avatar returned by API"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold">About</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                This section is now reading the logged-in fake API user profile, so the name, email, role, and avatar reflect the active bearer token.
                You can later swap this helper to your real backend without changing the page structure.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-500/10 p-2 text-emerald-600">
                  <ShieldCheckIcon size={18} />
                </div>
                <div>
                  <h2 className="font-semibold">Account Status</h2>
                  <p className="text-xs text-muted-foreground">Workspace access looks healthy.</p>
                </div>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-semibold">Free</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">2FA</span>
                  <span className="font-semibold">Not Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Session</span>
                  <span className="font-semibold">Active</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
              <div className="flex items-center gap-3 text-primary">
                <SparklesIcon size={18} />
                <h2 className="font-semibold">Next Step</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Hook this page up to your real backend later for editable profile settings, avatar uploads, and security preferences.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 active:scale-[0.99]"
            >
              <LogOutIcon size={18} />
              Logout
            </button>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default MyProfile;
