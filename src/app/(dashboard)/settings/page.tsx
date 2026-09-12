import { listUsers, getConfig } from "@/lib/actions/settings";
import { SettingsView } from "@/components/settings/settings-view";

export default async function SettingsPage() {
  const [users, config] = await Promise.all([listUsers(), getConfig()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage user accounts and the franchise fee schedule/zones.
        </p>
      </div>
      <SettingsView users={users} config={config} />
    </div>
  );
}
