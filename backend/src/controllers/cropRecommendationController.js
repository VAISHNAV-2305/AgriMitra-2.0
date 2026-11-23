export const recommendCrop = async (req, res) => {
  try {
    const response = await fetch(`${process.env.CROP_ML_SERVICE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nitrogen: req.body.nitrogen,
        phosphorus: req.body.phosphorus,
        potassium: req.body.potassium,
        temperature: req.body.temperature,
        humidity: req.body.humidity,
        ph: req.body.ph,
        rainfall: req.body.rainfall,
      }),
    });

    if (!response.ok) {
      return res.status(response.status).json({
        message: "Crop recommendation service returned an error",
      });
    }

    const result = await response.json();
    return res.json({ predicted_crop: result.predicted_crop });
  } catch (err) {
    console.error(err);
    return res.status(503).json({
      message: "Crop recommendation service is unavailable",
    });
  }
};