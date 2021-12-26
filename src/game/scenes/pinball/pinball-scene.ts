/* eslint-disable @typescript-eslint/no-explicit-any */
import { isInputDown_leftPaddle, isInputDown_rightPaddle } from "components";
import { LEFT_CHEVRON, CLICK, BG_SCRUBBED, SHAPES, PORTAL, SPIN_COIN, PINBALL, PADDLE, SLINGSHOT_SOUND, BALL_CURVING_AROUND_AFTER_RELEASE, BALL_HITTING_PLAIN_WALL, DOUBLE_POINTS_SOUND, ETH_COIN, GHST_COIN, TRIPLE_MULTIPLIER, WALL_BUMPERS, PORTAL_SOUND, LOOP_RE_ENTRY_BLOCKER, DIAMOND, GAME_END_SOUND, PLINKO_LOSE_BALL_SOUND, TILT_SOUND } from "game/assets";
import { COLLISION_CATEGORIES } from "game/helpers/collisionCategories";
import { getNormalizedDirectionAndAngle, isAngleBetweenAngles, isCompareEitherOrBodies, pushBodyAwayFrom, pushBodyAwayPoint } from "game/helpers/utils";
import { reset_ballsUnlockedForPlinko } from "game/main";
import { multipliers_start, toggleMultiplier } from "game/unOrganized/multipliers";
import { increaseScore, resetScore } from "game/unOrganized/stats";
import { statsBar_start } from "game/unOrganized/statsBar";
import { AavegotchiGameObject } from "types";
import { game_ref } from "..";
import { getGameWidth, getRelative } from "../../helpers";
import { aavegotchiHandWave_start } from "./aavegotchiHandWave";
import { arrows_start, singleArrows, tripleArrows_left, tripleArrows_right } from "./arrows";
import { leftBlackHole_start, on_ballEnteredHole, reset as resetLeftBlackHole, timer_closeLBH } from "./leftBlackHole";
import { passThroughLight_start } from "./passThroughLights";
import { WallBumper, wallBumper_start } from "./wallBumper";
import { currentRoflLives, resetLives, roflsManager_ref, rofls_start } from "./rofls";
import { fireImage_ref, fire_start } from "./fire";
import { BGMusicScene } from "../bgMusic/scene_bgMusic";
import { ballSpeedForWallHitSound, ballSpeedForWallHitSound_max, ballWallHitSoundOnHoldFor_ms, ball_mass, gameUI_retryFontSize, ghstBumper_soundVolume, is_logMousePos, plinko_lose_ball_soundVolume, scores, slingshotBumperForce, slingShotSensorLeft_position, slingShotSensorRight_position, timeBeforeStartPlinkoSceneAfterBallEnteredPortal_ms, wallBumperSensorLeft_position, wallBumperSensorRight_position } from "helpers/vars";
import gameOverStyle from "../../../components/GameOver/style.module.css";
import keyInputStle from "../../../components/PaddlesInput/styles.module.css";
import { EthCoin } from "./ethCoin";
import { PurpleBumper } from "./purpleBumper";
import { GameScene } from "../gameScene/game-scene";
import { HoldSpaceBallLaunchManager } from "./holdSpaceBallLaunch";
import { BallStuckService, IBallStuckServiceOptions } from "./ballStuckService";
import { TiltBehavior } from "./tiltBehavior";
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
export const ballResetForce = -40;

// debug
const isCreateBGRef = false;

const bg_scrubbed_collisionShape = {
	x: 362,
	y: 452
};

let ballGraphics: any;

enum EStates {
	firstShot,
	atTop,
	outOfLoop
}

/**
 * Scene where gameplay takes place
 */
export class PinballScene extends Phaser.Scene {
	public selectedGotchi?: AavegotchiGameObject;

	// Sounds
	private back?: Phaser.Sound.BaseSound;
	private slingshot_sound: any;
	private ballCurvingAround_sound: any;
	private ballHittingPlainWall_sound: any;
	private doublePoints_sound: any;
	private ethCoin_sound: any;
	private ghst_sound: any;
	private tripleMultiplier_sound: any;
	private wallBumpers_sound: any;
	private enterPortal_sound: any;
    private gameEnd_sound: any;
    private lose_ball_sound!: Phaser.Sound.BaseSound;
    private tilt_sound!: Phaser.Sound.BaseSound;

	private ghstBumpers: any = [];

	private is_ballWallHitSoundOnHold = false;

	private ballLoopEntryBlocker: any;
	public ballLoopEntryBlockerService: any;
	private ethCoin: any;

	private TEMP_purpleBumper: any;
	private purpleBumper_left: any;
	private purpleBumper_right: any;
	private is_ballLeftStart = false;

	public pinball_isGameOver = false;

    private holdSpaceBallLaunchManager!: HoldSpaceBallLaunchManager;
    private ballIsInShootForceArea_sensor_body: any;

    // private ballStuckService!: BallStuckService;
    public tiltBehavior!: TiltBehavior;

	constructor() {
		super(sceneConfig);
	}

	init = (data: { selectedGotchi: AavegotchiGameObject }): void => {
		this.selectedGotchi = data.selectedGotchi;
	};

	public create(): void {
		pinballScene = this;

        this.holdSpaceBallLaunchManager = new HoldSpaceBallLaunchManager(this);

		const bgMusicScene = this.scene.get('BGMusic') as BGMusicScene;
		if (!bgMusicScene.scene.isActive()) {
			// start music scene
			pinballScene.scene.launch('BGMusic');
		}

		// start game-scene (which has network stuff)
		const gameScene = this.scene.get('Game') as GameScene;
		if (!gameScene.scene.isActive()) {
			console.log("starting game scene");
			pinballScene.scene.launch('Game');
		}

		this.back = this.sound.add(CLICK, { loop: false });
		this.slingshot_sound = this.sound.add(SLINGSHOT_SOUND);
		this.ballCurvingAround_sound = this.sound.add(BALL_CURVING_AROUND_AFTER_RELEASE);
		this.ballHittingPlainWall_sound = this.sound.add(BALL_HITTING_PLAIN_WALL);
		this.doublePoints_sound = this.sound.add(DOUBLE_POINTS_SOUND);
		this.ethCoin_sound = this.sound.add(ETH_COIN);
		this.ghst_sound = this.sound.add(GHST_COIN);
		this.tripleMultiplier_sound = this.sound.add(TRIPLE_MULTIPLIER);
		this.wallBumpers_sound = this.sound.add(WALL_BUMPERS);
		this.enterPortal_sound = this.sound.add(PORTAL_SOUND);
        this.gameEnd_sound = this.sound.add(GAME_END_SOUND);
        this.lose_ball_sound = this.sound.add(PLINKO_LOSE_BALL_SOUND);
        this.tilt_sound = this.sound.add(TILT_SOUND);

		this.createBackButton();
		// this.createAavegotchi();
		aavegotchiHandWave_start();
		arrows_start();

		reset_ballsUnlockedForPlinko();

		// pinballScene.scene.start('PlinkoScene');

		// pinballScene.matter.world.setBounds();

		this.createMapObjects();

        if(process.env.NODE_ENV === "development") {
            pinballScene.matter.add.mouseSpring();
        }

		for (let i = 0; i < 1; i++) {
			this.createBall();
		}
		this.createPaddles();
		this.createPaddleStoppers();

		this.create_ballExitReEntryBlocker_collider();
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
		this.create_ballLoopEntryBlockerService();
		this.createSlingshotPurpleBumpers();

		ballGraphics = this.add.graphics({ x: 0, y: 0 });
		this.ethCoin = new EthCoin();

		// this.addGameOverUI();
        this.createBallShootForceSensor();
        // this.ballStuckService = new BallStuckService({ scene: this } as IBallStuckServiceOptions);
        this.tiltBehavior = new TiltBehavior();

        const windowAnyBypass: any = window;
        windowAnyBypass.MACHINEMAN1357_paddlesInput_container.enable_paddlesInput();
        document.getElementById("tilt-button-container")!.style.display = "block";
	}

	public update(time: number, delta: number): void {
        this.holdSpaceBallLaunchManager.update(delta);
		// aavegotchiHandWave.aavegotchiHandWave_update();

		// rotate ghst bumpers (to avoid ball bouncing forever on one of them)
		for (let i = 0, len = this.ghstBumpers.length; i < len; i++) {
			const ghstBumper: any = this.ghstBumpers[i];

			ghstBumper.rotation += 0.01;
		}

		this.ballLoopEntryBlockerService.update();

		if (this.TEMP_purpleBumper) {
			// this.TEMP_purpleBumper.moveToMouse();
		}
        // this.ballStuckService.update();
	}

    private createBallShootForceSensor() {
        this.ballIsInShootForceArea_sensor_body = pinballScene.matter.add.circle(550, 900, 35, {
			isStatic: true,
			label: "ballIsInShootForceArea_sensor",
			isSensor: true
		});
    }

	private createSlingshotPurpleBumpers() {
		// left slingshot bumper
		this.purpleBumper_left = new PurpleBumper({
			scene: this,
			xPos: 161.70012560973987,
			yPos: 750.0519952389902,
			angle: -23
		});

		// right
		this.purpleBumper_right = new PurpleBumper({
			scene: this,
			xPos: 378.37026910666174,
			yPos: 748.9820209233854,
			angle: -157
		});

		// debugging
		// document.body.addEventListener("keydown", (ev) => {
		// 	if(ev.code === "KeyQ") {
		// 		this.TEMP_purpleBumper.on_hitByBall();
		// 	} else if(ev.code === "KeyW") {
		// 		console.log(this.TEMP_purpleBumper.container.x, this.TEMP_purpleBumper.container.y);
		// 	}
		// });

		// document.body.addEventListener("wheel", (ev) => {
		// 	this.TEMP_purpleBumper.rect.angle += ev.deltaY / 100;
		// 	console.log("new angle:", this.TEMP_purpleBumper.rect.angle);
		// });
	}

	private create_ballLoopEntryBlockerService() {
		class BallLoopEntryBlockerService {
			public state: EStates = EStates.firstShot;

			private image: any;

			constructor() {
				this.createImage();
			}

			update() {
				if (this.state === EStates.firstShot) {
					if (ball.y < 350) {
						this.state = EStates.atTop;
					}
				} else if (this.state === EStates.atTop) {
					if (ball.y > 350) {
						this.state = EStates.outOfLoop;

						pinballScene.ballLoopEntryBlocker.enable();
						// this.image.setAlpha(1);
					}
				}
			}

			reset() {
				this.state = EStates.firstShot;

				pinballScene.ballLoopEntryBlocker.disable();

				this.image.setAlpha(0);
			}

			createImage() {
				// image
				this.image = pinballScene.add.image(115, 127, LOOP_RE_ENTRY_BLOCKER)
					.setDepth(10)
					.setAlpha(0);
			}
		}

		this.ballLoopEntryBlockerService = new BallLoopEntryBlockerService();
	}

	private create_ballExitReEntryBlocker_collider() {
		const verts = [{ "x": 148, "y": 87 }, { "x": 90, "y": 112 }, { "x": 132, "y": 150 }];

		const poly = this.add.polygon(125, 117, verts, 0x000000, 0.0);

		class BallLoopEntryBlocker {
			private object: any;

			constructor() {
				this.create();
				this.disable();
			}

			create() {
				this.object = pinballScene.matter.add.gameObject(
					poly,
					{
						shape: {
							type: 'fromVerts', verts: verts, flagInternal: true
						},
						isStatic: true
					}
				);
			}

			disable() {
				this.object.setPosition(9000, 1);
			}

			enable() {
				// this.object.setPosition(125, 117);
			}
		}

		this.ballLoopEntryBlocker = new BallLoopEntryBlocker();
	}

    public resetBallToShootTube() {
        ball.body.gameObject.setPosition(ballShootPosition[0], ballShootPosition[1]);
    }

	private playSlingshotSound() {
		this.slingshot_sound.play();
	}

	private createAavegotchi(): void {
		this.add.image(
			getGameWidth(this) + 15,
			/*getGameHeight(this)*/ 80,
			this.selectedGotchi?.spritesheetKey || "",
		).setDepth(3);
	}

	private createBackButton = () => {
		this.add
			.image(getRelative(695, this), getRelative(34, this), LEFT_CHEVRON)
			.setOrigin(0)
			.setInteractive({ useHandCursor: true })
			.setDisplaySize(getRelative(94, this), getRelative(94, this))
			.on("pointerdown", () => {
                pinballScene = undefined;
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
		// diamonds flare
		pinballScene.add.image(40, 635, DIAMOND).setDepth(5);
		pinballScene.add.image(498, 635, DIAMOND).setDepth(5);

		// bg
		const bg = pinballScene.add.image(0, 0, BG_SCRUBBED)
			// .setDisplaySize(getGameWidth(this), getGameHeight(this))
			.setOrigin(0, 0)
		// .setAlpha(0.1);
		bg.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

		// bg ref
		if (isCreateBGRef) {
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
		const shapes_gameObject = pinballScene.matter.add.sprite(bg_scrubbed_collisionShape.x, bg_scrubbed_collisionShape.y, BG_SCRUBBED, BG_SCRUBBED, { shape: shapes.bg_scrubbed } as any)
			// .setOrigin(0, 0)
			.setAlpha(0.0);

		ballShootForceSensor_body = shapes_gameObject.body.parts.find((x: { label: string; }) => x.label === "ballShootForceSensor");

		failResetSensor_body = shapes_gameObject.body.parts.find((x: { label: string; }) => x.label === "failResetSensor");

		this.doStuffWithGHSTBodies(shapes_gameObject);
	}

	doStuffWithGHSTBodies(shapes_gameObject: any) {
		for (let i = 0, len = shapes_gameObject.body.parts.length; i < len; i++) {
			const part = shapes_gameObject.body.parts[i];

			if (part.label === "ghstBumper") {
				this.ghstBumpers.push(part);
			}
		}
	}

	createBall(x?: any, y?: any) {
		const xPos = x === undefined ? ballShootPosition[0] : x;
		const yPos = y === undefined ? ballShootPosition[1] : y;

		const ballOptions: any = {
			shape: {
				type: 'circle',
				radius: 18
			},
			label: "PlayerBall",
			mass: ball_mass
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
			if (is_logMousePos) {
				const cam = pinballScene.cameras.main;
				const pointerX = pointer.position.x / cam.zoom;
				const pointerY = pointer.position.y / cam.zoom;
				console.log(Math.round(pointerX * 1000) / 1000, Math.round(pointerY * 1000) / 1000);
			}

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
		const compareData_PB_RS = isCompareEitherOrBodies(bodyA.label, bodyB.label, "PlayerBall", "rofl_saver", bodyA, bodyB);
		const compareData_PB_PW = isCompareEitherOrBodies(bodyA.label, bodyB.label, "PlayerBall", "plainWall", bodyA, bodyB);
		const compareData_PB_SSSL = isCompareEitherOrBodies(bodyA.label, bodyB.label, "PlayerBall", "slingshotSensor_left", bodyA, bodyB);
		const compareData_PB_SSSR = isCompareEitherOrBodies(bodyA.label, bodyB.label, "PlayerBall", "slingshotSensor_right", bodyA, bodyB);

		// this.doBehaviour_checkIfAnyBallsAreIn_ballShootForceSensor();
		this.doBehaviour_checkIfAnyBallsAreIn_failResetSensor();

		if (compareData_PB_GHSTB.isSuccess) {
			pushBodyAwayFrom(compareData_PB_GHSTB.firstBody, compareData_PB_GHSTB.secondBody, 5 + Math.random() * 5); // extra random force (to prevent being stuck on multiplier)
			increaseScore(scores.ghstBumper);
			this.ghst_sound.play({
				volume: ghstBumper_soundVolume
			});
		} else if (compareData_PB_TASL.isSuccess) {
			tripleArrows_left.tripleArrows_onBallHit(ball);
		} else if (compareData_PB_TASR.isSuccess) {
			tripleArrows_right.tripleArrows_onBallHit(ball);
		} else if (compareData_PB_PS.isSuccess) {
			this.ballEnteredPortal();
		} else if (compareData_PB_SAS.isSuccess) {
			const singleArrowName = compareData_PB_SAS.secondBody.gameObject.MACHINEMAN1357_singleArrowName;
			singleArrows[singleArrowName].singleArrow_onBallHit(ball);
		}

		// multiplier sensors
		else if (compareData_PB_MSL.isSuccess) {
			toggleMultiplier("left");
			this.tripleMultiplier_sound.play();
		} else if (compareData_PB_MSM.isSuccess) {
			toggleMultiplier("middle");
			this.tripleMultiplier_sound.play();
		} else if (compareData_PB_MSR.isSuccess) {
			toggleMultiplier("right");
			this.tripleMultiplier_sound.play();
		}

		else if (compareData_PB_PTLS.isSuccess) {
			compareData_PB_PTLS.secondBody.gameObject.MACHINEMAN1357_passThroughLight_class.toggleLight();
		} else if (compareData_PB_WB.isSuccess) {
			compareData_PB_WB.secondBody.MACHINEMAN1357_wallBumper.on_hitByBall();
			increaseScore(scores.wallBumperSensor);
			this.wallBumpers_sound.play({ volume: 1.8 });

			if (compareData_PB_WB.secondBody.MACHINEMAN1357_wallBumper_isRight) {
				pushBodyAwayFrom(compareData_PB_WB.firstBody, compareData_PB_WB.secondBody, slingshotBumperForce);
			} else {
				pushBodyAwayFrom(compareData_PB_WB.firstBody, compareData_PB_WB.secondBody, slingshotBumperForce);
			}
		} else if (compareData_PB_TLHS.isSuccess) {
			on_ballEnteredHole();
			this.doublePoints_sound.play();
		} else if (compareData_PB_CS.isSuccess) {
			increaseScore(scores.pointsReceive_spinningCoin);
			// this.ethCoin.wasHit();
		} else if (compareData_PB_RS.isSuccess) {
			this.saveBallByRofl();

			roflsManager_ref.onBallHitRofl(compareData_PB_RS.secondBody.gameObject.MACHINEMAN1357_rofl_saver_side);
		} else if (compareData_PB_PW.isSuccess) {
			if (!this.is_ballWallHitSoundOnHold) {
				this.is_ballWallHitSoundOnHold = true;

				this.time.addEvent({
					delay: ballWallHitSoundOnHoldFor_ms,
					callback: () => {
						this.is_ballWallHitSoundOnHold = false;
					},
					//args: [],
					callbackScope: this
				});

				if (ball.body.speed >= ballSpeedForWallHitSound) {
					const volume = Math.min(ball.body.speed / ballSpeedForWallHitSound_max, 1) * 0.5;

					this.ballHittingPlainWall_sound.play({
						volume: volume
					});
				}
			}
		} else if (compareData_PB_SSSL.isSuccess) {
			this.slingshot_sound.play();
            compareData_PB_SSSL.firstBody.gameObject.setVelocity(0.7 * slingshotBumperForce, -0.7 * slingshotBumperForce);
			this.purpleBumper_left.on_hitByBall();
		} else if (compareData_PB_SSSR.isSuccess) {
			this.slingshot_sound.play();
            compareData_PB_SSSR.firstBody.gameObject.setVelocity(-0.7 * slingshotBumperForce, -0.7 * slingshotBumperForce);
			this.purpleBumper_right.on_hitByBall();
		}
	}

	ballEnteredPortal() {
		this.enterPortal_sound.play();

		// disable ball
		ball.setStatic(true);
		ball.setPosition(9001, 0);
		ball.setVelocity(0, 0);

		this.time.addEvent({
			delay: timeBeforeStartPlinkoSceneAfterBallEnteredPortal_ms,
			callback: () => {
				const bgMusicScene = this.scene.get('BGMusic') as BGMusicScene;
				bgMusicScene.pauseMusic();

				pinballScene.scene.stop();
				pinballScene.scene.start('Plinko');
			},
			//args: [],
			callbackScope: this
		});
	}

	saveBallByRofl() {
		const force = 10;

		ball.setVelocity(0, -1 * force);
	}

	loseGame() {
		this.addGameOverUI();

		// disable ball
		ball.setStatic(true);
		ball.setPosition(9000, 1);
		ball.setVelocity(0, 0);

		this.pinball_isGameOver = true;

        this.gameEnd_sound.play();
	}

	resetGame() {
		resetScore();
        resetLives();
        resetLeftBlackHole();

		const gameScene = this.scene.get('Game') as GameScene;
		if (gameScene.scene.isActive()) {
			gameScene.resetGameOver();
		} else {
			console.error("game scene not found");
		}

		this.pinball_isGameOver = false;
		this.scene.start('Pinball');
	}

	addGameOverUI() {
		const gameOverContainer = document.createElement("div");
		const gameOverBorderContainer = document.createElement("div");
		const gameOverBorder_red = document.createElement("div");
		const gameOverBorder_orange = document.createElement("div");
		const gameOverBorder_yellow = document.createElement("div");
		const gameOverBackground = document.createElement("div");
		const gameOverRetryContainer = document.createElement("div");

        const onSpaceDownFn = (event: any) => {
			if (event.code === "Space") {
                if(this.pinball_isGameOver) {
                    gameOverContainer.remove();

                    this.resetGame();
                    document.removeEventListener("keydown", onSpaceDownFn);
                }
			}
		};

		document.addEventListener("keydown", onSpaceDownFn);

		const retryEl = `<div style="font-size:${gameUI_retryFontSize}px; margin-right: 10px;">retry?</div>`;
		gameOverBackground.innerHTML = `GAME!`;

		gameOverRetryContainer.innerHTML = retryEl + `
			<div class=${keyInputStle.keyboardKeys_container}>
				<div class=${keyInputStle.keyboardKey_container} style="width: 87px;">
					Space
				</div>
			</div>`;

		gameOverContainer.classList.add(gameOverStyle.gameOver_container);
		gameOverBorderContainer.classList.add(gameOverStyle.gameOver_borderContainer);
		gameOverBorder_red.classList.add(gameOverStyle.gameOver_border_red);
		gameOverBorder_orange.classList.add(gameOverStyle.gameOver_border_orange);
		gameOverBorder_yellow.classList.add(gameOverStyle.gameOver_border_yellow);
		gameOverBackground.classList.add(gameOverStyle.gameOver_background);
		gameOverRetryContainer.classList.add(gameOverStyle.gameOver_retryContainer);

		document.body.appendChild(gameOverContainer);
		gameOverContainer.appendChild(gameOverBorderContainer);
		gameOverBorderContainer.appendChild(gameOverBorder_red);
		gameOverBorderContainer.appendChild(gameOverBorder_orange);
		gameOverBorderContainer.appendChild(gameOverBorder_yellow);
		gameOverContainer.appendChild(gameOverBackground);
		gameOverBackground.appendChild(gameOverRetryContainer);
	}

	doBehaviour_checkIfAnyBallsAreIn_ballShootForceSensor() {
		const bodies = pinballScene.matter.intersectBody(ballShootForceSensor_body);

		for (let i = 0, len = bodies.length; i < len; i++) {
			const body = bodies[i];

			if (body.label === "PlayerBall") {
                console.log("yes");
				// body.gameObject.setVelocity(0, ballResetForce + Phaser.Math.Between(-6, -2));
				// this.playSound_ballCurvingAround();

				// if (this.ballLoopEntryBlockerService.state === EStates.outOfLoop) {
				// 	increaseScore(scores.ballReturnsToStart);
				// }
			}
		}
	}

    isBallOnShootForceSensorBody(): [boolean, any] {
        const bodies = pinballScene.matter.intersectBody(this.ballIsInShootForceArea_sensor_body);

		for (let i = 0, len = bodies.length; i < len; i++) {
			const body = bodies[i];

			if (body.label === "PlayerBall") {
                return [true, body];
			}
		}

        return [false, undefined];
    }

	on_ballEnteredFailResetSensor(body: any) {
		body.gameObject.setPosition(ballShootPosition[0], ballShootPosition[1]);
		roflsManager_ref.placeRoflInSaveAreas();
		fireImage_ref.activateFire();

		this.ballLoopEntryBlockerService.reset();

        this.lose_ball_sound.play({
            volume: plinko_lose_ball_soundVolume
        });
	}

	doBehaviour_checkIfAnyBallsAreIn_failResetSensor() {
		const bodies = pinballScene.matter.intersectBody(failResetSensor_body);

		for (let i = 0, len = bodies.length; i < len; i++) {
			const body = bodies[i];

			if (body.label === "PlayerBall") {
				this.on_ballEnteredFailResetSensor(body);
			}
		}
	}

	playSound_ballCurvingAround() {
		this.ballCurvingAround_sound.play();
	}

	createPaddleStoppers() {
		// left
		// x: 198
		// y: 845
		this.createPaddleStopper(200, 970, "left", "down");
		this.createPaddleStopper(200, 804, "left", "up");

		// right
		this.createPaddleStopper(337, 970, "right", "down");
		this.createPaddleStopper(337, 804, "right", "up");
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
		this.createPaddle(180, 890, 187, 895, -25, -12, -1.75, "left");

		// hingeX: 307
		// hingeY: 780
		this.createPaddle(355, 890, 355, 895, 22, 18, 1.75, "right");
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
			mass: 1
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
