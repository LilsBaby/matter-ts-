
import type { Entity, System, World } from "@rbxts/matter";
import ServerState from "./interface/state";

export type GameSystem = System<[World, Map<string, unknown>, Entity<[]>]>;
export type Middleware = (nextFunc: () => void, event: string) => () => void;
