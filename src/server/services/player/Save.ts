import { createCollection, Document } from "@rbxts/lapis";
import { AnyEntity, World } from "@rbxts/matter";
import { Players, RunService } from "@rbxts/services";
import { Data, User } from "shared/components/player";
import { GameEvent } from "types/enums/matter";
import { playerData } from "types/interface/default-data";
import { GameSystem } from "types/matter";
import Log from "@rbxts/log";
import { softKickPlayers } from "shared/utils/player-utils";
import { KickReason } from "types/enums/remove";
import { OnInit, OnStart, Service } from "@flamework/core";

/**
 * for (const [id, record] of world.queryChanged(User)) {
		if (record.new === undefined && record.old && record.old.player) {
			const player = record.old?.player as Player;

			Log.Info(`Player ${player.Name} leaving game, closing session.`);

			const document = world.get(id, Data)?.document as Document<playerData>;

			try {
				await document.close();
			} catch (err) {
				Log.Error(`Failed to close player document for ${player.Name}: ${err}`);
			}
			Log.Fatal(`Locking up session for: ${player.Name}`);
		}
	}
 */

export const PLAYER_DATA: playerData = {
	gold: 1,
};

const DATA_STORE_NAME = RunService.IsStudio() ? "Development" : "Production";
const COLLECTION = createCollection<playerData>(DATA_STORE_NAME, {
	defaultData: PLAYER_DATA,
});

@Service({})
export default class PlayerSavingService {
	/**
	 *  `loadPlayerData`
	 * Essentially accessing the player's session and return the document
	 * If it errors -> player will be kicked - KickReason.PlayerProfileUndefined
	 *
	 * @param player
	 * @returns
	 */
	public async loadPlayerData(player: Player): Promise<Document<playerData> | void> {
		try {
			const key = await this.getKey(player);
			const document = await COLLECTION.load(key, [player.UserId]);

			if (!player.IsDescendantOf(Players)) {
				await document.close();
				return;
			}

			document.beforeClose(() => {});

			return document;
		} catch (err) {
			Log.Error(`Failed to load player data for ${player.GetFullName()}: ${err}`);
			softKickPlayers([player], KickReason.PlayerProfileUndefined);
		}
	}

	public async getKey(player: Player): Promise<string> {
		return `${player.UserId}`;
	}
}
