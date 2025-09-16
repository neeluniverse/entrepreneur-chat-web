import React, { useState } from 'react';
import Comment from './Comment';

const Post = ({ post, onUpdate }) => {
  const [comment, setComment] = useState('');
  const token = localStorage.getItem('token');

  const handleLike = async () => {
    await fetch(`/posts/${post.id}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    onUpdate();
  };

  const handleComment = async (e) => {
    e.preventDefault();
    await fetch(`/posts/${post.id}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: comment }),
    });
    setComment('');
    onUpdate();
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <p className="font-bold">{post.user.username}</p>
      <p>{post.content}</p>
      <p className="text-gray-500 text-sm">{new Date(post.createdAt).toLocaleString()}</p>
      
      <div className="mt-2">
        <button onClick={handleLike} className="text-blue-500 mr-4">
          {post.likes.length} Likes
        </button>
      </div>
      
      <div className="mt-4">
        <form onSubmit={handleComment} className="mb-2">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Add a comment"
            required
          />
          <button type="submit" className="bg-blue-500 text-white p-1 rounded mt-1">
            Comment
          </button>
        </form>
        
        {post.comments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
};

export default Post;
