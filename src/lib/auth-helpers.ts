import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { UserRole } from "@/lib/models/User";

export class AuthError extends Error {}

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new AuthError("Not authenticated.");
  }
  return session;
}

export async function requireRole(...roles: UserRole[]) {
  const session = await requireSession();
  if (!roles.includes(session.user.role)) {
    throw new AuthError("You do not have permission to perform this action.");
  }
  return session;
}
