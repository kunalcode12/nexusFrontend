import { Cake, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./UI/CardComp";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./UI/Tabs";
import UserPost from "./UserPost";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect } from "react";
import {
  setBookMarkedPost,
  setPosts,
  upvoteContentApi,
} from "@/store/postSlice";
import { useParams } from "react-router-dom";

export default function UserMainContent() {
  const { userId } = useParams();
  const dispatch = useDispatch();

  const { user, profileUser, loading, error } = useSelector(
    (state) => state.auth
  );

  const isLoggedInUserProfile = user?._id === profileUser?.userData.Id;
  const renderData = profileUser;

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

  useEffect(() => {
    if (renderData) {
      dispatch(setPosts(renderData.contents));
    }
  }, [renderData, dispatch]);

  const selectPostState = (state) => state.post;
  const { posts, bookMarkedPost } = useSelector(selectPostState);

  useEffect(() => {
    if (
      profileUser?.bookmarkedContents &&
      profileUser.bookmarkedContents.length > 0
    ) {
      dispatch(setBookMarkedPost(profileUser.bookmarkedContents));
    }
  }, [profileUser?.bookmarkedContents, dispatch]);

  const renderUserPost = useCallback(
    (post, isBookmarkedPost = false) => {
      const postUserId = isBookmarkedPost
        ? post.user?._id
        : renderData?.userData.Id;
      const postUserName = isBookmarkedPost
        ? post.user.name
        : renderData?.userData.name;

      return (
        <UserPost
          key={post?._id}
          post={post}
          id={postUserId}
          name={postUserName}
          isbookMarkedPost={isBookmarkedPost}
          onUpvote={handleUpvote}
          currentUser={user}
        />
      );
    },
    [renderData?.userData, user, handleUpvote]
  );

  return (
    <main className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
      <div className="md:w-2/3">
        <Tabs defaultValue="overview" className="w-full">
          {isLoggedInUserProfile && (
            <TabsList className="w-full justify-start bg-white rounded-lg h-12 mb-6">
              <TabsTrigger value="overview" className="px-8">
                OVERVIEW
              </TabsTrigger>
              <TabsTrigger value="saved" className="px-8">
                SAVED
              </TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="overview" className="space-y-4">
            {renderData?.contents && renderData.contents.length > 0 ? (
              posts.map((post) => renderUserPost(post))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-500">No posts yet</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            {profileUser?.bookmarkedContents &&
            profileUser.bookmarkedContents.length > 0 ? (
              bookMarkedPost.map((post) => renderUserPost(post, true))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-500">No saved content</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="md:w-1/3 space-y-6">
        <Card>
          <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardTitle className="flex items-center">
              <Cake className="w-5 h-5 mr-2" />
              Cake day
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center text-gray-700">
              <Calendar className="w-5 h-5 mr-3 text-purple-500" />
              <span>May 24, 2018</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
