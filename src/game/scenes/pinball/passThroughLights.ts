/* eslint-disable @typescript-eslint/no-explicit-any */
import { PASS_THROUGH_LIGHTS } from "game/assets";
import { game_ref } from "..";
import { pinballScene } from "./pinball-scene";

const PTLs = [];

const scale = 0.25;
const depth = 3;
const collider_radius = 20;
const off_alpha = 0.5;

const colors = {
	green: 0xc0f800,
	blue: 0x57c6f6,
	purple: 0xf300f3
}

class PassThroughLight {
	private xPos: any;
	private yPos: any;
	private angle: any;
	private border: any;
	private bgColor: any;
	private container: any;
	private bg_sprite: any;
	private border_sprite: any;
	private isOn: any;

	constructor(options: any) {
		this.xPos = options.xPos;
		this.yPos = options.yPos;
		this.angle = options.angle;
		this.border = options.border; // square || round || square_black
		this.bgColor = options.bgColor;

		this.create();
		this.create_collider();

		PTLs.push(this);
	}

	create() {
		this.container = pinballScene.add.container(this.xPos, this.yPos)
			.setDepth(depth);

		if(this.border === "square") {
			this.border_sprite = pinballScene.add.image(0, 0, PASS_THROUGH_LIGHTS, "square_border_white");
			this.bg_sprite = pinballScene.add.image(0, 0, PASS_THROUGH_LIGHTS, "square_bgAndInnerShadow");
		} else if(this.border === "round") {
			this.border_sprite = pinballScene.add.image(0, 0, PASS_THROUGH_LIGHTS, "rounded_border_white");
			this.bg_sprite = pinballScene.add.image(0, 0, PASS_THROUGH_LIGHTS, "rounded_bgAndInnerShadow");
		} else if(this.border === "square_black") {
			this.border_sprite = pinballScene.add.image(0, 0, PASS_THROUGH_LIGHTS, "square_border_black");
			this.bg_sprite = pinballScene.add.image(0, 0, PASS_THROUGH_LIGHTS, "square_bgAndInnerShadow");
		}

		this.bg_sprite
			.setScale(scale)
			.setTint(this.bgColor)
			.setAngle(this.angle);
		this.border_sprite
			.setScale(scale)
			.setAngle(this.angle);

		this.container.add(this.bg_sprite);
		this.container.add(this.border_sprite);

		this.setLight(false);
	}

	create_collider() {
		const visual = pinballScene.add.sprite(this.xPos, this.yPos, "arrow_red").setAlpha(0);
		visual.MACHINEMAN1357_passThroughLight_class = this;

		const object_body = pinballScene.matter.add.circle(this.xPos, this.yPos, collider_radius, {
			isStatic: true,
			label: "passThroughLight_sensor",
			isSensor: true
		});
		pinballScene.matter.add.gameObject(visual, object_body);
	}

	moveToMouse(extraX: any, extraY: any) {
		const cam = pinballScene.cameras.main;
		this.container.x = game_ref.input.activePointer.position.x / cam.zoom + extraX;
		this.container.y = game_ref.input.activePointer.position.y / cam.zoom + extraY;
		console.log(this.container.x, this.container.y);
	}

	toggleLight() {
		this.isOn = !this.isOn;

		this.setLight(this.isOn);
	}

	setLight(state: any) {
		if(state) {
			this.bg_sprite.alpha = 1;
			// this.border_sprite.alpha = 1;

			this.isOn = state;
		} else if(!state) {
			this.bg_sprite.alpha = off_alpha;
			// this.border_sprite.alpha = off_alpha;

			this.isOn = state;
		}
	}
}

function create_passThroughLights() {
	// greens
	new PassThroughLight({
		xPos: 96.54,
		yPos: 156.54,
		angle: 25,
		border: "square",
		bgColor: colors.green
	});
	new PassThroughLight({
		xPos: 141.26,
		yPos: 184.78,
		angle: 40,
		border: "square",
		bgColor: colors.green
	});
	new PassThroughLight({
		xPos: 415.5,
		yPos: 184.78,
		angle: -50,
		border: "square",
		bgColor: colors.green
	});
	new PassThroughLight({
		xPos: 125.96,
		yPos: 288.36,
		angle: 0,
		border: "round",
		bgColor: colors.green
	});

	// blues
	new PassThroughLight({
		xPos: 62.4,
		yPos: 371.9,
		angle: 0,
		border: "round",
		bgColor: colors.blue
	});
	new PassThroughLight({
		xPos: 476.7,
		yPos: 373.1,
		angle: 0,
		border: "round",
		bgColor: colors.blue
	});
	new PassThroughLight({
		xPos: 131.85,
		yPos: 407.23,
		angle: -15,
		border: "square",
		bgColor: colors.blue
	});

	// purples
	new PassThroughLight({
		xPos: 48.28,
		yPos: 760.32,
		angle: 0,
		border: "square_black",
		bgColor: colors.purple
	});
	new PassThroughLight({
		xPos: 103.6,
		yPos: 760.32,
		angle: 0,
		border: "square_black",
		bgColor: colors.purple
	});
	new PassThroughLight({
		xPos: 436.7,
		yPos: 760.32,
		angle: 0,
		border: "square_black",
		bgColor: colors.purple
	});
	new PassThroughLight({
		xPos: 488.5,
		yPos: 760.32,
		angle: 0,
		border: "square_black",
		bgColor: colors.purple
	});
}

export function passThroughLight_start() {
	create_passThroughLights();
}

export function passThroughLight_update() {
	// PTLs[7].moveToMouse(0, 0);
}
