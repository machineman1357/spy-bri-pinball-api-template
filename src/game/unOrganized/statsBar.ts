import { game_ref } from "../scenes";

let ref_statsBar: any;
let ref_statsBar_multiplier: any;
let ref_scoreEl: any;
const statsBar_padding = 10;

function setRefs() {
	ref_statsBar = document.querySelector("#statsBar_container");
	ref_statsBar_multiplier = document.querySelector("#statsBar_multiplier");
	ref_scoreEl = document.querySelector("#statsBar_score");
}

export function setNewStatsBarContainerSize() {
	if(game_ref) {
		const canvasRect = game_ref.canvas.getBoundingClientRect();
		const twoTimesPadding = statsBar_padding * 2;
		const extraWidth = 2;
	
		if(ref_statsBar) {
			ref_statsBar.style.width = canvasRect.width /*- twoTimesPadding*/ + extraWidth + "px";
		}
	}
}

export function set_multiplierText(text: any) {
	ref_statsBar_multiplier.innerHTML = "x" + text;
}

export function set_scoreText(text: any) {
	ref_scoreEl.innerHTML = text;
}

export function statsBar_start() {
	setRefs();
	setNewStatsBarContainerSize();
}