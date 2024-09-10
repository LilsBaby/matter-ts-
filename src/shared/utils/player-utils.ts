import { KickReason } from "types/enums/remove";

export function softKickPlayers<T extends Player>( players: T[], reason: KickReason) {
	players.forEach((player) => player.Kick(`You have been kicked for: ${KickReason.PlayerProfileUndefined}`));
}
