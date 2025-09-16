import React from 'react';

const Comment = ({ comment }) => {
  return (
    <div className="bg-gray-100 p-2 rounded mt-2">
      <p className="font-bold text-sm">{comment.user.username}</p>
      <p className="text-sm">{comment.content}</p>
      <p className="text-gray-500 text-xs">{new Date(comment.createdAt).toLocaleString()}</p>
    </div>
  );
};

export default Comment;
