import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { buildings, buildingAccess, users } from "@db/schema";
import { db } from "@db";
import { eq, and } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Building management routes
  app.get("/api/buildings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const userBuildings = await db
        .select()
        .from(buildings)
        .innerJoin(buildingAccess, eq(buildings.id, buildingAccess.buildingId))
        .where(eq(buildingAccess.userId, req.user!.id));

      res.json(userBuildings);
    } catch (error) {
      res.status(500).send("Failed to fetch buildings");
    }
  });

  app.post("/api/buildings/:id/control", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const buildingId = parseInt(req.params.id);
    const { system, state } = req.body;

    try {
      const [building] = await db
        .select()
        .from(buildings)
        .where(eq(buildings.id, buildingId));

      if (!building) {
        return res.status(404).send("Building not found");
      }

      const newStatus = { ...building.status, [system]: state };

      await db
        .update(buildings)
        .set({ status: newStatus })
        .where(eq(buildings.id, buildingId));

      res.json({ message: "Control updated", status: newStatus });
    } catch (error) {
      res.status(500).send("Failed to update building control");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
