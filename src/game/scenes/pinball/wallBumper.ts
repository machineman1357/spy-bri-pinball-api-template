import { game_ref } from "..";
import { on_sideBumperHit } from "./leftBlackHole";
import { pinballScene } from "./pinball-scene";

const onHitMoveLeft = -10;
const startFromLeft = -5;
const timeBefore_resetPosFromLeft = 250;

export class WallBumper {
    private isRight: any;
    private container: any;
    private tube: any;
    private xPos;
    private yPos;
    private isPushedIn;
    private onHitCallback: any;

    constructor(options: any) {
        this.isRight = options.isRight !== undefined ? options.isRight : false
        this.xPos = options.xPos;
        this.yPos = options.yPos;
        this.isPushedIn = false;
        this.onHitCallback = options.onHitCallback !== undefined ? options.onHitCallback : function () { /* */ };

        this.create();
        this.createCollider();
    }

    create() {
        this.container = pinballScene.add.container(this.xPos, this.yPos);
        if (this.isRight) {
            this.container.scaleX = -1;
        }

        this.tube = pinballScene.add.image(startFromLeft, 0, "wallBumper_l_tube");
        const edge = pinballScene.add.image(0, 0, "wallBumper_l_edge");
        this.container.add([this.tube, edge]);
    }

    update() {
        // this.moveToMouse(0, 0);
    }

    moveToMouse(extraX: any | 0, extraY: any | 0) {
        const cam = pinballScene.cameras.main;
        this.container.x = game_ref.input.activePointer.position.x / cam.zoom + extraX;
        this.container.y = game_ref.input.activePointer.position.y / cam.zoom + extraY;
        console.log(this.container.x, this.container.y);
    }

    createCollider() {
        const collider = pinballScene.matter.add.rectangle(this.container.x, this.container.y, 20, 70, {
            label: "wallBumper_sensor",
            isStatic: true,
            isSensor: true
        });
        collider.MACHINEMAN1357_wallBumper = this;
        collider.MACHINEMAN1357_wallBumper_isRight = this.isRight;
    }

    on_hitByBall() {
        console.log("wallbumper hit");
        if (this.isPushedIn === false) {
            this.isPushedIn = true;

            this.onHitCallback();

            this.tube.x = onHitMoveLeft;

            pinballScene.time.addEvent({
                delay: timeBefore_resetPosFromLeft,
                callback: () => {
                    this.resetPushedIn();
                },
                args: []
            });
        }
    }

    resetPushedIn() {
        this.isPushedIn = false;
        this.tube.x = startFromLeft;
    }
}

export function wallBumper_start() {
    new WallBumper({
        xPos: 78.34902864062873,
        yPos: 637.9186952565676,
        onHitCallback: on_sideBumperHit
    });
    new WallBumper({
        isRight: true,
        xPos: 460.86548112129276,
        yPos: 637.9186952565676,
        onHitCallback: on_sideBumperHit
    });
}