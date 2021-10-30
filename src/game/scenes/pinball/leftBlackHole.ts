import { LBH_BLOCKER } from "game/assets";
import { config } from "game/unOrganized/config";
import { set_isLeftBlackHoleOpen } from "game/unOrganized/stats";
import { ball, pinballScene } from "./pinball-scene";

const blocker_position = {
	x: 40,
	y: 160
};
let blocker_go: any;
let isHoleOpen = false;
let blocker_spirte: any;
let canEnterHole = true;
export const LBH_timeOuts: any = [];

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
}

export function on_sideBumperHit() {
	if(!isHoleOpen) {
		isHoleOpen = true;
		openHole();

		const timeOut_closeHole = setTimeout(() => {
			closeHole();
		}, config.topLeftHole.staysOpenFor_ms);

		LBH_timeOuts.push(timeOut_closeHole);
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
	ball.setVelocity(0, config.topLeftHole.exitHoleVelocityY);
	ball.alpha = 1;

	const timeOut_canEnterHole = setTimeout(() => {
		canEnterHole = true;
	}, config.topLeftHole.timeBeforeBallCanEnterHoleAgain_ms);

	set_isLeftBlackHoleOpen(true);
	const timeOut_isLBHOpen = setTimeout(() => {
		set_isLeftBlackHoleOpen(false);
	}, config.topLeftHole.doublePointsLastFor_ms);

	LBH_timeOuts.push(timeOut_canEnterHole);
	LBH_timeOuts.push(timeOut_isLBHOpen);
}

function ballEnterHole() {
	canEnterHole = false;
	ball.setStatic(true);
	ball.setPosition(62, 68);
	ball.setVelocity(0, 0);
	ball.alpha = 0;

	const timeOut_ballExitHole = setTimeout(() => {
		ballExitHole();
	}, config.topLeftHole.timeInHole_ms);

	LBH_timeOuts.push(timeOut_ballExitHole);
}

export function on_ballEnteredHole() {
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