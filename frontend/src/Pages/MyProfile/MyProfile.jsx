import { useEffect, useState } from "react";
import {
  GithubIcon,
  ImageIcon,
  LinkedinIcon,
  LogOutIcon,
  MailIcon,
  MapPinIcon,
  PencilIcon,
  SaveIcon,
  SparklesIcon,
  UserRoundIcon,
  XIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../Dashboard/DashboardLayout";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { logout, saveProfile } from "../../store/authSlice";
import { useAppDispatch } from "../../store/hooks";

const profileStats = [
  { label: "Projects", value: "12" },
  { label: "Tasks Closed", value: "184" },
  { label: "Avg. Response", value: "1.8h" },
];

const ensureHttpUrl = (value = "") => {
  const trimmedValue = String(value || "").trim();

  if (!trimmedValue) {
    return "";
  }

  return /^https?:\/\//i.test(trimmedValue) ? trimmedValue : `https://${trimmedValue}`;
};

const matchesAllowedHostname = (value = "", allowedHostname) => {
  try {
    const parsedUrl = new URL(ensureHttpUrl(value));
    const hostname = parsedUrl.hostname.toLowerCase();
    return hostname === allowedHostname || hostname.endsWith(`.${allowedHostname}`);
  } catch {
    return false;
  }
};

function MyProfile() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { profile, loading, profileSaving } = useCurrentUser();
  const [role, setRole] = useState("");
  const [about, setAbout] = useState("");
  const [location, setLocation] = useState("");
  const [githubProfile, setGithubProfile] = useState("");
  const [linkedinProfile, setLinkedinProfile] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setRole(profile?.role || "Workspace Member");
    setAbout(
      profile?.about ||
        "This profile is connected to your active session. Add a short intro so teammates can quickly understand your role and focus."
    );
    setLocation(profile?.location || "");
    setGithubProfile(profile?.githubProfile || "");
    setLinkedinProfile(profile?.linkedinProfile || "");
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
    dispatch(logout());
    alert("Logged out successfully.");
    navigate("/login", { replace: true });
  };

  const displayName = profile?.name || "Loading profile...";
  const displayEmail = profile?.email || "No email available";
  const displayAvatar = profile?.avatar || profile?.photo;
  const normalizedGithubUrl = ensureHttpUrl(githubProfile);
  const normalizedLinkedinUrl = ensureHttpUrl(linkedinProfile);
  const hasGithubProfile = Boolean(githubProfile.trim());
  const hasLinkedinProfile = Boolean(linkedinProfile.trim());
  const isGithubProfileValid = !hasGithubProfile || matchesAllowedHostname(githubProfile, "github.com");
  const isLinkedinProfileValid = !hasLinkedinProfile || matchesAllowedHostname(linkedinProfile, "linkedin.com");
  const initials = (profile?.name || "TV")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSaveProfile = async () => {
    if (!isGithubProfileValid) {
      alert("Please enter a valid GitHub profile URL.");
      return;
    }

    if (!isLinkedinProfileValid) {
      alert("Please enter a valid LinkedIn profile URL.");
      return;
    }

    try {
      await dispatch(
        saveProfile({
          role,
          about: about.trim(),
          location: location.trim(),
          githubProfile: githubProfile.trim(),
          linkedinProfile: linkedinProfile.trim(),
        })
      ).unwrap();
      setIsEditing(false);
    } catch (error) {
      alert(error || "Unable to save your profile right now.");
    }
  };

  const handleCancelEdit = () => {
    setRole(profile?.role || "Workspace Member");
    setAbout(
      profile?.about ||
        "This profile is connected to your active session. Add a short intro so teammates can quickly understand your role and focus."
    );
    setLocation(profile?.location || "");
    setGithubProfile(profile?.githubProfile || "");
    setLinkedinProfile(profile?.linkedinProfile || "");
    setIsEditing(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* HEADER */}
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
                  {loading ? "Loading your account details..." : " "}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN GRID */}
        <section className="grid gap-5 lg:grid-cols-[1.3fr_0.9fr]">

          {/* LEFT SIDE */}
          <div className="space-y-5">

            {/* PROFILE DETAILS */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Profile Details</h2>

                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={profileSaving}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground"
                    >
                      <SaveIcon size={14} />
                      {profileSaving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={profileSaving}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm"
                    >
                      <XIcon size={14} />
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm"
                  >
                    <PencilIcon size={14} />
                    Edit
                  </button>
                )}
              </div>

              {/* DETAILS */}
              <div className="mt-5 space-y-4">

                {/* ROLE */}
                <div className="flex items-center gap-3">
                  <UserRoundIcon size={18} />
                  <div>
                    <p className="text-sm font-medium">Role</p>
                    {isEditing ? (
                      <select value={role} onChange={(e) => setRole(e.target.value)}>
                        {roleOptions.map((opt) => (
                          <option key={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <p>{role}</p>
                    )}
                  </div>
                </div>

                {/* EMAIL */}
                <div className="flex items-center gap-3">
                  <MailIcon size={18} />
                  <div>
                    <p>Email</p>
                    <p>{displayEmail}</p>
                  </div>
                </div>

                {/* LOCATION */}
                <div className="flex items-center gap-3">
                  <MapPinIcon size={18} />
                  <div>
                    <p>Location</p>
                    {isEditing ? (
                      <input value={location} onChange={(e) => setLocation(e.target.value)} />
                    ) : (
                      <p>{location || "No location"}</p>
                    )}
                  </div>
                </div>

                {/* AVATAR */}
                <div className="flex items-center gap-3">
                  <ImageIcon size={18} />
                  <div>
                    <p>Profile Photo</p>
                    <p>{displayAvatar || "No photo"}</p>
                  </div>
                </div>

                {/* GITHUB */}
                <div className="flex items-center gap-3">
                  <GithubIcon size={18} />
                  <div className="w-full">
                    <p>GitHub</p>
                    {isEditing ? (
                      <div className="space-y-1">
                        <input
                          value={githubProfile}
                          onChange={(e) => setGithubProfile(e.target.value)}
                          placeholder="https://github.com/username"
                          className="w-full"
                        />
                        {!isGithubProfileValid && (
                          <p className="text-xs text-rose-600">Enter a valid GitHub URL.</p>
                        )}
                      </div>
                    ) : hasGithubProfile ? (
                      <a
                        href={normalizedGithubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline-offset-2 hover:underline"
                      >
                        {normalizedGithubUrl}
                      </a>
                    ) : (
                      <p>No GitHub profile</p>
                    )}
                  </div>
                </div>

                {/* LINKEDIN */}
                <div className="flex items-center gap-3">
                  <LinkedinIcon size={18} />
                  <div className="w-full">
                    <p>LinkedIn</p>
                    {isEditing ? (
                      <div className="space-y-1">
                        <input
                          value={linkedinProfile}
                          onChange={(e) => setLinkedinProfile(e.target.value)}
                          placeholder="https://www.linkedin.com/in/username"
                          className="w-full"
                        />
                        {!isLinkedinProfileValid && (
                          <p className="text-xs text-rose-600">Enter a valid LinkedIn URL.</p>
                        )}
                      </div>
                    ) : hasLinkedinProfile ? (
                      <a
                        href={normalizedLinkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline-offset-2 hover:underline"
                      >
                        {normalizedLinkedinUrl}
                      </a>
                    ) : (
                      <p>No LinkedIn profile</p>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* ABOUT */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h1>About</h1>
              {isEditing ? (
                <textarea value={about} onChange={(e) => setAbout(e.target.value)} />
              ) : (
                <p>{about}</p>
              )}
            </div>

          </div>

          {/* RIGHT SIDE (FIXED) */}
          <div className="space-y-5">

            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
              <div className="flex items-center gap-3 text-primary">
                <SparklesIcon size={18} />
                <h2>Note</h2>
              </div>
              <p className="mt-3 text-sm">
                Keep your role, location, and intro updated so teammates see accurate details.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm text-white"
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
