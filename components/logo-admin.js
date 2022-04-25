import styles from './logo.module.css'
import { text } from '../lib/data'

const LogoAdmin = () => (
    <span className={styles.span}>
        <span>{text.logoAdmin.dashboard}</span>
        {/* <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 8" />
            <circle cx="8" cy="8" r="4" fill="black" />
        </svg> */}
    </span>
);

export default LogoAdmin;