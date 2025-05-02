import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './MemberDetails.module.css';

function MemberDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMemberDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:5000/api/members/${id}`);
        console.log('Fetched member details:', response.data);
        
        if (response.data.error) {
          console.error('Error fetching member:', response.data.error);
          console.error('Error details:', response.data.details);
          setError(response.data.details || response.data.error);
          return;
        }

        setMember(response.data);
      } catch (error) {
        console.error('Error fetching member details:', error);
        console.error('Error details:', error.response?.data?.details || error.message);
        setError(error.response?.data?.details || error.message || 'Failed to fetch member details');
      } finally {
        setLoading(false);
      }
    };

    fetchMemberDetails();
  }, [id]);

  const handleBack = () => {
    navigate('/members');
  };

  if (loading) {
    return <div className={styles.message}>Loading member details...</div>;
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.message}>{error}</div>
        <button onClick={handleBack} className={styles.backButton}>
          Back to Members
        </button>
      </div>
    );
  }

  if (!member) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.message}>Member not found</div>
        <button onClick={handleBack} className={styles.backButton}>
          Back to Members
        </button>
      </div>
    );
  }

  return (
    <div className={styles.detailsContainer}>
      <button onClick={handleBack} className={styles.backButton}>
        Back to Members
      </button>
      
      <div className={styles.memberDetails}>
        <div className={styles.imageContainer}>
          <img
            src={member.imageUrl || 'https://placehold.co/400x400'}
            alt={member.name}
            className={styles.memberImage}
          />
        </div>
        
        <div className={styles.infoContainer}>
          <h1 className={styles.memberName}>{member.name}</h1>
          <div className={styles.detailItem}>
            <span className={styles.label}>Role:</span>
            <span className={styles.value}>{member.role}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.label}>Email:</span>
            <span className={styles.value}>{member.email}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.label}>Joined:</span>
            <span className={styles.value}>
              {new Date(member.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemberDetails;
