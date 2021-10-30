import { FIRE } from "game/assets";
import { getGameHeight, getGameWidth } from "game/helpers";
import { pinballScene } from "./pinball-scene";

export let fireImage_ref: Fire;

class Fire {
	private fireImage: any;
	private timedEvent: any;

	constructor() {
		this.createFire();
		this.createTimer();
	}

	createFire(): void {
		this.fireImage = pinballScene.add
			.image(getGameWidth(pinballScene) / 2 - 15, getGameHeight(pinballScene) + 95, FIRE)
			.setDepth(3)
			.setScale(0.075)
			.setOrigin(0.5, 0.5)
			.setAlpha(0);
	}

	createTimer() {
		this.timedEvent = pinballScene.time.addEvent({
			delay: 500,                // ms
			callback: this.deActivateFire,
			args: [],
			paused: true
		});
	}

	activateFire() {
		fireImage_ref.fireImage.setAlpha(1);

		fireImage_ref.timedEvent.reset({
			delay: 500,                // ms
			callback: fireImage_ref.deActivateFire,
			args: [],
		});
		pinballScene.time.addEvent(fireImage_ref.timedEvent);
	}

	deActivateFire() {
		fireImage_ref.fireImage.setAlpha(0);
	}
}

export function fire_start(): void {
	fireImage_ref = new Fire();
}