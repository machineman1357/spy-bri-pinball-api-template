export interface Asset {
	key: string;
	src: string;
	type: 'IMAGE' | 'SVG' | 'SPRITESHEET' | 'AUDIO' | 'TILEMAP_TILES' | "TILEMAP_MAP" | "JSON" | "ATLAS";
	data?: {
		frameWidth?: number;
		frameHeight?: number;
	};
	atlasJson?: string;
}

export interface SpritesheetAsset extends Asset {
	type: 'SPRITESHEET';
	data: {
		frameWidth: number;
		frameHeight: number;
	};
}

export const BG = 'bg';
export const FULLSCREEN = 'fullscreen';
export const LEFT_CHEVRON = 'left_chevron';
export const CLICK = 'click';
export const BG_SCRUBBED = 'bg_scrubbed';
export const AAVEGOTCHIHAND = 'aavegotchiHand';
export const ARROW_RED = 'arrow_red';
export const ARROW_PURPLE = 'arrow_purple';
export const SHAPES = 'shapes';
export const PORTAL = 'portal';
export const SPIN_COIN = 'spinCoin_atlas';
export const PINBALL = 'pinball';
export const LBH_BLOCKER = 'leftBlackHole_blocker';
export const PADDLE = 'paddle';
export const WALL_BUMPER_EDGE = 'wallBumper_l_edge';
export const WALL_BUMPER_TUBE = 'wallBumper_l_tube';
export const TIMER = 'timer';
export const PASS_THROUGH_LIGHTS = 'passThroughLights';
export const MULTIPLIER_ACTIVATED = 'multiplier_activated';
export const TUBE_BG_COLOR = 'tube_bgColor';
export const TUBE_OUTLINE = 'tube_outline';
export const RED_RING = 'redRing';
export const PLINKO_BORDER = 'plinko_border';
export const PLINKO_UNIVERSE_BG = 'plinko_universeBG';
export const PLINKO_TUBES = 'plinko_tubes';
export const PLINKO_TUBES_AND_GRID_BG = 'plinko_tubesAndGridBG';
export const GHST = 'ghst';
export const SPIN_COIN_2 = 'spin_coin_2';
export const FIRE = 'fire';
export const BG_MUSIC = 'bgMusic';
export const K_POINTS_RED_PLINKO = '1000 pts red plinko';
export const MARIO_PIPE_SOUND = 'Mario Pipe Sounds';
export const SLINGSHOT_SOUND = 'Slingshot Sound';
export const BALL_CURVING_AROUND_AFTER_RELEASE = 'Ball curving around after release';
export const BALL_HITTING_PLAIN_WALL = 'ball hitting plain wall';
export const DOUBLE_POINTS_SOUND = 'double points sound';
export const ETH_COIN = 'eth coin';
export const GHST_COIN = 'GHST coin';
export const PLINKO_OST = 'PLINKO OST';
export const TRIPLE_MULTIPLIER = 'triple multiplier';
export const WALL_BUMPERS = 'wall bumpers';
export const PORTAL_SOUND = 'portal sound';
export const LOOP_RE_ENTRY_BLOCKER = 'LOOP_RE_ENTRY_BLOCKER';
export const DIAMOND = 'DIAMOND';
export const PLINKO_LOSE_BALL_SOUND = 'PLINKO_LOSE_BALL_SOUND';
export const GAME_END_SOUND = 'GAME_END_SOUND';
export const TILT_SOUND = 'TILT_SOUND';

// Save all in game assets in the public folder
export const assets: Array<Asset | SpritesheetAsset> = [
	{
		key: BG,
		src: 'assets/images/bg.png',
		type: 'IMAGE',
	},
	{
		key: LEFT_CHEVRON,
		src: 'assets/icons/chevron_left.svg',
		type: 'SVG',
	},
	{
		key: CLICK,
		src: 'assets/sounds/click.mp3',
		type: 'AUDIO',
	},
	{
		key: BG_SCRUBBED,
		src: 'assets/images/bg_scrubbed.png',
		type: 'ATLAS',
		atlasJson: 'assets/images/bg_scrubbed.json',
	},
	{
		key: AAVEGOTCHIHAND,
		src: 'assets/images/aavegotchiHand_l_up.png',
		type: 'IMAGE',
	},
	{
		key: ARROW_RED,
		src: 'assets/images/arrow_red.png',
		type: 'IMAGE',
	},
	{
		key: ARROW_PURPLE,
		src: 'assets/images/arrow_purple.png',
		type: 'IMAGE',
	},
	{
		key: SHAPES,
		src: 'assets/json/bg_scrubbed.json',
		type: 'JSON',
	},
	{
		key: PORTAL,
		src: 'assets/images/portal_spritesheet.png',
		type: 'SPRITESHEET',
		data: {
			frameWidth: 706,
			frameHeight: 836
		}
	},
	{
		key: SPIN_COIN,
		src: 'assets/images/spinCoin_atlas.png',
		type: 'SPRITESHEET',
		data: {
			frameWidth: 106,
			frameHeight: 106
		}
	},
	{
		key: PINBALL,
		src: 'assets/images/pinball.png',
		type: 'IMAGE',
	},
	{
		key: LBH_BLOCKER,
		src: 'assets/images/x2_warp_wall.png',
		type: 'IMAGE',
	},
	{
		key: PADDLE,
		src: 'assets/images/paddle.png',
		type: 'IMAGE',
	},
	{
		key: WALL_BUMPER_EDGE,
		src: 'assets/images/wallBumper/wallBumper_l_edge.png',
		type: 'IMAGE',
	},
	{
		key: WALL_BUMPER_TUBE,
		src: 'assets/images/wallBumper/wallBumper_l_tube.png',
		type: 'IMAGE',
	},
	{
		key: TIMER,
		src: 'assets/images/timer.png',
		type: 'IMAGE',
	},
	{
		key: PASS_THROUGH_LIGHTS,
		src: 'assets/images/passThroughLights/passThroughLights_atlas.png',
		type: 'ATLAS',
		atlasJson: 'assets/images/passThroughLights/passThroughLights_atlas.json',
	},
	{
		key: MULTIPLIER_ACTIVATED,
		src: 'assets/images/multiplier_activated.png',
		type: 'IMAGE',
	},
	{
		key: TUBE_BG_COLOR,
		src: 'assets/images/plinko-scene/tube_bgColor.png',
		type: 'IMAGE',
	},
	{
		key: TUBE_OUTLINE,
		src: 'assets/images/plinko-scene/tube_outline.png',
		type: 'IMAGE',
	},
	{
		key: RED_RING,
		src: 'assets/images/plinko-scene/redRing.png',
		type: 'IMAGE',
	},
	{
		key: PLINKO_BORDER,
		src: 'assets/images/plinko-scene/plinko_border.png',
		type: 'IMAGE',
	},
	{
		key: PLINKO_UNIVERSE_BG,
		src: 'assets/images/plinko-scene/plinko_universeBG.png',
		type: 'IMAGE',
	},
	{
		key: PLINKO_TUBES,
		src: 'assets/images/plinko-scene/plinko_tubes.png',
		type: 'IMAGE',
	},
	{
		key: PLINKO_TUBES_AND_GRID_BG,
		src: 'assets/images/plinko-scene/plinko_tubesAndGridBG.png',
		type: 'IMAGE',
	},
	{
		key: GHST,
		src: 'assets/images/ghst_atlas.png',
		type: 'SPRITESHEET',
		data: {
			frameWidth: 231,
			frameHeight: 231
		}
	},
	{
		key: SPIN_COIN_2,
		src: 'assets/images/spin_coin_2.png',
		type: 'IMAGE',
	},
	{
		key: FIRE,
		src: 'assets/images/Frame_13.png',
		type: 'IMAGE',
	},
	{
		key: BG_MUSIC,
		src: 'assets/sounds/Pinball soundtrack.mp3',
		type: 'AUDIO',
	},
	{
		key: K_POINTS_RED_PLINKO,
		src: 'assets/sounds/1000 pts red plinko.mp3',
		type: 'AUDIO',
	},
	{
		key: MARIO_PIPE_SOUND,
		src: 'assets/sounds/Mario Pipe Sounds.mp3',
		type: 'AUDIO',
	},
	{
		key: SLINGSHOT_SOUND,
		src: 'assets/sounds/Slingshot sound 2.mp3',
		type: 'AUDIO',
	},
	{
		key: BALL_CURVING_AROUND_AFTER_RELEASE,
		src: 'assets/sounds/Ball curving around after release.mp3',
		type: 'AUDIO',
	},
	{
		key: BALL_HITTING_PLAIN_WALL,
		src: 'assets/sounds/Ball hitting plain wall.mp3',
		type: 'AUDIO',
	},
	{
		key: DOUBLE_POINTS_SOUND,
		src: 'assets/sounds/Double Points Sound.mp3',
		type: 'AUDIO',
	},
	{
		key: ETH_COIN,
		src: 'assets/sounds/ETH coin.mp3',
		type: 'AUDIO',
	},
	{
		key: GHST_COIN,
		src: 'assets/sounds/GHST coin.mp3',
		type: 'AUDIO',
	},
	{
		key: PLINKO_OST,
		src: 'assets/sounds/PLINKO OST.mp3',
		type: 'AUDIO',
	},
	{
		key: TRIPLE_MULTIPLIER,
		src: 'assets/sounds/Triple Ring Sound (Above triple ghst coin).mp3',
		type: 'AUDIO',
	},
	{
		key: WALL_BUMPERS,
		src: 'assets/sounds/Wall Bumpers (opens up double pts area).mp3',
		type: 'AUDIO',
	},
	{
		key: PORTAL_SOUND,
		src: 'assets/sounds/portal sound.mp3',
		type: 'AUDIO',
	},
	{
		key: LOOP_RE_ENTRY_BLOCKER,
		src: 'assets/images/loopReEntryBlocker.png',
		type: 'IMAGE',
	},
	{
		key: DIAMOND,
		src: 'assets/images/diamond.png',
		type: 'IMAGE',
	},
	{
		key: PLINKO_LOSE_BALL_SOUND,
		src: 'assets/sounds/Losing Ball Sound.mp3',
		type: 'AUDIO',
	},
	{
		key: GAME_END_SOUND,
		src: 'assets/sounds/GAME ending.mp3',
		type: 'AUDIO',
	},
    {
		key: TILT_SOUND,
		src: 'assets/sounds/Tilt sfx.mp3',
		type: 'AUDIO',
	},
];
