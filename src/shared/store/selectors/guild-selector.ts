import { SharedState } from "..";

export const selectGuild = (state: SharedState) => state.guildSlice;

export const selectGuidlFromCode = (http: string) => (state: SharedState) => state.guildSlice[http];
