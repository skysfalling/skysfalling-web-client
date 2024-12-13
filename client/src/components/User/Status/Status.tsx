import React, { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import './Status.styles.css';

interface StatusProps {
  userId?: string;
  className?: string;
}

const Status: React.FC<StatusProps> = ({ userId, className = '' }) => {
  const { status: authState } = useContext(AuthContext);

  return (
    <div className={`user-status ${className}`}>
      <div className={`status-indicator ${authState ? 'online' : 'offline'}`} />
      <span className="status-text">{authState ? 'Authenticated' : 'Not Authenticated'}</span>
    </div>
  );
};

export default Status; 