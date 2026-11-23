import connectDB from "../config/db.js";

export const createCropTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS crops (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cropName VARCHAR(255) NOT NULL,
      farmerName VARCHAR(255) NOT NULL,
      city VARCHAR(255) NOT NULL,
      state VARCHAR(255) NOT NULL,
      harvestedDate DATE NOT NULL,
      quantityKg DECIMAL(10,2) NOT NULL,
      pricePerKg DECIMAL(10,2) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image VARCHAR(255) NULL,
      imagePublicId VARCHAR(255) NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;
  await connectDB.query(query);
  console.log("✅ Crops table ensured in database");
};

export const ensureCropImageColumns = async () => {
  for (const [column, definition] of [
    ["image", "VARCHAR(255) NULL"],
    ["imagePublicId", "VARCHAR(255) NULL"],
  ]) {
    const [existing] = await connectDB.query(
      "SHOW COLUMNS FROM crops LIKE ?",
      [column]
    );
    if (existing.length === 0) {
      await connectDB.query(`ALTER TABLE crops ADD COLUMN ${column} ${definition}`);
    }
  }
};



export const insertCrop = async (cropData) => {
  const {
    cropName,
    farmerName,
    location,
    harvestedDate,
    quantityKg,
    pricePerKg,
    contactInfo,
    image,
    imagePublicId,
  } = cropData;

  const [result] = await connectDB.query(
    `INSERT INTO crops 
      (cropName, farmerName, city, state, harvestedDate, quantityKg, pricePerKg, phone, email, image, imagePublicId)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      cropName,
      farmerName,
      location.city,
      location.state,
      harvestedDate,
      quantityKg,
      pricePerKg,
      contactInfo.phone,
      contactInfo.email,
      image || null,
      imagePublicId || null,
    ]
  );

  return result.insertId;
};

export const getAllCrops = async () => {
  const [rows] = await connectDB.query(`SELECT * FROM crops ORDER BY createdAt DESC`);
  return rows.map((row) => ({
    ...row,
    location: { city: row.city, state: row.state },
  }));
};

export const getCropById = async (id) => {
  const [rows] = await connectDB.query("SELECT * FROM crops WHERE id = ?", [id]);
  const row = rows[0];
  return row ? { ...row, location: { city: row.city, state: row.state } } : null;
};

export const updateCropById = async (id, cropData) => {
  const { location, contactInfo, image, imagePublicId } = cropData;
  const [result] = await connectDB.query(
    `UPDATE crops
     SET cropName = ?, farmerName = ?, city = ?, state = ?, harvestedDate = ?,
         quantityKg = ?, pricePerKg = ?, phone = ?, email = ?, image = ?, imagePublicId = ?
     WHERE id = ?`,
    [
      cropData.cropName,
      cropData.farmerName,
      location.city,
      location.state,
      cropData.harvestedDate,
      cropData.quantityKg,
      cropData.pricePerKg,
      contactInfo.phone,
      contactInfo.email,
      image || null,
      imagePublicId || null,
      id,
    ]
  );
  return result.affectedRows > 0;
};


export const deleteCropById = async (id) => {
  const [result] = await connectDB.query(`DELETE FROM crops WHERE id = ?`, [id]);
  return result.affectedRows > 0;
};
