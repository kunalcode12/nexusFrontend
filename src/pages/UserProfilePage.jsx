import { useCallback, useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "../components/UI/Button";
import { Input } from "../components/UI/Input";
import { Label } from "../components/UI/Label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/UI/Alerts";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import {
  updateUserProfile,
  updateUserProfilePassword,
  deleteUser,
} from "../store/userUpdateSlice";
import { useNavigate, useParams } from "react-router-dom";
import { fetchUserData } from "@/store/authSlice";

export default function UserProfile() {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const user = useSelector(useCallback((state) => state.auth.profileUser, []));

  const { loading, error, isSuccessUpdate, isSuccessDelete, isErrorUpdate } =
    useSelector(useCallback((state) => state.userUpdate, []));

  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState(user?.userData?.name);
  const [email, setEmail] = useState(user?.userData?.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const fields = useMemo(() => ["name", "email"], []);

  const handleUpdate = useCallback(
    (field) => {
      console.log(`Updating ${field}`);
      field === "name"
        ? dispatch(updateUserProfile({ name: name }))
        : dispatch(updateUserProfile({ email: email }));
    },
    [dispatch, email, name]
  );

  const handleDeleteAccount = useCallback(() => {
    dispatch(deleteUser());

    console.log("Deleting account");
  }, [dispatch]);

  const handleInputChange = useCallback((field, value) => {
    switch (field) {
      case "name":
        setName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "currentPassword":
        setCurrentPassword(value);
        break;
      case "newPassword":
        setNewPassword(value);
        break;
    }
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleUpdatePassword = useCallback(() => {
    console.log("Updating password");
    dispatch(
      updateUserProfilePassword({
        passwordCurrent: currentPassword,
        password: newPassword,
        passwordConfirm: newPassword,
      })
    );
  }, [currentPassword, newPassword, dispatch]);

  useEffect(() => {
    if (loading) {
      // Show loading spinner or disable buttons
    }
  }, [loading]);

  // Add error handling
  useEffect(() => {
    if (isErrorUpdate) {
      // Show error message to user
      alert(`Failed to delete account: ${error}`);
    }
  }, [isErrorUpdate, error]);

  ///////////////////////////////////////////////////////////
  //Jsx below
  const renderProfileFields = () => (
    <>
      {fields.map((field) => (
        <div key={field} className="space-y-2">
          <Label htmlFor={field} className="text-sm font-medium text-gray-700">
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </Label>
          <div className="relative">
            {field === "name" && (
              <User
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
            )}
            {field === "email" && (
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
            )}
            <Input
              id={field}
              type="text"
              value={field === "name" ? name : email}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="pl-10 pr-24 p-2 w-[590px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            />
            <Button
              onClick={() => handleUpdate(field)}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 px-3 py-1 text-xs bg-black text-white"
            >
              {loading ? "Updating..." : "Update"}
            </Button>
          </div>
        </div>
      ))}
    </>
  );

  const renderPasswordUpdateFields = () => (
    <>
      {["currentPassword", "newPassword"].map((field) => (
        <div key={field} className="space-y-2">
          <Label htmlFor={field} className="text-sm font-medium text-gray-700">
            {field === "currentPassword" ? "Current Password" : "New Password"}
          </Label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <Input
              id={field}
              type={showPassword ? "text" : "password"}
              value={
                field === "currentPassword" ? currentPassword : newPassword
              }
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="pl-10 pr-24 p-2 w-[590px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            />
            <button
              onClick={togglePasswordVisibility}
              className="absolute right-24 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      ))}
      <Button
        onClick={handleUpdatePassword}
        className="px-3 py-1 text-xs bg-black text-white mt-4"
      >
        {loading ? "Updating Password..." : "Update Password"}
      </Button>
    </>
  );

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="flex">
        <aside className="w-64 bg-white shadow-md mr-8 opacity-0"></aside>

        <main className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Profile Information
          </h1>

          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {["profile", "updatePassword"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  {tab === "profile" ? "Profile" : "Update Password"}
                </button>
              ))}
            </nav>
          </div>

          <div className="space-y-8 max-w-2xl">
            {activeTab === "profile"
              ? renderProfileFields()
              : renderPasswordUpdateFields()}

            {activeTab === "profile" && (
              <>
                <hr className="border-gray-200 my-8" />

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Danger Zone
                  </h2>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className={"bg-red-600 text-white"}
                      >
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your account and remove your data from our
                          servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className={"bg-red-500 text-white"}
                        >
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
