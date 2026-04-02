import { useEffect, useState } from "react";
import { getMyProfile, getStoredProfile, isAuthenticated } from "../api/auth";

export function useCurrentUser() {
  const [profile, setProfile] = useState(() => getStoredProfile());
  const [loading, setLoading] = useState(() => {
    // Only loading if we have a token but no stored profile
    return isAuthenticated() && !getStoredProfile();
  });

  useEffect(() => {
    // Only try to load profile if we have a token
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }

    let ignore = false;

    const loadProfile = async () => {
      try {
        console.log("useCurrentUser: Starting profile load");
        const data = await getMyProfile();
        console.log("useCurrentUser: Profile loaded successfully:", data);

        if (!ignore) {
          // Extract the user from the response
          const userProfile = data.data?.user;
          setProfile(userProfile);
        }
      } catch (error) {
        console.error("useCurrentUser: Error loading profile:", error);
        if (!ignore) {
          // If profile loading fails (token expired/invalid), clear profile
          setProfile(null);
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

  return { profile, loading };
}
