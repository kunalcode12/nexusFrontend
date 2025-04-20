import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/UI/dialog";
import { Button } from "@/components/UI/Button";
import { ImagePlus, X, Loader2, Trash2 } from "lucide-react";
import { useSelector } from "react-redux";

const ProfileImageDialog = ({
  isOpen,
  onClose,
  onImageSelect,
  onDeleteImage,
  updateSuccess,
  userId,
  isLoading,
  isDeletingImage,
  initialImage,
}) => {
  const [previewImage, setPreviewImage] = useState(initialImage || null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const user = useSelector((state) => state.auth.user);

  const isCurrentUser = user && user._id === userId;

  useEffect(() => {
    if (updateSuccess) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [updateSuccess, onClose]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSetProfileImage = () => {
    if (imageFile) {
      onImageSelect(imageFile);
    }
  };

  const clearSelection = () => {
    setPreviewImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Profile Picture</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isCurrentUser ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewImage ? (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="mx-auto max-h-64 rounded-lg"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearSelection();
                    }}
                    className="absolute top-2 right-2 p-1 bg-gray-800 bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="py-8">
                  <ImagePlus className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    Click to select an image or drag and drop here
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="border-2 border-gray-300 rounded-lg p-4 text-center">
              <img
                src={initialImage || "default-image-url.jpg"}
                alt="Profile"
                className="mx-auto max-h-64 rounded-lg"
              />
            </div>
          )}

          {isCurrentUser && (
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          )}
        </div>

        {isCurrentUser && (
          <DialogFooter className="flex justify-between">
            <div>
              {initialImage && (
                <Button
                  variant="destructive"
                  onClick={onDeleteImage}
                  className="rounded-full px-6"
                  disabled={isDeletingImage}
                >
                  {isDeletingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="rounded-full px-6"
                disabled={isLoading || isDeletingImage}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSetProfileImage}
                disabled={!previewImage || isLoading}
                className="rounded-full px-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Set Profile Picture"
                )}
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProfileImageDialog;
