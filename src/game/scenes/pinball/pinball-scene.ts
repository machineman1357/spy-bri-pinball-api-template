/* eslint-disable @typescript-eslint/no-explicit-any */
import { isInputDown_leftPaddle, isInputDown_rightPaddle } from "components";
import { LEFT_CHEVRON, CLICK, BG_SCRUBBED, SHAPES, PORTAL, SPIN_COIN, PINBALL, PADDLE } from "game/assets";
import { config } from "game/unOrganized/config";
import { COLLISION_CATEGORIES } from "game/helpers/collisionCategories";
import { getNormalizedDirectionAndAngle, isAngleBetweenAngles, isCompareEitherOrBodies, pushBodyAwayFrom } from "game/helpers/utils";
import { reset_ballsUnlockedForPlinko } from "game/main";
import { multipliers_start, toggleMultiplier } from "game/unOrganized/multipliers";
import { increaseScore } from "game/unOrganized/stats";
import { statsBar_start } from "game/unOrganized/statsBar";
import { AavegotchiGameObject } from "types";
import { game_ref } from "..";
import { getGameHeight, getGameWidth, getRelative } from "../../helpers";
import { aavegotchiHandWave, aavegotchiHandWave_start } from "./aavegotchiHandWave";
import { arrows_start, singleArrows, tripleArrows_left, tripleArrows_right } from "./arrows";
import { LBH_timeOuts, leftBlackHole_start, on_ballEnteredHole } from "./leftBlackHole";
import { passThroughLight_start } from "./passThroughLights";
import { wallBumper_start } from "./wallBumper";
import { roflsManager_ref, rofls_start } from "./rofls";
import { fireImage_ref, fire_start } from "./fire";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
	active: false,
	visible: false,
	key: "Pinball",
};

export let pinballScene: any;

export let ball: any;
let ballShootForceSensor_body: any;
let failResetSensor_body: any;
const PADDLE_PULL = 0.00055; // default: 0.0005
const ballShootPosition = [552, 777];
const playerBall_depth = 5;
const ballResetForce = -20;

// debug
const isCreateBGRef = false;

const bg_scrubbed_collisionShape = {
	x: 362,
	y: 452
};

let ballGraphics: any;
const is_drawBallVelocityLine = false;

/**
 * Scene where gameplay takes place
 */
export class PinballScene extends Phaser.Scene {
	public selectedGotchi?: AavegotchiGameObject;

	// Sounds
	private back?: Phaser.Sound.BaseSound;

	constructor() {
		super(sceneConfig);
	}

	init = (data: { selectedGotchi: AavegotchiGameObject }): void => {
		this.selectedGotchi = data.selectedGotchi;
	};

	public create(): void {
		pinballScene = this;

		this.back = this.sound.add(CLICK, { loop: false });
		// this.createBackButton();
		// this.createAavegotchi();
		aavegotchiHandWave_start();
		arrows_start();

		reset_ballsUnlockedForPlinko();

		// pinballScene.scene.start('PlinkoScene');

		// pinballScene.matter.world.setBounds();

		this.createMapObjects();

		pinballScene.matter.add.mouseSpring();
		
		for (let i = 0; i < 1; i++) {
			this.createBall();
		}
		this.createPaddles();
		this.createPaddleStoppers();
		
		this.setUpEvents();
		this.adjustCamera();
		aavegotchiHandWave_start();
		this.create_portalAnimation();
		statsBar_start();
		arrows_start();
		multipliers_start();
		passThroughLight_start();
		this.createSpinCoinAnimation();
		wallBumper_start();
		leftBlackHole_start();
		rofls_start();
		fire_start();

		ballGraphics = this.add.graphics({x: 0, y: 0});
	}

	public update(): void {
		// aavegotchiHandWave.aavegotchiHandWave_update();
	}

	private createAavegotchi(): void {
		const playerImage = this.add.image(
			getGameWidth(this) + 15,
			/*getGameHeight(this)*/ 80,
			this.selectedGotchi?.spritesheetKey || "",
		).setDepth(3);
	}

	private createBackButton = () => {
		this.add
			.image(getRelative(54, this), getRelative(54, this), LEFT_CHEVRON)
			.setOrigin(0)
			.setInteractive({ useHandCursor: true })
			.setDisplaySize(getRelative(94, this), getRelative(94, this))
			.on("pointerdown", () => {
				this.back?.play();
				window.history.back();
			})
			.setDepth(4);
	};

	createSpinCoinAnimation() {
		const config = {
			key: 'spinCoinAnimation',
			frames: pinballScene.anims.generateFrameNumbers(SPIN_COIN, { start: 0, end: 1, first: 0 }),
			frameRate: 5,
			repeat: -1
		};
	
		pinballScene.anims.create(config);
		pinballScene.add.sprite(480, 315, SPIN_COIN)
			.play('spinCoinAnimation')
			.setScale(0.3);
	}

	log_isMouseWithinArrowAngle() {
		const cam = pinballScene.cameras.main;
		const mousePos_x = game_ref.input.activePointer.position.x / cam.zoom;
		const mousePos_y = game_ref.input.activePointer.position.y / cam.zoom;

		const normDirAndAngle = getNormalizedDirectionAndAngle(
			singleArrows["singleArrow_1"].arrowSprite.x,
			singleArrows["singleArrow_1"].arrowSprite.y,
			mousePos_x,
			mousePos_y
		);
		const angle_deg = Phaser.Math.RadToDeg(normDirAndAngle.angle);
		const isWithin = isAngleBetweenAngles(angle_deg, -160, 65);

		console.log(normDirAndAngle.angle, angle_deg, isWithin);
		// if(isWithin) {
		// 	document.body.style.backgroundColor = "green";
		// } else {
		// 	document.body.style.backgroundColor = "red";
		// }
	}

	draw_ballVelocityLine() {
		ballGraphics.lineStyle(5, 0xff0000, 1.0);
		// ballGraphics.fillStyle(0xff0000, 1.0);
		ballGraphics.beginPath();
		ballGraphics.moveTo(ball.body.position.x, ball.body.position.y);
		ballGraphics.lineTo(
			ball.body.position.x + ball.body.velocity.x * 10,
			ball.body.position.y + ball.body.velocity.y * 10
		);
		ballGraphics.closePath();
		ballGraphics.strokePath();
	}

	create_portalAnimation() {
		const config = {
			key: 'portalAnimation',
			frames: pinballScene.anims.generateFrameNumbers(PORTAL, { start: 0, end: 4, first: 0 }),
			frameRate: 10,
			repeat: -1
		};
	
		pinballScene.anims.create(config);
		pinballScene.add.sprite(415.7733498152892, 283.43273288908836, PORTAL)
			.play('portalAnimation')
			.setScale(0.087);
	}
	
	adjustCamera() {
		pinballScene.cameras.main.zoom = 0.85; // 0.85
		pinballScene.cameras.main.setScroll(40, 80);
	}
	
	createMapObjects() {
		// bg
		const bg = pinballScene.add.image(0, 0, BG_SCRUBBED)
			// .setDisplaySize(getGameWidth(this), getGameHeight(this))
			.setOrigin(0, 0)
			// .setAlpha(0.1);
		bg.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
		
		// bg ref
		if(isCreateBGRef) {
			const bg_ref = pinballScene.add.image(0, 0, "bg_ref")
				.setOrigin(0, 0)
				.setAlpha(0.5)
				.setDepth(2);
			bg_ref.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
		}
		
		// const ball_visual = this.add.sprite(0, 0, "ball").setDepth(1);
		// const ball_body = this.matter.add.circle(481, 788, 16);
		// ball = this.matter.add.gameObject(ball_visual, ball_body);
	
		// bg collider
		const shapes = pinballScene.cache.json.get(SHAPES);
		const shapes_gameObject = pinballScene.matter.add.sprite(bg_scrubbed_collisionShape.x, bg_scrubbed_collisionShape.y, BG_SCRUBBED, BG_SCRUBBED, {shape: shapes.bg_scrubbed} as any)
			// .setOrigin(0, 0)
			.setAlpha(0.0);
		
		const ballShootForceSensor_shapeBody: any = shapes_gameObject.body;
		ballShootForceSensor_body = ballShootForceSensor_shapeBody.parts.find((x: { label: string; })  => x.label === "ballShootForceSensor");

		const failResetSensor_shapeBody: any = shapes_gameObject.body;
		failResetSensor_body = failResetSensor_shapeBody.parts.find((x: { label: string; }) => x.label === "failResetSensor");
	}
	
	createBall(x?: any, y?: any) {
		const xPos = x === undefined ? ballShootPosition[0] : x;
		const yPos = y === undefined ? ballShootPosition[1] : y;
	
		const ballOptions: any = {
			shape: {
				type: 'circle',
				radius: 18
			},
			label: "PlayerBall"
		};
		ball = pinballScene.matter.add.image(xPos, yPos, PINBALL, undefined, ballOptions).setDepth(playerBall_depth);
		ball.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
		ball.scale = 1.5;

		ball.setFriction(0.00000);
		ball.setBounce(0.5);
	
		ball.setCollisionCategory(COLLISION_CATEGORIES.BALL);
		ball.setCollidesWith([COLLISION_CATEGORIES.PADDLE, COLLISION_CATEGORIES.DEFAULT, COLLISION_CATEGORIES.BALL]);
	}
	
	setUpEvents() {
		pinballScene.input.on('pointermove', function (pointer: any) {
			const cam = pinballScene.cameras.main;
			const pointerX = pointer.position.x / cam.zoom;
			const pointerY = pointer.position.y / cam.zoom;

			// set_cursorElement(Math.round(pointerX * 1000) / 1000, Math.round(pointerY * 1000) / 1000);
		}, pinballScene);
	
		// collision filtering
		pinballScene.matter.world.on('collisionstart', function (event: any, bodyA: any, bodyB: any) {
			pinballScene.collisionFiltering(event, bodyA, bodyB);
		});
	}
	
	collisionFiltering(event: any, bodyA: any, bodyB: any) {
		const compareData_PB_GHSTB = isCompareEitherOrBodies(bodyA.label, bodyB.label, "PlayerBall", "ghstBumper", bodyA, bodyB);
		const compareData_PB_TASL = isCompareEitherOrBodies(bodyA.label, bodyB.label, "PlayerBall", "tripleArrowSensor_left", bodyA, bodyB);
		const compareData_PB_TASR = isCompareEitherOrBodies(bodyA.label, bodyB.label, "PlayerBall", "tripleArrowSensor_right", bodyA, bodyB);
		const compareData_PB_PS = isCompareEitherOrBodies(bodyA.label, bodyB.label, "PlayerBall", "portalSensor", bodyA, bodyB);
		const compareData_PB_SAS = isCompareEitherOrBodies(bodyA.label, bodyB.label, "PlayerBall", "singleArrowSensor", bodyA, bodyB);

		// multiplier sensors
		const compareData_PB_MSL = isCompareEitherOrBodies(bodyA.label, bodyB.label, "PlayerBall", "multiplierSensor_left", bodyA, bodyB);
		const compareData_PB_MSM = isCompareEitherOrBodies(bodyA.label, bodyB.label, "PlayerBall", "multiplierSensor_middle", bodyA, bodyB);
		const compareData_PB_MSR = isCompareEitherOrBodies(bodyA.label, bodyB.label, "PlayerBall", "multiplierSensor_right", bodyA, bodyB);

		const compareData_PB_PTLS = isCompareEitherOrBodies(bodyA.label, bodyB.label, "PlayerBall", "passThroughLight_sensor", bodyA, bodyB);
		const compareData_PB_WB = isCompareEitherOrBodies(bodyA.label, bodyB.label, "PlayerBall", "wallBumper_sensor", bodyA, bodyB);
		const compareData_PB_TLHS = isCompareEitherOrBodies(bodyA.label, bodyB.label, "PlayerBall", "topLeftHole_sensor", bodyA, bodyB);
		const compareData_PB_CS = isCompareEitherOrBodies(bodyA.label, bodyB.label, "PlayerBall", "coinSensor", bodyA, bodyB);
	
		this.doBehaviour_checkIfAnyBallsAreIn_ballShootForceSensor();
		this.doBehaviour_checkIfAnyBallsAreIn_failResetSensor();
	
		if(compareData_PB_GHSTB.isSuccess) {
			pushBodyAwayFrom(compareData_PB_GHSTB.firstBody, compareData_PB_GHSTB.secondBody, 5);
			increaseScore(config.score.ghstBumper);
		} else if(compareData_PB_TASL.isSuccess) {
			tripleArrows_left.tripleArrows_onBallHit(ball);
		} else if(compareData_PB_TASR.isSuccess) {
			tripleArrows_right.tripleArrows_onBallHit(ball);
		} else if(compareData_PB_PS.isSuccess) {
			for (let i = 0, len = LBH_timeOuts.length; i < len; i++) {
				const LBH_timeOut = LBH_timeOuts[i];
				clearTimeout(LBH_timeOut);
			}
			pinballScene.scene.stop();
			pinballScene.scene.start('Plinko');
		} else if(compareData_PB_SAS.isSuccess) {
			const singleArrowName = compareData_PB_SAS.secondBody.gameObject.MACHINEMAN1357_singleArrowName;
			singleArrows[singleArrowName].singleArrow_onBallHit(ball);
		}

		// multiplier sensors
		else if(compareData_PB_MSL.isSuccess) {
			toggleMultiplier("left");
		} else if(compareData_PB_MSM.isSuccess) {
			toggleMultiplier("middle");
		} else if(compareData_PB_MSR.isSuccess) {
			toggleMultiplier("right");
		}
		
		else if(compareData_PB_PTLS.isSuccess) {
			compareData_PB_PTLS.secondBody.gameObject.MACHINEMAN1357_passThroughLight_class.toggleLight();
		} else if(compareData_PB_WB.isSuccess) {
			compareData_PB_WB.secondBody.MACHINEMAN1357_wallBumper.on_hitByBall();
			increaseScore(config.score.wallBumperSensor);
		} else if(compareData_PB_TLHS.isSuccess) {
			on_ballEnteredHole();
		} else if(compareData_PB_CS.isSuccess) {
			increaseScore(config.score.pointsReceive_spinningCoin);
		}
	}
	
	doBehaviour_checkIfAnyBallsAreIn_ballShootForceSensor() {
		const bodies = pinballScene.matter.intersectBody(ballShootForceSensor_body);
		
		for (let i = 0, len = bodies.length; i < len; i++) {
			const body = bodies[i];
			
			if(body.label === "PlayerBall") {
				body.gameObject.setVelocity(0, ballResetForce + Phaser.Math.Between(-6, -2));
			}
		}
	}

	on_ballEnteredFailResetSensor(body: any) {
		body.gameObject.setPosition(ballShootPosition[0], ballShootPosition[1]);
		roflsManager_ref.placeRoflInSaveAreas();
		fireImage_ref.activateFire();
	}
	
	doBehaviour_checkIfAnyBallsAreIn_failResetSensor() {
		const bodies = pinballScene.matter.intersectBody(failResetSensor_body);
		
		for (let i = 0, len = bodies.length; i < len; i++) {
			const body = bodies[i];
			
			if(body.label === "PlayerBall") {
				this.on_ballEnteredFailResetSensor(body);
			}
		}
	}
	
	createPaddleStoppers() {
		// left
		// x: 198
		// y: 845
		this.createPaddleStopper(194, 970, "left", "down");
		this.createPaddleStopper(194, 804, "left", "up");
	
		// right
		this.createPaddleStopper(343, 970, "right", "down");
		this.createPaddleStopper(343, 804, "right", "up");
	}
	
	createPaddleStopper(x: any, y: any, side: any, position: any) {
		// determine which paddle composite to interact with
		const attracteeLabel = (side === 'left') ? 'paddleLeft' : 'paddleRight';
	
		const paddleStopper = pinballScene.matter.add.circle(x, y, 50, {
			isStatic: true,
			plugin: {
				attractors: [
					// stopper is always a, other body is b
					function (bodyA: any, bodyB: any) {
						if (bodyB.label === attracteeLabel) {
							const isPaddleUp = (side === 'left') ? isInputDown_leftPaddle : isInputDown_rightPaddle;
							const isPullingUp = (position === 'up' && isPaddleUp);
							const isPullingDown = (position === 'down' && !isPaddleUp);
							if (isPullingUp || isPullingDown) {
								return {
									x: (bodyA.position.x - bodyB.position.x) * PADDLE_PULL,
									y: (bodyA.position.y - bodyB.position.y) * PADDLE_PULL,
								};
							}
						}
					}
				]
			}
		});
	
		paddleStopper.collisionFilter.category = COLLISION_CATEGORIES.ATTRACTOR;
		paddleStopper.collisionFilter.mask = COLLISION_CATEGORIES.PADDLE;
	}
	
	createPaddles() {
		// hingeX: 154
		// hingeY: 780
		this.createPaddle(180, 890, 187, 890, -25, -12, -1.75, "left");
	
		// hingeX: 307
		// hingeY: 780
		this.createPaddle(355, 890, 355, 890, 22, 18, 1.75, "right");
	}
	
	createPaddle(x: any, y: any, hingeX: any, hingeY: any, pointA: any, pointB: any, scale: any, side: any) {
		const paddle_visual = pinballScene.add.sprite(0, 0, PADDLE).setDepth(1).setScale(scale, Math.abs(scale));
		paddle_visual.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
		const paddle_body = pinballScene.matter.add.trapezoid(x, y, 54 * Math.abs(scale), 19, 0, {
			chamfer: {},
			angle: 3.7,
			render: {
				sprite: {
					xOffset: 0
				}
			},
			label: (side === "left") ? "paddleLeft" : "paddleRight",
			// isStatic: true
		});
		const paddle = pinballScene.matter.add.gameObject(paddle_visual, paddle_body);
	
		paddle.setCollisionCategory(COLLISION_CATEGORIES.PADDLE);
		paddle.setCollidesWith([COLLISION_CATEGORIES.ATTRACTOR, COLLISION_CATEGORIES.BALL]);
	
		// hinge
		const hinge = pinballScene.matter.add.circle(hingeX, hingeY, 5, {
			isStatic: true
		});
		hinge.collisionFilter.group = COLLISION_CATEGORIES.HINGE;
	
		pinballScene.matter.add.constraint(paddle_body, hinge, 0, 0, {
			pointA: { x: pointA, y: pointB },
		});
	
		return paddle;
	}
}
