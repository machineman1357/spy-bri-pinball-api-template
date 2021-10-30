import { game_ref } from "game/scenes";
import React, { Component } from "react";
import styles from "./styles.module.css";

interface IKeyboardKeyVisual {
	keyText: string
}

interface IKeyboardKeyVisualsContainer {
	keyTexts: string[]
}

interface ISinkButton {
	title: string,
	side: ESinkButtonSide,
	keyTexts: string[],
	isSunk: boolean,
	toggleSink: (sinkButtonSide: ESinkButtonSide) => void
}

interface IPaddlesInput_Container {
	isLeftSunk: boolean,
	isRightSunk: boolean,
	paddlesInput_container_width: string,
	hidden: boolean
}

enum ESinkButtonSide {
	"LEFT",
	"RIGHT"
}

const paddleKeyCodeInputs_left = ["KeyA", "ArrowLeft"];
const paddleKeyCodeInputs_right = ["KeyD", "ArrowRight"];

export let isInputDown_leftPaddle = false;
export let isInputDown_rightPaddle = false;

class KeyboardKeyVisual extends Component<IKeyboardKeyVisual> {
	render() {
		return (
			<div className={styles.keyboardKey_container}>
				{this.props.keyText}
			</div>
		)
	}
}

class KeyboardKeyVisualsContainer extends Component<IKeyboardKeyVisualsContainer> {
	render() {
		const [...keyTexts] = this.props.keyTexts;
		const keyboardKeyVisuals = keyTexts.map((keyText, index) =>
			<KeyboardKeyVisual key={keyText} keyText={keyText} />
		);

		return (
			<div className={styles.keyboardKeys_container}>
				{keyboardKeyVisuals}
			</div>
		)
	}
}

class SinkButton extends Component<ISinkButton> {
	render() {
		const sunkClass = this.props.isSunk ? styles.paddlesInput_button_active : null;

		return (
			<div className={styles.paddlesInput_button_container}>
				<div
					className={`${styles.paddlesInput_button} ${sunkClass}`}
					onPointerDown={() => { this.props.toggleSink(this.props.side); }}
					onPointerUp={() => { this.props.toggleSink(this.props.side); }}
				>
					{this.props.title}
					<KeyboardKeyVisualsContainer keyTexts={this.props.keyTexts} />
				</div>
			</div>
		)
	}
}

export class PaddlesInput_Container extends React.Component<any, IPaddlesInput_Container> {
	private paddlesInput_container_ref: any;

	constructor(props: any) {
		super(props);

		this.state = {
			isLeftSunk: false,
			isRightSunk: false,
			paddlesInput_container_width: "9999px",
			hidden: false
		};
		this.paddlesInput_container_ref = React.createRef();

		// hacky way of referencing this react component to allow external calling of function 'disable_paddlesInput'
		Object.assign(window, {
			MACHINEMAN1357_paddlesInput_container: this
		});
	}

	componentDidMount() {
		this.setEvents();

		// set paddles container size for the first time (check every 100ms because game_ref could be null)
		setInterval(() => {
			this.setNewPaddlesInputContainerSize();
		}, 100);
	}

	disable_paddlesInput() {
		this.setState({
			hidden: true
		})
	}

	setEvents() {
		document.body.addEventListener("keydown", (ev) => {
			// left
			if(paddleKeyCodeInputs_left.includes(ev.code)) {
				this.setSinkButtonState(ESinkButtonSide.LEFT, true);

				isInputDown_leftPaddle = true;
			}
	
			// right
			if(paddleKeyCodeInputs_right.includes(ev.code)) {
				this.setSinkButtonState(ESinkButtonSide.RIGHT, true);

				isInputDown_rightPaddle = true;
			}
		});
	
		// up
		document.body.addEventListener("keyup", (ev) => {
			// left
			if(paddleKeyCodeInputs_left.includes(ev.code)) {
				this.setSinkButtonState(ESinkButtonSide.LEFT, false);

				isInputDown_leftPaddle = false;
			}
			
			// right
			if(paddleKeyCodeInputs_right.includes(ev.code)) {
				this.setSinkButtonState(ESinkButtonSide.RIGHT, false);

				isInputDown_rightPaddle = false;
			}
		});

		window.onresize = () => {
			this.setNewPaddlesInputContainerSize();
			// setNewStatsBarContainerSize();
			// setCanvasSize();
		}
	}

	setNewPaddlesInputContainerSize() {
		if(game_ref) {
			const canvasRect = game_ref.canvas.getBoundingClientRect();
			const twoTimesPaddleInputsSize = 100 * 2;
			const newStyleWidth = canvasRect.width + twoTimesPaddleInputsSize + "px";
		
			this.setState({ paddlesInput_container_width: newStyleWidth } );
		}
	}

	toggleSink(sinkButtonSide: ESinkButtonSide) {
		if(sinkButtonSide === ESinkButtonSide.LEFT) {
			this.setSinkButtonState(sinkButtonSide, !this.state.isLeftSunk);
		} else if(sinkButtonSide === ESinkButtonSide.RIGHT) {
			this.setSinkButtonState(sinkButtonSide, !this.state.isRightSunk);
		}
	}

	setSinkButtonState(sinkButtonSide: ESinkButtonSide, state: boolean) {
		if(sinkButtonSide === ESinkButtonSide.LEFT) {
			this.setState({ isLeftSunk: state });
		} else if(sinkButtonSide === ESinkButtonSide.RIGHT) {
			this.setState({ isRightSunk: state });
		}
	}

	render() {
		const paddlesInput_container_style = this.state.hidden ? { display: "none" } : { width: this.state.paddlesInput_container_width };

		return (
			<div className={styles.paddlesInput_container} ref={this.paddlesInput_container_ref} style={ paddlesInput_container_style }>
				<SinkButton title={"left"} side={ESinkButtonSide.LEFT} keyTexts={["A", "←"]} isSunk={this.state.isLeftSunk} toggleSink={ (i) => this.toggleSink(i) } />
				<SinkButton title={"right"} side={ESinkButtonSide.RIGHT} keyTexts={["D", "→"]} isSunk={this.state.isRightSunk} toggleSink={ (i) => this.toggleSink(i) } />
			</div>
		)
	}
}