import { currentScore } from "game/unOrganized/stats";
import { Socket } from "socket.io-client";
import { pinballScene } from "../pinball/pinball-scene";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
	active: false,
	visible: false,
	key: "Game",
};

export class GameScene extends Phaser.Scene {
	private socket?: Socket;

	private isGameOver = false;

	constructor() {
		super(sceneConfig);
	}

	public create(): void {
		this.socket = this.game.registry.values.socket;
		this.socket?.emit('gameStarted');

		console.log(this.socket);
	}

	public update(): void {
		if (pinballScene && !pinballScene.pinball_isGameOver) {
			//
		} else {
			if (!this.isGameOver) {
				this.isGameOver = true;
        console.log("emitting 'gameOver' to socket with score:", currentScore);
				this.socket?.emit('gameOver', { score: currentScore });
			}
		}
	}

	public resetGameOver() {
		console.log("resettin game over");
		this.isGameOver = false;
	}
}