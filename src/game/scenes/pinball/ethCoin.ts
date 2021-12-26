import { pinballScene_ethCoinMaxSoundCount, pinballScene_maxBallSpeedForEthCoinMaxSoundCount, pinballScene_timeBetweenEthCoinSounds_ms } from "helpers/vars";
import { pinballScene } from "./pinball-scene";
import { ball } from "./pinball-scene";

export class EthCoin {
	private soundCountTween: any;
	private soundCountTween_props: any;

	constructor() {
		this.soundCountTween_props = {

		};
	}

	wasHit() {
		const soundCount = this.getSoundCount();

		// remove tween if exists
		if(this.soundCountTween) {
			this.soundCountTween.remove();
		}

		// play once immediately (because repeat in the tween only happens after duration)..
		pinballScene.ethCoin_sound.play();

		// and repeat the rest.
		this.soundCountTween = pinballScene.tweens.add({
			targets: this.soundCountTween_props,
			dummyProp: 9001,
			duration: pinballScene_timeBetweenEthCoinSounds_ms,
			repeat: soundCount - 1,
			onRepeat: () => {
				pinballScene.ethCoin_sound.play();
			},
		});
	}

	getSoundCount() {
		const soundCountPercentage = ball.body.speed / pinballScene_maxBallSpeedForEthCoinMaxSoundCount;
		let soundCount = soundCountPercentage * pinballScene_ethCoinMaxSoundCount;
		soundCount = Math.round(soundCount);
		soundCount = Math.max(1, soundCount);
		soundCount = Math.min(pinballScene_ethCoinMaxSoundCount, soundCount);

		return soundCount;
	}
}