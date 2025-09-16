import React, { useState, useEffect } from 'react';
import Post from '../components/Post';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/posts', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setPosts(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    await fetch('/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
    setContent('');
    fetchPosts();
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5">Feed</h1>
      <form onSubmit={handleSubmit} className="mb-5">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="What's on your mind?"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-2">
          Post
        </button>
      </form>
      <div>
        {posts.map((post) => (
          <Post key={post.id} post={post} onUpdate={fetchPosts} />
        ))}
      </div>
    </div>
  );
};

export default Feed;
