import { useDeltaTime, useThrottle, World } from "@rbxts/matter";
import { Workspace } from "@rbxts/services";
import { Goblin } from "shared/components/enemy/goblin";
import { Path, Rig, Transform } from "shared/components/entity";
import { Trajectory } from "shared/components/weapon";
import { GameEvent } from "types/enums/matter";
import ServerState from "types/interface/state";
import { GameSystem } from "types/matter";

function canSeeTower() {}

const random = new Random();
const GoblinThrowSystem: GameSystem = (world: World, state) => {
	for (const [id, goblin, model, transform, trajectory] of world.query(Goblin, Rig, Transform, Trajectory)) {
		const modifier = trajectory.patch({
			duration: trajectory.duration - useDeltaTime(),
			isShooting: true,
		});

		if (modifier.duration <= 0) {
			world.remove(id, Trajectory);
		} else {
			world.insert(id, modifier);
		}
	}
};

export = {
	system: GoblinThrowSystem,
	event: GameEvent.Update,
};
