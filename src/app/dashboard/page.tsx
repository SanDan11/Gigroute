"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { IconArchive } from "@/components/icons";
import type { Id } from "../../../convex/_generated/dataModel";
import { DesertStrip } from "@/components/DesertStrip";

export default function Dashboard() {
  const [tab, setTab] = useState<"active" | "archived">("active");
  const tours = useQuery(api.tours.list, { archived: tab === "archived" });
  const createTour = useMutation(api.tours.create);
  const archiveTour = useMutation(api.tours.archive);
  const unarchiveTour = useMutation(api.tours.unarchive);
  const [newTourName, setNewTourName] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    if (!newTourName.trim()) return;
    setCreating(true);
    try {
      await createTour({ name: newTourName.trim() });
      setNewTourName("");
    } finally {
      setCreating(false);
    }
  }

  async function handleArchiveToggle(
    e: React.MouseEvent,
    id: Id<"tours">,
    isArchived: boolean
  ) {
    e.preventDefault();
    e.stopPropagation();
    if (isArchived) {
      await unarchiveTour({ id });
    } else {
      await archiveTour({ id });
    }
  }

  return (
    <AppNav>
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <h1 className="text-2xl font-bold">Your Tours</h1>

        <div className="mt-4 flex gap-1 border-b border-border">
          <button
            onClick={() => setTab("active")}
            className={`px-3 py-2 text-sm ${
              tab === "active"
                ? "border-b-2 border-primary font-medium text-primary"
                : "text-muted-foreground"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setTab("archived")}
            className={`px-3 py-2 text-sm ${
              tab === "archived"
                ? "border-b-2 border-primary font-medium text-primary"
                : "text-muted-foreground"
            }`}
          >
            Archived
          </button>
        </div>

        {tab === "active" && (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={newTourName}
              onChange={(e) => setNewTourName(e.target.value)}
              placeholder="New tour name"
              className="flex-1 rounded-md border border-border bg-card px-3 py-2 text-foreground placeholder:text-muted-foreground"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <button
              onClick={handleCreate}
              disabled={creating || !newTourName.trim()}
              className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50"
            >
              Create Tour
            </button>
          </div>
        )}

        <DesertStrip />

        <div className="flex flex-col gap-3">
          {tours === undefined && (
            <p className="text-muted-foreground">Loading tours...</p>
          )}

          {tours?.length === 0 && (
            <p className="text-muted-foreground">
              {tab === "active"
                ? "No tours yet. Create your first one above."
                : "No archived tours."}
            </p>
          )}

          {tours?.map((tour) => (
            <Link
              key={tour._id}
              href={`/dashboard/tours/${tour._id}`}
              className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3 transition-colors hover:border-primary"
            >
              <div>
                <p className="font-medium">{tour.name}</p>
                {tour.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {tour.description}
                  </p>
                )}
              </div>
              <button
                onClick={(e) =>
                  handleArchiveToggle(e, tour._id, tab === "archived")
                }
                className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={tab === "archived" ? "Unarchive tour" : "Archive tour"}
              >
                <IconArchive />
              </button>
            </Link>
          ))}
        </div>
      </div>
    </AppNav>
  );
}