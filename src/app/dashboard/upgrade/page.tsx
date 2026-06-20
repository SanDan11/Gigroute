import { AppNav } from "@/components/AppNav";

export default function UpgradePage() {
  return (
    <AppNav>
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <h1 className="text-2xl font-bold">Upgrade</h1>
        <p className="mt-2 text-muted-foreground">
          GigRoute Pro — unlimited mileage routing for $4.99/mo. Coming soon.
        </p>
      </div>
    </AppNav>
  );
}