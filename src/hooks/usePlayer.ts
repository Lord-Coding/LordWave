import { PlayerContext, usePlaybackStatus } from "@/context/PlayerContext";
import { useContext } from "react";

export function usePlayer() {
    const context = useContext(PlayerContext);

    if (!context) {
        throw new Error(
            "UsePlayer doit être utilisé dans PlayerProvider"
        );
    }
    return context;
}

export { usePlaybackStatus };