import React from "react";

const ConfirmModal = ({ open, onClose, onConfirm }) => {
  if (!open) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        
        <p style={styles.text}>
          Are you sure you want to delete?
        </p>

        <div style={styles.actions}>
          <button style={styles.cancel} onClick={onClose}>
            Cancel
          </button>

          <button style={styles.delete} onClick={onConfirm}>
            Delete
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmModal;

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",   // 🔥 opacity background
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    width: "300px",
    textAlign: "center",
  },

  text: {
    marginBottom: "20px",
    fontSize: "16px",
  },

  actions: {
    display: "flex",
    justifyContent: "space-between",
  },

  cancel: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    background: "#ccc",
    cursor: "pointer",
  },

  delete: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    background: "red",
    color: "#fff",
    cursor: "pointer",
  },
};