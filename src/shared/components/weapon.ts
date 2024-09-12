import { AnyEntity, component } from "@rbxts/matter";

export const Trajectory = component<{
	projectile: BasePart & {};
	acceleration: Vector3;
	speed: number;
	duration: number;
	distance: number;
	isShooting: boolean;

	hitPlayers: AnyEntity[];
}>("Projectile");
export type Trajectory = ReturnType<typeof Trajectory>;
