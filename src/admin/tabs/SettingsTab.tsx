// Settings Tab — IAM Management + Support Queries
// Redesigned from original AdminDashboard.tsx

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  MessageSquare,
  Plus,
  Trash2,
  Send,
  ChevronDown,
  ChevronUp,
  X,
  UserPlus,
  AlertTriangle,
} from "lucide-react";
import {
  StatusBadge,
  FilterBar,
  SectionHeader,
  ChartCard,
  EmptyState,
  SkeletonCard,
} from "../components/shared/SharedComponents";
import type {
  IamRoleAssignment,
  SupportTicket,
  AdminRole,
  TicketStatus,
} from "../types/admin.types";
import { assignAdminRole, revokeAdminRole, ROOT_SUPER_ADMIN_EMAIL } from "../../services/adminIamService";
import { replyToSupportTicket, updateTicketStatus } from "../../services/supportQueryService";
import { getIamRoleAssignments } from "../../services/adminIamService";
import { getSupportTickets } from "../../services/supportQueryService";

interface SettingsTabProps {
  iamRoles: IamRoleAssignment[];
  tickets: SupportTicket[];
  userEmail: string;
  isSuperAdmin: boolean;
  isLoading: boolean;
  isDark: boolean;
  onIamUpdate: (roles: IamRoleAssignment[]) => void;
  onTicketUpdate: (tickets: SupportTicket[]) => void;
}

const TICKET_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

const ROLE_OPTIONS: { value: AdminRole; label: string }[] = [
  { value: "SUPPORT_MODERATOR", label: "Support Moderator" },
  { value: "ANALYST", label: "Analyst" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
];

export function SettingsTab({
  iamRoles,
  tickets,
  userEmail,
  isSuperAdmin,
  isLoading,
  isDark,
  onIamUpdate,
  onTicketUpdate,
}: SettingsTabProps) {
  // IAM state
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<AdminRole>("SUPPORT_MODERATOR");
  const [iamMsg, setIamMsg] = useState("");
  const [iamLoading, setIamLoading] = useState(false);

  // Ticket state
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketFilter, setTicketFilter] = useState("ALL");
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  const cardBg = isDark ? "bg-[#1E1E1E] border-[#374151]" : "bg-white border-[#E5E7EB]";
  const divider = isDark ? "divide-[#374151]" : "divide-[#E5E7EB]";
  const textColor = isDark ? "text-[#F8FAFC]" : "text-[#111827]";
  const subColor = isDark ? "text-[#94A3B8]" : "text-[#6B7280]";
  const inputBg = isDark
    ? "bg-[#2D2D2D] border-[#374151] text-white placeholder-white/30"
    : "bg-[#F1F5F9] border-[#E5E7EB] text-[#111827] placeholder-[#6B7280]";
  const rowHover = isDark ? "hover:bg-white/5" : "hover:bg-[#F8FAFC]";

  // ─── IAM Actions ─────────────────────────────────────────────
  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setIamLoading(true);
    try {
      await assignAdminRole(newEmail.trim(), newRole, userEmail || ROOT_SUPER_ADMIN_EMAIL);
      const updated = await getIamRoleAssignments();
      onIamUpdate(updated as any);
      setNewEmail("");
      setIamMsg(`✓ Granted ${newRole} to ${newEmail}`);
      setTimeout(() => setIamMsg(""), 4000);
    } catch (err: any) {
      setIamMsg(`✗ ${err.message || "Error assigning role"}`);
      setTimeout(() => setIamMsg(""), 4000);
    } finally {
      setIamLoading(false);
    }
  };

  const handleRevoke = async (email: string) => {
    if (!confirm(`Revoke admin authority for ${email}?`)) return;
    try {
      await revokeAdminRole(email);
      const updated = await getIamRoleAssignments();
      onIamUpdate(updated as any);
    } catch (err: any) {
      alert(err.message || "Cannot revoke role.");
    }
  };

  // ─── Ticket Actions ───────────────────────────────────────────
  const filteredTickets = tickets.filter((t) => {
    const matchSearch =
      ticketSearch === "" ||
      t.userEmail.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.subject.toLowerCase().includes(ticketSearch.toLowerCase());
    const matchStatus = ticketFilter === "ALL" || t.status === ticketFilter;
    return matchSearch && matchStatus;
  });

  const handleSendReply = async (ticket: SupportTicket) => {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    try {
      await replyToSupportTicket(ticket.id, replyText.trim(), userEmail || ROOT_SUPER_ADMIN_EMAIL);
      const updated = await getSupportTickets();
      onTicketUpdate(updated as any);
      setReplyText("");
    } catch (e: any) {
      alert(e.message || "Error sending reply.");
    } finally {
      setReplyLoading(false);
    }
  };

  const handleStatusChange = async (ticket: SupportTicket, status: TicketStatus) => {
    try {
      await updateTicketStatus(ticket.id, status);
      const updated = await getSupportTickets();
      onTicketUpdate(updated as any);
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── IAM Section ────────────────────────────────────── */}
      <div>
        <SectionHeader
          title="IAM & Access Control"
          subtitle={`${iamRoles.length} role ${iamRoles.length === 1 ? "assignment" : "assignments"}`}
          isDark={isDark}
          action={
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 text-[10px] font-black border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              RBAC
            </span>
          }
        />

        {/* Assign Form — Super Admin only */}
        {isSuperAdmin && (
          <ChartCard
            title="Assign Admin Role"
            isDark={isDark}
            className="mb-4"
          >
            <form onSubmit={handleAssign} className="space-y-3">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="admin@email.com"
                className={`w-full h-10 px-4 rounded-2xl border text-sm font-medium outline-none ${inputBg}`}
                required
              />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as AdminRole)}
                className={`w-full h-10 px-4 rounded-2xl border text-sm font-medium outline-none ${inputBg}`}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <motion.button
                type="submit"
                disabled={iamLoading}
                whileTap={{ scale: 0.96 }}
                className="w-full h-10 rounded-2xl bg-emerald-500 text-white text-sm font-black flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                {iamLoading ? "Granting..." : "Grant Access"}
              </motion.button>
              {iamMsg && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-xs font-bold text-center ${iamMsg.startsWith("✓") ? "text-emerald-500" : "text-red-400"}`}
                >
                  {iamMsg}
                </motion.div>
              )}
            </form>
          </ChartCard>
        )}

        {/* IAM Role List */}
        {isLoading ? (
          <SkeletonCard isDark={isDark} lines={3} />
        ) : iamRoles.length === 0 ? (
          <EmptyState title="No admin roles assigned" isDark={isDark} />
        ) : (
          <div className={`rounded-[20px] border ${cardBg} divide-y ${divider} overflow-hidden`}>
            {iamRoles.map((r, idx) => {
              const isRoot = r.email.toLowerCase() === ROOT_SUPER_ADMIN_EMAIL.toLowerCase();
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex items-center gap-3 px-4 py-3.5`}
                >
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-sm font-black text-purple-600 flex-shrink-0">
                    {r.email?.[0]?.toUpperCase() || "A"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-bold truncate ${textColor}`}>{r.email}</div>
                    <div className={`text-[10px] ${subColor}`}>
                      Granted by {r.grantedBy} · {new Date(r.grantedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={r.role} isDark={isDark} />
                    {!isRoot && isSuperAdmin && (
                      <button
                        onClick={() => handleRevoke(r.email)}
                        className="p-1.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Support Queries Section ─────────────────────────── */}
      <div>
        <SectionHeader
          title="Support Queries"
          subtitle={`${tickets.filter((t) => t.status === "OPEN").length} open tickets`}
          isDark={isDark}
          action={
            tickets.filter((t) => t.status === "OPEN").length > 0 ? (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-black border border-red-500/20">
                <AlertTriangle className="w-3 h-3" />
                {tickets.filter((t) => t.status === "OPEN").length} OPEN
              </span>
            ) : null
          }
        />

        <FilterBar
          searchValue={ticketSearch}
          onSearchChange={setTicketSearch}
          filters={TICKET_FILTERS}
          activeFilter={ticketFilter}
          onFilterChange={setTicketFilter}
          searchPlaceholder="Search by email or subject..."
          isDark={isDark}
        />

        <div className="mt-4 space-y-3">
          {isLoading ? (
            <SkeletonCard isDark={isDark} lines={4} />
          ) : filteredTickets.length === 0 ? (
            <EmptyState title="No tickets found" isDark={isDark} />
          ) : (
            filteredTickets.map((ticket) => {
              const isExpanded = expandedTicket === ticket.id;
              return (
                <motion.div
                  key={ticket.id}
                  layout
                  className={`rounded-[20px] border ${cardBg} overflow-hidden`}
                >
                  {/* Ticket Header */}
                  <button
                    onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3.5 text-left cursor-pointer ${rowHover} transition-colors`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <StatusBadge status={ticket.priority} isDark={isDark} />
                        <StatusBadge status={ticket.status} isDark={isDark} />
                      </div>
                      <p className={`text-xs font-bold truncate ${textColor}`}>{ticket.subject}</p>
                      <p className={`text-[10px] ${subColor}`}>{ticket.userEmail}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className={`w-4 h-4 ${subColor}`} />
                      ) : (
                        <ChevronDown className={`w-4 h-4 ${subColor}`} />
                      )}
                    </div>
                  </button>

                  {/* Expanded Detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`border-t ${isDark ? "border-[#374151]" : "border-[#E5E7EB]"} px-4 pb-4 pt-3 space-y-3`}
                      >
                        {/* Question */}
                        <p className={`text-xs ${subColor} leading-relaxed`}>{ticket.question}</p>

                        {/* Existing Reply */}
                        {ticket.reply && (
                          <div className={`rounded-2xl p-3 ${isDark ? "bg-emerald-500/10" : "bg-emerald-50"}`}>
                            <p className="text-[10px] font-black text-emerald-600 mb-1">Admin Reply</p>
                            <p className={`text-xs ${subColor}`}>{ticket.reply.content}</p>
                          </div>
                        )}

                        {/* Status Controls */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {(["IN_PROGRESS", "RESOLVED", "CLOSED"] as TicketStatus[]).map((s) => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(ticket, s)}
                              disabled={ticket.status === s}
                              className={`px-2.5 py-1 rounded-xl text-[10px] font-black border cursor-pointer disabled:opacity-30 transition-all ${
                                isDark ? "border-[#374151] text-[#94A3B8] hover:bg-white/10" : "border-[#E5E7EB] text-[#6B7280] hover:bg-slate-100"
                              }`}
                            >
                              → {s.replace(/_/g, " ")}
                            </button>
                          ))}
                        </div>

                        {/* Reply Form */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type admin reply..."
                            className={`flex-1 h-9 px-3 rounded-2xl border text-xs font-medium outline-none ${
                              isDark ? "bg-[#2D2D2D] border-[#374151] text-white placeholder-white/30" : "bg-[#F1F5F9] border-[#E5E7EB] text-[#111827] placeholder-[#6B7280]"
                            }`}
                          />
                          <motion.button
                            onClick={() => handleSendReply(ticket)}
                            disabled={!replyText.trim() || replyLoading}
                            whileTap={{ scale: 0.92 }}
                            className="w-9 h-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center cursor-pointer disabled:opacity-40"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
