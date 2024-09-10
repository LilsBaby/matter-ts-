import { InferState, combineProducers } from "@rbxts/reflex";
import { $NODE_ENV } from "rbxts-transform-env";
import { slices } from "shared/store";
import { broadcasterMiddleware } from "./middleware/broadcaster";

export type RootStore = typeof store;
export type RootState = InferState<RootStore>;

export function createStore(): typeof store {
	const store = combineProducers({
		...slices,
	});

	store.applyMiddleware(broadcasterMiddleware());

	return store;
}

export const store = createStore();
