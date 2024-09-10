import { AnyEntity, useEvent, useThrottle, World } from "@rbxts/matter";
import { ReplicatedStorage, RunService, Workspace } from "@rbxts/services";
import { Goblin } from "shared/components/enemy/goblin";
import { Rig, Transform } from "shared/components/entity";
import PID from "shared/packages/pid";
import Tree from "shared/packages/tree";
import { GameEvent } from "types/enums/matter";
import { GameSystem } from "types/matter";

const random = new Random();
const box = Tree.Find(Workspace, "assets/misc/Box") as BasePart;

const RayParams = new RaycastParams();

function GenerateMinMax() {
	const center = box.GetPivot().Position;
	const size = box.Size;

	const MAX_X = center.X + size.X / 2;
	const MIN_X = center.X - size.X / 2;

	const MAX_Y = center.Z - size.Z / 2;
	const MIN_Y = center.Z - size.Z / 2;

	return { MAX_X, MIN_X, MAX_Y, MIN_Y };
}

async function GenerateRandomPosition(): Promise<Vector3> {
	const { MIN_X, MAX_X, MIN_Y, MAX_Y } = GenerateMinMax();

	const x = random.NextNumber(MIN_X, MAX_X);
	const y = random.NextNumber(MIN_Y, MAX_Y);

	const position = new Vector3(x, box.GetPivot().Position.Y + box.Size.div(2).Y, y);
	return position;
}

/**
 * `GoblineSpawnsystem`
 * System for spawning goblin
 *
 * @param world
 */
const GoblinSpawnSystem: GameSystem = async (world: World) => {
	const goblins = new Map<number, AnyEntity>();

	if (useThrottle(random.NextInteger(5, 10))) {
		const position = await GenerateRandomPosition();
		const direction = new Vector3(0, -1, 0);

		const cast = Workspace.Raycast(position, direction.mul(100), RayParams);

		let finalPos: CFrame | undefined;
		if (cast === undefined) {
			finalPos = CFrame.lookAlong(position, position.add(direction.mul(100))) as CFrame;
		} else {
			finalPos = new CFrame(cast.Instance.Position);
		}
		if (finalPos === undefined) {
			return;
		}

		const transform = Transform({
			cframe: new CFrame(position).Lerp(finalPos, 0.9),
		});
		const id = world.spawn(Goblin(), transform);

		goblins.set(goblins.size() + 1, id);
	}

	for (const [id, goblin] of world.query(Goblin).without(Rig)) {
		const model = (Tree.Find(ReplicatedStorage, `Assets/Enemies/Goblin`) as Model).Clone();
		model.Parent = Tree.Find(Workspace, "assets/enemies");
		model.PrimaryPart?.SetNetworkOwner();

		world.insert(
			id,
			Rig({
				CharacterRig15: model,
			}),
		);
	}
};

export = {
	system: GoblinSpawnSystem,
	event: GameEvent.Update,
};
