import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { RosterMeta, useFetchRosters } from "../hooks/useFetchRosters";
import { RosterFileData, useRosterFile } from "../hooks/useRosterFile";

type RosterContextValue = {
  rosters: RosterMeta[] | null;
  loading: boolean;
  error: string | null;
  selectedRoster: RosterFileData | null;
  rosterDataLoading: boolean;
  rosterDataError: string | null;
  setSelectedRosterId: (rosterId: string | null) => void;
};

const RosterContext = createContext<RosterContextValue | undefined>(undefined);

type RosterProviderProps = {
  children: ReactNode;
  initialRosterId?: string | null;
};

export function RosterProvider({ children, initialRosterId }: RosterProviderProps) {
  const { rosters, loading, error } = useFetchRosters();
  const [selectedRosterId, setSelectedRosterId] = useState<string | null>(
    initialRosterId ?? null,
  );

  useEffect(() => {
    if (initialRosterId) {
      setSelectedRosterId(initialRosterId);
    }
  }, [initialRosterId]);

  const selectedRosterMeta = useMemo(() => {
    if (!rosters || !selectedRosterId) {
      return null;
    }
    return rosters.find((roster) => roster.id === selectedRosterId) ?? null;
  }, [rosters, selectedRosterId]);

  const {
    data: selectedRoster,
    loading: rosterDataLoading,
    error: rosterDataError,
  } = useRosterFile(selectedRosterMeta);

  const value = useMemo(
    () => ({
      rosters,
      loading,
      error,
      selectedRoster,
      rosterDataLoading,
      rosterDataError,
      setSelectedRosterId,
    }),
    [rosters, loading, error, selectedRoster, rosterDataLoading, rosterDataError],
  );

  return <RosterContext.Provider value={value}>{children}</RosterContext.Provider>;
}

export function useRosterContext() {
  const context = useContext(RosterContext);
  if (!context) {
    throw new Error("useRosterContext must be used within a RosterProvider.");
  }
  return context;
}
