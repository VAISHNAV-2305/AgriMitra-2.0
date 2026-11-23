
import connectDB from "../config/db.js";



export const EquipmentModel = {
  async ensureImageColumns() {
    for (const [column, definition] of [
      ["image", "VARCHAR(255) NULL"],
      ["imagePublicId", "VARCHAR(255) NULL"],
    ]) {
      const [existing] = await connectDB.query(
        "SHOW COLUMNS FROM equipments LIKE ?",
        [column]
      );
      if (existing.length === 0) {
        await connectDB.query(`ALTER TABLE equipments ADD COLUMN ${column} ${definition}`);
      }
    }
  },

  async getAll() {
    const [rows] = await connectDB.query("SELECT * FROM equipments");
    return rows.map((row) => ({
      ...row,
      location: { city: row.city, state: row.state },
    }));
  },

  async getById(id) {
    const [rows] = await connectDB.query("SELECT * FROM equipments WHERE id = ?", [id]);
    const row = rows[0];
    return row ? { ...row, location: { city: row.city, state: row.state } } : null;
  },

  async create(equipment) {
    const {
      name,
      verified,
      description,
      ownerName,
      city,
      state,
      buyPrice,
      rentPricePerDay,
      image,
      imagePublicId,
    } = equipment;

    const [result] = await connectDB.query(
      `INSERT INTO equipments 
       (name, verified, description, ownerName, city, state, buyPrice, rentPricePerDay, image, imagePublicId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, verified || false, description, ownerName, city, state, buyPrice, rentPricePerDay, image || null, imagePublicId || null]
    );

    return result.insertId;
  },

  async delete(id) {
    const [result] = await connectDB.query("DELETE FROM equipments WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },

  async update(id, equipment) {
    const {
      name,
      verified,
      description,
      ownerName,
      city,
      state,
      buyPrice,
      rentPricePerDay,
      image,
      imagePublicId,
    } = equipment;

    const [result] = await connectDB.query(
      `UPDATE equipments 
       SET name=?, verified=?, description=?, ownerName=?, city=?, state=?, buyPrice=?, rentPricePerDay=?,
           image=COALESCE(?, image), imagePublicId=COALESCE(?, imagePublicId)
       WHERE id=?`,
      [name, verified || false, description, ownerName, city, state, buyPrice, rentPricePerDay, image || null, imagePublicId || null, id]
    );

    return result.affectedRows > 0;
  },
};
