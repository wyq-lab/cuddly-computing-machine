"use client";
import { getUserId } from "./user-id";

export async function fetcher(url: string, options?: RequestInit) {
  const userId = getUserId();
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
      ...options?.headers,
    },
  });
  return res.json();
}
