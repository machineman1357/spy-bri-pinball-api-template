import { BootScene } from './boot-scene';
import { PinballScene } from './pinball/pinball-scene';
import { PlinkoScene } from './plinko/scene_plinko';
import { BGMusicScene } from './bgMusic/scene_bgMusic';
import { GameScene } from './gameScene/game-scene';

const scenes = [BootScene, PinballScene, PlinkoScene, BGMusicScene, GameScene];
export let game_ref: Phaser.Game;

export default scenes;

export const setGameRef = (game: Phaser.Game) => {
	game_ref = game;
};
