import React from "react";
import {
  X,
  MessageCircle,
  Link2,
  UserPlus,
  Instagram,
} from "lucide-react";
import { toast } from "react-hot-toast"; 

const ShareModal = ({ postId, onClose }) => {
  const postUrl = `${window.location.origin}/reel/${postId}`;

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(postUrl)}`;
    window.open(url, "_blank");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      toast.success("Link copied!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleInstagram = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      window.open("https://www.instagram.com/", "_blank");
      toast.success("Link copied! Paste it on Instagram.");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <span>Share</span>
          <X onClick={onClose} style={styles.close} />
        </div>

        <div style={styles.grid}>
          <ShareItem
            icon={<MessageCircle />}
            label="WhatsApp"
            onClick={handleWhatsApp}
          />

          <ShareItem
            icon={<Instagram />}
            label="Instagram"
            onClick={handleInstagram}
          />

          <ShareItem
            icon={<Link2 />}
            label="Copy Link"
            onClick={handleCopy}
          />

          <ShareItem icon={<UserPlus />} label="Profile" />
        </div>
      </div>
    </div>
  );
};

const ShareItem = ({ icon, label, onClick }) => (
  <div style={styles.item} onClick={onClick}>
    <div style={styles.icon}>{icon}</div>
    <div style={styles.text}>{label}</div>
  </div>
);

export default ShareModal;

/* STYLES */
const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  modal: {
    width: "380px",
    background: "#fff",
    borderRadius: "12px",
    padding: "16px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
    fontWeight: "600",
  },

  close: {
    cursor: "pointer",
  },

  grid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    justifyContent: "space-between",
  },

  item: {
    width: "30%",
    textAlign: "center",
    cursor: "pointer",
  },

  icon: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "#f0f2f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "auto",
  },

  text: {
    fontSize: "12px",
    marginTop: "6px",
  },
};