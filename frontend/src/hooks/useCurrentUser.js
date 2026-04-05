import { useAppSelector } from "../store/hooks";

export function useCurrentUser() {
  const profile = useAppSelector((state) => state.auth.user);
  const loading = useAppSelector((state) => state.auth.loading);

  return { profile, loading };
}
