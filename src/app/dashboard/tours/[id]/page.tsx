"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { AppNav } from "@/components/AppNav";
import { IconMapPin, IconPlus } from "@/components/icons";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  }).toUpperCase();
}

export default function TourDetail() {
  const params = useParams();
  const tourId = params.id as Id<"tours">;
  const { isLoaded, isSignedIn } = useAuth();

const data = useQuery(
    api.tours.getWithStops,
    isLoaded && isSignedIn ? { id: tourId } : "skip"
  );
  const createStop = useMutation(api.stops.create);

  const [showForm, setShowForm] = useState(false);
  const [venueName, setVenueName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAddStop() {
    if (!venueName.trim() || !city.trim()) return;
    setSaving(true);
    try {
      await createStop({
        tourId,
        venueName: venueName.trim(),
        city: city.trim(),
        state: state.trim() || undefined,
        date: date || undefined,
        notes: notes.trim() || undefined,
      });
      setVenueName("");
      setCity("");
      setState("");
      setDate("");
      setNotes("");
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  if (data === undefined) {
    return (
      <AppNav>
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
          <p className="text-muted-foreground">Loading tour...</p>
        </div>
      </AppNav>
    );
  }

  const { tour, stops } = data;

  return (
    <AppNav>
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <h1 className="text-2xl font-bold">{tour.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {stops.length} {stops.length === 1 ? "stop" : "stops"}
        </p>

        <button
          onClick={() => setShowForm((v) => !v)}
          className="mt-4 flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <IconPlus />
          Add Stop
        </button>

        {showForm && (
          <div className="mt-4 flex flex-col gap-2 rounded-md border border-border bg-card p-4">
            <input
              type="text"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder="Venue name"
              className="rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground"
              />
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
                className="w-20 rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-foreground"
            />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)"
              rows={2}
              className="rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddStop}
                disabled={saving || !venueName.trim() || !city.trim()}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                Save Stop
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-md border border-border px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="relative mt-6 pl-5">
          {stops.length === 0 && (
            <p className="text-muted-foreground">
              No stops yet. Add your first one above.
            </p>
          )}

          {stops.length > 0 && (
            <div className="absolute bottom-1 left-[9px] top-1 w-px bg-border" />
          )}

          <div className="flex flex-col gap-5">
            {stops.map((stop) => (
              <div key={stop._id} className="relative">
                <div className="absolute -left-5 top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                {stop.date && (
                  <p className="text-xs font-medium text-primary">
                    {formatDate(stop.date)}
                  </p>
                )}
                <p className="font-medium">{stop.venueName}</p>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <IconMapPin className="h-3.5 w-3.5 shrink-0" />
                  {stop.city}
                  {stop.state ? `, ${stop.state}` : ""}
                </p>
                {stop.notes && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {stop.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppNav>
  );
}