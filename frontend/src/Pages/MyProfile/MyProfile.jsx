import { useEffect, useState } from "react";
import { ImageIcon, LogOutIcon, MailIcon, PencilIcon, SaveIcon, ShieldCheckIcon, SparklesIcon, UserRoundIcon, XIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../Dashboard/DashboardLayout";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { logout, updateProfileLocally } from "../../store/authSlice";
import { useAppDispatch } from "../../store/hooks";

const profileStats = [
  { label: "Projects", value: "12" },
  { label: "Tasks Closed", value: "184" },
  { label: "Avg. Response", value: "1.8h" },
];

function MyProfile() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { profile, loading } = useCurrentUser();
  const [role, setRole] = useState("");
  const [about, setAbout] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setRole(profile?.role || "Workspace Member");
    setAbout(
      profile?.about ||
        "This profile is connected to your active session. Add a short intro so teammates can quickly understand your role and focus."
    );
  }, [profile]);

  const roleOptions = [
    "Workspace Member",
    "Frontend Developer",
    "Backend Engineer",
    "UI Designer",
    "QA Analyst",
    "Project Manager",
  ];

  const handleLogout = () => {
    // Clear the local auth session before sending the user back to login.
    dispatch(logout());
    alert("Logged out successfully.");
    navigate("/login", { replace: true });
  };

  const displayName = profile?.name || "Loading profile...";
  const displayEmail = profile?.email || "No email available";
  const displayAvatar = profile?.avatar || profile?.photo;
  const initials = (profile?.name || "TV")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSaveProfile = () => {
    dispatch(
      updateProfileLocally({
        role,
        about: about.trim(),
      })
    );
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setRole(profile?.role || "Workspace Member");
    setAbout(
      profile?.about ||
        "This profile is connected to your active session. Add a short intro so teammates can quickly understand your role and focus."
    );
    setIsEditing(false);
  };

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
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Profile Details</h2>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                    >
                      <SaveIcon size={14} />
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold text-muted-foreground transition hover:border-primary/30 hover:text-primary"
                    >
                      <XIcon size={14} />
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold text-muted-foreground transition hover:border-primary/30 hover:text-primary"
                  >
                    <PencilIcon size={14} />
                    Edit
                  </button>
                )}
              </div>
              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-slate-100 p-2 text-slate-700">
                    <UserRoundIcon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Role</p>
                    {isEditing ? (
                      <select
                        value={role}
                        onChange={(event) => setRole(event.target.value)}
                        className="mt-1 h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                      >
                        {roleOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm text-muted-foreground capitalize">{role}</p>
                    )}
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
              {isEditing ? (
                <textarea
                  value={about}
                  onChange={(event) => setAbout(event.target.value)}
                  className="mt-4 min-h-32 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm leading-7 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  placeholder="Add a short profile summary..."
                />
              ) : (
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  {about}
                </p>
              )}
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
                You can now update your role and about section locally, and later connect the same UI to your real backend.
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
