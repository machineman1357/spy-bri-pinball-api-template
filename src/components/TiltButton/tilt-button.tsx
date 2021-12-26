import React from "react";
import styles from "./style.module.css";

export class TiltButton extends React.Component {
    handleTiltButtonPress() {
        console.log("tilt button pressed.");

        window.postMessage({ msgType: "TILT_BUTTON"})
    }

    render() {
        return(
            <div className={styles.tiltButtonContainer} id="tilt-button-container">
                <img className={styles.tiltButtonImg} onClick={this.handleTiltButtonPress} src="./assets/images/tiltbutton.png"></img>
                <img className={styles.tiltButtonTextImg} src="./assets/images/TILT.png"></img>
                <div className={styles.TILT_underLine}></div>
                <img className={styles.backButtonText} src="./assets/images/BACK.png"></img>
            </div>
        )
    }
}