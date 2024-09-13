import { getComponentFromSpecifier } from "@flamework/components/out/utility";
import { Janitor } from "@rbxts/better-janitor";
import FastCast, { ActiveCast, Caster, FastCastBehavior } from "@rbxts/fastcast";
import Log from "@rbxts/log";
import { useDeltaTime, useThrottle, World } from "@rbxts/matter";
import worldInspect from "@rbxts/matter/lib/debugger/widgets/worldInspect";
import { Players, TweenService, Workspace } from "@rbxts/services";
import { Rig, Transform } from "shared/components/entity";
import { Trajectory } from "shared/components/weapon";
import Tree from "shared/packages/tree";
import { GameEvent } from "types/enums/matter";
import { GameSystem } from "types/matter";

const projectile = new Instance("Part");
projectile.BrickColor = BrickColor.Black();
projectile.Anchored = true;
projectile.CanCollide = false;
projectile.Size = new Vector3(6, 6, 6);
projectile.Material = Enum.Material.Metal;
projectile.Shape = Enum.PartType.Ball;
const RANDOM = new Random();

function getBehaviour({ distance, acceleration, projectile }: Trajectory): FastCastBehavior {
	const CastParams = new RaycastParams();
	CastParams.FilterType = Enum.RaycastFilterType.Exclude;
	CastParams.AddToFilter(Tree.Find(Workspace, "assets/misc/bullet-container"));

	const behavior = FastCast.newBehavior();
	behavior.RaycastParams = CastParams;

	behavior.Acceleration = acceleration;
	behavior.AutoIgnoreContainer = true;
	behavior.CosmeticBulletTemplate = projectile;
	behavior.CosmeticBulletContainer = Tree.Find(Workspace, "assets/misc/bullet-container") as Folder;

	behavior.CanPierceFunction = (_, result): boolean => {
		const hit = result.Instance;
		if (hit === undefined) return false;
		if (hit.Parent && !hit.Parent.IsDescendantOf(Workspace)) return false;
		if (
			hit.Parent &&
			hit.Parent.IsA("Model") &&
			hit.Parent.IsDescendantOf(Workspace) &&
			!Players.GetPlayerFromCharacter(hit.Parent)
		) {
			return true;
		}
		return false;
	};

	return behavior;
}

function RayHit(cast: ActiveCast, raycastResult: RaycastResult, velocity: Vector3, projectile: Instance | undefined) {
	const hit = raycastResult.Instance;
	if (!hit.Parent?.IsA("Model")) return;
	if (!hit.IsA("BasePart")) return;
	const isPlayer = Players.GetPlayerFromCharacter(hit);
	if (isPlayer) {
		return;
	}

	const explosion = new Instance("Explosion")
	explosion.BlastRadius = RANDOM.NextInteger(25, 30);
	explosion.Position = (projectile as Model).GetPivot().Position
	explosion.Parent = projectile

	const tween = TweenService.Create(hit, new TweenInfo(1, Enum.EasingStyle.Quart), {
		Transparency: 1,
	})
	tween.Play()

	task.delay(0.2, () => {
		explosion.Destroy();
		tween.Cancel();
		tween.Destroy()
	})
}

function LengthChanged(
	cast: ActiveCast,
	lastPoint: Vector3,
	dir: Vector3,
	displacement: number,
	velocity: Vector3,
	projectile: Instance | undefined,
) {
	if (!projectile?.IsDescendantOf(Workspace)) {
		return;
	}

	if (!projectile.IsA("BasePart")) {
		return;
	}

	if (projectile.GetAttribute("Visible") === undefined) {
		for (const part of projectile.GetChildren()) {
			if (part.IsA("Beam")) {
				part.Enabled = true;
			} else if (part.IsA("BasePart")) {
				TweenService.Create(part, new TweenInfo(0.6, Enum.EasingStyle.Bounce), { Transparency: 0 }).Play();
			} else if (part.IsA("Trail")) {
				part.Enabled = false;
			}
		}
		projectile.SetAttribute("Visible", true);
	}

	projectile.PivotTo(CFrame.lookAt(lastPoint.add(dir.mul(displacement)), lastPoint));
}

async function Fire(caster: Caster, behavior: FastCastBehavior, model: Model) {
	try {
		const origin = model.GetPivot().Position;
		// origin: 0, 0, 0 and looks at the base
		const worldDir = CFrame.lookAt(
			Vector3.zero,
			((Tree.Find(Workspace, "assets/towers/tower-base") as Model).PrimaryPart as BasePart)
				.GetPivot()
				.Position.sub(origin).Unit,
		);
		const spread = CFrame.fromOrientation(0, 0, RANDOM.NextInteger(0, math.pi * 2));
		const final = worldDir.mul(spread).mul(CFrame.fromOrientation(math.rad(RANDOM.NextInteger(-8, 8)) * 0.5, 0, 0));
		caster.Fire(origin, final.LookVector, 250, behavior);
	} catch (err) {
		Log.Error(`Error during projectile: ${err}`);
	}
}

const TrajectorySystem: GameSystem = async (world: World) => {
	for (const [id, record] of world.queryChanged(Trajectory)) {
		if (record.new?.projectile === undefined) continue;
		if (!record.new?.isShooting) continue;

		const janitor = new Janitor<string>();
		const caster = new FastCast();

		const behavior = await getBehaviour(record.new);
		if (!behavior) continue;

		const model = world.get(id, Rig)?.CharacterRig15 as Model;
		await Fire(caster, behavior, model);
		record.new.patch({
			isShooting: true,
		});

		janitor.addConnection(caster.LengthChanged.Connect(LengthChanged));
		janitor.addConnection(caster.RayHit.Connect(RayHit));
	}

	for (const [id, _] of world.query(Rig, Transform).without(Trajectory)) {
		if (!world.contains(id)) {
			continue;
		}

		world.insert(
			id,
			Trajectory({
				duration: 3,
				projectile,
				acceleration: Vector3.yAxis.mul(-Workspace.Gravity / 6),
				distance: 200,
				isShooting: false,
				speed: 250,

				hitPlayers: [],
			}),
		);
	}
};

export = {
	system: TrajectorySystem,
	event: GameEvent.Update,
};
