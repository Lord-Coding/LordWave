import { router } from "expo-router";
import type { CollectionType } from "@/constants/musicType";

export function openCollection(type: CollectionType, id: string) {
  router.push({
    pathname: "/details/[type]/[id]",
    params: { type, id },
  });
}
