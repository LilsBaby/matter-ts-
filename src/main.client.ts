import { Flamework, Modding } from "@flamework/core";
import { CmdrClient } from "@rbxts/cmdr";
import Log, { Logger } from "@rbxts/log";
import { Players, ReplicatedStorage, RunService } from "@rbxts/services";
import Tree from "shared/packages/tree";
import { start } from "shared/start";
import { GameEvent } from "types/enums/matter";

const events = {
	[GameEvent.Physics]: RunService.PreSimulation,
	[GameEvent.Render]: RunService.PreRender,
	[GameEvent.Update]: RunService.PostSimulation,
};

CmdrClient.SetActivationKeys([Enum.KeyCode.Home]);
start([Tree.Await(ReplicatedStorage, "Client/systems") as Folder], events);

Modding.registerDependency<Logger>((ctro) => Log.ForContext(ctro));
Flamework.addPaths("src/client/controllers");
Flamework.ignite();