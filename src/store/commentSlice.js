import { createSlice } from "@reduxjs/toolkit";
import { incrementCommentCount, decrementCommentCount } from "./postSlice";

const initialCommentState = {
  comments: [],
  loading: false,
  isError: false,
  success: false,
  errorMessage: "",
  successMessage: "",
  upvoteLoading: false,

  commentVotes: [],
  replyVotes: [],
};

export const commentSlice = createSlice({
  name: "Comments",
  initialState: initialCommentState,
  reducers: {
    setComments: (state, action) => {
      state.comments = action.payload
        .map((comment) => ({
          ...comment,
          // If comment is deleted and has no replies, remove it
          ...(comment.isDeleted && comment.replies.length === 0
            ? null
            : {
                userId: {
                  _id: comment.userId._id,
                  name: comment.userId.name,
                  email: comment.userId.email,
                  profilePicture: comment.userId.profilePicture,
                },
                // Replace comment text with "Comment deleted" if isDeleted is true
                comment: comment.isDeleted
                  ? "Comment deleted"
                  : comment.comment,
                replies: comment.replies.map((reply) => ({
                  ...reply,
                  userId: {
                    _id: reply.userId._id,
                    name: reply.userId.name,
                    email: reply.userId.email,
                    id: reply.userId.id,
                    profilePicture: reply.userId.profilePicture,
                  },
                })),
              }),
        }))
        .filter(Boolean); // Remove null entries
    },

    setUserVotes: (state, action) => {
      // Handle comment votes - ensure commentId is properly extracted
      state.commentVotes = action.payload.commentVotes
        .map((vote) => ({
          commentId: vote.commentId?._id || vote.commentId, // Handle both nested and direct ID cases
          voteType: vote.voteType,
          userId: vote.userId,
        }))
        .filter((vote) => vote.commentId !== null); // Filter out any votes with null commentId

      // Handle reply votes
      state.replyVotes = action.payload.replyVotes.map((vote) => ({
        replyId: vote.replyId,
        voteType: vote.voteType,
        userId: vote.userId,
      }));
    },

    addComment: (state, action) => {
      state.comments.push({
        ...action.payload,
        replies: [],
        upVote: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __v: 0,
      });
    },

    removeComment: (state, action) => {
      const comment = state.comments.find((c) => c._id === action.payload);

      if (comment) {
        // If comment has replies, mark as deleted
        if (comment.replies && comment.replies.length > 0) {
          comment.isDeleted = true;
          comment.comment = "Comment deleted";
        } else {
          // If no replies, remove the comment completely
          state.comments = state.comments.filter(
            (comment) => comment._id !== action.payload
          );
        }

        // Remove associated votes when comment is deleted
        state.commentVotes = state.commentVotes.filter(
          (vote) => vote.commentId !== action.payload
        );
      }
    },

    addReply: (state, action) => {
      const { commentId, reply } = action.payload;
      const comment = state.comments.find((c) => c._id === commentId);
      if (comment) {
        // Initialize replies array if it doesn't exist
        if (!comment.replies) comment.replies = [];

        // Check if this reply ID already exists
        const replyExists = comment.replies.some((r) => r._id === reply._id);

        // Only add the reply if it doesn't already exist
        if (!replyExists) {
          comment.replies.push({
            _id: reply._id,
            commentId: reply.commentId,
            reply: reply.reply,
            upVoteReply: reply.upVoteReply || 0,
            createdAt: reply.createdAt,
            id: reply._id,
            userId: {
              _id: reply.userId._id,
              name: reply.userId.name,
              email: reply.userId.email,
              id: reply.userId.id,
              profilePicture: reply.userId.profilePicture,
            },
          });
        }
      }
    },

    removeReply: (state, action) => {
      const { commentId, replyId } = action.payload;
      const comment = state.comments.find((c) => c._id === commentId);
      if (comment && comment.replies && comment.replies.length > 0) {
        // Remove the specific reply
        comment.replies = comment.replies.filter(
          (reply) => reply._id !== replyId
        );

        // Remove associated votes when reply is deleted
        state.replyVotes = state.replyVotes.filter(
          (vote) => vote.replyId !== replyId
        );

        // If the comment is deleted and has no more replies, remove it completely
        if (comment.isDeleted && comment.replies.length === 0) {
          state.comments = state.comments.filter((c) => c._id !== commentId);
        }
      }
    },

    updateCommentVote: (state, action) => {
      const { commentId, voteType, userId } = action.payload;
      const comment = state.comments.find((c) => c._id === commentId);

      if (comment) {
        // Update vote count
        if (action.payload.message === "upvote removed successfull") {
          comment.upVote = Math.max(0, (comment.upVote || 0) - 1);
          // Remove vote from userVotes
          state.commentVotes = state.commentVotes.filter(
            (vote) => vote.commentId !== commentId
          );
        } else {
          comment.upVote = (comment.upVote || 0) + 1;
          // Add or update vote in userVotes
          const existingVoteIndex = state.commentVotes.findIndex(
            (vote) => vote.commentId === commentId
          );

          if (existingVoteIndex >= 0) {
            state.commentVotes[existingVoteIndex] = {
              commentId,
              voteType,
              userId,
            };
          } else {
            state.commentVotes.push({
              commentId,
              voteType,
              userId,
            });
          }
        }
      }
    },

    updateReplyVote: (state, action) => {
      const { commentId, replyId, voteType, userId } = action.payload;
      const comment = state.comments.find((c) => c._id === commentId);

      if (comment) {
        const reply = comment.replies.find((r) => r._id === replyId);
        if (reply) {
          // Update vote count
          if (action.payload.message === "upvote removed successfully") {
            reply.upVoteReply = Math.max(0, (reply.upVoteReply || 0) - 1);
            // Remove vote from userVotes
            state.replyVotes = state.replyVotes.filter(
              (vote) => vote.replyId !== replyId
            );
          } else {
            reply.upVoteReply = (reply.upVoteReply || 0) + 1;
            // Add or update vote in userVotes
            const existingVoteIndex = state.replyVotes.findIndex(
              (vote) => vote.replyId === replyId
            );

            if (existingVoteIndex >= 0) {
              state.replyVotes[existingVoteIndex] = {
                replyId,
                voteType,
                userId,
              };
            } else {
              state.replyVotes.push({
                replyId,
                voteType,
                userId,
              });
            }
          }
        }
      }
    },

    setUpvoteLoading: (state, action) => {
      state.upvoteLoading = action.payload;
    },

    setSuccess: (state, action) => {
      state.success = true;
      state.successMessage = action.payload;
      state.isError = false;
      state.errorMessage = "";
    },
    setError: (state, action) => {
      state.isError = true;
      state.errorMessage = action.payload;
      state.success = false;
      state.successMessage = "";
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    resetStatus: (state) => {
      state.success = false;
      state.isError = false;
      state.successMessage = "";
      state.errorMessage = "";
    },
  },
});

export const {
  setComments,
  addComment,
  removeComment,
  addReply,
  removeReply,
  setError,
  setLoading,
  setSuccess,
  resetStatus,
  updateCommentVote,
  updateReplyVote,
  setUpvoteLoading,
  setUserVotes,
} = commentSlice.actions;

// Get all comments
export const getComments = (postId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(
      `https://nexusbackend-ff1v.onrender.com/api/v1/comment/getComments/${postId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch comments");
    }
    dispatch(setComments(data.data.data));
    dispatch(setSuccess("Comments fetched successfully"));
    dispatch(setLoading(false));
    return data;
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

// Create a new comment
export const createComment = (postId, content) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(
      `https://nexusbackend-ff1v.onrender.com/api/v1/comment/${postId}/createComment`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment: content }),
      }
    );
    const data = await response.json();
    console.log(data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to create comment");
    }

    dispatch(addComment(data.data.data));
    dispatch(incrementCommentCount(postId));
    dispatch(setSuccess("Comment created successfully"));
    dispatch(setLoading(false));
    return data;
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

// Delete a comment
export const deleteComment = (commentId, postId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(
      `https://nexusbackend-ff1v.onrender.com/api/v1/comment/getComment/${commentId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete comment");
    }

    console.log(data.data);

    // If comment is marked as deleted due to existing replies
    if (
      data.data.message === "Comment marked as deleted due to existing replies"
    ) {
      // Update the comment in the state to show as deleted
      dispatch(removeComment(commentId));
    } else {
      // If comment is completely removed
      dispatch(removeComment(commentId));
      dispatch(decrementCommentCount(postId));
    }

    dispatch(setSuccess("Comment deleted successfully"));
    dispatch(setLoading(false));
    return data;
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

// Reply to a comment
export const replyToComment = (commentId, content) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(
      `https://nexusbackend-ff1v.onrender.com/api/v1/comment/reply/${commentId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reply: content }),
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to reply to comment");
    }

    const updatedComment = data.data.reply;

    const newReply = updatedComment.replies[updatedComment.replies.length - 1];
    console.log(newReply);

    dispatch(
      addReply({
        commentId: updatedComment._id,
        reply: newReply,
      })
    );

    dispatch(setSuccess("Reply added successfully"));
    return data;
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export const deleteReply = (commentId, replyId, postId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(
      `https://nexusbackend-ff1v.onrender.com/api/v1/comment/${commentId}/reply/${replyId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete reply");
    }

    if (data.data.message === "Last reply deleted and comment removed") {
      dispatch(removeReply({ commentId, replyId }));
      dispatch(decrementCommentCount(postId));
      dispatch(setSuccess("Reply deleted successfully"));
    } else {
      dispatch(removeReply({ commentId, replyId }));
      dispatch(setSuccess("Reply deleted successfully"));
    }

    return data;
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export const upvoteComment = (commentId) => async (dispatch) => {
  try {
    dispatch(setUpvoteLoading(true));
    const response = await fetch(
      `https://nexusbackend-ff1v.onrender.com/api/v1/votes/commentVote/${commentId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voteType: "upvote" }),
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to upvote comment");
    }

    dispatch(
      updateCommentVote({
        commentId,
        userId: data.data.data.userId,
        message: data.data.message,
        voteType: data.data.data.voteType,
      })
    );

    dispatch(setSuccess(data.data.message));
    return data;
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setUpvoteLoading(false));
  }
};

export const getUserVotes = (userId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(
      `https://nexusbackend-ff1v.onrender.com/api/v1/votes/userCommentVotes/${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch user votes");
    }
    console.log(data.data);

    dispatch(setUserVotes(data.data));
    dispatch(setLoading(false));
    dispatch(setSuccess(true));
    return data;
  } catch (error) {
    dispatch(setError(error.message));
    dispatch(setLoading(false));
  }
};

export const upvoteReply = (commentId, replyId) => async (dispatch) => {
  try {
    dispatch(setUpvoteLoading(true));
    const response = await fetch(
      `https://nexusbackend-ff1v.onrender.com/api/v1/votes/comments/${commentId}/replies/${replyId}/vote`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voteType: "upvote" }),
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to upvote reply");
    }

    dispatch(
      updateReplyVote({
        commentId,
        replyId,
        userId: data.data.data.userId,
        message: data.data.message,
        voteType: data.data.data.voteType,
      })
    );

    dispatch(setSuccess(data.data.message));
    return data;
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setUpvoteLoading(false));
  }
};

export default commentSlice.reducer;
