import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

function Modal({ children, open, onOpenChange, className = "" }) {
  const dialog = useRef();

  useEffect(() => {
    if (open) {
      dialog.current.showModal();
    } else {
      dialog.current.close();
    }
  }, [open]);

  return createPortal(
    <dialog
      className={`fixed inset-0 bg-black bg-opacity-75 p-4 overflow-auto ${className}`}
      ref={dialog}
      onClick={(e) => {
        if (e.target === dialog.current) {
          onOpenChange(false);
        }
      }}
    >
      <div className="bg-white rounded-lg max-w-5xl mx-auto my-8 flex">
        {children}
      </div>
    </dialog>,
    document.getElementById("modal")
  );
}

export default Modal;
