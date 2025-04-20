import { useCallback, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/UI/Avatar";
import { Button } from "../components/UI/Button";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/UI/Tabs";
import { UserX, Users, MessageCircle } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import {
  fetchUserData,
  resetStatus,
  setProfileImage,
} from "../store/authSlice";
import { useEffect } from "react";
import LoadingBar from "../components/UI/LoadingBar";

import { Outlet } from "react-router-dom";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";
import {
  followUser,
  getFollowers,
  getFollowing,
  unfollowUser,
} from "@/store/followSlice";
import UserMainContent from "@/components/UserMainContent";
import ProfileImageDialog from "@/components/ProfileImageDialog";
import mediaService from "@/services/mediaService";

export default function UserProfile() {
  const location = useLocation();
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { user, profileUser, loading, error, updateProfileSuccess } =
    useSelector((state) => state.auth);

  const profilePicture = useSelector(
    (state) =>
      state.auth.profilePicture ||
      state.auth.profileUser?.userData?.profilePicture
  );

  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowDialog, setShowFollowDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("followers");
  const [followInProgress, setFollowInProgress] = useState(false);
  const [isProfileImageDialogOpen, setIsProfileImageDialogOpen] =
    useState(false);

  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const handleCreateNewProfileImage = async (file) => {
    if (!file) return;

    try {
      setIsImageUploading(true);
      const response = await mediaService.createProfilePicture(file);

      if (response.status === "success") {
        dispatch(setProfileImage(response.data.user.profilePicture));
        setIsProfileImageDialogOpen(false);
        // dispatch(fetchUserData(userId, token));
      }
    } catch (error) {
      setIsProfileImageDialogOpen(false);
      console.error("Error creating profile picture:", error);
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleUpdateProfileImage = async (file) => {
    if (!file) return;

    try {
      setIsImageUploading(true);
      const response = await mediaService.updateMedia(
        null,
        file,
        "image",
        null,
        true
      );

      if (response.status === "success") {
        console.log(response);
        dispatch(setProfileImage(response.data.user.profilePicture));
        setIsProfileImageDialogOpen(false);
        // dispatch(fetchUserData(userId, token));
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      setIsProfileImageDialogOpen(false);
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleDeleteProfileImage = async () => {
    try {
      setIsDeletingImage(true);
      const response = await mediaService.deleteMedia(null, true);
      console.log(response);

      if (response.success) {
        dispatch(setProfileImage(null));
        setIsProfileImageDialogOpen(false);
      }
    } catch (error) {
      console.error("Error deleting profile picture:", error);
      setIsProfileImageDialogOpen(false);
    } finally {
      setIsDeletingImage(false);
    }
  };

  const handleProfileImageSelect = useCallback(
    async (file) => {
      // Check if we have a profile picture in either profileUser or profilePicture
      const hasProfilePicture = Boolean(
        profileUser?.userData?.avatar || profilePicture
      );

      if (hasProfilePicture) {
        await handleUpdateProfileImage(file);
      } else {
        await handleCreateNewProfileImage(file);
      }
    },
    [profileUser, profilePicture]
  );

  useEffect(() => {
    if (updateProfileSuccess) {
      const redirectTimer = setTimeout(() => {
        // Reset the success state to prevent multiple redirects
        dispatch(resetStatus());
      }, 2000);

      return () => clearTimeout(redirectTimer);
    }
  }, [updateProfileSuccess, dispatch]);

  useEffect(() => {
    dispatch(getFollowers(userId));
    dispatch(getFollowing(userId));
  }, [dispatch, userId]);

  const { followers, following, success, isError } = useSelector(
    (state) => state.follow
  );

  useEffect(() => {
    if (followers && followers.length > 0 && user?._id) {
      // Using some() to check if user exists in followers array
      const isUserFollowing = followers.some(
        (follower) => follower._id === user._id
      );

      setIsFollowing(isUserFollowing);
    }
  }, [followers, user?._id]);

  const handleFollowToggle = () => {
    if (followInProgress) return; // Prevent multiple clicks while request is in progress

    try {
      setFollowInProgress(true);

      if (isFollowing) {
        dispatch(unfollowUser(userId, user));
      } else {
        dispatch(followUser(userId, user));
      }

      // Only update local state after successful API call

      setIsFollowing(!isFollowing);

      // Refresh followers list
      // dispatch(getFollowers(userId));
    } catch (error) {
      console.error("Error toggling follow status:", error);
      // Revert local state if the API call fails
      setIsFollowing(isFollowing);
    } finally {
      setFollowInProgress(false);
    }
  };

  const handleClick = (userID) => {
    navigate(`/user/${userID}`);
    setShowFollowDialog(false);
  };

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserData(userId, token));
    }
  }, [userId, token, dispatch]);

  const isLoggedInUserProfile = user?._id === userId;
  const renderData = profileUser;

  const FollowButton = () => (
    <Button
      onClick={handleFollowToggle}
      disabled={followInProgress}
      className={`${
        isFollowing
          ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
          : "bg-blue-600 text-white hover:bg-blue-700"
      } transition-colors px-6 py-2 rounded-full font-medium ${
        followInProgress ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {followInProgress
        ? "Processing..."
        : isFollowing
        ? "Following"
        : "Follow"}
    </Button>
  );

  const UserList = ({ users }) => (
    <div className="space-y-4 overflow-y-auto max-h-[60vh] px-2">
      {users.map((follower) => {
        const isCurrentUserFollowing = following.some(
          (f) => f._id === follower._id
        );

        return (
          <div
            key={follower._id}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={follower.avatar || "/placeholder.svg"}
                  alt={follower.name}
                />
                <AvatarFallback>
                  {follower.name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{follower.name}</p>
                {/* <p className="text-sm text-gray-500">@{follower.username}</p> */}
              </div>
            </div>
            {user._id !== follower._id && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full hover:bg-gray-100"
                onClick={() => handleClick(follower._id)}
              >
                View Profile
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );

  const FollowersSection = () => (
    <div className="flex space-x-4 text-sm text-gray-600">
      <Button
        variant="ghost"
        className="hover:bg-gray-100 rounded-lg space-x-2"
        onClick={() => {
          setActiveTab("followers");
          setShowFollowDialog(true);
        }}
      >
        <Users className="w-4 h-4" />
        <span className="font-semibold">{followers.length}</span>
        <span className="text-gray-600">followers</span>
      </Button>
      <Button
        variant="ghost"
        className="hover:bg-gray-100 rounded-lg space-x-2"
        onClick={() => {
          setActiveTab("following");
          setShowFollowDialog(true);
        }}
      >
        <Users className="w-4 h-4" />
        <span className="font-semibold">{following.length}</span>
        <span className="text-gray-600">following</span>
      </Button>
    </div>
  );

  const FollowDialog = () => (
    <Dialog open={showFollowDialog} onOpenChange={setShowFollowDialog}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-center">
            {renderData.name}s Connections
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers">
              Followers ({followers.length})
            </TabsTrigger>
            <TabsTrigger value="following">
              Following ({following.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="followers" className="mt-4">
            <UserList users={followers} />
          </TabsContent>
          <TabsContent value="following" className="mt-4">
            <UserList users={following} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );

  if (loading) return <LoadingBar />;
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <UserX className="w-16 h-16 text-gray-400 mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Profile Not Found
          </h2>
          <p className="text-gray-600">We couldnt find this user profile.</p>
          <Link to="/">
            <Button
              variant="outline"
              className="mt-4 hover:bg-gray-100 transition-colors"
            >
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen pt-12 pl-52">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-white shadow-xl hover:shadow-2xl transition-shadow">
                  <div
                    onClick={() => setIsProfileImageDialogOpen(true)}
                    className={"cursor-pointer"}
                  >
                    {profilePicture ? (
                      <AvatarImage
                        src={
                          profilePicture ||
                          "/placeholder.svg?height=96&width=96"
                        }
                        alt={renderData.userData.name}
                      />
                    ) : (
                      <AvatarImage
                        src={
                          renderData.userData.avatar ||
                          "/placeholder.svg?height=96&width=96"
                        }
                        alt={renderData.userData.name}
                      />
                    )}

                    <AvatarFallback className="text-2xl">
                      {renderData.userData.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </div>
                </Avatar>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">{`u/${renderData.userData.name}`}</h1>
                <FollowersSection />
              </div>
            </div>

            <div className="mt-4 md:mt-0 flex space-x-3">
              {!isLoggedInUserProfile && (
                <>
                  <FollowButton />
                  {/* <Button
                    variant="outline"
                    className="rounded-full px-6 hover:bg-gray-100 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button> */}
                </>
              )}
              {isLoggedInUserProfile && (
                <Link to={`${location.pathname}/profile`}>
                  <Button
                    variant="outline"
                    className="rounded-full px-6 hover:bg-gray-100 transition-colors"
                  >
                    Edit Profile
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <UserMainContent />
      <Outlet />
      <FollowDialog />
      <ProfileImageDialog
        initialImage={profilePicture}
        isOpen={isProfileImageDialogOpen}
        onClose={() => setIsProfileImageDialogOpen(false)}
        onImageSelect={handleProfileImageSelect}
        onDeleteImage={handleDeleteProfileImage}
        updateSuccess={updateProfileSuccess}
        userId={userId}
        isLoading={isImageUploading}
        isDeletingImage={isDeletingImage}
      />
    </div>
  );
}
