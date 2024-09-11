import { Modding, OnInit, OnStart, Service } from "@flamework/core";
import { Janitor } from "@rbxts/better-janitor";
import { Logger } from "@rbxts/log";
import { CollectionService, Lighting, RunService } from "@rbxts/services";
import { setTimeout } from "@rbxts/set-timeout";
import { Lightning } from "shared/utils/lightning-utils";

type Period = "AM" | "PM";
export interface onTimerChanged {
	/**
	 *
	 */
	onTimerChanged(time: number, period: "AM" | "PM"): void;
}

/**
 * Service for managing lighting system
 */
@Service({})
export default class EnvironmentService implements OnStart, OnInit {
	/** Janitor for cleaning up lighting update event */
	private readonly janitor = new Janitor<string>();

	/**
	 * How long a day lasts
	 */
	private readonly duration = 60;
	private readonly length = 24;
	private readonly bossSpawned: boolean = false

	/**
	 * How rapid the clock time is changing
	 * The lower, the faster
	 */
	private readonly speed = 0.1;

	/** @ignore */
	constructor(private readonly logger: Logger) {}

	/** @ignore */
	onInit(): void | Promise<void> {
		Modding.onListenerAdded<onTimerChanged>((listener) => {
			Lighting.GetPropertyChangedSignal("ClockTime").Connect(() => {
				const period = this.getPeriod(Lighting.ClockTime);
				listener.onTimerChanged(Lighting.ClockTime, period);
			});
		});

		Lightning.onClockTime((clock) =>
			this.onTimerChanged(clock)
				.then(() => {})
				.catch((err) => this.logger.Error(err)),
		);

		const event = this.updateClock();
		this.janitor.addFunction(() => event.Disconnect(), "Clean up timer");
	}
	onStart(): void {}

	/**
	 * Fires whenever the clock time changes
	 *
	 * @param time
	 * @returns
	 */
	private async onTimerChanged(time: number): Promise<void> {
		if (!typeIs(time, "number") || time === undefined) {
			return
		}


		const [hour, minute] = await this.deconstructTime(tostring(time));
		const period = this.getPeriod(tonumber(hour as string) as number);

		const items = (await this.getMiscItems()) as Instance[];
		if (items.isEmpty()) {
			return;
		}

		items.forEach((item) => {
			if (item.FindFirstChildWhichIsA("Fire")) {
				const descendant = item.FindFirstChildWhichIsA("Fire") as Fire;
				descendant.Enabled = period === "AM" ?? false;
			} 
		});
	}

	/**
	 * `updateClock`
	 * Updating clock time corresponding the heartbeat delta
	 *
	 * @returns RBXScriptConnection
	 */
	private updateClock(): RBXScriptConnection {
		return RunService.Heartbeat.Connect((delta) => {
			const speed = (this.duration / this.length) * this.speed;
			Lighting.ClockTime += delta * speed;
		});
	}

	/**
	 * `getMiscItems`
	 * Essentially returns all the misc items, such as fire and woods.
	 *
	 * @returns
	 */
	private async getMiscItems(): Promise<Array<Instance> | void> {
		const misc: Array<Instance> = [];
		for (const item of CollectionService.GetTagged("Misc")) {
			misc.push(item);
		}
		return !misc.isEmpty() ? misc : undefined;
	}

	/**
	 * Returns the boolean if the item type
	 * Corresponds to the given type
	 * 
	 * @param item - the item we are checking for
	 * @param type - category of what the item belongs to
	 * @returns boolean
	 */
	public isOfCategory<T extends keyof Instances>(item: Instance, category: T): boolean {
		return item.IsA(category);
	}

	/**
	 * `deconstructTime`
	 * Eseentially breaking down the string pattern %02d:%02d
	 *
	 * @param time
	 */
	public async deconstructTime(time: string): Promise<LuaTuple<(string | number)[]>> {
		const matched = time.match("(%d+)%.(%d+)");
		if (matched === undefined) {
			this.logger.Info(`Invalid string patterns`);
		}
		return matched as LuaTuple<(string | number)[]>;
	}

	/** Convert the time into hours */
	public getHour(time: number) {
		return math.floor(time / 3600);
	}

	/** Convert the time into minutes */
	public getMinute(time: number) {
		const hours = this.getHour(time);
		return math.floor((time - hours * 3600) / 60);
	}

	/** Convert the time into seconds */
	public getSeconds(time: number) {
		const hours = this.getHour(time);
		const minutes = this.getMinute(time);
		return math.floor(time - hours * 3600 - minutes * 60);
	}

	/**
	 * Basically get the time period - Period
	 *
	 * @param time
	 * @returns Period - AM | PM
	 */
	public getPeriod(time: number): Period {
		warn(time);
		return time < 18.72 ? "AM" : "PM";
	}
}
