import { CombineStates } from "@rbxts/reflex";
import { GuildSlice } from "./slices/guild-slice";

export type SharedState = CombineStates<typeof slices>;

export const slices = {
    guildSlice: GuildSlice
};
