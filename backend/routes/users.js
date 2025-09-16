const express = require('express');
const auth = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

// Follow/unfollow user
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const followingId = parseInt(req.params.id);

    if (req.user.id === followingId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user.id,
          followingId
        }
      }
    });

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: {
          id: existingFollow.id
        }
      });
      res.json({ following: false });
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId: req.user.id,
          followingId
        }
      });
      res.json({ following: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
router.get('/:id', auth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        posts: {
          include: {
            likes: true,
            comments: {
              include: {
                author: {
                  select: {
                    id: true,
                    username: true
                  }
                }
              }
            }
          }
        },
        followers: true,
        following: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
