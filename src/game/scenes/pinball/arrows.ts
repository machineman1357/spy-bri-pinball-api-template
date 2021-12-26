/* eslint-disable @typescript-eslint/no-explicit-any */
import { ARROW_PURPLE, ARROW_RED, TIMER } from "game/assets";
import { increase_ballsUnlockedForPlinko } from "game/main";
import { game_ref } from "..";
import { getNormalizedDirectionAndAngle, isAngleBetweenAngles } from "../../helpers/utils";
import { pinballScene } from "./pinball-scene";

export let tripleArrows_left: any;
export let tripleArrows_right: any;

let current_singleArrowIndex = 0;
export const singleArrows: any = {};

class TripleArrows {
	private arrowsContainer: any;
	private arrowSprites: any = [];
	private arrowSpritesTaken: any = 0;
	private angleOfArrows: any;
	private angleWithinNeeded: any;
	private xPos: any;
	private yPos: any;
	private angle: any;


	constructor(options: any) {
		this.angleOfArrows = options.angleOfArrows;
		this.angleWithinNeeded = options.angleWithinNeeded;

		this.xPos = options.xPos;
		this.yPos = options.yPos;
		this.angle = options.angle;

		this.tripleArrows_create();
	}

	tripleArrows_create() {
		const arrowHeight = 26;

		this.arrowsContainer = pinballScene.add.container(this.xPos, this.yPos)
			.setDepth(2)
			.setScale(1.5)
			.setAngle(this.angle);

		for (let i = 0; i < 3; i++) {
			const arrow = pinballScene.add.image(0, arrowHeight * i, ARROW_RED);
			arrow.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
			
			this.arrowsContainer.add(arrow);
			this.arrowSprites.push(arrow);
		}
	}

	tripleArrows_update() {
		// this.tripleArrows_moveToMouse();
	}

	tripleArrows_moveToMouse() {
		const cam = pinballScene.cameras.main;
		this.arrowsContainer.x = game_ref.input.activePointer.position.x / cam.zoom;
		this.arrowsContainer.y = game_ref.input.activePointer.position.y / cam.zoom + 50;
		console.log(this.arrowsContainer.x, this.arrowsContainer.y);
	}

	tripleArrows_onBallHit(ball: any) {
		if(!this.tripleArrows_isBallWithinAngles(ball)) return;

		// only decrement if all the arrows haven't been taken
		if(this.arrowSpritesTaken < this.arrowSprites.length) {
			increase_ballsUnlockedForPlinko();

			this.arrowSpritesTaken += 1;
			const asti = this.tripleArrows_getArrowSpriteTakenIndex();
	
			this.arrowSprites[asti].setTexture(ARROW_PURPLE);
			this.tripleArrows_addTimerSpriteToArrow();
		}
	}

	tripleArrows_isBallWithinAngles(ball: any) {
		const normDirAndAngle = getNormalizedDirectionAndAngle(
			ball.body.position.x,
			ball.body.position.y,
			ball.body.position.x + ball.body.velocity.x,
			ball.body.position.y + ball.body.velocity.y
		);
		const angle_deg = Phaser.Math.RadToDeg(normDirAndAngle.angle);
		const isWithin = isAngleBetweenAngles(angle_deg, this.angleOfArrows, this.angleWithinNeeded);

		return isWithin;
	}

	tripleArrows_getArrowSpriteTakenIndex() {
		return this.arrowSprites.length - this.arrowSpritesTaken;
	}

	tripleArrows_addTimerSpriteToArrow() {
		const asti = this.tripleArrows_getArrowSpriteTakenIndex();
		const timerSprite = pinballScene.add.image(this.arrowSprites[asti].x, this.arrowSprites[asti].y + 3, "timer")
			.setAngle(-this.angle)
			.setScale(0.75);
		timerSprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
		this.arrowsContainer.add(timerSprite);
	}
}

class SingleArrow {
	private arrowSprite: any = false;
	private isTaken: any;
	private angleOfArrow: any;
	private angleWithinNeeded: any;
	private timerExtraPos: any;
	private singleArrowName: any;
	private xPos: any;
	private yPos: any;
	private angle: any;

	constructor(options: any) {
		this.angleOfArrow = options.angleOfArrow;
		this.angleWithinNeeded = options.angleWithinNeeded;
		this.timerExtraPos = options.timerExtraPos;

		this.singleArrowName = "singleArrow_" + current_singleArrowIndex;
		current_singleArrowIndex += 1;

		this.xPos = options.xPos;
		this.yPos = options.yPos;
		this.angle = options.angle;

		this.singleArrow_create();

		singleArrows[this.singleArrowName] = this;
	}

	singleArrow_create() {
		// this.arrowSprite = pinballScene.add.image(this.xPos, this.yPos, ARROW_RED)
		// 	.setDepth(2)
		// 	.setScale(1.5)
		// 	.setAngle(this.angle);

		// this.arrowSprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

		this.arrowSprite = pinballScene.add.sprite(this.xPos, this.yPos, ARROW_RED).setDepth(2).setScale(1.5);
		this.arrowSprite.MACHINEMAN1357_singleArrowName = this.singleArrowName;
		this.arrowSprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

		const object_body = pinballScene.matter.add.circle(this.xPos, this.yPos, 25, {
			isStatic: true,
			label: "singleArrowSensor",
			isSensor: true
		});
		const arrow = pinballScene.matter.add.gameObject(this.arrowSprite, object_body)
			.setAngle(this.angle);
	}

	singleArrow_update() {
		// this.tripleArrows_moveToMouse();
	}

	singleArrow_moveToMouse() {
		const cam = pinballScene.cameras.main;
		this.arrowSprite.x = game_ref.input.activePointer.position.x / cam.zoom;
		this.arrowSprite.y = game_ref.input.activePointer.position.y / cam.zoom + 50;
	}

	singleArrow_onBallHit(ball: any) {
		if(!this.singleArrow_isBallWithinAngles(ball)) return;
		if(this.isTaken) return;

		increase_ballsUnlockedForPlinko();

		this.isTaken = true;
		this.arrowSprite.setTexture(ARROW_PURPLE);
		this.singleArrow_addTimerSpriteToArrow();
	}

	singleArrow_isBallWithinAngles(ball: any) {
		const normDirAndAngle = getNormalizedDirectionAndAngle(
			ball.body.position.x,
			ball.body.position.y,
			ball.body.position.x + ball.body.velocity.x,
			ball.body.position.y + ball.body.velocity.y
		);
		const angle_deg = Phaser.Math.RadToDeg(normDirAndAngle.angle);
		const isWithin = isAngleBetweenAngles(angle_deg, this.angleOfArrow, this.angleWithinNeeded);

		return isWithin;
	}

	singleArrow_addTimerSpriteToArrow() {
		const timerSprite = pinballScene.add.image(this.arrowSprite.x + this.timerExtraPos.x, this.arrowSprite.y + this.timerExtraPos.y, TIMER)
			.setScale(1.15)
			.setDepth(3);
		timerSprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
	}
}

export function arrows_start() {
	// triple arrows
	tripleArrows_left = new TripleArrows({
		xPos: 103.065,
		yPos: 524.32,
		angle: -28,
		angleOfArrows: -160,
		angleWithinNeeded: 30
	});
	tripleArrows_right = new TripleArrows({
		xPos: 433.9,
		yPos: 523.14,
		angle: 28,
		angleOfArrows: 146,
		angleWithinNeeded: 30
	});
	
	// single arrows
	// middle
	new SingleArrow({
		xPos: 270,
		yPos: 550,
		angle: 0,
		angleOfArrow: 180,
		angleWithinNeeded: 30,
		timerExtraPos: { x: 0, y: 5 }
	});
	// left
	new SingleArrow({
		xPos: 184,
		yPos: 493,
		angle: -38,
		angleOfArrow: -145,
		angleWithinNeeded: 30,
		timerExtraPos: { x: 5, y: 5 }
	});
	// right
	new SingleArrow({
		xPos: 355,
		yPos: 493,
		angle: 38,
		angleOfArrow: 145,
		angleWithinNeeded: 30,
		timerExtraPos: { x: -5, y: 5 }
	});
}
