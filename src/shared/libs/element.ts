import { Janitor } from "@rbxts/better-janitor";
import Skill from "./skill";

const registeredElements: Map<string, Element<Skill[]>> = new Map();

export default abstract class Element<Skills extends Skill[]> {
	protected readonly janitor = new Janitor<string>();

	constructor(element: string, skills: Skill[]) {}
}
