import { error } from "console";
import { fileUploader } from "../helper/fileUpload";
import { AppError } from "../middleware/error";
import { AboutPayload, IAbout } from "./about.interface";
import { About } from "./about.schema";

/* ------------------------------------------------
   CREATE ABOUT
------------------------------------------------ */
const createAbout = async (payload: any, file: any) => {
  const { title, description, points, year } = payload;
  // console.log(payload);
  const haveAbout = await About.find({});
  if (haveAbout.length > 1) {
    throw new AppError(400, "Aready have a about");
  }
  let result;
  if (title && description) {
    result = await About.findOneAndUpdate(
      {},
      {
        title,
        description,
      },
      {
        new: true,
        upsert: true,
      }
    );
  }
  if (points) {
    const pointText = points.trim();

    const existingPoint = await About.findOne({
      "points.point": pointText,
    });

    if (existingPoint) {
      throw new AppError(409, "This point already exists");
    }

    result = await About.findOneAndUpdate(
      {},
      {
        $push: {
          points: { point: pointText },
        },
      },
      { new: true }
    );

    if (!result) {
      throw new AppError(400, "Create title and description first");
    }
  }

  if (year && file) {
    console.log("payload in crete", payload);
    const uploadImage = (await fileUploader.CloudinaryUpload(file)) as {
      secure_url: string;
    };
    if (!uploadImage) {
      throw new AppError(500, "Failed to upload file");
    }
    result = await About.findOneAndUpdate(
      {},
      {
        $addToSet: {
          images: {
            year,
            image: uploadImage.secure_url,
          },
        },
      },
      { new: true, upsert: true }
    );
  }
  return result;
};

/* ------------------------------------------------
   GET ABOUTS
------------------------------------------------ */
const getAbouts = async () => {
  const abouts = await About.find({});

  if (!abouts.length) {
    throw new AppError(404, "About not found");
  }

  return abouts;
};

/* ------------------------------------------------
   DELETE ABOUT
------------------------------------------------ */
const deleteAbout = async (payload: any) => {
  console.log("in payload delete", payload);

  if (!payload) {
    throw new AppError(400, "No payload provided");
  }

  let result;

  // ✅ DELETE IMAGE
  if (payload._id) {
    result = await About.findOneAndUpdate(
      {},
      {
        $pull: {
          images: { _id: payload._id },
        },
      },
      { new: true }
    );
  }

  // ✅ DELETE POINT
  if (payload.point) {
    result = await About.findOneAndUpdate(
      {},
      {
        $pull: {
          points: { point: payload.point },
        },
      },
      { new: true }
    );
  }

  return result;
};

/* ------------------------------------------------
   PATCH ABOUT
------------------------------------------------ */
const updateAboutPatch = async (
  id: string,
  payload: any,
  files?: { [fieldname: string]: Express.Multer.File[] }
) => {
  const about = await About.findById(id);
  if (!about) {
    throw new AppError(404, "About not found");
  }

  /* ---------- EXISTING IMAGES ---------- */
  let existingImages: string[] = [];
  if (payload.existingImages) {
    existingImages = Array.isArray(payload.existingImages)
      ? payload.existingImages
      : [payload.existingImages];
  }

  /* ---------- UPLOAD NEW IMAGES ---------- */
  const uploadArray = async (fileArr?: Express.Multer.File[]) => {
    if (!fileArr || fileArr.length === 0) return [];
    const uploaded = await fileUploader.CloudinaryUploadMultiple(fileArr);
    return uploaded.map((u: any) => u.secure_url);
  };

  const uploadedImages = await uploadArray(files?.images);
  const finalImages = [...existingImages, ...uploadedImages];

  // const updatePayload: any = {
  //   title: payload.title,
  //   name: payload.name,
  //   description: payload.description,
  //   details: payload.details,
  //   eventDate: payload.eventDate
  //     ? new Date(payload.eventDate)
  //     : about.eventDate,
  //   images: finalImages,
  // };

  // return await About.findByIdAndUpdate(id, updatePayload, { new: true });
};

/* ------------------------------------------------
   PUT ABOUT
------------------------------------------------ */
const updateAbout = async (payload: any) => {
  if (!payload) {
    throw new AppError(400, "No point provided");
  }

  return;
};

/* ------------------------------------------------
   EXPORT
------------------------------------------------ */
export const AboutService = {
  createAbout,
  getAbouts,
  deleteAbout,
  updateAboutPatch,
  updateAbout,
};
