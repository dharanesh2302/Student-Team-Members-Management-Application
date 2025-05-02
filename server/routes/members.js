const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Member = require('../models/Member');
const fs = require('fs');
const mongoose = require('mongoose');

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Debug route to list all members
router.get('/debug/list', async (req, res) => {
  try {
    const members = await Member.find({}, '_id name');
    console.log('All members in database:', members);
    res.json(members);
  } catch (error) {
    console.error('Error listing members:', error);
    res.status(500).json({ error: 'Failed to list members' });
  }
});

// Debug route to check database state
router.get('/debug/check', async (req, res) => {
  try {
    // Check if the collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const hasMembersCollection = collections.some(c => c.name === 'members');
    
    if (!hasMembersCollection) {
      console.log('Members collection does not exist');
      return res.status(404).json({ 
        error: 'Collection not found',
        details: 'The members collection does not exist in the database'
      });
    }

    const members = await Member.find({}, '_id name role email');
    console.log('All members in database:', members);
    
    if (members.length === 0) {
      console.log('No members found in database');
      return res.status(404).json({ 
        error: 'No members found',
        details: 'The members collection exists but is empty'
      });
    }

    res.json({
      count: members.length,
      members: members
    });
  } catch (error) {
    console.error('Error checking database:', error);
    res.status(500).json({ 
      error: 'Failed to check database',
      details: error.message 
    });
  }
});

// Debug route to check database state
router.get('/debug/db-state', async (req, res) => {
  try {
    console.log('Checking database state...');
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Check members collection
    const membersCollection = collections.find(c => c.name === 'members');
    if (!membersCollection) {
      console.log('Members collection does not exist');
      return res.status(404).json({ 
        error: 'Collection not found',
        details: 'The members collection does not exist in the database'
      });
    }

    // Count documents in members collection
    const count = await mongoose.connection.db.collection('members').countDocuments();
    console.log('Number of members:', count);

    res.json({
      connectionState: mongoose.connection.readyState,
      collections: collections.map(c => c.name),
      memberCount: count
    });
  } catch (error) {
    console.error('Error checking database state:', error);
    res.status(500).json({ 
      error: 'Failed to check database state',
      details: error.message 
    });
  }
});

// GET all members
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all members...');
    
    // Check if the collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const hasMembersCollection = collections.some(c => c.name === 'members');
    
    if (!hasMembersCollection) {
      console.log('Members collection does not exist');
      return res.status(404).json({ 
        error: 'Collection not found',
        details: 'The members collection does not exist in the database'
      });
    }

    const members = await Member.find().sort({ createdAt: -1 });
    console.log('Fetched members:', members.map(m => ({ id: m._id, name: m.name })));
    
    if (members.length === 0) {
      console.log('No members found in database');
      return res.status(200).json([]); // Return empty array instead of error
    }

    res.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ 
      error: 'Failed to fetch members',
      details: error.message 
    });
  }
});

// GET single member
router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json(member);
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

// POST route to add a member
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, role, email } = req.body;

    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    const newMember = new Member({
      name,
      role,
      email,
      imageUrl,
    });

    await newMember.save();
    res.status(201).json(newMember);
  } catch (error) {
    console.error('Error saving member:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create member' });
  }
});

// PUT route to update a member
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const memberId = req.params.id;
    console.log('Update request received for member ID:', memberId);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      console.log('Invalid member ID format:', memberId);
      return res.status(400).json({ 
        error: 'Invalid member ID format',
        details: 'The provided ID is not in the correct format'
      });
    }

    // First check if the member exists
    console.log('Searching for member with ID:', memberId);
    const currentMember = await Member.findById(memberId);
    
    if (!currentMember) {
      console.log('Member not found for update:', memberId);
      return res.status(404).json({ 
        error: 'Member not found',
        details: `No member exists with ID: ${memberId}`
      });
    }

    console.log('Found member:', { id: currentMember._id, name: currentMember.name });

    const { name, role, email } = req.body;
    const updateData = { name, role, email };

    // If a new image is uploaded, update the imageUrl
    if (req.file) {
      // Delete the old image file if it exists
      if (currentMember.imageUrl) {
        const oldImagePath = path.join(__dirname, '../uploads', currentMember.imageUrl.split('/').pop());
        console.log('Attempting to delete old image at path:', oldImagePath);
        
        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
            console.log('Old image file deleted successfully');
          } catch (error) {
            console.error('Error deleting old image file:', error);
            // Continue with update even if old image deletion fails
          }
        } else {
          console.log('Old image file not found at path:', oldImagePath);
        }
      }
      
      updateData.imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    console.log('Updating member with data:', updateData);

    const updatedMember = await Member.findByIdAndUpdate(
      memberId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedMember) {
      console.log('Member update failed - no document was updated');
      return res.status(404).json({ 
        error: 'Member not found',
        details: `Failed to update member with ID: ${memberId}`
      });
    }

    console.log('Member updated successfully:', { id: updatedMember._id, name: updatedMember.name });
    res.status(200).json(updatedMember);
  } catch (error) {
    console.error('Error updating member:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to update member',
      details: error.message 
    });
  }
});

// DELETE route to remove a member
router.delete('/:id', async (req, res) => {
  try {
    const memberId = req.params.id;
    console.log('Delete request received for member ID:', memberId);

    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      console.log('Invalid member ID format:', memberId);
      return res.status(400).json({ 
        error: 'Invalid member ID format',
        details: 'The provided ID is not in the correct format'
      });
    }

    // Find the member to get the image path
    const member = await Member.findById(memberId);
    if (!member) {
      console.log('Member not found for deletion:', memberId);
      return res.status(404).json({ 
        error: 'Member not found',
        details: `No member exists with ID: ${memberId}`
      });
    }

    // Delete the member's image file if it exists
    if (member.imageUrl) {
      const imagePath = path.join(__dirname, '../uploads', member.imageUrl.split('/').pop());
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('Deleted image file:', imagePath);
      }
    }

    // Delete the member from the database
    await Member.findByIdAndDelete(memberId);
    console.log('Deleted member from database:', memberId);

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ 
      error: 'Failed to delete member',
      details: error.message 
    });
  }
});

module.exports = router;
