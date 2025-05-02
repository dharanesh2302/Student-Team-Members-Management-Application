import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';
import { FaUserPlus, FaUsers, FaChartLine, FaCog, FaShieldAlt } from 'react-icons/fa';

function Home() {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.heroSection}>
        <h1 className={styles.title}>Team Management System</h1>
        <p className={styles.subtitle}>
          Streamline your team management with our comprehensive solution. 
          Add members, track performance, and manage your team efficiently.
        </p>
        
        <div className={styles.memberBox}>
          <h2 className={styles.memberBoxTitle}>Member Management</h2>
          <div className={styles.buttonGroup}>
            <Link to="/add-member" className={`${styles.ctaButton} ${styles.primaryButton}`}>
              <FaUserPlus /> Add Member
            </Link>
            <Link to="/members" className={`${styles.ctaButton} ${styles.secondaryButton}`}>
              <FaUsers /> View Members
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <FaChartLine />
          </div>
          <h3 className={styles.featureTitle}>Performance Tracking</h3>
          <p className={styles.featureDescription}>
            Monitor and analyze team performance with detailed metrics and insights.
          </p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <FaCog />
          </div>
          <h3 className={styles.featureTitle}>Easy Management</h3>
          <p className={styles.featureDescription}>
            Simple and intuitive interface for managing your team effectively.
          </p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <FaShieldAlt />
          </div>
          <h3 className={styles.featureTitle}>Secure Access</h3>
          <p className={styles.featureDescription}>
            Robust security measures to protect your team's data and privacy.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
