"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users2, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { updateUserRole, toggleUserActive } from "@/lib/actions/settings";
import { USER_ROLES } from "@/lib/constants";
import { ROLE_LABELS } from "@/components/layout/nav-config";
import { UserForm } from "@/components/settings/user-form";
import { ConfigForm } from "@/components/settings/config-form";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type User = {
  _id: string;
  name: string;
  email: string;
  role: (typeof USER_ROLES)[number];
  active: boolean;
};

type ConfigData = {
  feeSchedule: { tricycle: number; "habal-habal/motorcycle": number; other: number };
  zones: string[];
};

export function SettingsView({ users, config }: { users: User[]; config: ConfigData }) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [userList, setUserList] = useState(users);
  const [, startTransition] = useTransition();

  async function handleRoleChange(userId: string, role: string) {
    const result = await updateUserRole({ userId, role });
    if (result.success) {
      toast.success("Role updated.");
      setUserList((prev) => prev.map((u) => (u._id === userId ? { ...u, role: role as User["role"] } : u)));
    } else {
      toast.error(result.error);
    }
  }

  async function handleToggleActive(userId: string, active: boolean) {
    const result = await toggleUserActive(userId, active);
    if (result.success) {
      toast.success(active ? "User activated." : "User deactivated.");
      setUserList((prev) => prev.map((u) => (u._id === userId ? { ...u, active } : u)));
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Tabs defaultValue="users">
      <TabsList>
        <TabsTrigger value="users">
          <Users2 className="size-4" />
          Users
        </TabsTrigger>
        <TabsTrigger value="config">
          <Settings2 className="size-4" />
          Fee Schedule & Zones
        </TabsTrigger>
      </TabsList>

      <TabsContent value="users" className="mt-4 space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            New User
          </Button>
        </div>

        {userList.length === 0 ? (
          <EmptyState icon={Users2} title="No users found" description="Create your first user account." />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userList.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Select
                        value={u.role}
                        onValueChange={(value) =>
                          startTransition(() => handleRoleChange(u._id, String(value)))
                        }
                      >
                        <SelectTrigger size="sm" className="w-44">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {USER_ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {ROLE_LABELS[role]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          u.active
                            ? "border-status-active/30 bg-status-active/10 text-status-active"
                            : "border-status-suspended/30 bg-status-suspended/10 text-status-suspended"
                        }
                      >
                        {u.active ? "Active" : "Deactivated"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startTransition(() => handleToggleActive(u._id, !u.active))}
                      >
                        {u.active ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New User</DialogTitle>
            </DialogHeader>
            <UserForm
              onSuccess={() => {
                setCreateOpen(false);
                router.refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </TabsContent>

      <TabsContent value="config" className="mt-4">
        <ConfigForm config={config} />
      </TabsContent>
    </Tabs>
  );
}
