"use server";

import { dracinApi } from "@/lib/api";
import { Book } from "@/types/dracin";

export async function searchDramas(query: string, page: number): Promise<Book[]> {
  try {
    return await dracinApi.search(query, page);
  } catch (error) {
    console.error("Search action failed", error);
    return [];
  }
}
