import { Controller, OnInit } from "@flamework/core";
import { Janitor } from "@rbxts/better-janitor";
import { Logger } from "@rbxts/log";
import { Players, RunService, UserInputService, Workspace } from "@rbxts/services";

@Controller({})
export default class CameraController implements OnInit {
	/** Camera */
	private readonly camera = Workspace.CurrentCamera as Camera;

	/** Player */
	private readonly player = Players.LocalPlayer;
	private readonly character = this.player.Character || this.player.CharacterAdded.Wait()[0];

	/** Timeout */
	private readonly timeout: number = 10;

	/** how far the camera is from the root position */
	private readonly depth: number = 58;

	/** Camera responsive speed */
	private readonly speed: number = 0.6;

	/** We dont want players to zoom in / out that far */
	private readonly MIN_ZOOM = 2;
	private readonly MAX_ZOOM = 2;

	/** @ignore */
	constructor(private readonly logger: Logger) {}

	onInit(): void | Promise<void> {
		const janitor = new Janitor<string>();

		this.camera.CameraType = Enum.CameraType.Scriptable;
		janitor.addInstance(this.camera);

		this.player.CameraMaxZoomDistance = this.MAX_ZOOM;
		this.player.CameraMinZoomDistance = this.MIN_ZOOM;

		this.isometicCamera()
			.then((event) => {
				this.faceMousePosition()
				janitor.addFunction(() => event.Disconnect(), "Clean up isomentic camera");
			})
			.catch((err) => this.logger.Error("Failed to implement Isometic camera: {@Error}"));
	}

	private async isometicCamera(): Promise<RBXScriptConnection> {
		return RunService.Heartbeat.Connect((delta) => {
			const center = this.camera.ViewportSize.div(2);
			const mouse = UserInputService.GetMouseLocation();
			const head = this.character.WaitForChild("Head", this.timeout) as BasePart;

			const origin = head.GetPivot().UpVector.add(new Vector3(0, this.depth, -this.depth / 2));
			const final = CFrame.lookAt(origin, head.GetPivot().Position);

			this.camera.CFrame = this.camera.CFrame.Lerp(final, this.speed);
		});
	}

	private faceMousePosition() {
		const root = this.character.WaitForChild("HumanoidRootPart", this.timeout) as BasePart;
		const [_, angleY, _n] = root.CFrame.ToEulerAnglesXYZ();

		const x = 

		root.CFrame = root.CFrame.mul(CFrame.fromEulerAnglesXYZ(0, angleY, 0));
	}

	private getMousePosition(): Vector2 {
		return UserInputService.GetMouseLocation();
	}
}
