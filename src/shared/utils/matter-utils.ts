import { AnyEntity } from "@rbxts/matter";
import { ComponentCtor } from "@rbxts/matter/lib/component";

export interface ComponentInfo<T extends ComponentCtor> {
	componentId: AnyEntity;
	component: ReturnType<T>;
}