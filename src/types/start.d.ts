
import type { Signal } from "@rbxts/lemon-signal";
import type { Context } from "@rbxts/rewire";

export interface OtherReloadingContainer {
	readonly folder: Folder;
	readonly onLoadedSignal: Signal<[ModuleScript, Context]> | undefined;
	readonly onUnloadedSignal: Signal<[ModuleScript, Context]> | undefined;
}
