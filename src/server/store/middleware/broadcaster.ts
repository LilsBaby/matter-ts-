import { ProducerMiddleware, createBroadcaster } from "@rbxts/reflex";
import { Players } from "@rbxts/services";
import { $NODE_ENV } from "rbxts-transform-env";
import Remotes from "shared/events";
import { slices } from "shared/store";

export const ONCE_PER_MINUTE = 60;

export function broadcasterMiddleware(): ProducerMiddleware {
	// Storybook support
	if ($NODE_ENV === "development") {
		return () => (dispatch) => dispatch;
	}

	const hydrated = new Set<number>();

	const broadcaster = createBroadcaster({
		beforeHydrate: (player, state) => {
			const isInitialHydrate = !hydrated.has(player.UserId);
			if (isInitialHydrate) {
				hydrated.add(player.UserId);
				return state;
			}

			return state;
		},
		dispatch: (player, actions) => {
			Remotes.Server.Get("Dispatch").SendToPlayer(player, actions);
		},
		hydrate: (player, state) => {
			Remotes.Server.Get("Hydrate").SendToPlayer(player, state);
		},
		hydrateRate: ONCE_PER_MINUTE,
		producers: slices,
	});

	Remotes.Server.Get("Start").Connect((player) => {
		broadcaster.start(player);
	});

	Players.PlayerRemoving.Connect((player) => {
		hydrated.delete(player.UserId);
	});

	return broadcaster.middleware;
}
