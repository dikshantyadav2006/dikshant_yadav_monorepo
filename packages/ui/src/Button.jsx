import React from 'react';

export function Button({ children, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: '8px 12px', borderRadius: 8 }}>
      {children}
    </button>
  );
}

export default Button;
