import Net, { Definitions } from "@rbxts/net";
import { BroadcastAction, CombineStates } from "@rbxts/reflex";

const Remotes = Net.CreateDefinitions({
	Start: Definitions.ClientToServerEvent<[player: Player]>(),

	Dispatch: Definitions.ServerToClientEvent<[actions: BroadcastAction[]]>(),
	Hydrate: Definitions.ServerToClientEvent<[states: CombineStates<{}>]>(),
});

export = Remotes;
