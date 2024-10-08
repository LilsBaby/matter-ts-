import { component } from "@rbxts/matter";
import Simplepath from "@rbxts/simplepath";

export const Health = component<{ health: number }>("Health");
export type Health = ReturnType<typeof Health>;

export const Rig = component<{
	CharacterRig15: Model;
}>("Rig");
export type Rig = ReturnType<typeof Rig>;

export const Transform = component<{ cframe: CFrame | undefined }>("Health");
export type Transform = ReturnType<typeof Transform>;

export const Path = component<{
	destionation: Vector3;
	reached: () => void;

	path: Simplepath | undefined;
}>("Path");
export type Path = ReturnType<typeof Path>;
