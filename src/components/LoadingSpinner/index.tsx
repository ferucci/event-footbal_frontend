import styles from "./LoadingSpinner.module.scss"; // Стили для спиннера

export const LoadingSpinner = () => {
  return (
    <div className={styles.loadingSpinnerOverlay}>
      <div className={styles.loadingSpinner}>
        <div className={styles.spinner}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;