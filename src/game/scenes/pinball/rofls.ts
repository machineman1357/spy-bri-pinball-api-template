import { getGameHeight } from "game/helpers";
import { pinballScene } from "./pinball-scene";

export let roflsManager_ref: RoflsManager;

class RoflsManager {
	private rofl_scale_inUI = 0.4;
	private rofl_scale_inSaveArea = 0.4;

	private rofls_spaceFromLeft_inUI = 30;
	private rofls_spaceFromBottom_inUI = 85;
	private rofls_spacing_inUI = 35;
	private rofls_leftPos_inSaveArea = { x: 50, y: 875 };
	private rofls_rightPos_inSaveArea = { x: 488, y: 875 };

	private rofl_isLeftActive_inSaveArea = false;
	private rofl_isRightActive_inSaveArea = false;

	private rofls_images_inUI: any = [];

	constructor() {
		this.createRofls_inUI();
	}

	createRofls_inUI () {
		for (let i = 0; i < 3; i++) {
			const currentSpacing = this.rofls_spacing_inUI * i;

			const rofl = pinballScene.add.image(
				this.rofls_spaceFromLeft_inUI + currentSpacing,
				getGameHeight(pinballScene) + this.rofls_spaceFromBottom_inUI,
				pinballScene.selectedGotchi?.spritesheetKey || "",
			).setDepth(3).setScale(this.rofl_scale_inUI);

			this.rofls_images_inUI.push(rofl);
		}
	}

	placeRoflInSaveAreas() {
		const isLoseOneRoflInPool = !this.rofl_isLeftActive_inSaveArea || !this.rofl_isRightActive_inSaveArea; // if either or, remove one from pool

		if(!this.rofl_isLeftActive_inSaveArea) {
			this.rofl_isLeftActive_inSaveArea = true;

			const rofl_left = pinballScene.add.image(
				this.rofls_leftPos_inSaveArea.x,
				this.rofls_leftPos_inSaveArea.y,
				pinballScene.selectedGotchi?.spritesheetKey || "",
			).setDepth(3).setScale(this.rofl_scale_inSaveArea);
		}

		if(!this.rofl_isRightActive_inSaveArea) {
			this.rofl_isRightActive_inSaveArea = true;

			const rofl_right = pinballScene.add.image(
				this.rofls_rightPos_inSaveArea.x,
				this.rofls_rightPos_inSaveArea.y,
				pinballScene.selectedGotchi?.spritesheetKey || "",
			).setDepth(3).setScale(this.rofl_scale_inSaveArea);
		}

		if(isLoseOneRoflInPool) {
			this.removeOneRoflFromPool();
		}
	}

	removeOneRoflFromPool() {
		this.rofls_images_inUI[this.rofls_images_inUI.length - 1].destroy();
	}
}

export function rofls_start() {
	roflsManager_ref = new RoflsManager();
}