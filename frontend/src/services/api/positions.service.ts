// ./src/services/api/positions.service.ts

import { api } from "@/lib/axios";

/**
 * Positions API
 * Placeholder-safe implementation (Org Structure not in scope)
 */

export async function GetAllPositions() {
  try {
    const res = await api.get("/positions");
    return res.data;
  } catch {
    // Safe fallback to avoid crashing the UI
    return [];
  }
}

export async function getPositionById(positionId: string) {
  if (!positionId) return null;

  try {
    const res = await api.get(`/positions/${positionId}`);
    return res.data;
  } catch {
    return null;
  }
}