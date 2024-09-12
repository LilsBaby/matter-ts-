import { Janitor } from "@rbxts/better-janitor";
import { AnyEntity, World } from "@rbxts/matter";
import { StarterPack } from "@rbxts/services";
import { Path, Rig } from "shared/components/entity";
import { GameEvent } from "types/enums/matter";
import ServerState from "types/interface/state";
import Simplepath from "@rbxts/simplepath";
import { GameSystem } from "types/matter";
import Log, { Logger } from "@rbxts/log";
import { setTimeout } from "@rbxts/set-timeout";
import { Trajectory } from "shared/components/weapon";

const OVERRIDERS = {
	JUMP_WHEN_STUCK: true,
};

const SETTINGS: { Visualize: boolean } = { Visualize: true };

async function getPath(world: World, id: AnyEntity): Promise<Simplepath> {
	return new Promise((resolve, reject, onCancel) => {
		if (onCancel()) {
			reject();
		}

		const model = world.get(id, Rig);
		if (!model) {
			reject(`Unable to locate rig: ${id}`);
		}

		const path = new Simplepath(
			model?.CharacterRig15 as Model,
			{
				AgentRadius: 3.5,
				AgentHeight: 7.5,
				AgentCanJump: true,
				AgentCanClimb: true,
				Costs: {
					FireZone: math.huge,
				},
			},
			OVERRIDERS,
		);
		path.Visualize = SETTINGS.Visualize;

		if (path) resolve(path);

		reject(`Failed to create path for: ${id}`);
	});
}

async function initiatePath(path: Simplepath, destination: Vector3, retries = 0) {
	const canRun = path.Run(destination);
	if (!canRun) {
		if (retries < 10) {
			await new Promise((resolve) => setTimeout(() => resolve, 100)); // Delay before retry
			initiatePath(path, destination, retries + 1);
		} else {
			Log.Error("Failed to initiate path after maximum retries");
		}
		return;
	}
}

function endPath(world: World, id: AnyEntity, janitor: Janitor) {
	janitor.cleanup();
	janitor.destroy();

	world.remove(id, Path);
}

/**
 * `PathSystem`
 *
 * @param world
 * @param state
 */
const PathSystem: GameSystem = async (world: World, state) => {
	const janitors = new Map<AnyEntity, Janitor>();

	for (const [id, record] of world.queryChanged(Path)) {
		if (record.old && record.new === undefined) {
			continue;
		}

		if (!world.contains(id)) {
			continue;
		}

		const janitor = new Janitor<string>();
		const destination = record.new?.destionation as Vector3;
		if (!destination) {
			continue;
		}

		const path = await getPath(world, id);
		if (!path) {
			continue;
		}

		const isProjectile = world.get(id, Trajectory);
		if (isProjectile?.isShooting) {
			endPath(world, id, janitor);
		} else {
			initiatePath(path, destination);
		}

		janitor.addConnection(path.WaypointReached.Connect(() => initiatePath(path, destination)));
		janitor.addConnection(path.Blocked.Connect(() => initiatePath(path, destination)));
		janitor.addConnection(path.Error.Connect(() => initiatePath(path, destination)));

		janitor.addConnection(
			path.Reached.Connect(() => {
				Log.Info("{@Entity} has reached its path", id);
				endPath(world, id, janitor);
				task.spawn(() => record.new?.reached());
			}),
		);

		record.new?.patch({
			path,
		});
	}
};

export = {
	system: PathSystem,
	event: GameEvent.Update,
};
