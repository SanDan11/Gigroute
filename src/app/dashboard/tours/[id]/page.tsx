"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { AppNav } from "@/components/AppNav";
import { IconMapPin, IconPlus, IconTrash, IconPencil } from "@/components/icons";
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

type Stop = {
  _id: Id<"stops">;
  venueName: string;
  city: string;
  state?: string;
  date?: string;
  notes?: string;
  order: number;
};

export default function TourDetail() {
  const params = useParams();
  const tourId = params.id as Id<"tours">;
  const { isLoaded, isSignedIn } = useAuth();

  const data = useQuery(
    api.tours.getWithStops,
    isLoaded && isSignedIn ? { id: tourId } : "skip"
  );
  
  const createStop = useMutation(api.stops.create);
  const updateStop = useMutation(api.stops.update);
  const removeStop = useMutation(api.stops.remove);
  const updateTour = useMutation(api.tours.update);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<Id<"stops"> | null>(null);
  const [venueName, setVenueName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const [editingTour, setEditingTour] = useState(false);
  const [tourName, setTourName] = useState("");
  const [tourDescription, setTourDescription] = useState("");
  const [tourStartDate, setTourStartDate] = useState("");
  const [tourEndDate, setTourEndDate] = useState("");
  const [savingTour, setSavingTour] = useState(false);

  function startEdit(stop: Stop) {
    setEditingId(stop._id);
    setVenueName(stop.venueName);
    setCity(stop.city);
    setState(stop.state ?? "");
    setDate(stop.date ?? "");
    setNotes(stop.notes ?? "");
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setVenueName("");
    setCity("");
    setState("");
    setDate("");
    setNotes("");
  }

  async function handleSaveStop() {
    if (!venueName.trim() || !city.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateStop({
          id: editingId,
          venueName: venueName.trim(),
          city: city.trim(),
          state: state.trim() || undefined,
          date: date || undefined,
          notes: notes.trim() || undefined,
        });
      } else {
        await createStop({
          tourId,
          venueName: venueName.trim(),
          city: city.trim(),
          state: state.trim() || undefined,
          date: date || undefined,
          notes: notes.trim() || undefined,
        });
      }
      cancelForm();
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteStop(id: Id<"stops">, venueName: string) {
    const confirmed = window.confirm(
      `Delete "${venueName}"? This cannot be undone.`
    );
    if (!confirmed) return;
    await removeStop({ id });
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
        </p>{editingTour ? (
          <div className="flex flex-col gap-2 rounded-md border border-border bg-card p-4">
            <p className="text-sm font-medium">Edit tour</p>
            <input
              type="text"
              value={tourName}
              onChange={(e) => setTourName(e.target.value)}
              placeholder="Tour name"
              className="rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground"
            />
            <input
              type="text"
              value={tourDescription}
              onChange={(e) => setTourDescription(e.target.value)}
              placeholder="Description (optional)"
              className="rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground"
            />
            <div className="flex gap-2">
              <div className="flex flex-1 flex-col gap-1">
                <label className="text-xs text-muted-foreground">Start date</label>
                <input
                  type="date"
                  value={tourStartDate}
                  onChange={(e) => setTourStartDate(e.target.value)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-foreground"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <label className="text-xs text-muted-foreground">End date</label>
                <input
                  type="date"
                  value={tourEndDate}
                  onChange={(e) => setTourEndDate(e.target.value)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-foreground"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveTour}
                disabled={savingTour || !tourName.trim()}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                Save Tour
              </button>
              <button
                onClick={() => setEditingTour(false)}
                className="rounded-md border border-border px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold">{tour.name}</h1>
              {tour.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {tour.description}
                </p>
              )}
              <p className="mt-1 text-sm text-muted-foreground">
                {stops.length} {stops.length === 1 ? "stop" : "stops"}
                {tour.startDate && ` · ${formatDate(tour.startDate)}`}
                {tour.endDate && ` — ${formatDate(tour.endDate)}`}
              </p>
            </div>
            <button
              onClick={startEditTour}
              className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Edit tour"
            >
              <IconPencil className="h-4 w-4" />
            </button>
          </div>
        )}

        {!editingId && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="mt-4 flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            <IconPlus />
            Add Stop
          </button>
        )}

        {(showForm || editingId) && (
          <div className="mt-4 flex flex-col gap-2 rounded-md border border-border bg-card p-4">
            <p className="text-sm font-medium">
              {editingId ? "Edit stop" : "New stop"}
            </p>
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
                onClick={handleSaveStop}
                disabled={saving || !venueName.trim() || !city.trim()}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {editingId ? "Save Changes" : "Save Stop"}
              </button>
              <button
                onClick={cancelForm}
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
                <div className="flex items-start justify-between gap-2">
                  <div>
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
                  <div className="flex shrink-0 gap-1">
                  <button
                      onClick={() => startEdit(stop)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label="Edit stop"
                    >
                      <IconPencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStop(stop._id, stop.venueName)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete stop"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppNav>
    
  );
  
  function startEditTour() {
    setTourName(tour.name);
    setTourDescription(tour.description ?? "");
    setTourStartDate(tour.startDate ?? "");
    setTourEndDate(tour.endDate ?? "");
    setEditingTour(true);
  }

  async function handleSaveTour() {
    if (!tourName.trim()) return;
    setSavingTour(true);
    try {
      await updateTour({
        id: tourId,
        name: tourName.trim(),
        description: tourDescription.trim() || undefined,
        startDate: tourStartDate || undefined,
        endDate: tourEndDate || undefined,
      });
      setEditingTour(false);
    } finally {
      setSavingTour(false);
    }
  }
}

