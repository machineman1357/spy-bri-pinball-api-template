import { LBH_BLOCKER } from "game/assets";
import { modifyMultiplier, set_isLeftBlackHoleOpen } from "game/unOrganized/stats";
import { topLeftHole } from "helpers/vars";
import { ball, pinballScene } from "./pinball-scene";

const blocker_position = {
	x: 40,
	y: 160
};
let blocker_go: any;
let isHoleOpen = false;
let blocker_spirte: any;
let canEnterHole = true;
let isMultiplierActive = false;
export let timer_closeLBH: Phaser.Time.TimerEvent;

export function reset() {
    isHoleOpen = false;
    canEnterHole = true;
    isMultiplierActive = false;
}

function create_blocker_sprite() {
	blocker_spirte = pinballScene.add.image(60.69442314152116, 171.8378773200348, LBH_BLOCKER);
	blocker_spirte.setScale(1.2);
}

function openHole() {
	blocker_go.setPosition(-1000, 0);
	blocker_spirte.visible = false;
}

function closeHole() {
	isHoleOpen = false;
	blocker_go.setPosition(blocker_position.x, blocker_position.y);
	blocker_spirte.visible = true;

    if(isMultiplierActive) {
        console.log("LBH multiplier is active, modifyMultiplier(-4)");
        modifyMultiplier(-4);
        isMultiplierActive = false;
    }
}

export function on_sideBumperHit() {
    console.log("on_sideBumperHit(), isHoleOpen:", isHoleOpen);
	if(!isHoleOpen) {
		isHoleOpen = true;
		openHole();

		timer_closeLBH = pinballScene.time.addEvent({
			delay: topLeftHole.staysOpenFor_ms,
			callback: closeHole,
			args: []
		});
	}
}

function create_blocker_collider() {
	const verts = '16 -871 104 -880 63 -825 40 -769 19 -701';

	const poly = pinballScene.add.polygon(blocker_position.x, blocker_position.y, verts, 0x000000, 0.0);

	blocker_go = pinballScene.matter.add.gameObject(
		poly, {
		shape: {
			type: 'fromVerts', verts: verts, flagInternal: true
		},
		isStatic: true
	});
}

function ballExitHole() {
	ball.setStatic(false);
	ball.setVelocity(0, topLeftHole.exitHoleVelocityY);
	ball.alpha = 1;
    if(!isMultiplierActive) {
        console.log("LBH multiplier is NOT active, modifyMultiplier(4)");
        isMultiplierActive = true;
        modifyMultiplier(4);
    }

    timer_closeLBH.paused = false;

	pinballScene.time.addEvent({
		delay: topLeftHole.timeBeforeBallCanEnterHoleAgain_ms,
		callback: () => {
			canEnterHole = true;
		},
		args: []
	});

	pinballScene.time.addEvent({
		delay: topLeftHole.doublePointsLastFor_ms,
		callback: () => {
			set_isLeftBlackHoleOpen(false);
		},
		args: []
	});
}

function ballEnterHole() {
	canEnterHole = false;
	ball.setStatic(true);
	ball.setPosition(62, 68);
	ball.setVelocity(0, 0);
	ball.alpha = 0;

    timer_closeLBH.paused = true;
    timer_closeLBH.elapsed -= 1000;

	pinballScene.time.addEvent({
		delay: topLeftHole.timeInHole_ms,
		callback: () => {
			ballExitHole();
		},
		args: []
	});
}

export function on_ballEnteredHole() {
    console.log("ball touched LFB, canEnterHole?", canEnterHole);
	if(canEnterHole) {
		ballEnterHole();
	}
}

export function leftBlackHole_start() {
	create_blocker_collider();
	create_blocker_sprite();
}

export function leftBlackHole_update() {
	// moveSpriteToMousePosAndLog(pinballScene, blocker_spirte);
}