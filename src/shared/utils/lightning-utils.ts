import { Janitor } from "@rbxts/better-janitor";
import { Lighting } from "@rbxts/services";

export namespace Lightning {
	export function onClockTime(callback: (clock: number) => void): () => void {
		Lighting.GetPropertyChangedSignal("ClockTime").Connect(() => callback(Lighting.ClockTime));

		return () => {};
	}
}
