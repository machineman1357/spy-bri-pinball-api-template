import { Component } from "react";
import styles from "./styles.module.css";

export class StatsBar extends Component {
	render() {
		return (
			<div id="statsBar_container" className={styles.statsBar_container}>
				<div id="statsBar_multiplier" className={styles.statsBar_multiplier}>0x</div>
				<div id="statsBar_score" className={styles.statsBar_score}>0</div>
			</div>
		)
	}
}