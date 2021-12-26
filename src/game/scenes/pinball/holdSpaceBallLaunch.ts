import { ballResetForce, PinballScene } from "./pinball-scene";

export class HoldSpaceBallLaunchManager {
    private spaceKeyObj: Phaser.Input.Keyboard.Key;
    private scene: PinballScene;
    private wasSpacePressed = false;
    private timeSpaceWasHeldDown = 0;
    private maxTimeForMaxVelocity_ms = 1000;

    constructor(scene: PinballScene) {
        this.scene = scene;
        this.spaceKeyObj = scene.input.keyboard.addKey('Space');  // Get key object
    }

    update(delta: number) {
        if(this.spaceKeyObj.isDown) {
            this.wasSpacePressed = true;
            this.timeSpaceWasHeldDown += delta;
        } else {
            if(this.wasSpacePressed) {
                this.wasSpacePressed = false;

                this.handleSpaceRelease();
            }
        }
    }

    handleSpaceRelease() {
        const [_isBallOnShootForceSensorBody, body] = this.scene.isBallOnShootForceSensorBody();
        if(_isBallOnShootForceSensorBody) {
            const forceRatio = Math.min(this.timeSpaceWasHeldDown / this.maxTimeForMaxVelocity_ms, 1);
            console.log(this.timeSpaceWasHeldDown, forceRatio);

            body.gameObject.setVelocity(0, ballResetForce * forceRatio);
        }

        this.timeSpaceWasHeldDown = 0;
    }
}