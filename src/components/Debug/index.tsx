import { is_musicEnabled, version } from 'helpers/vars';
import styles from './styles.module.css';

interface Props {
	text: string;
}

export const Entry = (props: Props) => {
	return (
		<div className={styles.entry}>{props.text}</div>
	);
};

export const Notes = (props: Props) => {
	return (
		<pre className={`${styles.note} ${styles.entry}`}>{props.text}</pre>
	);
};

export const Debug = () => {
	return (
		<div className={styles.debug}>
			<Entry text={`DEBUG = true`}/>
			<Notes text={`Version: ${version}`}/>
			<Entry text={`Is music enabled: ${is_musicEnabled}`}/>
			<Notes text={`Notes:
	- all audio should be .mp3 (ex.: some .m4a files don't work)
	- all audio files should be longer than 1 second (issues with web audio and short audio files)
	- all audio that are meant to be sound effects should be cut in the beginning or else it sounds weird`} />
		</div>
	);
};