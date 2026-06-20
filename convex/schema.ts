import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tours: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    totalMiles: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  stops: defineTable({
    tourId: v.id("tours"),
    userId: v.string(),
    venueName: v.string(),
    city: v.string(),
    state: v.optional(v.string()),
    country: v.optional(v.string()),
    address: v.optional(v.string()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    date: v.optional(v.string()),
    order: v.number(),
    notes: v.optional(v.string()),
    milesFromPrevious: v.optional(v.number()),
  })
    .index("by_tour", ["tourId"])
    .index("by_user", ["userId"]),
});