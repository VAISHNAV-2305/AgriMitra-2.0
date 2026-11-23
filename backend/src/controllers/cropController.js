import {
  insertCrop,
  getAllCrops,
  getCropById,
  updateCropById,
  deleteCropById,
} from "../models/Crops.js";
import { deleteImage, uploadImage } from "../config/cloudinary.js";

const parseNestedField = (value, fallback) => {
  if (typeof value !== "string") return value || fallback;
  return JSON.parse(value);
};

const cleanupImage = async (publicId) => {
  try {
    await deleteImage(publicId);
  } catch {
    console.error("Cloudinary image cleanup failed");
  }
};

const cropDataFromRequest = (body, image) => ({
  ...body,
  location: parseNestedField(body.location, { city: body.city, state: body.state }),
  contactInfo: parseNestedField(body.contactInfo, {
    phone: body.phone || body.contactPhone,
    email: body.email || body.contactEmail,
  }),
  image: image?.image || null,
  imagePublicId: image?.imagePublicId || null,
});

export const getCrops = async (req, res) => {
  try {
    const crops = await getAllCrops();
    res.json(crops);
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.log(err);
  }
};

export const createCrop = async (req, res) => {
  let uploadedImage;
  try {
    if (req.file) {
      uploadedImage = await uploadImage(req.file.buffer, "agrimitra/marketplace/crops");
    }
    const cropData = cropDataFromRequest(req.body, uploadedImage);
    const id = await insertCrop(cropData);
    return res.status(201).json({
      message: "Crop added successfully",
      id,
      image: cropData.image,
      imagePublicId: cropData.imagePublicId,
    });
  } catch (err) {
    if (uploadedImage) await cleanupImage(uploadedImage.imagePublicId);
    if (err instanceof SyntaxError) {
      return res.status(400).json({ message: "Invalid crop listing data" });
    }
    return res.status(500).json({ message: "Failed to create crop listing" });
  }
};

export const updateCrop = async (req, res) => {
  const existing = await getCropById(req.params.id);
  if (!existing) return res.status(404).json({ message: "Crop not found" });

  let uploadedImage;
  try {
    if (req.file) {
      uploadedImage = await uploadImage(req.file.buffer, "agrimitra/marketplace/crops");
    }
    const cropData = cropDataFromRequest(
      {
        ...existing,
        ...req.body,
        location: req.body.location || {
          city: req.body.city || existing.city,
          state: req.body.state || existing.state,
        },
        contactInfo: req.body.contactInfo || {
          phone: req.body.phone || existing.phone,
          email: req.body.email || existing.email,
        },
      },
      uploadedImage || {
        image: existing.image,
        imagePublicId: existing.imagePublicId,
      }
    );

    const updated = await updateCropById(req.params.id, cropData);
    if (!updated) {
      if (uploadedImage) await cleanupImage(uploadedImage.imagePublicId);
      return res.status(404).json({ message: "Crop not found" });
    }

    if (uploadedImage && existing.imagePublicId) {
      await cleanupImage(existing.imagePublicId);
    }
    return res.json({
      message: "Crop updated successfully",
      id: existing.id,
      image: cropData.image,
      imagePublicId: cropData.imagePublicId,
    });
  } catch (err) {
    if (uploadedImage) await cleanupImage(uploadedImage.imagePublicId);
    if (err instanceof SyntaxError) {
      return res.status(400).json({ message: "Invalid crop listing data" });
    }
    return res.status(500).json({ message: "Failed to update crop listing" });
  }
};

export const deleteCrop = async (req, res) => {
  try {
    const crop = await getCropById(req.params.id);
    if (!crop) return res.status(404).json({ message: "Crop not found" });
    const deleted = await deleteCropById(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Crop not found" });
    await cleanupImage(crop.imagePublicId);
    return res.json({ message: "Crop deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete crop listing" });
  }
};
