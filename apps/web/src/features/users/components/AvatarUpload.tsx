import { LoadingOutlined, UploadOutlined } from "@ant-design/icons";
import { message, Upload } from "antd";

const MAX_FILE_SIZE_MB = 10;

const AvatarUpload = ({
  avatarUrl,
  onUpload,
  isUploading,
}: {
  avatarUrl?: string;
  onUpload: (file: File) => void;
  isUploading: boolean;
}) => {
  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ chấp nhận file hình ảnh (JPG, PNG, ...)");
      return Upload.LIST_IGNORE;
    }

    const isLtSize = file.size / 1024 / 1024 <= MAX_FILE_SIZE_MB;
    if (!isLtSize) {
      message.error(`Kích thước file tối đa là ${MAX_FILE_SIZE_MB}MB`);
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  return (
    <Upload
      showUploadList={false}
      accept="image/*"
      customRequest={({ file, onSuccess }) => {
        if (!file) return;
        onUpload(file as File);
        onSuccess?.({}, file);
      }}
      beforeUpload={beforeUpload}
      disabled={isUploading}
    >
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: "50%",
          overflow: "hidden",
          border: "4px solid #fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          position: "relative",
          cursor: isUploading ? "not-allowed" : "pointer",
        }}
      >
        <img
          src={avatarUrl || "https://joeschmoe.io/api/v1/random"}
          alt="avatar"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 20,
            opacity: 0,
            transition: "opacity 0.3s",
            borderRadius: "50%",
          }}
          className="avatar-overlay"
        >
          <UploadOutlined />
        </div>

        {/* Spinner */}
        {isUploading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              backgroundColor: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 20,
            }}
          >
            <LoadingOutlined style={{ fontSize: 24, color: "#fff" }} spin />
          </div>
        )}
      </div>
    </Upload>
  );
};

export default AvatarUpload;
