import { AnyEntity, World } from "@rbxts/matter";
import Object from "@rbxts/object-utils";
import { Troop } from "shared/components/enemy";
import { Balista } from "shared/components/enemy/balista";
import { Health, Rig, Transform } from "shared/components/entity";
import { GameEvent } from "types/enums/matter";
import { GameSystem } from "types/matter";
import Projectile from "../Projectile";

const BalistaSystem: GameSystem = (world: World) => {
	const [closestCharacter, closestDistance] = [undefined, math.huge];
	const enemies = new Map<AnyEntity, Rig>();

	for (const [id, entity, health, model] of world.query(Rig, Health, Rig, Transform).without(Balista, Troop)) {
		if (world.contains(id) && health.health > 0) {
			enemies.set(id, model);
		}
	}

	if (enemies.isEmpty()) {
		return;
	}

	for (const [id, balista, model] of world.query(Balista, Rig, Transform)) {
		const balistaPosition = model.CharacterRig15.GetPivot().Position;
		const enemyModels = Object.values(enemies);
		const closestEnemy = enemyModels.reduce((accumulator, current) => {
			const otherPosition = accumulator.CharacterRig15.GetPivot().Position as Vector3;
			const currentPosition = current.CharacterRig15.GetPivot().Position as Vector3;

			const closestDistance =
				otherPosition.sub(balistaPosition).Magnitude < currentPosition.sub(balistaPosition).Magnitude
					? accumulator
					: current;
			return closestDistance;
		});

		if (closestEnemy) {
			world.insert(id)
		}
	}
};

export = {
	system: BalistaSystem,
	event: GameEvent.Update,
};
