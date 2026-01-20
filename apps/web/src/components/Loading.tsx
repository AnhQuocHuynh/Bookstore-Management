import React from "react";

interface LoadingProps {
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({ text = "Loading..." }) => {
  return (
    <div style={styles.wrapper}>
      <div style={styles.spinner} />
      <p style={styles.text}>{text}</p>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    width: "100%",
    height: "100%", // 👈 full height component cha
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center", // 👈 căn giữa
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  text: {
    marginTop: "8px",
    fontSize: "14px",
    color: "#6b7280",
  },
};

export default Loading;
