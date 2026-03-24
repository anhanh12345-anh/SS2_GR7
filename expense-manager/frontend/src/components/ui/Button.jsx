import React from 'react';
import styles from './Button.module.css';

const Button = ({
  children, onClick, type = 'button', variant = 'primary',
  size = 'md', disabled, loading, icon, className = '', fullWidth, ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${styles.btn} ${styles[variant]} ${styles[size]} ${fullWidth ? styles.full : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="spinner" style={{ width: 16, height: 16 }} />
      ) : icon ? (
        <span className={styles.icon}>{icon}</span>
      ) : null}
      {children}
    </button>
  );
};

export default Button;
