import Phaser from "phaser";
import { useState, useEffect } from "react";
import { IonPhaser, GameInstance } from "@ion-phaser/react";
import { useWeb3 } from "web3/context";
import { Redirect } from "react-router";
import Scenes, { game_ref, setGameRef } from "./scenes";
// import io, { Socket } from "socket.io-client";
import { AavegotchiObject, Tuple } from "types";
import { useDiamondCall } from "web3/actions";
import { PaddlesInput_Container } from "components";
import './main.css';
import { StatsBar } from "components/StatsBar";

export let ballsUnlockedForPlinko = 1;

const Main = () => {
	const {
		state: { usersAavegotchis, selectedAavegotchiId, provider },
	} = useWeb3();
	const [initialised, setInitialised] = useState(true);
	const [config, setConfig] = useState<GameInstance>();

	const startGame = async (/*socket: Socket,*/ selectedGotchi: AavegotchiObject) => {
		let width = window.innerWidth;
		let height = width / 1.778;

		if (height > window.innerHeight) {
			height = window.innerHeight;
			width = height * 1.778;
		}

		if (!selectedGotchi.svg) {
			try {
				if (!provider) throw "Not connected to web3";
				const svg = await useDiamondCall<Tuple<string, 4>>(provider, { name: "getAavegotchiSideSvgs", parameters: [selectedGotchi.id] });
				selectedGotchi.svg = svg;
			} catch (err) {
				console.error(err);
			}
		}

		// setConfig({
		// 	type: Phaser.AUTO,
		// 	physics: {
		// 		default: "arcade",
		// 		arcade: {
		// 			gravity: { y: 0 },
		// 			debug: process.env.NODE_ENV === "development",
		// 		},
		// 	},
		// 	scale: {
		// 		mode: Phaser.Scale.NONE,
		// 		width,
		// 		height,
		// 	},
		// 	scene: Scenes,
		// 	fps: {
		// 		target: 60,
		// 	},
		// 	callbacks: {
		// 		preBoot: (game) => {
		// 			// Makes sure the game doesnt create another game on rerender
		// 			setInitialised(false);
		// 			game.registry.merge({
		// 				selectedGotchi,
		// 				// socket
		// 			});
		// 		},
		// 	},
		// });

		setConfig({
			type: Phaser.WEBGL,
			width: 565,
			height: 854,
			// pixelArt: true,
			parent: "gameCanvas",
			canvas: document.getElementById('gameCanvas') as HTMLCanvasElement,
			scene: Scenes,
			physics: {
				default: 'matter',
				matter: {
					gravity: {
						x: 0,
						y: 0.25 // default: 0.15
					},
					// debug: true,
					"plugins.attractors": true,
					positionIterations: 12,
					velocityIterations: 8
				}
			},
			scale: {
				mode: Phaser.Scale.FIT,
				parent: 'game',
			},
			fps: {
				target: 60,
			},
			callbacks: {
				preBoot: (game: Phaser.Game) => {
					setGameRef(game);

					// Makes sure the game doesnt create another game on rerender
					setInitialised(false);
					game.registry.merge({
						selectedGotchi,
						// socket
					});
				},
			},
		});
	}

	useEffect(() => {
		if (usersAavegotchis && selectedAavegotchiId) {
			// Socket is called here so we can take advantage of the useEffect hook to disconnect upon leaving the game screen
			// const socket = io(process.env.REACT_APP_SERVER_PORT || 'http://localhost:8080');
			const selectedGotchi = usersAavegotchis.find(gotchi => gotchi.id === selectedAavegotchiId);
			if (!selectedGotchi) return;

			startGame(/*socket,*/ selectedGotchi)

			// return () => {
			// 	socket.emit("handleDisconnect");
			// };
		}
	}, []);

	if (!usersAavegotchis) {
		return <Redirect to="/" />;
	}

	return(
		<>
			<StatsBar />
			<canvas id="gameCanvas" />
			<PaddlesInput_Container />
			<IonPhaser initialize={initialised} game={config} id="phaser-app" />
		</>
	);
};

export function increase_ballsUnlockedForPlinko() {
	ballsUnlockedForPlinko += 1;
}

export function reset_ballsUnlockedForPlinko() {
	ballsUnlockedForPlinko = 1;
}

export default Main;
