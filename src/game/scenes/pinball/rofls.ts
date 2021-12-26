import { getGameHeight } from "game/helpers";
import { pinballScene } from "./pinball-scene";

export let roflsManager_ref: RoflsManager;

enum ERofl_Saver_Side {
    "LEFT",
    "RIGHT"
}

interface IRofl_Saver {
    side: ERofl_Saver_Side;
}

export let currentRoflLives = 3;
export let rofl_isLeftActive_inSaveArea = false;
export let rofl_isRightActive_inSaveArea = false;

class Rofl_Saver {
    private rofl_scale_inSaveArea = 0.4;
    private rofls_leftPos_inSaveArea = { x: 50, y: 875 };
    private rofls_rightPos_inSaveArea = { x: 488, y: 875 };

    private collider_radius = 25;

    private side: ERofl_Saver_Side;

    private rofl_collider: any;

    constructor(options: IRofl_Saver) {
        this.side = options.side;

        this.createRoflCollider();
    }

    getPos() {
        if (this.side === ERofl_Saver_Side.LEFT) {
            return {
                x: this.rofls_leftPos_inSaveArea.x,
                y: this.rofls_leftPos_inSaveArea.y,
            }
        } else if (this.side === ERofl_Saver_Side.RIGHT) {
            return {
                x: this.rofls_rightPos_inSaveArea.x,
                y: this.rofls_rightPos_inSaveArea.y,
            }
        }

        return {};
    }

    createRoflCollider() {
        const sidePos = this.getPos();

        const visual = pinballScene.add
            .sprite(0, 0, pinballScene.selectedGotchi?.spritesheetKey)
            .setDepth(3)
            .setScale(this.rofl_scale_inSaveArea);
        visual["MACHINEMAN1357_rofl_saver_side"] = this.side;

        this.rofl_collider = pinballScene.matter.add.circle(
            sidePos.x,
            sidePos.y,
            this.collider_radius, {
            isStatic: true,
            label: "rofl_saver",
            isSensor: true
        });
        pinballScene.matter.add.gameObject(visual, this.rofl_collider);
    }

    getHitByBall() {
        // position rofl off screen
        this.rofl_collider.gameObject.setPosition(-1000, 0);
    }

    positionInSaveArea() {
        const sidePos = this.getPos();

        this.rofl_collider.gameObject.setPosition(sidePos.x, sidePos.y);
    }
}

class RoflsManager {
    private rofl_scale_inUI = 0.4;

    private rofls_spaceFromLeft_inUI = 30;
    private rofls_spaceFromBottom_inUI = 85;
    private rofls_spacing_inUI = 35;

    private rofl_isLeftActive_inSaveArea = false;
    private rofl_isRightActive_inSaveArea = false;

    private rofls_images_inUI: any = [];
    private rofl_saver_left: any;
    private rofl_saver_right: any;

    constructor() {
        this.createRofls_inUI();
    }

    createRofls_inUI() {
        for (let i = 0; i < currentRoflLives; i++) {
            const currentSpacing = this.rofls_spacing_inUI * i;

            const rofl = pinballScene.add.image(
                this.rofls_spaceFromLeft_inUI + currentSpacing,
                getGameHeight(pinballScene) + this.rofls_spaceFromBottom_inUI,
                pinballScene.selectedGotchi?.spritesheetKey || "",
            ).setDepth(3).setScale(this.rofl_scale_inUI);

            this.rofls_images_inUI.push(rofl);
        }
    }

    placeRoflInSaveAreas() {
        // const isLoseOneRoflInPool = !this.rofl_isLeftActive_inSaveArea || !this.rofl_isRightActive_inSaveArea; // if either or, remove one from pool

        if (this.rofls_images_inUI.length > 0) {
            if (!rofl_isLeftActive_inSaveArea) {
                this.placeRoflInSaveArea(ERofl_Saver_Side.LEFT);
            }

            if (!rofl_isRightActive_inSaveArea) {
                this.placeRoflInSaveArea(ERofl_Saver_Side.RIGHT);
            }
        }

        this.removeOneRoflFromPool();
    }

    placeRoflInSaveArea(side: ERofl_Saver_Side) {
        if (side === ERofl_Saver_Side.LEFT) {
            rofl_isLeftActive_inSaveArea = true;

            // if rofl save already was created, just set its position. Else, create
            if (this.rofl_saver_left) {
                this.rofl_saver_left.positionInSaveArea();
            } else {
                const rofl = new Rofl_Saver({
                    side: ERofl_Saver_Side.LEFT
                });
                this.rofl_saver_left = rofl;
            }
        } else if (side === ERofl_Saver_Side.RIGHT) {
            rofl_isRightActive_inSaveArea = true;

            if (this.rofl_saver_right) {
                this.rofl_saver_right.positionInSaveArea();
            } else {
                const rofl = new Rofl_Saver({
                    side: ERofl_Saver_Side.RIGHT
                });
                this.rofl_saver_right = rofl;
            }
        }
    }

    removeOneRoflFromPool() {
        if (currentRoflLives > 0) {
            this.rofls_images_inUI[this.rofls_images_inUI.length - 1].destroy();

            this.rofls_images_inUI.splice(this.rofls_images_inUI.length - 1, 1);
        }

        currentRoflLives -= 1;
        if (currentRoflLives < 0) {
            pinballScene.loseGame();
        }
    }

    onBallHitRofl(side: ERofl_Saver_Side) {
        if (side === ERofl_Saver_Side.LEFT) {
            this.rofl_saver_left.getHitByBall();
            rofl_isLeftActive_inSaveArea = false;
        } else if (side === ERofl_Saver_Side.RIGHT) {
            this.rofl_saver_right.getHitByBall();
            rofl_isRightActive_inSaveArea = false;
        }
    }
}

export function resetLives() {
    currentRoflLives = 3;
    rofl_isRightActive_inSaveArea = false;
    rofl_isLeftActive_inSaveArea = false;
}

export function rofls_start() {
    roflsManager_ref = new RoflsManager();

    if (rofl_isRightActive_inSaveArea) {
        roflsManager_ref.placeRoflInSaveArea(ERofl_Saver_Side.RIGHT);
    } else if (rofl_isLeftActive_inSaveArea) {
        roflsManager_ref.placeRoflInSaveArea(ERofl_Saver_Side.LEFT);
    }
}