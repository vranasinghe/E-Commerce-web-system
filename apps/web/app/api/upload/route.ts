import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Read Cloudinary environment variables dynamically on each request
    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const isCloudinaryConfigured = Boolean(
      cloudinaryUrl || (cloudName && apiKey && apiSecret)
    );

    if (isCloudinaryConfigured) {
      if (cloudinaryUrl) {
        cloudinary.config({ cloudinary_url: cloudinaryUrl });
      } else {
        cloudinary.config({
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
          secure: true,
        });
      }

      const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "ecommerce-products",
            resource_type: "image",
          },
          (error, result) => {
            if (error || !result) {
              console.error("Cloudinary upload_stream error:", error);
              reject(error || new Error("Cloudinary upload error"));
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(buffer);
      });

      return NextResponse.json({
        success: true,
        url: uploadResult.secure_url,
        provider: "cloudinary",
      });
    }

    // Fallback: Save to local public/uploads directory if Cloudinary credentials are missing
    const ext = path.extname(file.name) || ".png";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;
    return NextResponse.json({
      success: true,
      url: fileUrl,
      provider: "local",
    });
  } catch (err: unknown) {
    console.error("Image upload error:", err);
    const message = err instanceof Error ? err.message : "Failed to upload image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
