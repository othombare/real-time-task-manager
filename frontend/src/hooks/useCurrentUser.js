import { useAppSelector } from "../store/hooks";

export function useCurrentUser() {
  const profile = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const loading = useAppSelector((state) => state.auth.loading);
  const profileSaving = useAppSelector((state) => state.auth.profileSaving);
  const initialized = useAppSelector((state) => state.auth.initialized);

  return { profile, token, loading, profileSaving, initialized };
}
