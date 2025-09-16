const express = require('express');
const auth = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

// Create post
router.post('/', auth, async (req, res) => {
  try {
    const { content } = req.body;

    const post = await prisma.post.create({
      data: {
        content,
        authorId: req.user.id
      },
      include: {
        author: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all posts (for feed)
router.get('/feed', auth, async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        author: {
          followers: {
            some: {
              followerId: req.user.id
            }
          }
        }
      },
      include: {
        author: {
          select: {
            id: true,
            username: true
          }
        },
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Like/unlike post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: req.user.id
        }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          id: existingLike.id
        }
      });
      res.json({ liked: false });
    } else {
      // Like
      await prisma.like.create({
        data: {
          postId,
          userId: req.user.id
        }
      });
      res.json({ liked: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Comment on post
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { content } = req.body;

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: req.user.id
      },
      include: {
        author: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
