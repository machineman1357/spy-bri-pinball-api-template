import { game_ref } from "..";
import { on_sideBumperHit } from "./leftBlackHole";
import { pinballScene } from "./pinball-scene";

const onHitMoveLeft = -5;
const timeBefore_resetPosFromLeft = 250;

class WallBumper {
	private isRight: any;
	private container: any;
	private tube: any;
	private xPos;
	private yPos;
	private isPushedIn;

	constructor(options: any) {
		this.isRight = options.isRight !== undefined ? options.isRight : false
		this.xPos = options.xPos;
		this.yPos = options.yPos;
		this.isPushedIn = false;

		this.create();
		this.createCollider();
	}

	create() {
		this.container = pinballScene.add.container(this.xPos, this.yPos);
		if(this.isRight) {
			this.container.scaleX = -1;
		}

		this.tube = pinballScene.add.image(0, 0, "wallBumper_l_tube");
		const edge = pinballScene.add.image(0, 0, "wallBumper_l_edge");
		this.container.add([this.tube, edge]);
	}

	update() {
		// this.moveToMouse(0, 0);
	}

	moveToMouse(extraX: any, extraY: any) {
		const cam = pinballScene.cameras.main;
		this.container.x = game_ref.input.activePointer.position.x / cam.zoom + extraX;
		this.container.y = game_ref.input.activePointer.position.y / cam.zoom + extraY;
		console.log(this.container.x, this.container.y);
	}

	createCollider() {
		const collider = pinballScene.matter.add.rectangle(this.container.x, this.container.y, 30, 70, { 
			label: "wallBumper_sensor",
			isStatic: true,
			isSensor: true
		});
		collider.MACHINEMAN1357_wallBumper = this;
	}

	on_hitByBall() {
		if(this.isPushedIn === false) {
			this.isPushedIn = true;
	
			on_sideBumperHit();
	
			this.tube.x = onHitMoveLeft;
			setTimeout(() => {
				this.resetPushedIn();
			}, timeBefore_resetPosFromLeft);
		}
	}

	resetPushedIn() {
		this.isPushedIn = false;
		this.tube.x = 0;
	}
}

export function wallBumper_start() {
	new WallBumper({
		xPos: 78.34902864062873,
		yPos: 637.9186952565676
	});
	new WallBumper({
		isRight: true,
		xPos: 460.86548112129276,
		yPos: 637.9186952565676
	});
}