import { set_multiplierText, set_scoreText } from "./statsBar";

let current_multiplier = 0;
let finalMultiplier = 0;
let isLeftBlackHoleOpen = false;

let currentScore = 0;

function updateFinalMultiplier() {
	finalMultiplier = current_multiplier;
	if(isLeftBlackHoleOpen) {
		finalMultiplier += 2;
	}

	set_multiplierText(finalMultiplier);
}

export function set_isLeftBlackHoleOpen(state: any) {
	isLeftBlackHoleOpen = state;
	updateFinalMultiplier();
}

export function increaseScore(points: any) {
	const multiplier = finalMultiplier === 0 ? 1 : finalMultiplier; // if multiplier is 0, then make it 1, or else points is * 0
	currentScore += points * multiplier;

	set_scoreText(currentScore);
}

export function modifyMultiplier(amount: any) {
	current_multiplier += amount;

	updateFinalMultiplier();
}