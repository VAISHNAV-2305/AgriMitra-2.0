const NUMERIC_FIELDS = [
  "N",
  "P",
  "K",
  "Soil_pH",
  "Soil_Moisture",
  "Rainfall",
  "Wind_Speed",
  "Fertilizer_Used",
];
const CROP_TYPES = ["Cotton", "Maize", "Potato", "Rice", "Sugarcane", "Wheat"];
const CROP_TYPE_FIELD = "Crop_Type";

export const predictYield = async (req, res) => {
  const body = req.body ?? {};
  const requiredFields = [...NUMERIC_FIELDS, CROP_TYPE_FIELD];
  const missingFields = requiredFields.filter(
    (field) =>
      body[field] === undefined ||
      body[field] === null ||
      (typeof body[field] === "string" && body[field].trim() === "")
  );

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: "All yield prediction inputs are required",
      fields: missingFields,
    });
  }

  const invalidFields = NUMERIC_FIELDS.filter((field) => {
    const value = body[field];
    return (
      !["number", "string"].includes(typeof value) ||
      (typeof value === "string" && value.trim() === "") ||
      !Number.isFinite(Number(value))
    );
  });
  if (
    typeof body[CROP_TYPE_FIELD] !== "string" ||
    body[CROP_TYPE_FIELD].trim() === "" ||
    !CROP_TYPES.includes(body[CROP_TYPE_FIELD])
  ) {
    invalidFields.push(CROP_TYPE_FIELD);
  }

  if (invalidFields.length > 0) {
    return res.status(400).json({
      message: "Yield prediction inputs have invalid values",
      fields: [...new Set(invalidFields)],
    });
  }

  const yieldFeatures = {
    Crop_Type: body.Crop_Type,
    N: Number(body.N),
    P: Number(body.P),
    K: Number(body.K),
    Soil_pH: Number(body.Soil_pH),
    Soil_Moisture: Number(body.Soil_Moisture),
    Rainfall: Number(body.Rainfall),
    Wind_Speed: Number(body.Wind_Speed),
    Fertilizer_Used: Number(body.Fertilizer_Used),
  };

  try {
    const response = await fetch(
      `${process.env.CROP_ML_SERVICE_URL}/predict-yield`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(yieldFeatures),
      }
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      return res.status(response.status).json({
        message:
          response.status === 422
            ? "Yield prediction inputs were rejected by the ML service"
            : "Yield prediction service returned an error",
        ...(errorBody?.detail ? { details: errorBody.detail } : {}),
      });
    }

    const result = await response.json();
    if (typeof result.predicted_yield !== "number" || !Number.isFinite(result.predicted_yield)) {
      return res.status(502).json({
        message: "Yield prediction service returned an invalid response",
      });
    }

    return res.json({ predicted_yield: result.predicted_yield });
  } catch (err) {
    console.error(err);
    return res.status(503).json({
      message: "Yield prediction service is unavailable",
    });
  }
};