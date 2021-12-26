import { set_multiplierText, set_scoreText } from "./statsBar";

let current_multiplier = 0;
let finalMultiplier = 0;
let isLeftBlackHoleOpen = false;

export let currentScore = 0;

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
    const multiplierBEFORE = current_multiplier;
	current_multiplier += amount;

    console.log(`Modifying multiplier. [before: ${multiplierBEFORE}] [amount: ${amount}] [after: ${current_multiplier}]`);

	updateFinalMultiplier();
}

export function resetScore() {
	currentScore = 0;
	current_multiplier = 0;

	set_scoreText(currentScore);
	updateFinalMultiplier();
}