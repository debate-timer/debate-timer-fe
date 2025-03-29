import React from 'react';

interface KeyIconProps {
  keyLabel: string; // 'A', 'L' 등 원하는 키 표시
  size?: number;
}

const KeyIcon: React.FC<KeyIconProps> = ({ keyLabel, size = 32 }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.2,
        background: 'linear-gradient(145deg, #e6e6e6, #ffffff)',
        boxShadow: '6px 6px 12px #b8b8b8, -6px -6px 12px #ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.5,
        fontWeight: 'bold',
        color: '#555',
        fontFamily: 'Arial, sans-serif',
        userSelect: 'none',
      }}
    >
      {keyLabel}
    </div>
  );
};

export default KeyIcon;
