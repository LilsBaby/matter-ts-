import { World } from "@rbxts/matter";
import { Rig, Transform } from "shared/components/entity";
import { GameEvent } from "types/enums/matter";
import { GameSystem } from "types/matter";

const TransformSystem: GameSystem = (world: World) => {
	for (const [id, record] of world.queryChanged(Transform)) {
		if (world.contains(id) === undefined) {
			continue;
		}

		const model = world.get(id, Rig);
		if (model === undefined) {
			continue;
		}

		if (record.new && record.new.cframe) {
			model.CharacterRig15.SetPrimaryPartCFrame(record.new.cframe);
		}
	}
};

export = {
	system: TransformSystem,
	event: GameEvent.Update,
};
