import { BaseComponent, Components } from "@flamework/components";
import { Janitor } from "@rbxts/better-janitor";
import { Dependency, Modding, OnInit, OnStart } from "@flamework/core";
import { Players } from "@rbxts/services";
import Log, { Logger } from "@rbxts/log";
import { Signal } from "@rbxts/lemon-signal";
import Object = require("@rbxts/object-utils");
import First = Enum.RenderPriority.First;

export interface ToolDestroyed {
	ToolDestroyed(tool: Tool<ToolAttributes, ToolInstance>): void;
}

export interface ToolCreated {
	ToolCreated(tool: Tool<ToolAttributes, ToolInstance>): void;
}

export interface ToolAttributes {}

export interface ToolInstance extends Instance {
	Handle: BasePart & {};
}

export enum ToolState {
	ACTIVATE = "Activate",
	EQUIP = "Equip",
	UNEQUIP = "Unequip",
	DESTROY = "Destroy",
}

enum InputEnum {
	"MouseButton1",
	"MouseButton2",
}

export type InputKey = keyof typeof InputEnum;
export type ActionInfo = { Action: keyof typeof ToolState };
type ToolInput = {
	InputKey: ActionInfo;
};

type ValidatorAction<T extends Record<string, ActionInfo>[]> = T extends Record<infer First, infer Rest>[] ? T : never;

export default abstract class Tool<I extends ToolAttributes = ToolAttributes, K extends ToolInstance = ToolInstance>
	extends BaseComponent<I, K>
	implements OnStart, OnInit
{
	/**
	 * Janitor for cleaning up unused objects
	 */
	protected janitor = new Janitor<string>();
	/**
	 * Map for setting / removing active inputs (MouseButton1, MouseButton2)
	 */
	protected activeInputs = new Map<InputKey, ToolInput>();
	/**
	 *
	 */
	protected components: Components = Dependency<Components>()
	/**
	 * Fires whenever tool is destroyed
	 * @private
	 */
	private toolDestroyed = new Signal<[tool: Tool<I, K>]>();
	/**
	 * Fires whenever tool is created
	 * @private
	 */
	private toolCreated = new Signal<[tool: Tool<I, K>]>();
	/**
	 *
	 */
	/**
	 * Checks whether the tool is being used
	 * @public
	 * */
	public isEquipping: boolean = false;

	/**
	 * Counter for the amount of times a tool has been initiated
	 * @public
	 */
	public toolInit = 0;
	/**
	 * Counter for the amount of times a tool has been initiated
	 * @public
	 */
	public toolRemoved = 0;

	constructor(
		private readonly logger: Logger,
	) {
		super();
	}

	/** @ignore */
	onStart() {
		try {
			this.manageLifeCycles();
		} catch (err) {
			this.logger.Error(`Error during initiating tool: ${err}`);
		}
	}
	/** @ignore */
	onInit(): void | Promise<void> {}

	/** @internal */
	private manageLifeCycles() {
		Modding.onListenerAdded<ToolCreated>((listener) => {
			this.toolCreated.Connect((tool) => listener.ToolCreated(tool));
			this.toolInit++;
		});

		Modding.onListenerAdded<ToolDestroyed>((listener) => {
			this.toolDestroyed.Connect((tool) => listener.ToolDestroyed(tool));
			this.toolRemoved++;
		});
	}

	/**
	 * `getHolder`
	 * Gets the person holding the tool
	 **/
	protected async getHolder(): Promise<Player | void> {
		const tool = this.getTool();
		if (!tool) {
			return;
		}

		const holder = tool.GetAttribute("Holder") as AttributeValue as string;
		const player = Players.GetPlayers().find((v) => v.Name === holder);
		if (player) return player;

		const event = Promise.fromEvent(
			tool.AttributeChanged,
			(value) =>
				value === "Holder" &&
				tool.GetAttribute("Holder") !== undefined &&
				Players.FindFirstChild(tool.GetAttribute("Holder") as AttributeValue as string) !== undefined,
		);

		const [success, result] = event.await();
		if (!success) return;

		return Players.FindFirstChild(result) as Instance as Player;
	}

	/**
	 * `checkForEnabledTools`
	 * Returns an array of tools that are enabled, in case when we want to cancel a weapon
	 */
	protected async checkForEnabledTools(tool: K): Promise<Array<Tool>> {
		const tools = this.components.getAllComponents<Tool>();
		return tools.filter((v) => v.isEnabled());
	}

	public isEnabled(): boolean {
		return this.isEquipping;
	}

	public getTool(): K {
		return this.instance;
	}

	public Destroy() {
		this.components.removeComponent<Tool>(this.instance);
		this.janitor.cleanup();
		this.janitor.destroy();
	}
}
