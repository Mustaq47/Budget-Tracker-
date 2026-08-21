import { collection, doc, setDoc, getDocs, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { PRIMARY_ROOT_EMAIL } from "./adminIamService";

export type TicketPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketCategory = 'GENERAL' | 'BUG' | 'LEGAL_PRIVACY' | 'FEATURE_REQUEST' | 'BILLING';

export interface SupportTicket {
  id: string;
  userEmail: string;
  userUid?: string;
  subject: string;
  question: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  reply?: {
    content: string;
    repliedBy: string;
    repliedAt: string;
  };
}

const LOCAL_STORAGE_KEY = "cozify_support_tickets_cache";

/**
 * Load support tickets from Firestore + Local Cache
 */
export async function getSupportTickets(): Promise<SupportTicket[]> {
  const ticketMap = new Map<string, SupportTicket>();

  // Load from local storage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SupportTicket[];
      parsed.forEach((t) => ticketMap.set(t.id, t));
    }
  } catch {
    // ignore
  }

  // Load from Firestore
  try {
    const querySnapshot = await getDocs(collection(db, "support_queries"));
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as SupportTicket;
      ticketMap.set(docSnap.id, {
        ...data,
        id: docSnap.id,
      });
    });

    // Cache to local storage
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(ticketMap.values())));
    } catch {
      // ignore
    }
  } catch (e) {
    console.warn("[SupportQueryService] Offline/fallback mode for support tickets:", e);
  }

  return Array.from(ticketMap.values()).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Submit a new support ticket / user question
 */
export async function submitSupportTicket(payload: {
  userEmail: string;
  subject: string;
  question: string;
  category?: TicketCategory;
  priority?: TicketPriority;
}): Promise<SupportTicket> {
  const ticketId = `TKT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(10 + Math.random() * 90)}`;
  const newTicket: SupportTicket = {
    id: ticketId,
    userEmail: payload.userEmail || "anonymous@cozify.local",
    subject: payload.subject,
    question: payload.question,
    category: payload.category || "GENERAL",
    priority: payload.priority || "MEDIUM",
    status: "OPEN",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Save local
  try {
    const list = await getSupportTickets();
    const updated = [newTicket, ...list];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  // 2. Save cloud
  try {
    await setDoc(doc(db, "support_queries", ticketId), {
      ...newTicket,
      updatedAt: serverTimestamp(),
    });
  } catch {
    // ignore
  }

  return newTicket;
}

/**
 * Admin reply to a support ticket
 */
export async function replyToSupportTicket(
  ticketId: string,
  replyContent: string,
  adminEmail: string = PRIMARY_ROOT_EMAIL
): Promise<SupportTicket | null> {
  const cleanReply = replyContent.trim();
  if (!cleanReply) throw new Error("Reply content cannot be empty.");

  const all = await getSupportTickets();
  const ticket = all.find((t) => t.id === ticketId);
  if (!ticket) throw new Error("Ticket not found.");

  const updatedTicket: SupportTicket = {
    ...ticket,
    status: "RESOLVED",
    updatedAt: new Date().toISOString(),
    reply: {
      content: cleanReply,
      repliedBy: adminEmail,
      repliedAt: new Date().toISOString(),
    },
  };

  // 1. Save local
  try {
    const updatedList = all.map((t) => (t.id === ticketId ? updatedTicket : t));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
  } catch {
    // ignore
  }

  // 2. Save cloud
  try {
    await updateDoc(doc(db, "support_queries", ticketId), {
      status: "RESOLVED",
      updatedAt: serverTimestamp(),
      reply: updatedTicket.reply,
    });
  } catch {
    // ignore
  }

  return updatedTicket;
}

/**
 * Admin change ticket status
 */
export async function updateTicketStatus(
  ticketId: string,
  newStatus: TicketStatus
): Promise<boolean> {
  const all = await getSupportTickets();
  const ticket = all.find((t) => t.id === ticketId);
  if (!ticket) return false;

  const updatedTicket: SupportTicket = {
    ...ticket,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };

  try {
    const updatedList = all.map((t) => (t.id === ticketId ? updatedTicket : t));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
  } catch {
    // ignore
  }

  try {
    await updateDoc(doc(db, "support_queries", ticketId), {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
  } catch {
    // ignore
  }

  return true;
}
