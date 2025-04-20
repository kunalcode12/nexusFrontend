import { useDispatch } from "react-redux";
import Post from "./Post";
import { memo, useCallback } from "react";
import { upvoteContentApi } from "@/store/postSlice";

const Posts = memo(function Posts({ posts, currentUser }) {
  const dispatch = useDispatch();
  const postmain = posts;

  const handleUpvote = useCallback(
    (postId) => {
      try {
        dispatch(upvoteContentApi(postId));
      } catch (error) {
        console.error("Upvote failed:", error);
      }
    },
    [dispatch]
  );

  return (
    <div className="w-2/3 pr-4">
      {postmain.map((post) => (
        <Post
          key={post._id || post.id}
          post={post}
          id={post.user._id}
          name={post.user.name}
          onUpvote={handleUpvote}
          currentUser={currentUser}
        />
      ))}
    </div>
  );
});

export default Posts;
