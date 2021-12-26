import { ball, pinballScene } from "./pinball-scene";

export interface IBallStuckServiceOptions {
    scene: Phaser.Scene
}

const timeBefore_checkStuckBounds_ms = 500; // default: 3000
const timeBefore_checkRemainStuck_ms = 500; // default: 5000
const maxDistanceForStuck = 50;

export class BallStuckService {
    private scene: Phaser.Scene;
    private cachedBallPos: { x: number, y: number };

    constructor(options: IBallStuckServiceOptions) {
        this.scene = options.scene;
        this.cachedBallPos = { x: ball.x, y: ball.y };

        this.start();
    }

    update() {
        // console.log(ball.x, ball.y);
    }

    start() {
        this.startCheckStuckBoundsTimer();
    }

    startCheckStuckBoundsTimer() {
        this.scene.time.addEvent({
            delay: timeBefore_checkStuckBounds_ms,
            callback: () => {
                const distance = Phaser.Math.Distance.Between(ball.x, ball.y, this.cachedBallPos.x, this.cachedBallPos.y);
                if(distance < maxDistanceForStuck) {
                    console.log("within stuck bounds.", distance);
                    this.startCheckRemainStuckTimer();
                } else {
                    console.log("Not within stuck bounds:", distance);
                    this.cachedBallPos = { x: ball.x, y: ball.y };

                    this.startCheckStuckBoundsTimer();
                }
            },
            callbackScope: this
        });
    }

    startCheckRemainStuckTimer() {
        this.scene.time.addEvent({
            delay: timeBefore_checkRemainStuck_ms,
            callback: () => {
                const distance = Phaser.Math.Distance.Between(ball.x, ball.y, this.cachedBallPos.x, this.cachedBallPos.y);
                if(distance < maxDistanceForStuck) {
                    console.log("remained stuck.", distance);
                    pinballScene.cameras.main.shake(250, 0.01);

                    pinballScene.resetBallToShootTube();

                    this.startCheckStuckBoundsTimer();
                } else {
                    console.log("Didn't remain stuck:", distance);
                    this.cachedBallPos = { x: ball.x, y: ball.y };

                    this.startCheckStuckBoundsTimer();
                }
            },
            callbackScope: this
        });
    }
}