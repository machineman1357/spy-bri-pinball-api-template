/* eslint-disable @typescript-eslint/no-explicit-any */
import { BALL_HITTING_PLAIN_WALL, GHST, GHST_COIN, K_POINTS_RED_PLINKO, MARIO_PIPE_SOUND, PINBALL, PLINKO_BORDER, PLINKO_LOSE_BALL_SOUND, PLINKO_TUBES, PLINKO_TUBES_AND_GRID_BG, PLINKO_UNIVERSE_BG, RED_RING, SPIN_COIN_2, TUBE_BG_COLOR, TUBE_OUTLINE } from "game/assets";
import { COLLISION_CATEGORIES } from "game/helpers/collisionCategories";
import { isCompareEitherOrBodies, pushBodyAwayFrom } from "game/helpers/utils";
import { ballsUnlockedForPlinko } from "game/main";
import { increaseScore, set_isLeftBlackHoleOpen } from "game/unOrganized/stats";
import { ball_mass, ethCoinPlinko_pointsReward, ethCoin_plinko_audioVolume, ghstBumper_soundVolume, plinko_lose_ball_soundVolume, scores, timeBefore_endOfSceneToPinballSwitch_ms } from "helpers/vars";
import { game_ref } from "..";
import { BGMusicScene } from "../bgMusic/scene_bgMusic";
import { BallFollowingRedRing } from "./ballFollowingRedRing";
import { BallGoingInTube } from "./ballGoingInTube";
import { reset as leftBlackHoleReset } from "../pinball/leftBlackHole";

let plinkoScene: any;

const ghst_scale = 0.25;
const spinCoin_scale = 0.4;
const isCreateBGRef = false;
const playerBall_depth = 2;

export let redRing_go: any;
const redRingData = {
	posX: 0
};
let ballsFollowingRedRing: any = [];
let ballsGoingInTubes: any = [];
let ghstAndCoins: any = [];
let ballKiller_body: any;
let isChangingScene = false;

let ballsNeededToFinishLevel: any;
let ballsCompleted = 0;

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
	active: false,
	visible: false,
	key: "Plinko",
};

export class PlinkoScene extends Phaser.Scene {
	private kPointsRedPlinko_sound: any;
	private marioPipe_sound: any;
	private ethCoin_sound: any;
	private ghst_sound: any;
    private lose_ball_sound: any;

    constructor () {
        super(sceneConfig);
    }

	create() {
		plinkoScene = this;

		const bgMusicScene = this.scene.get('BGMusic') as BGMusicScene;
		if(bgMusicScene.plinkoOST.isPaused) {
			bgMusicScene.resume_plinkoOST();
		} else {
			bgMusicScene.play_plinkoOST();
		}

		this.resetStuff();

		this.setUp_ghstAnimation();
		this.cameras.main.setBackgroundColor('#bb358e');
		this.create_sceneObjects();

		ballsNeededToFinishLevel = ballsUnlockedForPlinko;
		this.create_balls();

        if(process.env.NODE_ENV === "development") {
            this.matter.add.mouseSpring();
        }

		this.matter.world.setBounds();
		this.setUp_events();
		this.create_tubeColliders();
		const windowAnyBypass: any = window; // I can't do 'window.' because property doesn't exist on it (type error from typescript) so this circumnavigates it
		windowAnyBypass.MACHINEMAN1357_paddlesInput_container.disable_paddlesInput();
        document.getElementById("tilt-button-container")!.style.display = "none";
		this.create_bottomBallKillerCollider();
		this.setUpSounds();
    }

	update() {
		if(!isChangingScene) {
			if(redRing_go) redRing_go.setPosition(redRingData.posX, game_ref.scale.height - 198);

			// update balls following red ring
			for (let i = 0, len = ballsFollowingRedRing.length; i < len; i++) {
				const ballFollowingRedRing = ballsFollowingRedRing[i];
				
				ballFollowingRedRing.update();
			}
	
			// update balls going in tubes
			for (let i = 0, len = ballsGoingInTubes.length; i < len; i++) {
				const ballGoingInTube = ballsGoingInTubes[i];
				
				ballGoingInTube.update();
			}
	
			// rotate coins (to avoid balls being stationary on them)
			for (let i = 0, len = ghstAndCoins.length; i < len; i++) {
				const ghstOrCoin = ghstAndCoins[i];
				
				ghstOrCoin.rotation += 0.01;
			}
		}
    }

	setUpSounds() {
		this.kPointsRedPlinko_sound = this.sound.add(K_POINTS_RED_PLINKO);
		this.marioPipe_sound = this.sound.add(MARIO_PIPE_SOUND);
		this.ethCoin_sound = this.sound.add(BALL_HITTING_PLAIN_WALL, {
			volume: ethCoin_plinko_audioVolume
		});
		this.ghst_sound = this.sound.add(GHST_COIN);
        this.lose_ball_sound = this.sound.add(PLINKO_LOSE_BALL_SOUND);
	}

	resetStuff() {
		isChangingScene = false;
		ballsFollowingRedRing = [];
		ballsGoingInTubes = [];
		ghstAndCoins = [];
		redRing_go = undefined;
		ballKiller_body = undefined;
		ballsNeededToFinishLevel = undefined;
		ballsCompleted = 0;
	}

	setUp_events() {
		// collision filtering
		this.matter.world.on('collisionstart', function (event: any, bodyA: any, bodyB: any) {
			plinkoScene.collisionFiltering(event, bodyA, bodyB);
		});
	}

	collisionFiltering(event: any, bodyA: any, bodyB: any) {
		const compareData_PB_GHSTB = isCompareEitherOrBodies(bodyA.label, bodyB.label, "PlayerBall", "ghstBumper", bodyA, bodyB);
		const compareData_PB_C = isCompareEitherOrBodies(bodyA.label, bodyB.label, "PlayerBall", "coin", bodyA, bodyB);
		const compareData_PB_RR = isCompareEitherOrBodies(bodyA.label, bodyB.label, "PlayerBall", "redRing", bodyA, bodyB);
		const compareData_PB_T = isCompareEitherOrBodies(bodyA.label, bodyB.label, "PlayerBall", "tube", bodyA, bodyB);

		this.doBehaviour_forAllBodiesWithLabelIntersectingBody("PlayerBall", this.killBall, ballKiller_body);

		if(compareData_PB_GHSTB.isSuccess) {
			pushBodyAwayFrom(compareData_PB_GHSTB.firstBody, compareData_PB_GHSTB.secondBody, 5);
			increaseScore(scores.ghstBumper);
			this.ghst_sound.play({
				volume: ghstBumper_soundVolume
			});
		} else if(compareData_PB_RR.isSuccess) {
			this.moveBallDownRedRing(compareData_PB_RR.firstBody);
			increaseScore(scores.redRing);
			this.createScoreText(1000, compareData_PB_RR.secondBody.gameObject.x, compareData_PB_RR.secondBody.gameObject.y);
			this.kPointsRedPlinko_sound.play();
		} else if(compareData_PB_T.isSuccess) {
			this.moveBallDownTube(compareData_PB_T.firstBody, compareData_PB_T.secondBody);
			this.marioPipe_sound.play();

			const tubeName = compareData_PB_T.secondBody.MACHINEMAN1357_tubeName;
			let scoreAmount = -1;

			if(tubeName === "purple") {
				scoreAmount = scores.purpleTube;
			} else if(tubeName === "blue") {
				scoreAmount = scores.blueTube;
			} else if(tubeName === "yellow") {
				scoreAmount = scores.yellowTube;
			} else if(tubeName === "green") {
				scoreAmount = scores.greenTube;
			}

			// shared
			increaseScore(scoreAmount);
			this.createScoreText(scoreAmount, compareData_PB_T.secondBody.position.x, compareData_PB_T.secondBody.position.y);
		} else if(compareData_PB_C.isSuccess) {
			increaseScore(ethCoinPlinko_pointsReward);
			this.ethCoin_sound.play();
		}
	}

	killBall(ball_body: any) {
		if(!ball_body.gameObject.MACHINEMAN1357_isKilled) {
			ball_body.gameObject.setCollisionCategory(-1); // this makes it collide with nothing
			ball_body.gameObject.setStatic(true);
			ball_body.collisionFilter.mask = 0;
			ball_body.gameObject.MACHINEMAN1357_isKilled = true;
			ball_body.gameObject.alpha = 0;

			plinkoScene.completeBall();

			plinkoScene.createScoreText("☠️", ball_body.gameObject.x, ball_body.gameObject.y, 20);

            plinkoScene.lose_ball_sound.play({
				volume: plinko_lose_ball_soundVolume
			});
		}
	}

	completeBall() {
		ballsCompleted += 1;
		const ballsLeft = ballsNeededToFinishLevel - ballsCompleted;

		console.log("+1 ball completed. Still need " + ballsLeft + " more.");
		if(ballsCompleted === ballsNeededToFinishLevel) {
			console.log("All balls completed!");

			plinkoScene.time.addEvent({
				delay: timeBefore_endOfSceneToPinballSwitch_ms,
				callback: () => {
					const bgMusicScene = this.scene.get('BGMusic') as BGMusicScene;
					bgMusicScene.resumeMusic();
					bgMusicScene.pause_plinkoOST();

                    leftBlackHoleReset();
					plinkoScene.scene.stop();
					plinkoScene.scene.start('Pinball');
				},
				args: []
			});
		}
	}

	doBehaviour_forAllBodiesWithLabelIntersectingBody(label: any, func: any, sensor_body: any) {
		const bodies = this.matter.intersectBody(sensor_body);
		
		for (let i = 0, len = bodies.length; i < len; i++) {
			const body = bodies[i] as any;
			
			if(body.label === label) {
				func(body);
			}
		}
	}

	createScoreText(text: any, xPos: any, yPos: any, fontSize?: any) {
		const text_go = this.add.text(xPos, yPos, text, { fontFamily: "Arial Black", fontSize: fontSize || 40 });
		text_go.setStroke('#000000', 4);
		text_go.setDepth(10);
		text_go.setOrigin(0.5, 0.5);
		//  Apply the gradient fill.
		const gradient = text_go.context.createLinearGradient(0, 0, 0, text_go.height);
		gradient.addColorStop(0, '#111111');
		gradient.addColorStop(.5, '#ffffff');
		gradient.addColorStop(.5, '#aaaaaa');
		gradient.addColorStop(1, '#111111');

		text_go.setFill(gradient);

		const tween = this.tweens.add({
			targets: text_go,
			y: {
				from: yPos,
				to: yPos - 50,
				duration: 1000,
				ease: 'Sine.easeInOut',
			},
			alpha: {
				from: 1,
				to: 0,
				duration: 1000,
				ease: 'Sine.easeInOut',
			}
		});
	}

	moveBallDownRedRing(ball_body: any) {
		ball_body.gameObject.setCollisionCategory(0); // thism akes it collide with nothing
		ball_body.gameObject.setStatic(true);

		const bfrr = new BallFollowingRedRing({
			ball_body: ball_body
		});
		ballsFollowingRedRing.push(bfrr);

		plinkoScene.completeBall();
	}

	moveBallDownTube(ball_body: any, tube_body: any) {
		ball_body.gameObject.setCollisionCategory(0); // thism akes it collide with nothing
		ball_body.gameObject.setStatic(true);

		const bgit = new BallGoingInTube({
			ball_body: ball_body,
			tube_body: tube_body
		});
		ballsGoingInTubes.push(bgit);

		plinkoScene.completeBall();
	}

	create_balls() {
		const distanceFromTop = 50;
		const extraWidth = 0;
		const spacing = (game_ref.scale.width + extraWidth) / ballsUnlockedForPlinko;
		for (let i = 0; i < ballsUnlockedForPlinko; i++) {
			const xPos = spacing * i + spacing / 2 - extraWidth / 2;
			this.createBall(xPos, distanceFromTop);
		}
	}

	create_sceneObjects() {
		// this.create_tubes();

		// bg ref
		if(isCreateBGRef) {
			this.add.image(game_ref.scale.width / 2, game_ref.scale.height / 2, "bgPlinkoRef")
				.setScale(1.4)
				.setAlpha(0.5);

		}
		this.create_ghsts();

		this.add.image(game_ref.scale.width / 2, game_ref.scale.height / 2, PLINKO_UNIVERSE_BG);
		const bottomBlueRectangle = this.add.rectangle(
			game_ref.scale.width / 2,
			game_ref.scale.height,
			game_ref.scale.width + 10,
			360,
			0x32d2d4);
		
		this.create_redRing();
		this.add.image(game_ref.scale.width / 2, game_ref.scale.height - 113, PLINKO_TUBES_AND_GRID_BG).setScale(0.332);
		this.add.image(game_ref.scale.width / 2, game_ref.scale.height - 113, PLINKO_TUBES).setScale(0.332).setDepth(11); // put tubes ontop
		this.add.image(game_ref.scale.width / 2, game_ref.scale.height / 2, PLINKO_BORDER);
	}

	createBall(xPos: any, yPos: any) {
		const ballConfig: any = {
			shape: {
				type: 'circle',
				radius: 18
			},
			label: "PlayerBall",
			mass: ball_mass
		};
		const ball = this.matter.add.image(xPos, yPos, PINBALL, undefined, ballConfig).setDepth(playerBall_depth);
		ball.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
		ball.scale = 1.5;

		ball.setFriction(0.0);
		ball.setBounce(0.5);
	
		ball.setCollisionCategory(COLLISION_CATEGORIES.BALL);
		ball.setCollidesWith([COLLISION_CATEGORIES.PADDLE, COLLISION_CATEGORIES.DEFAULT, COLLISION_CATEGORIES.BALL]);
	}

	setUp_ghstAnimation() {
		const config = {
			key: 'ghstAnimation',
			frames: this.anims.generateFrameNumbers('ghst', { start: 0, end: 10, first: 0 }),
			frameRate: 10,
			repeat: -1
		};
	
		this.anims.create(config);
	}

	create_ghstOrCoin(xPos: any, yPos: any, texture: any, scale: any) {
		// this visual will be static: just sit there, looking pretty
		const object_visual = this.add.sprite(xPos, yPos, texture).setDepth(5).setScale(scale);
		object_visual.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

		// THIS visual will be tied to the body by adding it to a gameobject and making it invisible, because it will be rotating (to circumnavigate the issue of balls idling ontop of them) and the sprite rotates with it, but having a separate one fixes this.
		const object_visual_forBody = this.add.sprite(xPos, yPos, texture).setAlpha(0);

		const object_body = this.matter.add.circle(xPos, yPos, 20, {
			isStatic: true,
			label: texture === "ghst" ? "ghstBumper" : "coin"
		});
		const ghstOrCoin_go = this.matter.add.gameObject(object_visual_forBody, object_body);
		ghstAndCoins.push(ghstOrCoin_go);
	}

	create_ghsts() {
		const rows = 8;
		let isSix = true;
		const extraWidth = -50;
		const spacing = (game_ref.scale.width + extraWidth) / 6;
		const ySpacing = 70;
		const extraY = 75;
		const ghstBumperIndices = [11, 13, 26, 28, 34, 43];

		let created = 0;
		for (let r = 0; r < rows; r++) {
			const columns = isSix === true ? 6 : 5;

			for (let c = 0; c < columns; c++) {
				let xPos = spacing * c + spacing / 2 - extraWidth / 2;
				if(columns === 5) {
					const fiveSpacing = (game_ref.scale.width + extraWidth) / 5;
					xPos += fiveSpacing / 2;
				}

				created += 1;

				if(ghstBumperIndices.includes(created)) {
					this.create_ghstOrCoin(xPos, r * ySpacing + extraY, GHST, ghst_scale);
				} else {
					this.create_ghstOrCoin(xPos, r * ySpacing + extraY, SPIN_COIN_2, spinCoin_scale);
				}
			}

			isSix = !isSix;
		}
	}

	create_tubes() {
		const tubeScale = 1.5;
		const extraWidth = -50;
		const spacing = (game_ref.scale.width + extraWidth) / 4;
		const yPos = game_ref.scale.height - 77;
		const colors = [0xcd25a1, 0x0061ff, 0xffd503, 0x37a961];

		for (let i = 0; i < 4; i++) {
			const xPos = spacing * i + spacing / 2 - extraWidth / 2;
			const color = colors[i];

			const tube_bgColor = this.add.image(xPos, yPos, TUBE_BG_COLOR)
				.setDepth(1)
				.setTint(color)
				.setScale(tubeScale);
			tube_bgColor.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
			
			const tube_outline = this.add.image(xPos, yPos, TUBE_OUTLINE)
				.setDepth(1)
				.setScale(tubeScale);
			tube_outline.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
		}
	}

	create_redRing() {
		const img = this.add.image(0, 0, RED_RING).setScale(1.4).setDepth(10);
		img.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

		const collider = this.matter.add.rectangle(game_ref.scale.width / 2, game_ref.scale.height - 198, 67, 25, {
			label: "redRing",
			isStatic: true
		});

		redRing_go = this.matter.add.gameObject(img, collider);

		const tween = this.tweens.add({
			targets: redRingData,
			posX: {
				from: 50,
				to: game_ref.scale.width - 50
			},
			duration: 2000,
			ease: 'Sine.easeInOut',
			yoyo: true,
			repeat: -1
		});
	}

	create_tubeColliders() {
		const tubeDatas = [
			{
				name: "purple",
				xPos: 95
			},
			{
				name: "blue",
				xPos: 230
			},
			{
				name: "yellow",
				xPos: 367
			},
			{
				name: "green",
				xPos: 490
			}
		];

		for (let i = 0; i < tubeDatas.length; i++) {
			const tubeData = tubeDatas[i];

			const collider = this.matter.add.rectangle(tubeData.xPos, game_ref.scale.height - 152, 67, 25, {
				label: "tube",
				isStatic: true
			}) as any;
			collider.MACHINEMAN1357_tubeName = tubeData.name;
		}
	}

	create_bottomBallKillerCollider() {
		ballKiller_body = this.matter.add.rectangle(game_ref.scale.width / 2, game_ref.scale.height, game_ref.scale.width, 200, {
			label: "ballKiller",
			isStatic: true,
			isSensor: true
		});
	}
}