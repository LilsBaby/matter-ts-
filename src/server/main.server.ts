import { Flamework, Modding } from "@flamework/core";
import { Cmdr } from "@rbxts/cmdr";
import Log, { Logger } from "@rbxts/log";
import { ReplicatedStorage, RunService } from "@rbxts/services";
import Tree from "shared/packages/tree";
import { start } from "shared/start";
import { GameEvent } from "types/enums/matter";

const parent = script.Parent!;

Cmdr.RegisterDefaultCommands();
Cmdr.RegisterCommandsIn(Tree.Find(parent, "cmdr") as Folder);
Cmdr.RegisterTypesIn(Tree.Find(parent, "cmdr/types") as Folder);

const events = {
	// stepped
	[GameEvent.Physics]: RunService.PreSimulation,
	[GameEvent.Render]: RunService.PreRender,
	// heartbeat
	[GameEvent.Update]: RunService.PostSimulation,
};

Log.Info(`rpg is starting up! Version: ${game.PlaceVersion}`);

start([Tree.Await(parent, "systems") as Folder, Tree.Await(ReplicatedStorage, "TS/systems") as Folder], events);

// Ignite flamework
Modding.registerDependency<Logger>((ctro) => Log.ForContext(ctro));
Flamework.addPaths("src/server/services");
Flamework.ignite();
