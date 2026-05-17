import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "#080b14",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            width: 156,
            height: 156,
            background: "linear-gradient(135deg, #0f1f35 0%, #0d1520 100%)",
            borderRadius: 32,
            border: "1px solid #1c2a3a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 90, lineHeight: 1 }}>⚽</span>
        </div>
      </div>
    ),
    { width: 180, height: 180 }
  );
}
