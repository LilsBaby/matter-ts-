import Tool, { ToolAttributes, ToolInstance } from "./Tool";
import { Logger } from "@rbxts/log";

interface BowAttributes extends ToolAttributes {}
interface BowInstance extends ToolInstance {
    Handle: BasePart
}

export default class Bow extends Tool<BowAttributes, BowInstance> {
	constructor(private readonly log: Logger) {
		super(log);
	}

  private async Release(): Promise<void> {}

	Destroy() {
		super.destroy();
	}
}