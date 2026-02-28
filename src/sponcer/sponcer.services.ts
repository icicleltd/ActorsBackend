import { deleteFromCloudinary, fileUploader } from "../helper/fileUpload";
import { sanitizePayload } from "../helper/senitizePayload";
import { AppError } from "../middleware/error";
import { requiredString } from "../notification/hepler/requiredName";
import { AllowEditSponsorField, ISponcer } from "./sponcer.interface";
import { Sponcer } from "./sponcer.schema";

/* ------------------------------------
   CREATE BANNER
------------------------------------- */
const createSponcer = async (payload: ISponcer) => {
  const { name, url, description, discount, validity, terms } = payload;
  requiredString(name, "Name");
  requiredString(url, "URL");
  requiredString(description, "Description");
  requiredString(discount, "Discount");
  requiredString(terms, "Terms & Conditions");
  if (!validity || isNaN(Date.parse(validity))) {
    throw new AppError(400, "Valid validity date is required");
  }

  const result = await Sponcer.create(payload);
  if (!result) {
    throw new AppError(404, "Banner not created");
  }
  return result;
};
const editSponsor = async (id: string, payload: AllowEditSponsorField) => {
  if (!id) {
    throw new AppError(400, "Sponsor not found");
  }
  const sanitize = sanitizePayload(payload);
  if (!Object.keys(sanitize).length) {
    throw new AppError(400, "No valid fields to update");
  }
  const result = await Sponcer.findByIdAndUpdate(
    id,
    {
      $set: sanitize,
    },
    { new: true, runValidators: true },
  );
  console.log(result);
  if (!result) {
    throw new AppError(404, "Sponsor not Updated");
  }
  return result;
};

/* ------------------------------------
   GET ALL BANNERS
------------------------------------- */
const getSponcer = async (sortBy: string = "order", sortWith: 1 | -1 = 1) => {
  const banners = await Sponcer.find().sort({ order: 1 });
  return banners;
};

/* ------------------------------------
   DELETE SINGLE BANNER
------------------------------------- */
const deleteSponcer = async (id: string) => {
  if (!id) {
    throw new AppError(400, "Banner id is required");
  }

  const banner = await Sponcer.findById(id);

  if (!banner) {
    throw new AppError(404, "Banner not found");
  }

  // await deleteFromCloudinary(banner.publicId);
  await Sponcer.findByIdAndDelete(id);

  return banner;
};

export const SponsorService = {
  createSponcer,
  getSponcer,
  deleteSponcer,
  editSponsor,
};
