import { useState, useEffect, useCallback } from "react";
import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { useBudgetStore } from "../store/useBudgetStore";

export type AdminRole = 'SUPER_ADMIN' | 'SUPPORT_MODERATOR' | 'ANALYST' | 'USER';

export interface IamRoleAssignment {
  id: string;               // Unique slug (email lowercased)
  email: string;            // Primary email address
  role: AdminRole;
  grantedBy: string;        // Email of granter
  grantedAt: string;        // ISO timestamp
  lastActiveAt?: string;
  permissions: {
    canManageUsers: boolean;
    canManageQueries: boolean;
    canManageIam: boolean;
    canExportLogs: boolean;
  };
}

export const ROOT_SUPER_ADMIN_EMAILS = [
  "mustaqsk47@gmail.com"
];

// Use the primary one as fallback where a single string is needed
export const PRIMARY_ROOT_EMAIL = ROOT_SUPER_ADMIN_EMAILS[0];

const LOCAL_STORAGE_KEY = "cozify_iam_role_assignments";

export function isRootSuperAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ROOT_SUPER_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

// Hardcode root super admin as immutable base entry
const ROOT_ADMIN_ASSIGNMENT: IamRoleAssignment = {
  id: "mustaqsk47_gmail_com",
  email: PRIMARY_ROOT_EMAIL,
  role: "SUPER_ADMIN",
  grantedBy: "SYSTEM_ROOT",
  grantedAt: "2026-08-01T00:00:00.000Z",
  permissions: {
    canManageUsers: true,
    canManageQueries: true,
    canManageIam: true,
    canExportLogs: true,
  },
};

export function getRolePermissions(role: AdminRole) {
  switch (role) {
    case "SUPER_ADMIN":
      return {
        canManageUsers: true,
        canManageQueries: true,
        canManageIam: true,
        canExportLogs: true,
      };
    case "SUPPORT_MODERATOR":
      return {
        canManageUsers: false,
        canManageQueries: true,
        canManageIam: false,
        canExportLogs: false,
      };
    case "ANALYST":
      return {
        canManageUsers: true,
        canManageQueries: false,
        canManageIam: false,
        canExportLogs: true,
      };
    default:
      return {
        canManageUsers: false,
        canManageQueries: false,
        canManageIam: false,
        canExportLogs: false,
      };
  }
}

/**
 * Load all IAM role assignments from local cache + Firestore sync
 */
export async function getIamRoleAssignments(): Promise<IamRoleAssignment[]> {
  const localList: IamRoleAssignment[] = [ROOT_ADMIN_ASSIGNMENT];

  // Try loading from localStorage first
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as IamRoleAssignment[];
      parsed.forEach((item) => {
        if (!isRootSuperAdmin(item.email)) {
          localList.push(item);
        }
      });
    }
  } catch (e) {
    console.warn("[IAM] Error reading local IAM cache:", e);
  }

  // Try syncing from Firestore
  try {
    const querySnapshot = await getDocs(collection(db, "iam_roles"));
    const cloudList: IamRoleAssignment[] = [ROOT_ADMIN_ASSIGNMENT];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as Partial<IamRoleAssignment>;
      if (data.email && !isRootSuperAdmin(data.email)) {
        cloudList.push({
          id: docSnap.id,
          email: data.email,
          role: (data.role as AdminRole) || "USER",
          grantedBy: data.grantedBy || PRIMARY_ROOT_EMAIL,
          grantedAt: data.grantedAt || new Date().toISOString(),
          permissions: getRolePermissions((data.role as AdminRole) || "USER"),
        });
      }
    });

    // Save cloud synced to local
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(cloudList.filter((i) => !isRootSuperAdmin(i.email)))
      );
    } catch {
      // ignore
    }

    return cloudList;
  } catch (e) {
    // Offline or rules fallback
    return localList;
  }
}

/**
 * Assign a new Admin or Moderator role to any user email
 */
export async function assignAdminRole(
  email: string,
  role: AdminRole,
  grantedByEmail: string = PRIMARY_ROOT_EMAIL
): Promise<IamRoleAssignment> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) throw new Error("A valid user email is required.");
  if (isRootSuperAdmin(cleanEmail)) {
    return ROOT_ADMIN_ASSIGNMENT;
  }

  const assignmentId = cleanEmail;
  const newAssignment: IamRoleAssignment = {
    id: assignmentId,
    email: cleanEmail,
    role,
    grantedBy: grantedByEmail,
    grantedAt: new Date().toISOString(),
    permissions: getRolePermissions(role),
  };

  // 1. Save to local storage
  try {
    const list = await getIamRoleAssignments();
    const updated = list
      .filter((i) => i.email.toLowerCase() !== cleanEmail)
      .concat(newAssignment);
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(updated.filter((i) => !isRootSuperAdmin(i.email)))
    );
  } catch (e) {
    console.warn("[IAM] Local save error:", e);
  }

  // 2. Save to Firestore
  try {
    await setDoc(doc(db, "iam_roles", assignmentId), {
      email: cleanEmail,
      role,
      grantedBy: grantedByEmail,
      grantedAt: newAssignment.grantedAt,
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn("[IAM] Firestore sync offline/unreachable:", e);
  }

  return newAssignment;
}

/**
 * Revoke an admin assignment (cannot revoke root super admin)
 */
export async function revokeAdminRole(email: string): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  if (isRootSuperAdmin(cleanEmail)) {
    throw new Error("Cannot revoke Root Super Admin authority.");
  }

  const assignmentId = cleanEmail;
  const legacyAssignmentId = cleanEmail.replace(/[^a-z0-9]/g, "_");

  // 1. Remove from local storage
  try {
    const list = await getIamRoleAssignments();
    const updated = list.filter((i) => i.email.toLowerCase() !== cleanEmail);
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(updated.filter((i) => !isRootSuperAdmin(i.email)))
    );
  } catch {
    // ignore
  }

  // 2. Remove from Firestore
  try {
    await deleteDoc(doc(db, "iam_roles", assignmentId));
    await deleteDoc(doc(db, "iam_roles", legacyAssignmentId));
  } catch (e) {
    console.warn("[IAM] Firestore delete offline:", e);
  }

  return true;
}

/**
 * React hook to check current logged-in user IAM authorization
 */
export function useAdminIAM() {
  const { user } = useBudgetStore();
  const [role, setRole] = useState<AdminRole>("USER");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuthorization = useCallback(async () => {
    setIsLoading(true);
    const userEmail = user?.email?.trim().toLowerCase() || "";

    // Strict check for Root Super Admin
    if (isRootSuperAdmin(userEmail)) {
      setRole("SUPER_ADMIN");
      setIsLoading(false);
      return;
    }

    if (!userEmail) {
      setRole("USER");
      setIsLoading(false);
      return;
    }

    // Check IAM assignments table
    const assignments = await getIamRoleAssignments();
    const match = assignments.find((i) => i.email.toLowerCase() === userEmail);
    if (match && match.role !== "USER") {
      setRole(match.role);
    } else {
      setRole("USER");
    }
    setIsLoading(false);
  }, [user?.email]);

  useEffect(() => {
    checkAuthorization();
  }, [checkAuthorization]);

  const permissions = getRolePermissions(role);
  const isAdmin = role === "SUPER_ADMIN" || role === "SUPPORT_MODERATOR" || role === "ANALYST";
  const isSuperAdmin = role === "SUPER_ADMIN";

  return {
    role,
    isAdmin,
    isSuperAdmin,
    permissions,
    isLoading,
    refreshIAM: checkAuthorization,
    userEmail: user?.email || "Anonymous",
  };
}
