import { GameSystem } from "../../../types/matter";
import { World } from "@rbxts/matter";
import { GameEvent } from "../../../types/enums/matter";
import { Base } from "../../../shared/components/base";

function dealDamageToHealth() {
  
}

const BaseSystem: GameSystem = (world: World, state) => {
    for (const [id, base] of world.query((Base))) {

    }
}

export = {
  system: BaseSystem,
  event: GameEvent.Update
}