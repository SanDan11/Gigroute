"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { AppNav } from "@/components/AppNav";

export default function Dashboard() {
  const tours = useQuery(api.tours.list, { archived: false });
  const createTour = useMutation(api.tours.create);
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

  return (
    <AppNav>
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <h1 className="text-2xl font-bold">Your Tours</h1>

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

        <div className="mt-6 flex flex-col gap-3">
          {tours === undefined && (
            <p className="text-muted-foreground">Loading tours...</p>
          )}

          {tours?.length === 0 && (
            <p className="text-muted-foreground">
              No tours yet. Create your first one above.
            </p>
          )}

          {tours?.map((tour) => (
            <Link
              key={tour._id}
              href={`/dashboard/tours/${tour._id}`}
              className="rounded-md border border-border bg-card px-4 py-3 transition-colors hover:border-primary"
            >
              <p className="font-medium">{tour.name}</p>
              {tour.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {tour.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </AppNav>
  );
}