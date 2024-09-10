import { OnInit, OnStart } from "@flamework/core";
import { Signal } from "@rbxts/lemon-signal";
import { Logger } from "@rbxts/log";
import { Players, Workspace } from "@rbxts/services";
import { Document } from "@rbxts/lapis";
import { playerData } from "types/interface/default-data";
import { Janitor } from "@rbxts/better-janitor";
import { softKickPlayers } from "shared/utils/player-utils";
import { KickReason } from "types/enums/remove";
import { store } from "server/store/global";
import PlayerSavingService from "./Save";

export interface onPlayerJoin {
	onPlayerJoin(player: Player): void;
}

export interface onPlayerLeave {
	onPlayerLeave(player: Player): void;
}

export default class PlayerService implements OnStart, OnInit {
	/**
	 * For cleaning up unused stuff after the player leaves
	 */
	public readonly janitor = new Janitor<string>();

	/**
	 * Event for specifically firing and connecting when player joins
	 */
	private readonly playerJoinedEvent = new Signal<Player>();
	

	/** @ignore */
	constructor(
		private readonly logger: Logger,
		private readonly playerSavingService: PlayerSavingService,
	) {}

	onInit(): void | Promise<void> {
		this.playerJoinedEvent.Connect((player) =>
			this.onPlayerJoin(player)
				.then(() => debug.profileend())
				.catch((err) => this.logger.Info(`Failed to load player's data: ${err}`)),
		);

		Players.PlayerRemoving.Connect((player) =>
			this.onPlayerLeave(player)
				.then(() => debug.profileend())
				.catch((err) => this.logger.Error(`${err}`)),
		);

		game.BindToClose(() => {
			this.logger.Info("Game session ending soon...");
		});
	}
	onStart(): void {}

	private async onPlayerJoin(player: Player) {
		debug.profilebegin("PLAYER_LIFECYCLE");

		const data = (await this.playerSavingService.loadPlayerData(player)) as Document<playerData>;
		if (!data) {
			return;
		}

		const character = (await this.getCharacter(player)) as Instance;
		if (character === undefined) {
			softKickPlayers([player], KickReason.PlayerCharacterInvalid);
			this.logger.Info("(@Player)'s character has not loaded yet", player.Name);
			return;
		}

		//const unsubscribe = store.subscribe()

		this.janitor.addInstance(character);
		this.janitor.addFunction(() => {
			this.playerJoinedEvent.DisconnectAll();
		}, "Clean Up Player");

		this.playerJoinedEvent.Fire(player);
	}

	private async onPlayerLeave(player: Player) {
		debug.profilebegin("PLAYER_LEAVE_LIFECYCLE");

		this.janitor.cleanup();
	}

	private async subscribeToPlayerData() {}

	public async getCharacter(player: Player): Promise<Instance | void> {
		const character = player.Character;
		if (character) {
			return character;
		}

		const event = Promise.fromEvent(player.CharacterAdded, (character) => character.IsDescendantOf(Workspace));

		const [succ, model] = event.await();
		if (!succ) {
			return;
		}

		return model;
	}
}
