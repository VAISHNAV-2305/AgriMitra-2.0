
import { EquipmentModel } from "../models/Equipment.js";
import { deleteImage, uploadImage } from "../config/cloudinary.js";

const parseLocation = (value, body, fallback = {}) => {
  const location = typeof value === "string" ? JSON.parse(value) : value;
  return {
    city: location?.city || body.city || fallback.city,
    state: location?.state || body.state || fallback.state,
  };
};

const cleanupImage = async (publicId) => {
  try {
    await deleteImage(publicId);
  } catch {
    console.error("Cloudinary image cleanup failed");
  }
};

export const getAllEquipments = async (req, res) => {
  try {
    const equipments = await EquipmentModel.getAll();
    res.status(200).json(equipments);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching equipments", error: error.message });
  }
};


export const createEquipment = async (req, res) => {
  let uploadedImage;
  try {
    const { name, verified, description, ownerName, location, buyPrice, rentPricePerDay } = req.body;
    const parsedLocation = parseLocation(location, req.body);

    if (
      !name ||
      !description ||
      !ownerName ||
      !parsedLocation.city ||
      !parsedLocation.state ||
      !buyPrice ||
      !rentPricePerDay
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (req.file) {
      uploadedImage = await uploadImage(req.file.buffer, "agrimitra/marketplace/equipment");
    }

    const equipmentData = {
      name,
      verified: verified === true || verified === "true" || verified === "1",
      description,
      ownerName,
      city: parsedLocation.city,
      state: parsedLocation.state,
      buyPrice: Number(buyPrice),
      rentPricePerDay: Number(rentPricePerDay),
      image: uploadedImage?.image,
      imagePublicId: uploadedImage?.imagePublicId,
    };

    const newId = await EquipmentModel.create(equipmentData);
    return res.status(201).json({
      message: "Equipment created successfully",
      id: newId,
      image: equipmentData.image || null,
      imagePublicId: equipmentData.imagePublicId || null,
    });
  } catch (error) {
    if (uploadedImage) await cleanupImage(uploadedImage.imagePublicId);
    if (error instanceof SyntaxError) {
      return res.status(400).json({ message: "Invalid equipment listing data" });
    }
    return res.status(500).json({ message: "Server error creating equipment" });
  }
};


export const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await EquipmentModel.getById(id);
    if (!equipment) return res.status(404).json({ message: "Equipment not found" });
    const deleted = await EquipmentModel.delete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    await cleanupImage(equipment.imagePublicId);
    return res.status(200).json({ message: "Equipment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting equipment", error: error.message });
  }
};


export const updateEquipment = async (req, res) => {
  let uploadedImage;
  try {
    const { id } = req.params;
    const existing = await EquipmentModel.getById(id);
    if (!existing) return res.status(404).json({ message: "Equipment not found" });

    const { name, verified, description, ownerName, location, buyPrice, rentPricePerDay } = req.body;
    const parsedLocation = parseLocation(location, req.body, existing.location);

    if (req.file) {
      uploadedImage = await uploadImage(req.file.buffer, "agrimitra/marketplace/equipment");
    }

    const updatedData = {
      name: name ?? existing.name,
      verified: verified === undefined
        ? existing.verified
        : verified === true || verified === "true" || verified === 1 || verified === "1",
      description: description ?? existing.description,
      ownerName: ownerName ?? existing.ownerName,
      city: parsedLocation.city,
      state: parsedLocation.state,
      buyPrice: buyPrice === undefined ? existing.buyPrice : Number(buyPrice),
      rentPricePerDay: rentPricePerDay === undefined ? existing.rentPricePerDay : Number(rentPricePerDay),
      image: uploadedImage?.image,
      imagePublicId: uploadedImage?.imagePublicId,
    };

    const updated = await EquipmentModel.update(id, updatedData);

    if (!updated) {
      if (uploadedImage) await cleanupImage(uploadedImage.imagePublicId);
      return res.status(404).json({ message: "Equipment not found" });
    }

    if (uploadedImage && existing.imagePublicId) {
      await cleanupImage(existing.imagePublicId);
    }
    return res.status(200).json({
      message: "Equipment updated successfully",
      id: Number(id),
      image: uploadedImage?.image || existing.image || null,
      imagePublicId: uploadedImage?.imagePublicId || existing.imagePublicId || null,
    });
  } catch (error) {
    if (uploadedImage) await cleanupImage(uploadedImage.imagePublicId);
    if (error instanceof SyntaxError) {
      return res.status(400).json({ message: "Invalid equipment listing data" });
    }
    return res.status(500).json({ message: "Server error updating equipment" });
  }
};
