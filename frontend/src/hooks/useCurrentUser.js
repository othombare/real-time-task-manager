import { useEffect, useState } from "react";
import { getMyProfile, getStoredProfile } from "../api/auth";

export function useCurrentUser() {
  const [profile, setProfile] = useState(() => getStoredProfile());
  const [loading, setLoading] = useState(!getStoredProfile());

  useEffect(() => {
    let ignore = false;

    const loadProfile = async () => {
      try {
        const data = await getMyProfile();

        if (!ignore) {
          setProfile(data);
        }
      } catch {
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
