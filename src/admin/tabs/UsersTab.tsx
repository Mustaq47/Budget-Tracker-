// Users Tab — Full user directory with search, filter, and expandable detail panel
// Virtual-scrolled list, mobile-optimized touch rows

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence, useDragControls } from "motion/react";

function UserDetailPanel({
  user,
  onClose,
  isDark,
}: {
  user: UserDirectoryEntry;
  onClose: () => void;
  isDark: boolean;
}) {
  const panelBg = isDark ? "bg-[#1C1C1E]/95 backdrop-blur-3xl" : "bg-white/95 backdrop-blur-3xl";
  const textColor = isDark ? "text-white" : "text-black";
  const subColor = isDark ? "text-white/50" : "text-slate-500";
  const divider = isDark ? "divide-white/5" : "divide-slate-200/50";
  const rowBg = isDark ? "bg-white/5 shadow-inner" : "bg-slate-100/50 shadow-inner";
  const dragControls = useDragControls();

  const stats = [
    { label: "Transactions", value: user.stats.transactionCount },
    { label: "Trips", value: user.stats.tripsCount },
    { label: "Goals", value: user.stats.goalsCount },
    { label: "Storage", value: `${user.stats.localStorageSizeKb} KB` },
  ];

  return (
    <motion.div
      drag="y"
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={{ top: 0 }}
      dragElastic={0.2}
      onDragEnd={(e, info) => {
        if (info.offset.y > 100 || info.velocity.y > 500) {
          onClose();
        }
      }}
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 350 }}
      className={`fixed inset-x-0 bottom-0 z-50 rounded-t-[40px] flex flex-col ${panelBg} shadow-[0_-20px_60px_rgb(0,0,0,0.3)] border-t ${isDark ? "border-white/10" : "border-slate-200/50"}`}
      style={{ maxHeight: "92vh" }}
    >
      {/* Handle Area (Drag target) */}
      <div 
        onPointerDown={(e) => dragControls.start(e)}
        style={{ touchAction: "none" }}
        className="pt-3 pb-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing shrink-0"
      >
        <div className={`w-12 h-1.5 rounded-full ${isDark ? "bg-white/20" : "bg-slate-300"}`} />
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto touch-pan-y hide-scrollbar pb-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-6 pt-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-2xl font-black text-emerald-500 shadow-inner">
              {user.displayName?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <p className={`font-black text-xl tracking-tight ${textColor}`}>{user.displayName}</p>
              <p className={`text-sm font-semibold mt-0.5 ${subColor}`}>{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            onPointerDown={(e) => e.stopPropagation()}
            className={`p-2 rounded-full ${isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-slate-100 hover:bg-slate-200 text-black"} cursor-pointer transition-colors shadow-sm`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status row */}
        <div className="px-6 flex items-center gap-2 pb-6">
          <StatusBadge status={user.syncState} isDark={isDark} />
          <StatusBadge status={user.platform} isDark={isDark} />
          <StatusBadge status={user.status} isDark={isDark} />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2 px-6 mb-6">
          {stats.map((s) => (
            <div key={s.label} className={`p-4 rounded-3xl text-center ${rowBg}`}>
              <p className={`text-base font-black tracking-tight ${textColor}`}>{s.value}</p>
              <p className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${subColor}`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Details list */}
        <div className={`px-6 space-y-1 divide-y ${divider}`}>
          {[
            { label: "UID", value: user.uid },
            { label: "App Version", value: user.appVersion },
            { label: "Last Login", value: new Date(user.lastLoginAt).toLocaleString() },
            { label: "Last Backup", value: user.lastBackupAt ? new Date(user.lastBackupAt).toLocaleString() : "None" },
            { label: "Sync State", value: user.syncState },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-4">
              <span className={`text-xs font-semibold ${subColor}`}>{label}</span>
              <span className={`text-xs font-black tracking-tight ${textColor} text-right max-w-[60%] truncate`}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

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

const SORT_OPTIONS = [
  { value: "recent_login", label: "Recent Login" },
  { value: "name", label: "Name (A-Z)" },
  { value: "transactions", label: "Transactions" },
  { value: "storage", label: "Storage Size" },
];

interface UsersTabProps {
  users: UserDirectoryEntry[];
  isLoading: boolean;
  isDark: boolean;
}

export function UsersTab({ users, isLoading, isDark }: UsersTabProps) {
  const [search, setSearch] = useState("");
  const [syncFilter, setSyncFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("recent_login");
  const [selectedUser, setSelectedUser] = useState<UserDirectoryEntry | null>(null);

  const cardBg = isDark 
    ? "bg-[#1C1C1E]/80 border-white/5 backdrop-blur-2xl shadow-[0_4px_20px_rgb(0,0,0,0.3)]" 
    : "bg-white/80 border-slate-200/50 backdrop-blur-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)]";
  const divider = isDark ? "divide-white/5" : "divide-slate-200/50";
  const textColor = isDark ? "text-white" : "text-black";
  const subColor = isDark ? "text-white/50" : "text-slate-500";
  const rowHover = isDark ? "hover:bg-white/5" : "hover:bg-slate-100/50";

  const [viewMode, setViewMode] = useState<"DIRECTORY" | "MAIL">("DIRECTORY");

  const handleDownloadCSV = () => {
    const headers = ["userid", "username", "Mail", "timestamp"];
    const rows = users.map(u => [
      u.uid,
      u.displayName || "Unknown",
      u.email || "No Email",
      new Date(u.lastLoginAt).toISOString()
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.map(cell => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "cozify_users_mail_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = useMemo(() => {
    let result = users.filter((u) => {
      const matchSearch =
        search === "" ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.displayName.toLowerCase().includes(search.toLowerCase());
      const matchFilter = syncFilter === "ALL" || u.syncState === syncFilter;
      return matchSearch && matchFilter;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.displayName.localeCompare(b.displayName);
        case "transactions":
          return (b.stats?.transactionCount || 0) - (a.stats?.transactionCount || 0);
        case "storage":
          return (b.stats?.localStorageSizeKb || 0) - (a.stats?.localStorageSizeKb || 0);
        case "recent_login":
        default:
          return new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime();
      }
    });

    return result;
  }, [users, search, syncFilter, sortBy]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionHeader
          title={viewMode === "DIRECTORY" ? "User Directory" : "Mail Directory"}
          subtitle={viewMode === "DIRECTORY" 
            ? `${filtered.length} ${filtered.length === 1 ? 'user' : 'users'} ${syncFilter !== 'ALL' ? `(${syncFilter.toLowerCase()})` : `(Total: ${users.length})`}`
            : `${users.length} registered email addresses`}
          isDark={isDark}
        />
        <div className={`flex items-center p-1 rounded-full ${isDark ? "bg-[#1C1C1E]" : "bg-slate-200"}`}>
          <button
            onClick={() => setViewMode("DIRECTORY")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === "DIRECTORY" ? (isDark ? "bg-white text-black shadow-md" : "bg-white text-black shadow-md") : (isDark ? "text-white/50" : "text-slate-500")}`}
          >
            Directory
          </button>
          <button
            onClick={() => setViewMode("MAIL")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === "MAIL" ? (isDark ? "bg-white text-black shadow-md" : "bg-white text-black shadow-md") : (isDark ? "text-white/50" : "text-slate-500")}`}
          >
            Mail
          </button>
        </div>
      </div>

      {viewMode === "DIRECTORY" ? (
        <>
          <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        filters={SYNC_FILTERS}
        activeFilter={syncFilter}
        onFilterChange={setSyncFilter}
        searchPlaceholder="Search by name or email..."
        isDark={isDark}
        sortOptions={SORT_OPTIONS}
        activeSort={sortBy}
        onSortChange={setSortBy}
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
        <div className={`rounded-[28px] border ${cardBg} divide-y ${divider} overflow-hidden`}>
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
                  Last login: {new Date(user.lastLoginAt).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                {(sortBy === "transactions" || sortBy === "storage") && (
                  <div className={`text-[10px] mt-0.5 font-bold ${textColor}`}>
                    {sortBy === "transactions" ? `${user.stats.transactionCount} transactions` : `${user.stats.localStorageSizeKb} KB storage`}
                  </div>
                )}
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
        </>
      ) : (
        <div className={`rounded-[28px] border p-4 ${cardBg}`}>
          <div className="flex justify-end mb-4">
            <button
              onClick={handleDownloadCSV}
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 ${isDark ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-emerald-100 text-emerald-700 border border-emerald-200"}`}
            >
              Download CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className={`border-b ${divider} ${subColor} text-[10px] uppercase tracking-wider`}>
                  <th className="pb-3 font-bold px-2">User ID</th>
                  <th className="pb-3 font-bold px-2">Username</th>
                  <th className="pb-3 font-bold px-2">Mail</th>
                  <th className="pb-3 font-bold px-2 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${divider}`}>
                {users.map((user) => (
                  <tr key={user.uid} className={`transition-colors ${rowHover}`}>
                    <td className={`py-3 px-2 text-xs font-medium font-mono ${subColor} max-w-[120px] truncate`}>{user.uid}</td>
                    <td className={`py-3 px-2 text-xs font-bold ${textColor}`}>{user.displayName || "Unknown"}</td>
                    <td className={`py-3 px-2 text-xs ${subColor}`}>{user.email || "No Email"}</td>
                    <td className={`py-3 px-2 text-xs ${subColor} text-right whitespace-nowrap`}>
                      {new Date(user.lastLoginAt).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
