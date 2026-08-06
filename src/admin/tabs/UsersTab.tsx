// Users Tab — Full user directory with search, filter, and expandable detail panel
// Virtual-scrolled list, mobile-optimized touch rows

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Smartphone, Globe, Monitor, Cloud, Lock, ChevronRight } from "lucide-react";
import {
  FilterBar,
  StatusBadge,
  EmptyState,
  SectionHeader,
  SkeletonCard,
} from "../components/shared/SharedComponents";
import type { UserDirectoryEntry, SyncState } from "../types/admin.types";

const SYNC_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "SYNCED", label: "Synced" },
  { value: "OFFLINE_LOCAL", label: "Offline" },
  { value: "PENDING", label: "Pending" },
  { value: "FLAGGED", label: "Flagged" },
];

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  Android: <Smartphone className="w-3.5 h-3.5 text-emerald-500" />,
  Web: <Globe className="w-3.5 h-3.5 text-blue-500" />,
  iOS: <Monitor className="w-3.5 h-3.5 text-purple-500" />,
};

interface UsersTabProps {
  users: UserDirectoryEntry[];
  isLoading: boolean;
  isDark: boolean;
}

function UserDetailPanel({
  user,
  onClose,
  isDark,
}: {
  user: UserDirectoryEntry;
  onClose: () => void;
  isDark: boolean;
}) {
  const panelBg = isDark ? "bg-[#1E1E1E]" : "bg-white";
  const textColor = isDark ? "text-[#F8FAFC]" : "text-[#111827]";
  const subColor = isDark ? "text-[#94A3B8]" : "text-[#6B7280]";
  const divider = isDark ? "divide-[#374151]" : "divide-[#E5E7EB]";
  const rowBg = isDark ? "bg-[#2D2D2D]" : "bg-[#F8FAFC]";

  const stats = [
    { label: "Transactions", value: user.stats.transactionCount },
    { label: "Cards", value: user.stats.cardsCount },
    { label: "Goals", value: user.stats.goalsCount },
    { label: "Storage", value: `${user.stats.localStorageSizeKb} KB` },
  ];

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className={`fixed inset-x-0 bottom-0 z-50 rounded-t-[28px] ${panelBg} shadow-2xl`}
      style={{ maxHeight: "80vh", overflowY: "auto" }}
    >
      {/* Handle */}
      <div className="flex justify-center pt-3 pb-2">
        <div className={`w-10 h-1 rounded-full ${isDark ? "bg-white/20" : "bg-slate-300"}`} />
      </div>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-xl font-black text-emerald-600">
            {user.displayName?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <p className={`font-black text-base ${textColor}`}>{user.displayName}</p>
            <p className={`text-xs ${subColor}`}>{user.email}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className={`p-2 rounded-full ${isDark ? "bg-white/10" : "bg-slate-100"} cursor-pointer`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Status row */}
      <div className="px-5 flex items-center gap-2 pb-4">
        <StatusBadge status={user.syncState} isDark={isDark} />
        <StatusBadge status={user.platform} isDark={isDark} />
        <StatusBadge status={user.status} isDark={isDark} />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-2 px-5 mb-4">
        {stats.map((s) => (
          <div key={s.label} className={`p-3 rounded-2xl text-center ${rowBg}`}>
            <p className={`text-sm font-black ${textColor}`}>{s.value}</p>
            <p className={`text-[9px] font-semibold mt-0.5 ${subColor}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Details list */}
      <div className={`px-5 pb-8 space-y-2 divide-y ${divider}`}>
        {[
          { label: "UID", value: user.uid },
          { label: "App Version", value: user.appVersion },
          { label: "Last Login", value: new Date(user.lastLoginAt).toLocaleString() },
          { label: "Last Backup", value: user.lastBackupAt ? new Date(user.lastBackupAt).toLocaleString() : "None" },
          { label: "Sync State", value: user.syncState },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center py-2">
            <span className={`text-xs ${subColor}`}>{label}</span>
            <span className={`text-xs font-bold ${textColor} text-right max-w-[60%] truncate`}>{value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function UsersTab({ users, isLoading, isDark }: UsersTabProps) {
  const [search, setSearch] = useState("");
  const [syncFilter, setSyncFilter] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState<UserDirectoryEntry | null>(null);

  const cardBg = isDark ? "bg-[#1E1E1E] border-[#374151]" : "bg-white border-[#E5E7EB]";
  const divider = isDark ? "divide-[#374151]" : "divide-[#E5E7EB]";
  const textColor = isDark ? "text-[#F8FAFC]" : "text-[#111827]";
  const subColor = isDark ? "text-[#94A3B8]" : "text-[#6B7280]";
  const rowHover = isDark ? "hover:bg-white/5" : "hover:bg-[#F8FAFC]";

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        search === "" ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.displayName.toLowerCase().includes(search.toLowerCase());
      const matchFilter = syncFilter === "ALL" || u.syncState === syncFilter;
      return matchSearch && matchFilter;
    });
  }, [users, search, syncFilter]);

  return (
    <div className="space-y-4">
      <SectionHeader
        title="User Directory"
        subtitle={`${users.length} registered users`}
        isDark={isDark}
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        filters={SYNC_FILTERS}
        activeFilter={syncFilter}
        onFilterChange={setSyncFilter}
        searchPlaceholder="Search by name or email..."
        isDark={isDark}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} isDark={isDark} lines={1} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Try a different search or filter"
          isDark={isDark}
        />
      ) : (
        <div className={`rounded-[20px] border ${cardBg} divide-y ${divider} overflow-hidden`}>
          {filtered.map((user, idx) => (
            <motion.button
              key={user.uid}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => setSelectedUser(user)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${rowHover} cursor-pointer`}
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-sm font-black text-emerald-600 flex-shrink-0">
                {user.displayName?.[0]?.toUpperCase() || "U"}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold truncate ${textColor}`}>{user.displayName}</span>
                  <span>{PLATFORM_ICONS[user.platform]}</span>
                </div>
                <div className={`text-[10px] truncate ${subColor}`}>{user.email}</div>
                <div className={`text-[10px] mt-0.5 ${subColor}`}>
                  Last login: {new Date(user.lastLoginAt).toLocaleDateString()}
                </div>
              </div>

              {/* Sync badge */}
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <StatusBadge status={user.syncState} isDark={isDark} />
                <ChevronRight className={`w-3.5 h-3.5 ${subColor}`} />
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Detail Panel Overlay */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="fixed inset-0 bg-black z-40 cursor-pointer"
            />
            <UserDetailPanel
              user={selectedUser}
              onClose={() => setSelectedUser(null)}
              isDark={isDark}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
