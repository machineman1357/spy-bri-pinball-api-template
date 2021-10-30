import { redRing_go } from "./scene_plinko";

const startExtraY = -20;
const moveDownSpeed = 0.1;
const moveDownAmount = 20;

export class BallFollowingRedRing {
	private ball_body: any;

	constructor(options: any) {
		this.ball_body = options.ball_body;

		this.start();
	}

	start() {
		this.ball_body.gameObject.setPosition(redRing_go.x, redRing_go.y + startExtraY);
	}

	update() {
		const newY = this.ball_body.gameObject.y + moveDownSpeed;
		const startY = redRing_go.y + startExtraY;

		if(this.ball_body.gameObject.y >= startY + moveDownAmount) {
			this.finishTubing();
			// this.ball_body.gameObject.setPosition(redRing_go.x, startY + moveDownAmount);
		} else {
			this.ball_body.gameObject.setPosition(redRing_go.x, newY);
		}
	}

	finishTubing() {
		this.ball_body.gameObject.alpha = 0;
	}
}