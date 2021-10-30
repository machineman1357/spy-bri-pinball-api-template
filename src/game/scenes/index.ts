import { BootScene } from './boot-scene';
import { PinballScene } from './pinball/pinball-scene';
import { PlinkoScene } from './plinko/scene_plinko';

const scenes = [BootScene, PinballScene, PlinkoScene];
export let game_ref: Phaser.Game;

export default scenes;

export const setGameRef = (game: Phaser.Game) => {
	game_ref = game;
};
