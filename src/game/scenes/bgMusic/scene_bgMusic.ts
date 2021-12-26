import { BG_MUSIC, PLINKO_OST } from "game/assets";
import { is_musicEnabled } from "helpers/vars";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
	active: false,
	visible: false,
	key: "BGMusic",
};

export class BGMusicScene extends Phaser.Scene {
	private bgMusic: any;
	public plinkoOST: any;

    constructor () {
        super(sceneConfig);
    }

	create() {
		const plinkoOST_loopMarker = {
			name: 'plinkoOST_loop',
			start: 0,
			duration: 31,
			config: {
				loop: true,
				volume: 0.2
			}
		};
		this.plinkoOST = this.sound.add(PLINKO_OST);
		this.plinkoOST.addMarker(plinkoOST_loopMarker);

		this.scene.setVisible(false);

		const pinballOST_loopMarker = {
			name: 'pinballOST_loop',
			start: 0,
			duration: 506,
			config: {
				loop: true,
				volume: 0.2
			}
		};
		this.bgMusic = this.sound.add(BG_MUSIC);
		this.bgMusic.addMarker(pinballOST_loopMarker);
		this.playMusic();
    }

	update() {
		//
    }

	playMusic() {
		if(is_musicEnabled) this.bgMusic.play('pinballOST_loop');
	}

	resumeMusic() {
		if(is_musicEnabled) this.bgMusic.resume();
	}

	pauseMusic() {
		if(is_musicEnabled) this.bgMusic.pause();
	}

	play_plinkoOST() {
		if(is_musicEnabled) this.plinkoOST.play('plinkoOST_loop');
	}

	resume_plinkoOST() {
		if(is_musicEnabled) this.plinkoOST.resume();
	}

	pause_plinkoOST() {
		if(is_musicEnabled) this.plinkoOST.pause();
	}
}