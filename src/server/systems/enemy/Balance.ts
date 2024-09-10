import { useEvent, World } from "@rbxts/matter";
import { RunService, Workspace } from "@rbxts/services";
import { Goblin } from "shared/components/enemy/goblin";
import { Rig } from "shared/components/entity";
import PID from "shared/packages/pid";
import Tree from "shared/packages/tree";
import { GameEvent } from "types/enums/matter";
import { GameSystem } from "types/matter";

const controller = new PID(-10000, 10000, 1000, 0, 100000);
controller.Debug("NPCBalance", Workspace);

const GoblinBalanaceSystem: GameSystem = (world: World) => {
	for (const [_, delta] of useEvent(RunService, "Heartbeat")) {
		for (const [id, goblin, model] of world.query(Goblin, Rig)) {
			if (model.CharacterRig15.PrimaryPart === undefined) {
				continue;
			}
			const tilt = model.CharacterRig15.PrimaryPart?.Orientation.Y as number;
			const force = controller.Calculate(delta, 0, tilt);
			const vector = Tree.Find(model.CharacterRig15.PrimaryPart as BasePart, "CounterForce/Force") as VectorForce;
			if (vector === undefined) {
				continue;
			}

			vector.Force = new Vector3(0, force, 0);
		}
	}
};

export = {
	system: GoblinBalanaceSystem,
	// Stepped
	event: GameEvent.Physics,
};
