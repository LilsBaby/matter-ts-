declare namespace PID {
	type PIDMeta = {
		Calculate(setPoint: number, processValue: number, deltaTime: number): number;
		Debug(name: string, parent: Instance): void;
		Reset(): void;
		Destroy(): void;
	};

	type PIDConstructor = {
		new (min: number, max: number, kp: number, ki: number, kd: number): PIDMeta;
	};
}

declare const PID: PID.PIDConstructor;

export = PID;
