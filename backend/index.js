const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/auth/signup', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.status(201).json({ token });
  } catch (error) {
    res.status(400).json({ error: 'User already exists' });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
  res.json({ token });
});

// Posts routes
app.get('/posts', authenticateToken, async (req, res) => {
  const posts = await prisma.post.findMany({
    include: {
      user: { select: { username: true } },
      comments: { include: { user: { select: { username: true } } } },
      likes: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(posts);
});

app.post('/posts', authenticateToken, async (req, res) => {
  const { content } = req.body;
  const post = await prisma.post.create({
    data: {
      content,
      userId: req.user.userId,
    },
  });
  res.status(201).json(post);
});

// Comment routes
app.post('/posts/:id/comment', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  const comment = await prisma.comment.create({
    data: {
      content,
      postId: id,
      userId: req.user.userId,
    },
    include: { user: { select: { username: true } } },
  });
  res.status(201).json(comment);
});

// Like routes
app.post('/posts/:id/like', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  const existingLike = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId: id } },
  });

  if (existingLike) {
    await prisma.like.delete({ where: { id: existingLike.id } });
    res.json({ liked: false });
  } else {
    await prisma.like.create({
      data: { userId, postId: id },
    });
    res.json({ liked: true });
  }
});

// Follow routes
app.post('/users/:id/follow', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const followerId = req.user.userId;

  if (id === followerId) {
    return res.status(400).json({ error: 'Cannot follow yourself' });
  }

  const existingFollow = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId: id } },
  });

  if (existingFollow) {
    await prisma.follow.delete({ where: { id: existingFollow.id } });
    res.json({ followed: false });
  } else {
    await prisma.follow.create({
      data: { followerId, followingId: id },
    });
    res.json({ followed: true });
  }
});

// Feed route
app.get('/feed', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  const followingIds = following.map(f => f.followingId);

  const posts = await prisma.post.findMany({
    where: { userId: { in: followingIds } },
    include: {
      user: { select: { username: true } },
      comments: { include: { user: { select: { username: true } } } },
      likes: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(posts);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
