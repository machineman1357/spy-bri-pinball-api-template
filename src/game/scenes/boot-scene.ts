import { AavegotchiGameObject, AavegotchiObject, Tuple } from "types";
import { getGameHeight, getGameWidth } from "game/helpers";
import { assets, SpritesheetAsset } from "game/assets";
import { constructSpritesheet } from "../helpers/spritesheet";
import { customiseSvg } from "helpers/aavegotchi";
import { Socket } from "socket.io-client";
import { isLog_loadFiles } from "helpers/vars";
import Phaser from 'phaser';
import { pinballScene } from "./pinball/pinball-scene";

interface AavegotchiWithSvg extends AavegotchiObject {
	svg: Tuple<string, 4>;
}

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
	active: false,
	visible: false,
	key: "Boot",
};

/**
 * The initial scene that loads all necessary assets to the game.
 */
export class BootScene extends Phaser.Scene {
	private socket?: Socket;
	private connected?: boolean;
	private assetsLoaded?: boolean;
	private gotchi?: AavegotchiGameObject;
	private loadIndex: number;
	private progressBarContainer?: Phaser.GameObjects.Rectangle;
	private progressBar?: Phaser.GameObjects.Rectangle;
	private loadingText?: Phaser.GameObjects.Text;

	constructor() {
		super(sceneConfig);
		this.loadIndex = 0;

        window.onmessage = (event) => { 
            if(event.data.msgType === "TILT_BUTTON") {
                console.log("received tilt button window message");
                if(!pinballScene) return;
                console.log(pinballScene, pinballScene.scene);
                if(!pinballScene.scene) return;
                if(!pinballScene.scene.isActive()) return;
                
                pinballScene.tiltBehavior.tilt();
            }
        };
	}

	public preload = (): void => {
		// Construct progress bar
		this.createProgressBar();

		// Construct gotchi game object from registry
		const selectedGotchi = this.game.registry.values
			.selectedGotchi as AavegotchiWithSvg;
		this.gotchi = {
			...selectedGotchi,
			spritesheetKey: "PLAYER",
		};

		// Checks connection to the server
		this.socket = this.game.registry.values.socket;
		!this.socket?.connected
			? this.socket?.on("connect", () => {
				this.handleConnection();
			})
			: this.handleConnection();

		// Listener that triggers when an asset has loaded
		this.load.on(
			"filecomplete",
			(key: string) => {
				if (isLog_loadFiles) console.log(`filecomplete [key: ${key}] [assets.length: ${assets.length}] [loadIndex: ${this.loadIndex}]`);

				// As the spritesheet is the last asset to load in, we can attempt to start the game
				if (key === "PLAYER") {
					this.assetsLoaded = true;
					this.loadingText?.setText(`Connecting to server...`);
					this.startGame();
				}
				if (this.loadIndex === assets.length && this.gotchi) {
					this.loadInGotchiSpritesheet(this.gotchi);
				} else {
					this.loadNextFile(this.loadIndex);
				}
			},
			this
		);
		this.loadNextFile(0);
	};

	/**
	 * Submits gotchi data to the server and attempts to start game
	 */
	private handleConnection = () => {
		console.log("handleConnection()");
		const gotchi = this.game.registry.values.selectedGotchi as AavegotchiObject;
		this.connected = true;
		this.socket?.emit("setGotchiData", {
			name: gotchi.name,
			tokenId: gotchi.id,
		});

		this.startGame();
	};

	/**
	 * If all the assets are loaded in, and user is connected to server, start game
	 */
	private startGame = () => {
		console.log(`Attempting 'startGame' [assetsLoaded: ${this.assetsLoaded}]`);
		if (this.assetsLoaded /*&& this.connected*/) {
			this.scene.start("Pinball", { selectedGotchi: this.gotchi });
		}
	};

	/**
	 * Renders UI component to display loading progress
	 */
	private createProgressBar = () => {
		const width = getGameWidth(this) * 0.5;
		const height = 12;
		this.progressBarContainer = this.add
			.rectangle(
				getGameWidth(this) / 2,
				getGameHeight(this) / 2,
				width,
				height,
				0x12032e
			)
			.setOrigin(0.5);

		this.progressBar = this.add
			.rectangle(
				(getGameWidth(this) - width) / 2,
				getGameHeight(this) / 2,
				0,
				height,
				0x6d18f8
			)
			.setOrigin(0, 0.5);

		this.loadingText = this.add
			.text(getGameWidth(this) / 2, getGameHeight(this) / 2 - 32, "Loading...")
			.setFontSize(24)
			.setOrigin(0.5);
	};

	/**
	 * Iterates through each file in the assets array
	 */
	private loadNextFile = (index: number) => {
		const file = assets[index];
		this.loadIndex++;

		if (isLog_loadFiles) {
			let colorStyle;

			switch (file.type) {
				case "IMAGE":
					colorStyle = "color: #00ff00";
					break;
				case "SVG":
					colorStyle = "color: #00ffff";
					break;
				case "AUDIO":
					colorStyle = "color: #3399ff";
					break;
				case "SPRITESHEET":
					colorStyle = "color: #ff99ff";
					break;
				case "TILEMAP_TILES":
					colorStyle = "color: #ffcc99";
					break;
				case "TILEMAP_MAP":
					colorStyle = "color: #ffff66";
					break;
				case "JSON":
					colorStyle = "color: #ff9900";
					break;
				case "ATLAS":
					colorStyle = "color: #ff3399";
					break;
				default:
					colorStyle = "color: white";
					break;
			}

			if (isLog_loadFiles) console.log(
				`%cloadNextFile [file.key: ${file.key}] [assets.length: ${assets.length}] [file source: ${file.src}] [loadIndex: ${this.loadIndex}] [file type: ${file.type}]`,
				colorStyle
			);
		}

		if (this.loadingText && this.progressBar && this.progressBarContainer) {
			this.loadingText.setText(`Loading: ${file.key}`);
			this.progressBar.width =
				(this.progressBarContainer.width / assets.length) * index;
		}

		switch (file.type) {
			case "IMAGE":
				this.load.image(file.key, file.src);
				break;
			case "SVG":
				this.load.svg(file.key, file.src);
				break;
			case "AUDIO":
				this.load.audio(file.key, [file.src]);
				break;
			case "SPRITESHEET":
				this.load.spritesheet(
					file.key,
					file.src,
					(file as SpritesheetAsset).data
				);
				break;
			case "TILEMAP_TILES":
				this.load.image(file.key, file.src);
				break;
			case "TILEMAP_MAP":
				this.load.tilemapTiledJSON(file.key, file.src);
				break;
			case "JSON":
				this.load.json(file.key, file.src);
				break;
			case "ATLAS":
				this.load.atlas(file.key, file.src, file.atlasJson);
				break;
			default:
				break;
		}
	};

	/**
	 * Constructs and loads in the Aavegotchi spritesheet, you can use customiseSVG() to create custom poses and animations
	 */
	private loadInGotchiSpritesheet = async (
		gotchiObject: AavegotchiGameObject
	) => {
		const svg = gotchiObject.svg;
		const spriteMatrix = [
			// Front
			[
				customiseSvg(svg[0], { removeBg: true }),
				customiseSvg(svg[0], {
					armsUp: true,
					eyes: "happy",
					float: true,
					removeBg: true,
				}),
			],
			// Left
			[
				customiseSvg(svg[1], { removeBg: true }),
			],
			// Right
			[
				customiseSvg(svg[2], { removeBg: true }),
			],
			// Right
			[
				customiseSvg(svg[3], { removeBg: true }),
			]
		];
		const { src, dimensions } = await constructSpritesheet(spriteMatrix);
		this.load.spritesheet(gotchiObject.spritesheetKey, src, {
			frameWidth: dimensions.width / dimensions.x,
			frameHeight: dimensions.height / dimensions.y,
		});
		this.load.start();
	};
}
