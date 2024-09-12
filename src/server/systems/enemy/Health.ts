import { World } from "@rbxts/matter";
import { ReplicatedStorage } from "@rbxts/services";
import { Enemy } from "shared/components/enemy";
import { Health, Rig } from "shared/components/entity";
import Tree from "shared/packages/tree";
import { GameEvent } from "types/enums/matter";
import ServerState from "types/interface/state";
import { GameSystem } from "types/matter";

const max_health = 100;
const rate = 0.08;
const amount = 1 / max_health;

/**
		 * health?.patch({
					health: math.min(record.new.health + math.clamp(rate * amount * max_health, 0, max_health), 100)
			})
		 */

/**
 * `HealthSystem`
 * System for subscribing and creating health component of the enemy.
 *
 * @param world
 * @param state
 */
const HealthSystem: GameSystem = (world: World, state) => {
	// add health to whatever entity does not have a health component yet
	for (const [id, model] of world.query(Rig).without(Health)) {
		world.insert(id, Health({ health: max_health }));
	}

	for (const [id, model, health] of world.query(Rig, Health)) {
		const health_ui = Tree.Find(ReplicatedStorage, "Assets/UI/Health").Clone() as BillboardGui;
		if (!health_ui) {
			continue;
		}

		const head = model.CharacterRig15.FindFirstChild("Head") as BasePart;
		if (!head) {
			continue;
		}

		const text = health_ui.FindFirstChild("HP") as TextLabel;
		if (text === undefined) {
			continue;
		}
		text.Text = `HP: ${health.health}/100`;

		health_ui.Enabled = true;
		health_ui.Parent = head;
	}

	for (const [id, record] of world.queryChanged(Health)) {
		if (!world.contains(id)) {
			continue;
		}

		if (!record.new || record.new.health === record.old?.health) {
			continue;
		}

		const model = world.get(id, Rig)?.CharacterRig15;
		if (!model) {
			continue;
		}

		if (record.new && record.new.health <= 0) {
			world.despawn(id);
		} else if ((record.new?.health as number) > 0 && (record.new?.health as number) < 100) {
			const head = model.FindFirstChild("Head");
			if (!head) return;

			const ui = head.FindFirstChild("Health");
			if (!ui) return;
			const text = ui.FindFirstChild("HP") as TextLabel;
			if (text === undefined) return;
			text.Text = `HP: ${record.new.health}/100`;
		}
	}
};

export = {
	system: HealthSystem,
	event: GameEvent.Update,
};
