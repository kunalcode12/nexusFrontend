import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "./UI/dialog";
import { Button } from "./UI/Button";

const ShareDialog = ({
  isOpen,
  onClose,
  url,
  title = "Share",
  message = "Share this content",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">{message}</h3>
          <div className="flex items-center space-x-2">
            <div className="flex-1 p-3 bg-gray-100 rounded-lg text-sm text-gray-600 break-all">
              {url}
            </div>
            <Button
              onClick={handleCopyUrl}
              className={`px-4 py-2 rounded-lg transition-colors ${
                copied
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white`}
            >
              {copied ? (
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4" />
                  <span>Copied!</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
