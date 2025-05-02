import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './AddMember.module.css';

function EditMember() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    image: null,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [currentImage, setCurrentImage] = useState('');

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/members/${id}`);
        const member = response.data;
        setFormData({
          name: member.name,
          role: member.role,
          email: member.email,
          image: null,
        });
        setCurrentImage(member.imageUrl);
      } catch (error) {
        console.error('Error fetching member:', error);
        setServerError('Failed to load member details.');
      }
    };

    fetchMember();
  }, [id]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    if (!formData.role.trim()) {
      newErrors.role = 'Role is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.image && !formData.image.type.match(/image\/(jpeg|png|gif)/)) {
      newErrors.image = 'Please select a valid image file (JPEG, PNG, or GIF)';
    } else if (formData.image && formData.image.size > 5 * 1024 * 1024) {
      newErrors.image = 'Image size must be less than 5MB';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    if (!validateForm()) {
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('role', formData.role);
    data.append('email', formData.email);
    if (formData.image) {
      data.append('image', formData.image);
    }

    setIsLoading(true);
    try {
      console.log('Submitting update for member ID:', id);
      console.log('Update data:', {
        name: formData.name,
        role: formData.role,
        email: formData.email,
        hasImage: !!formData.image
      });

      const response = await axios.put(`http://localhost:5000/api/members/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        validateStatus: function (status) {
          return true; // Accept all status codes
        }
      });

      console.log('Update response status:', response.status);
      console.log('Update response data:', response.data);

      if (response.status === 404) {
        throw new Error(response.data?.details || 'Member not found');
      } else if (response.status !== 200) {
        throw new Error(response.data?.error || 'Failed to update member');
      }

      console.log('Update successful:', response.data);
      navigate('/members');
    } catch (error) {
      console.error('Error updating member:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to update member. Please try again.';
      if (error.response?.data?.details) {
        errorMessage = error.response.data.details;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Edit Member</h2>
      {serverError && <div className={styles.error}>{serverError}</div>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className={styles.formGroup}>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? styles.errorInput : ''}
          />
          {errors.name && <span className={styles.error}>{errors.name}</span>}
        </div>
        <div className={styles.formGroup}>
          <label>Role:</label>
          <input
            type="text"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={errors.role ? styles.errorInput : ''}
          />
          {errors.role && <span className={styles.error}>{errors.role}</span>}
        </div>
        <div className={styles.formGroup}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? styles.errorInput : ''}
          />
          {errors.email && <span className={styles.error}>{errors.email}</span>}
        </div>
        <div className={styles.formGroup}>
          <label>Current Profile Image:</label>
          <img
            src={currentImage}
            alt="Current profile"
            className={styles.currentImage}
          />
        </div>
        <div className={styles.formGroup}>
          <label>New Profile Image (optional):</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className={errors.image ? styles.errorInput : ''}
          />
          {errors.image && <span className={styles.error}>{errors.image}</span>}
        </div>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? 'Updating...' : 'Update Member'}
        </button>
      </form>
    </div>
  );
}

export default EditMember; 