import { ImageResponse } from "next/og";

export const alt = "bingd. TV tracking app";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#050505",
          color: "#ffffff",
          padding: "72px",
          fontFamily: "Arial",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "28px",
            maxWidth: "720px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              fontSize: "42px",
              fontWeight: 800,
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "16px",
                background: "#22c55e",
                color: "#020202",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "42px",
                fontWeight: 900,
              }}
            >
              b
            </div>
            <span>bingd.</span>
          </div>
          <div
            style={{
              fontSize: "74px",
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: "0",
            }}
          >
            Track your shows. Never miss what is next.
          </div>
          <div
            style={{
              fontSize: "30px",
              lineHeight: 1.25,
              color: "#b7b7b7",
            }}
          >
            Watchlists, friends, and episode notifications in one simple app.
          </div>
        </div>

        <div
          style={{
            width: "290px",
            height: "420px",
            borderRadius: "44px",
            border: "2px solid rgba(255,255,255,0.16)",
            background: "#101010",
            display: "flex",
            flexDirection: "column",
            padding: "24px",
            gap: "16px",
            boxShadow: "0 24px 90px rgba(34,197,94,0.20)",
          }}
        >
          {["Tonight", "This Week", "Following"].map((label, index) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: "92px",
                borderRadius: "22px",
                background: index === 0 ? "#22c55e" : "#1c1c1c",
                color: index === 0 ? "#020202" : "#ffffff",
                padding: "0 22px",
                fontSize: "24px",
                fontWeight: 800,
              }}
            >
              <span>{label}</span>
              <span>{index === 0 ? "3" : index === 1 ? "8" : "12"}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
