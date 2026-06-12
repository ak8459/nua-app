import { Link } from 'react-router-dom';
import { FiHome, FiAlertCircle } from 'react-icons/fi';
import styles from './NotFoundPage.module.scss';

const NotFoundPage = () => {
  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.wrapper}>
        <div className={styles.iconWrapper}>
          <FiAlertCircle />
        </div>
        <h1 className={styles.title}>404</h1>
        <h2 className={styles.subtitle}>Page Not Found</h2>
        <p className={styles.description}>
          The page you are looking for does not exist.
        </p>
        <Link to="/" className={styles.homeBtn}>
          <FiHome /> Return to Collection
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
