import Log, { Logger } from "@rbxts/log";
import type { System } from "@rbxts/matter";
import { Debugger, Loop, World } from "@rbxts/matter";
import Plasma from "@rbxts/plasma";
import type { Context } from "@rbxts/rewire";
import { HotReloader } from "@rbxts/rewire";
import { ContextActionService, RunService } from "@rbxts/services";

import type { GameEvent } from "types/enums/matter";
import type { Middleware } from "types/matter";
import type { OtherReloadingContainer } from "types/start";
import { Rig } from "./components/entity";

const setupLogger = () => Log.SetLogger(Logger.configure().WriteTo(Log.RobloxOutput()).Create());

export const GameWorld = new World();
export const ContextEntity = GameWorld.spawn();
export const GameState = new Map<string, boolean>();

let firstRunSystems: Array<System<[World, typeof GameState]>> | undefined = [];
const systemsByModule = new Map<ModuleScript, System<[World, typeof GameState]>>();

const debuggr = new Debugger(Plasma);

debuggr.findInstanceFromEntity = function (id): Instance | undefined {
	if (GameWorld.contains(id)) return undefined;

	const model = GameWorld.get(id, Rig);
	if (model) return model.CharacterRig15;

	return undefined;
};

const loop = new Loop(GameWorld, GameState, ContextEntity, debuggr.getWidgets());
debuggr.autoInitialize(loop);

function loadModule(module: ModuleScript, context: Context): void {
	const { originalModule } = context;
	const [ok, system] = pcall(require, module);

	if (!ok) {
		warn(`Failed to load module ${module.GetFullName()}`);
		return;
	}

	if (firstRunSystems !== undefined) firstRunSystems.push(system as System<[World, typeof GameState]>);
	else if (systemsByModule.has(originalModule)) {
		const sys = systemsByModule.get(originalModule);
		if (sys === undefined) return;

		loop.replaceSystem(sys, system as System<[World, typeof GameState]>);
		debuggr.replaceSystem(sys as System<Array<unknown>>, system as System<Array<unknown>>);
	} else loop.scheduleSystem(system as System<[World, typeof GameState]>);

	systemsByModule.set(originalModule, system as System<[World, typeof GameState]>);
}

function unloadModule(module: ModuleScript, context: Context): void {
	if (context.isReloading) return;

	const { originalModule } = context;
	const sys = systemsByModule.get(originalModule);
	if (sys === undefined) return;

	loop.evictSystem(sys);
	systemsByModule.delete(originalModule);
}

export function start(
	containers: Array<Folder>,
	events: Record<GameEvent, RBXScriptSignal>,
	middlewares?: Array<Middleware>,
	others?: Array<OtherReloadingContainer>,
): void {
	const hotReloader = new HotReloader();
	for (const container of containers) hotReloader.scan(container, loadModule, unloadModule);

	if (others)
		for (const { folder, onLoadedSignal, onUnloadedSignal } of others) {
			const loadModule_ = (module: ModuleScript, context: Context): void => {
				if (onLoadedSignal !== undefined) onLoadedSignal.Fire(module, context);
			};

			const unloadModule_ = (module: ModuleScript, context: Context): void => {
				if (onUnloadedSignal !== undefined) onUnloadedSignal.Fire(module, context);
			};

			hotReloader.scan(folder, loadModule_, unloadModule_);
		}

	if (firstRunSystems !== undefined) {
		loop.scheduleSystems(firstRunSystems);
		firstRunSystems = undefined;
	}

	if (middlewares) for (const middleware of middlewares) loop.addMiddleware(middleware);

	// Begin running our systems
	// Force convert events type
	loop.begin(events);

	setupLogger();

	if (RunService.IsClient())
		ContextActionService.BindAction(
			"OpenDebugger",
			(_, inputState) => {
				if (inputState === Enum.UserInputState.Begin) debuggr.toggle();
			},
			false,
			Enum.KeyCode.End,
		);
}
