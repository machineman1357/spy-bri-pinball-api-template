import { PINBALL } from "game/assets";
import { game_ref } from "..";

const startWidth = 7;
const startHeight = 76;
const onHit_width = 3;
const timeBefore_resetPosFromLeft_ms = 250;

export class PurpleBumper {
	public container: any;
	private xPos;
	private yPos;
	private angle;
	private isPushedIn;
	private on_sideBumperHit: any;
	private scene: any;
	public rect: any;

	constructor(options: any) {
		this.xPos = options.xPos !== undefined ? options.xPos : 0;
		this.yPos = options.yPos !== undefined ? options.yPos : 0;
		this.angle = options.angle !== undefined ? options.angle : 0;
		this.isPushedIn = false;
		this.on_sideBumperHit = options.on_sideBumperHit !== undefined ? options.on_sideBumperHit : function() { /* */ };
		this.scene = options.scene;

		this.create();
		this.createCollider();
	}

	create() {
		this.container = this.scene.add.container(this.xPos, this.yPos)
			.setAngle(this.angle);

		this.rect = this.scene.add.rectangle(0, 0, startWidth, startHeight, 0xff00ff)
		this.container.add([this.rect]);
	}

	update() {
		// this.moveToMouse(0, 0);
	}

	moveToMouse(extraX: any = 0, extraY: any = 0) {
		const cam = this.scene.cameras.main;
		this.container.x = game_ref.input.activePointer.position.x / cam.zoom + extraX;
		this.container.y = game_ref.input.activePointer.position.y / cam.zoom + extraY;
	}

	createCollider() {
		// const collider = this.scene.matter.add.rectangle(this.container.x, this.container.y, 30, 70, { 
		// 	label: "purpleBumper_sensor",
		// 	isStatic: true,
		// 	isSensor: true
		// });
		// collider.MACHINEMAN1357_purpleBumper = this;
		// console.log(collider);



		const visual = this.scene.add
			.sprite(this.container.x, this.container.y, PINBALL)
			.setAlpha(0);

		const collider = this.scene.matter.add.rectangle(
			this.container.x,
			this.container.y,
			10,
			80,
			{
				isStatic: true,
				label: "purpleBumper_sensor",
				isSensor: true
			}
		);
		collider.MACHINEMAN1357_purpleBumper = this;
		this.scene.matter.add.gameObject(visual, collider);

		visual.angle = this.angle;
	}

	on_hitByBall() {
		if(this.isPushedIn === false) {
			this.isPushedIn = true;
	
			this.on_sideBumperHit();
	
			this.rect.width = onHit_width;

			this.scene.time.addEvent({
				delay: timeBefore_resetPosFromLeft_ms,
				callback: () => {
					this.resetPushedIn();
				},
				args: []
			});
		}
	}

	resetPushedIn() {
		this.isPushedIn = false;
		this.rect.width = startWidth;
	}
}