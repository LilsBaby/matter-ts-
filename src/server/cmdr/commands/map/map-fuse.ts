import { CommandDefinition } from "@rbxts/cmdr";

export = identity<CommandDefinition>({
	Name: "test-map-fuser",
	Description: "Test the map fuser",
	Aliases: ["tmf"],
	Args: [],
	ClientRun: (player, args) => {
		return "Test map fuser";
	},
});
