import { World } from "@rbxts/matter"
import { GameEvent } from "types/enums/matter"
import ServerState from "types/interface/state"
import { GameSystem } from "types/matter"

const GoblinThrowSystem: GameSystem = (world: World, state) => {
    // for every 3-6 seconds throw my dick
    
}

export = {
    system: GoblinThrowSystem,
    event: GameEvent.Update
}