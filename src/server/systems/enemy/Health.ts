import { World } from "@rbxts/matter";
import { Enemy } from "shared/components/enemy";
import { Health, Rig } from "shared/components/entity";
import { GameEvent } from "types/enums/matter";
import ServerState from "types/interface/state";
import { GameSystem } from "types/matter";

/**
 * `HealthSystem`
 * System for subscribing and creating health component of the enemy.
 *
 * @param world
 * @param state
 */
const HealthSystem: GameSystem = (world: World, state) => {
	// add health to whatever entity does not have a health component yet
	for (const [id, enemy, model] of world.query(Enemy, Rig).without(Health)) {
		const max_health = 100;
		const rate = 0.08;
		const amount = 1 / max_health;

		world.insert(id, Health({ health: math.clamp(rate * amount * max_health, 0, max_health) }));
	}

	for (const [id, record] of world.queryChanged(Health)) {
		if (!world.contains(id)) {
			continue;
		}

		if (record.new && record.new.health <= 0) {
			world.despawn(id);
		}
	}
};

export = {
	system: HealthSystem,
	event: GameEvent.Update,
};
