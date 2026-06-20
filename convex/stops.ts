import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByTour = query({
  args: { tourId: v.id("tours") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const tour = await ctx.db.get(args.tourId);
    if (!tour || tour.userId !== identity.subject) return [];

    return await ctx.db
      .query("stops")
      .withIndex("by_tour", (q) => q.eq("tourId", args.tourId))
      .order("asc")
      .collect();
  },
});

export const create = mutation({
  args: {
    tourId: v.id("tours"),
    venueName: v.string(),
    city: v.string(),
    state: v.optional(v.string()),
    country: v.optional(v.string()),
    address: v.optional(v.string()),
    date: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const tour = await ctx.db.get(args.tourId);
    if (!tour || tour.userId !== identity.subject) {
      throw new Error("Tour not found");
    }

    // New stop goes to the end of the order
    const existingStops = await ctx.db
      .query("stops")
      .withIndex("by_tour", (q) => q.eq("tourId", args.tourId))
      .collect();
    const nextOrder = existingStops.length;

    return await ctx.db.insert("stops", {
      tourId: args.tourId,
      userId: identity.subject,
      venueName: args.venueName,
      city: args.city,
      state: args.state,
      country: args.country,
      address: args.address,
      date: args.date,
      notes: args.notes,
      order: nextOrder,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("stops"),
    venueName: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    country: v.optional(v.string()),
    address: v.optional(v.string()),
    date: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const stop = await ctx.db.get(args.id);
    if (!stop || stop.userId !== identity.subject) {
      throw new Error("Stop not found");
    }

    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
  },
});

export const reorder = mutation({
  args: {
    tourId: v.id("tours"),
    orderedStopIds: v.array(v.id("stops")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const tour = await ctx.db.get(args.tourId);
    if (!tour || tour.userId !== identity.subject) {
      throw new Error("Tour not found");
    }

    await Promise.all(
      args.orderedStopIds.map((stopId, index) =>
        ctx.db.patch(stopId, { order: index })
      )
    );
  },
});

export const remove = mutation({
  args: { id: v.id("stops") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const stop = await ctx.db.get(args.id);
    if (!stop || stop.userId !== identity.subject) {
      throw new Error("Stop not found");
    }

    await ctx.db.delete(args.id);
  },
});