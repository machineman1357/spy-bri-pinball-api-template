import { MULTIPLIER_ACTIVATED } from "../assets";
import { game_ref } from "../scenes";
import { pinballScene } from "../scenes/pinball/pinball-scene";
import { modifyMultiplier } from "./stats";

let image;
const multipliers: any = {
	left: undefined,
	middle: undefined,
	right: undefined
}

export function multipliers_start() {
	multipliers.left = pinballScene.add.image(196.58136708825936, 209.50097371894657, MULTIPLIER_ACTIVATED).setVisible(false);
	multipliers.middle = pinballScene.add.image(269.5537364845706, 170.6609055575688, MULTIPLIER_ACTIVATED).setVisible(false);
	multipliers.right = pinballScene.add.image(342.5261058808819, 174.19182084496677, MULTIPLIER_ACTIVATED).setVisible(false);
}

export function multipliers_update() {
	const cam = pinballScene.cameras.main;
	const mousePos_x = game_ref.input.activePointer.position.x / cam.zoom;
	const mousePos_y = game_ref.input.activePointer.position.y / cam.zoom;

	// multipliers["right"].x = mousePos_x;
	// multipliers["right"].y = mousePos_y;
	// console.log(mousePos_x, mousePos_y);
}

export function toggleMultiplier(name: any) {
	const isVisible = multipliers[name].visible;

	// if it was visible, then it will be invisible, so remove 3 multipliers
	if(isVisible) {
		modifyMultiplier(-3);
	} else {
		modifyMultiplier(3);
	}

	multipliers[name].visible = !isVisible;
}