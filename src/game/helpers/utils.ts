/* eslint-disable @typescript-eslint/no-explicit-any */
import { game_ref } from "game/scenes";

export function getMouseWorldPosition_phaser(mainScene: any) {
	if(mainScene && game_ref) {
		const cam = mainScene.cameras.main;
		const linePosX = (game_ref.input.activePointer.position.x - (window.innerWidth / 2)) / cam.zoom + cam.midPoint.x;
		const linePosY = (game_ref.input.activePointer.position.y - (window.innerHeight / 2)) / cam.zoom + cam.midPoint.y;
	
		return { x: linePosX, y: linePosY };
	} else {
		console.warn("mainScene or game_ref is undefined");
	}
}

export function getNormalizedDirectionAndAngle(x1: any, y1: any, x2: any, y2: any) {
	const dirX = x2 - x1;
	const dirY = y2 - y1;

	let length = Math.sqrt(dirX * dirX + dirY * dirY);
	if(length === 0) { length = 1; }

	const ndx = dirX / length;	// x normalized
    const ndy = dirY / length;

	const angle = Math.atan2(ndx, ndy);

	return { x: ndx, y: ndy, angle: angle};
}

// check if the inputted names (nameA & nameB) match the must be names in either order, and return the order of the matched names
export function isCompareEitherOrBodies(nameA: any, nameB: any, nameAMustBe: any, nameBMustBe: any, bodyA: any, bodyB: any) {
	if(nameA === nameAMustBe && nameB === nameBMustBe) {
		return {
			isSuccess: true,
			firstBody: bodyA,
			secondBody: bodyB
		};
	}

	if(nameA === nameBMustBe && nameB === nameAMustBe) {
		return {
			isSuccess: true,
			firstBody: bodyB,
			secondBody: bodyA
		};
	}

	return {
		isSuccess: false
	};
}

export function isAngleBetweenAngles(facingAngle_deg: any, angleOfTarget_deg: any, angleWithin_deg: any) {
	const anglediff = (facingAngle_deg - angleOfTarget_deg + 180 + 360) % 360 - 180

	if (anglediff <= angleWithin_deg && anglediff >= -angleWithin_deg) {
		return true;
	} else {
		return false;
	}
}

export function moveSpriteToMousePosAndLog(scene: any, sprite: any, extraX: any, extraY: any) {
	extraX = extraX === undefined ? 0 : extraX;
	extraY = extraY === undefined ? 0 : extraY;

	const cam = scene.cameras.main;
	sprite.x = game_ref.input.activePointer.position.x / cam.zoom + extraX;
	sprite.y = game_ref.input.activePointer.position.y / cam.zoom + extraY;
	console.log(sprite.x, sprite.y);
}

export function pushBodyAwayFrom(bodyA: any, bodyB: any, force: any) {
	const posA = bodyA.position;
	const posB = bodyB.position;

	const normDir = getNormalizedDirectionAndAngle(posB.x, posB.y, posA.x, posA.y);

	bodyA.gameObject.setVelocity(normDir.x * force, normDir.y * force);
}

export function pushBodyAwayPoint(bodyA: any, point: { x: number, y: number }, force: any) {
	const posA = bodyA.position;

	const normDir = getNormalizedDirectionAndAngle(point.x, point.y, posA.x, posA.y);

	bodyA.gameObject.setVelocity(normDir.x * force, normDir.y * force);
}