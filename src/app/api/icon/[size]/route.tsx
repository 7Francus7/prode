import { ImageResponse } from "next/og";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size: sizeStr } = await params;
  const size = parseInt(sizeStr) || 192;
  const fontSize = Math.round(size * 0.52);
  const pad = Math.round(size * 0.08);

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          background: "#080b14",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: size * 0.22,
          padding: pad,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #0f1f35 0%, #0d1520 100%)",
            borderRadius: size * 0.18,
            border: "1px solid #1c2a3a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize, lineHeight: 1 }}>⚽</span>
        </div>
      </div>
    ),
    { width: size, height: size }
  );
}
