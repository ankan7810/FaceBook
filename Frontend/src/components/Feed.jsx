import React from "react";
import { useSelector } from "react-redux";
import PostCard from "./PostCard ";
import CreatePost from "./CreatePost";

const Feed = () => {
  const { posts, loading } = useSelector((state) => state.post);

  return (
    <div>
      <CreatePost />

      {loading && <p>Loading...</p>}

      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
};

export default Feed;