import { createProducer } from "@rbxts/reflex";

export type Guild = {
	readonly id: string;
	readonly creator: string | undefined;
};

const GuildTemplate: Guild = {
	id: "",
	creator: undefined,
};

interface GuildState {
	readonly [guild: string]: Guild | undefined;
}

const initialState: GuildState = {};
export const GuildSlice = createProducer(initialState, {
	addGuild: (state, code: string, creator: string, info?: Omit<Guild, "id">) => ({
		...state,
		[code]: {
			...GuildTemplate,
			id: code,
			...info,
		},
	}),
});
