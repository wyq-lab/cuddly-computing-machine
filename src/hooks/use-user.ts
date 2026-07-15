"use client";
import { useEffect, useState } from "react";
import { getUserId } from "@/lib/user-id";
import { fetcher } from "@/lib/fetcher";

export function useUser() {
  const [userId, setUserId] = useState<string>("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const id = getUserId();
    setUserId(id);
    // Hydrate user from server
    fetcher("/api/user")
      .then((data) => {
        if (!data.user) {
          setIsReady(true);
        } else {
          setIsReady(true);
        }
      })
      .catch(() => setIsReady(true));
  }, []);

  const createUser = async (opts: { stage: string; baseLevel: string; planDays: number }) => {
    const data = await fetcher("/api/user", {
      method: "POST",
      body: JSON.stringify(opts),
    });
    return data.user;
  };

  return { userId, isReady, createUser };
}
