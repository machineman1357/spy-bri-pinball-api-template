const startExtraY = -25;
const moveDownSpeed = 0.2;
const moveDownAmount = 50;

export class BallGoingInTube {
	private ball_body: any;
	private tube_body: any;

	constructor(options: any) {
		this.ball_body = options.ball_body;
		this.tube_body = options.tube_body;

		this.start();
	}

	start() {
		this.ball_body.gameObject.setPosition(this.tube_body.position.x, this.tube_body.position.y + startExtraY);
	}

	update() {
		const newY = this.ball_body.gameObject.y + moveDownSpeed;
		const startY = this.tube_body.position.y + startExtraY;

		if(this.ball_body.gameObject.y >= startY + moveDownAmount) {
			this.finishTubing();
		} else {
			this.ball_body.gameObject.setPosition(this.tube_body.position.x, newY);
		}
	}

	finishTubing() {
		this.ball_body.gameObject.alpha = 0;
	}
}