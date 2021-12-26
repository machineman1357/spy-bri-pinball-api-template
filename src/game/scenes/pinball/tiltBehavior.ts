import { tiltBehaviorButtonKey, tiltBehaviour_delay_ms } from "helpers/vars";
import { ball, pinballScene } from "./pinball-scene";

function getNormalizedDirectionAndAngle(x1: number, y1: number, x2: number, y2: number) {
    const dirX = x2 - x1;
    const dirY = y2 - y1;

    let length = Math.sqrt(dirX * dirX + dirY * dirY);
    if (length === 0) { length = 1; }

    const ndx = dirX / length;	// x normalized
    const ndy = dirY / length;

    const angle = Math.atan2(ndx, ndy);

    return { x: ndx, y: ndy, angle: angle };
}

export class TiltBehavior {
    private canTilt = true;
    private centerPos = { x: 274, y: 528 };
    constructor() {
        this.start();
    }

    start() {
        const keyObj = pinballScene.input.keyboard.addKey(tiltBehaviorButtonKey);  // Get key object
        keyObj.on('down', () => {
            this.tilt();
        });
    }

    tilt() {
        if (this.canTilt) {
            this.canTilt = false;
            pinballScene.cameras.main.shake(250, 0.01);
            const normalizedDirectionAndAngle = getNormalizedDirectionAndAngle(ball.body.position.x, ball.body.position.y, this.centerPos.x, this.centerPos.y);
            console.log(normalizedDirectionAndAngle);
            const newPos = {
                x: ball.body.position.x + (normalizedDirectionAndAngle.x * 50),
                y: ball.body.position.y + (normalizedDirectionAndAngle.y * 50)
            };
            ball.body.gameObject.setPosition(newPos.x, newPos.y);
            console.log(newPos.x, newPos.y);

            console.log(ball.body);

            pinballScene.time.addEvent({
                delay: tiltBehaviour_delay_ms,
                callback: () => {
                    console.log("timer done");
                    this.canTilt = true;
                }
            });

            pinballScene.tilt_sound.play({
                volume: 1
            });
        }
    }
}