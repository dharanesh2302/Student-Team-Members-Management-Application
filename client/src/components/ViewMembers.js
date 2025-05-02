import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './ViewMembers.module.css';

function ViewMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/members');
      if (response.data.error) {
        setError(response.data.details || response.data.error);
        return;
      }
      setMembers(response.data);
    } catch (error) {
      setError(error.response?.data?.details || error.message || 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberClick = (memberId) => {
    navigate(`/members/${memberId}`);
  };

  if (loading) {
    return <div className={styles.message}>Loading members...</div>;
  }

  if (error) {
    return <div className={styles.message}>{error}</div>;
  }

  if (members.length === 0) {
    return <div className={styles.message}>No members found</div>;
  }

  return (
    <div className={styles.membersContainer}>
      {members.map(member => (
        <div 
          key={member._id} 
          className={styles.memberCard}
          onClick={() => handleMemberClick(member._id)}
        >
          <img
            src={member.imageUrl || 'https://placehold.co/100x100'}
            alt={member.name}
            className={styles.memberImage}
          />
          <div className={styles.memberInfo}>
            <div className={styles.memberName}>{member.name}</div>
            <div className={styles.memberRole}>{member.role}</div>
            <div className={styles.memberEmail}>{member.email}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ViewMembers;
