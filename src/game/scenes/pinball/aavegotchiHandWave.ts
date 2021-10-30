import { AAVEGOTCHIHAND } from "game/assets";
import { game_ref } from "..";
import { pinballScene } from "./pinball-scene";

export let aavegotchiHandWave: AavegotchiHandWave;

class AavegotchiHandWave {
	private handImage: any;
	private handImage_scaleY: any = 1;
	private handImage_lessYPositionWhenHandIsDown: any = 2;
	private handImage_startPos = { x: 233.45926119908032, y: 622.6576402894877 };

	constructor() {
		this.aavegotchiHandWave_createSprite();
		this.aavegotchiHandWave_createHandFlipTween();
	}

	aavegotchiHandWave_update() {
		this.aavegotchiHandWave_moveToMouse();
	}

	aavegotchiHandWave_createSprite() {
		this.handImage = pinballScene.add.image(this.handImage_startPos.x, this.handImage_startPos.y, AAVEGOTCHIHAND);
	}

	aavegotchiHandWave_createHandFlipTween() {
		pinballScene.tweens.add({
			targets: this.handImage,
			x: this.handImage.x,
			ease: 'Power1',
			duration: 250,
			yoyo: true,
			repeat: -1,
			onYoyo: () => {
				this.handImage_scaleY *= -1;
				this.handImage.scaleY = this.handImage_scaleY;

				// move down?
				if(this.handImage_scaleY === -1) {
					this.handImage.y = this.handImage.y + this.handImage_lessYPositionWhenHandIsDown;
				} else {
					this.handImage.y = this.handImage_startPos.y;
				}
			},
		});
	}

	aavegotchiHandWave_moveToMouse() {
		if(!game_ref) return;
		
		const cam = pinballScene.cameras.main;
		this.handImage.x = game_ref.input.activePointer.position.x / cam.zoom;
		this.handImage.y = game_ref.input.activePointer.position.y / cam.zoom + 50;
		console.log(this.handImage.x, this.handImage.y);
	}
}

export function aavegotchiHandWave_start() {
	aavegotchiHandWave = new AavegotchiHandWave();
}
