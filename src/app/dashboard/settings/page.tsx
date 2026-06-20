import { AppNav } from "@/components/AppNav";

export default function SettingsPage() {
  return (
    <AppNav>
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Account settings are coming soon.
        </p>
      </div>
    </AppNav>
  );
}