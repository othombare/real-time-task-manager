import { useEffect, useState } from "react";
import { getMyProfile, getStoredProfile } from "../api/auth";

export function useCurrentUser() {
  const [profile, setProfile] = useState(() => getStoredProfile());
  const [loading, setLoading] = useState(!getStoredProfile());

  useEffect(() => {
    let ignore = false;

    const loadProfile = async () => {
      try {
        console.log("useCurrentUser: Starting profile load");
        const data = await getMyProfile();
        console.log("useCurrentUser: Profile loaded successfully:", data);

        if (!ignore) {
          // Extract the user from the response
          setProfile(data.data?.user || getStoredProfile());
        }
      } catch (error) {
        console.error("useCurrentUser: Error loading profile:", error);
        if (!ignore) {
          setProfile((current) => current);
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
