import { Document } from "@rbxts/lapis";
import { AnyEntity, component } from "@rbxts/matter";
import { playerData } from "types/interface/default-data";

export const User = component<{
	player: Player;
}>("Player");
export type User = ReturnType<typeof User>;

export const Data = component<{
	key?: string,
	document?: Document<playerData>
	collection?: Readonly<playerData>
}>("Data")
export type Data = ReturnType<typeof Data>

export const AnimationTrack = component<{
	id: string;
	animationID: Animation;
	remaining: number;
	finished: (animation: Animation) => void;
}>();
export type AnimationTrack = ReturnType<typeof AnimationTrack>;

export const Stamina = component<{
	stamina: number;
	remaining: number;
}>();
export type Stamina = ReturnType<typeof Stamina>;
