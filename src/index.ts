// import app from "./app";
// import { connectDB } from "./db";

// export default async function handler(req: any, res: any) {
//   await connectDB();   // ensure MongoDB is connected
//   return app(req, res); // run Express app
// }

// import app from "./app";
// import { connectDB } from "./db";

// const isVercel = process.env.VERCEL === "1";

// // --- PRODUCTION: Vercel serverless handler ---
// export default async function handler(req: any, res: any) {
//   await connectDB();
//   return app(req, res);
// }

// // --- DEVELOPMENT: local server ---
// if (!isVercel) {
//   const port = process.env.PORT || 8000;

//   const startServer = async () => {
//     try {
//       await connectDB();
//       app.listen(port, () => {
//         console.log("🚀 Server running on http://localhost:" + port);
//       });
//     } catch (err) {
//       console.error("❌ Failed to start server:", err);
//     }
//   };

//   startServer();
// }


// fix for bufferCommands


import app from "./app";
import { connectDB } from "./db";

const isVercel = process.env.VERCEL === "1";

// --- PRODUCTION: Vercel serverless handler ---
export default async function handler(req: any, res: any) {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error("❌ API Handler Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

// --- DEVELOPMENT: local server ---
if (!isVercel) {
  const port = process.env.PORT || 8000;

  const startServer = async () => {
    try {
      await connectDB();
      app.listen(port, () => {
        console.log("🚀 Server running on http://localhost:" + port);
      });
    } catch (err) {
      console.error("❌ Failed to start server:", err);
      process.exit(1);
    }
  };

  startServer();
}

