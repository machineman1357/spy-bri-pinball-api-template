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
];
