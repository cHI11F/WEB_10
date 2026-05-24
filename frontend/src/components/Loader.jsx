import React from 'react';

export default function Loader() {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
      <p style={styles.text}>Завантаження...</p>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontFamily: 'sans-serif',
    background: '#f5f6fa'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #ccc',
    borderTop: '5px solid #1877f2',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  text: {
    marginTop: '15px',
    color: '#555',
    fontWeight: 'bold'
  }
};

// Додамо ключові кадри анімації безпосередньо в DOM, якщо стилі не підключені
const styleSheet = document.styleSheets[0] || (() => {
  const style = document.createElement("style");
  document.head.appendChild(style);
  return style.sheet;
})();

try {
  styleSheet.insertRule(`
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `, styleSheet.cssRules.length);
} catch (e) {
  // Ігноруємо якщо вже додано або помилка
}
