import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "stylematch:saved";

type SavedRecord = {
  product_id: string;
  saved_at: string;
  note?: string;
};

type Store = Record<string, SavedRecord>;

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function write(store: Store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new CustomEvent("stylematch:saved-changed"));
  } catch {
    /* ignore */
  }
}

export function useSavedItems() {
  const [store, setStore] = useState<Store>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStore(read());
    setHydrated(true);

    const onChange = () => setStore(read());
    window.addEventListener("stylematch:saved-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("stylematch:saved-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  // Best-effort sync to Supabase if user is signed in.
  useEffect(() => {
    if (!hydrated) return;
    void (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) return;
      const { data: rows } = await supabase
        .from("saved_items")
        .select("product_id,created_at")
        .eq("user_id", user.id);
      if (!rows) return;
      const merged: Store = { ...read() };
      for (const r of rows) {
        if (!merged[r.product_id]) {
          merged[r.product_id] = {
            product_id: r.product_id,
            saved_at: r.created_at,
          };
        }
      }
      write(merged);
      setStore(merged);
    })();
  }, [hydrated]);

  const isSaved = useCallback((id: string) => !!store[id], [store]);

  const toggle = useCallback(async (productId: string) => {
    const current = read();
    const next = { ...current };
    const wasSaved = !!next[productId];
    if (wasSaved) {
      delete next[productId];
    } else {
      next[productId] = {
        product_id: productId,
        saved_at: new Date().toISOString(),
      };
    }
    write(next);
    setStore(next);

    // Mirror to Supabase if signed in.
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (!user) return;
    if (wasSaved) {
      await supabase
        .from("saved_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);
    } else {
      await supabase
        .from("saved_items")
        .insert({ user_id: user.id, product_id: productId });
    }
  }, []);

  const setNote = useCallback((productId: string, note: string) => {
    const next = read();
    if (!next[productId]) return;
    next[productId] = { ...next[productId], note };
    write(next);
    setStore(next);
  }, []);

  const clear = useCallback(async () => {
    write({});
    setStore({});
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (user) {
      await supabase.from("saved_items").delete().eq("user_id", user.id);
    }
  }, []);

  const ids = Object.keys(store);

  return { ids, store, isSaved, toggle, setNote, clear, hydrated };
}
