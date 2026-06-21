import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { archived: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const tours = await ctx.db
      .query("tours")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    const wantArchived = args.archived ?? false;
    return tours.filter((t) => Boolean(t.archived) === wantArchived);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.db.insert("tours", {
      userId: identity.subject,
      name: args.name,
      description: args.description,
      startDate: args.startDate,
      endDate: args.endDate,
      totalMiles: 0,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("tours"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const tour = await ctx.db.get(args.id);
    if (!tour || tour.userId !== identity.subject) {
      throw new Error("Tour not found");
    }

    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
  },
});

export const archive = mutation({
  args: { id: v.id("tours") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const tour = await ctx.db.get(args.id);
    if (!tour || tour.userId !== identity.subject) {
      throw new Error("Tour not found");
    }

    await ctx.db.patch(args.id, { archived: true });
  },
});

export const unarchive = mutation({
  args: { id: v.id("tours") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const tour = await ctx.db.get(args.id);
    if (!tour || tour.userId !== identity.subject) {
      throw new Error("Tour not found");
    }

    await ctx.db.patch(args.id, { archived: false });
  },
});

export const remove = mutation({
  args: { id: v.id("tours") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const tour = await ctx.db.get(args.id);
    if (!tour || tour.userId !== identity.subject) {
      throw new Error("Tour not found");
    }

    // Clean up stops belonging to this tour first
    const stops = await ctx.db
      .query("stops")
      .withIndex("by_tour", (q) => q.eq("tourId", args.id))
      .collect();
    await Promise.all(stops.map((s) => ctx.db.delete(s._id)));

    await ctx.db.delete(args.id);
  },
});

export const getWithStops = query({
  args: { id: v.id("tours") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const tour = await ctx.db.get(args.id);
    if (!tour || tour.userId !== identity.subject) {
      throw new Error("Tour not found");
    }

    const stops = await ctx.db
      .query("stops")
      .withIndex("by_tour", (q) => q.eq("tourId", args.id))
      .collect();

    // Auto-order by date — undated stops go last, in creation order
    const sorted = [...stops].sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date.localeCompare(b.date);
    });

    return { tour, stops: sorted };
  },
});