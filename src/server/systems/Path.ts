import { World } from "@rbxts/matter";
import { StarterPack } from "@rbxts/services";
import { GameEvent } from "types/enums/matter";
import ServerState from "types/interface/state";
import { GameSystem } from "types/matter";

const PathSystem: GameSystem = (world: World, state) => {};

export = {
	system: PathSystem,
	event: GameEvent.Update,
};
