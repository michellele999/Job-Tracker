import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProspectSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/prospects", async (_req, res) => {
    const prospects = await storage.getAllProspects();
    res.json(prospects);
  });

  app.post("/api/prospects", async (req, res) => {
    const parsed = insertProspectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors.map((e) => e.message).join(", ") });
    }
    const prospect = await storage.createProspect(parsed.data);
    res.status(201).json(prospect);
  });

  app.patch("/api/prospects/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid prospect ID" });
    }

    const existing = await storage.getProspect(id);
    if (!existing) {
      return res.status(404).json({ message: "Prospect not found" });
    }

    const body = req.body;
    const updates: Record<string, unknown> = {};

    const patchSchema = insertProspectSchema.partial();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors.map((e) => e.message).join(", ") });
    }

    const validFields = parsed.data;
    if (validFields.companyName !== undefined) updates.companyName = validFields.companyName;
    if (validFields.roleTitle !== undefined) updates.roleTitle = validFields.roleTitle;
    if (validFields.jobUrl !== undefined) updates.jobUrl = validFields.jobUrl;
    if (validFields.targetSalary !== undefined) updates.targetSalary = validFields.targetSalary;
    if (validFields.notes !== undefined) updates.notes = validFields.notes;
    if (validFields.status !== undefined) updates.status = validFields.status;
    if (validFields.interestLevel !== undefined) updates.interestLevel = validFields.interestLevel;

    const updated = await storage.updateProspect(id, updates);
    res.json(updated);
  });

  app.delete("/api/prospects/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid prospect ID" });
    }

    const deleted = await storage.deleteProspect(id);
    if (!deleted) {
      return res.status(404).json({ message: "Prospect not found" });
    }

    res.status(204).send();
  });

  return httpServer;
}
