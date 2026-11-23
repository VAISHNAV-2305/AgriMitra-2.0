const NUMERIC_FIELDS = [
  "N",
  "P",
  "K",
  "temperature",
  "humidity",
  "ph",
  "rainfall",
];
const LABEL_FIELD = "label";

export const recommendFertilizer = async (req, res) => {
  const body = req.body ?? {};
  const missingFields = [...NUMERIC_FIELDS, LABEL_FIELD].filter(
    (field) =>
      body[field] === undefined ||
      body[field] === null ||
      (typeof body[field] === "string" && body[field].trim() === "")
  );

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: "All fertilizer recommendation inputs are required",
      fields: missingFields,
    });
  }

  const invalidNumericFields = NUMERIC_FIELDS.filter((field) => {
    const value = body[field];
    return (
      !["number", "string"].includes(typeof value) ||
      (typeof value === "string" && value.trim() === "") ||
      !Number.isFinite(Number(value))
    );
  });
  const invalidLabelFields =
    typeof body[LABEL_FIELD] !== "string" ||
    body[LABEL_FIELD].trim() === ""
      ? [LABEL_FIELD]
      : [];

  if (invalidNumericFields.length > 0 || invalidLabelFields.length > 0) {
    return res.status(400).json({
      message: "Fertilizer recommendation inputs have invalid values",
      fields: [...invalidNumericFields, ...invalidLabelFields],
    });
  }

  const fertilizerFeatures = {
    N: Number(body.N),
    P: Number(body.P),
    K: Number(body.K),
    temperature: Number(body.temperature),
    humidity: Number(body.humidity),
    ph: Number(body.ph),
    rainfall: Number(body.rainfall),
    label: body.label,
  };

  try {
    const response = await fetch(
      `${process.env.CROP_ML_SERVICE_URL}/predict-fertilizer`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fertilizerFeatures),
      }
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      return res.status(response.status).json({
        message:
          response.status === 422
            ? "Fertilizer recommendation inputs were rejected by the ML service"
            : "Fertilizer recommendation service returned an error",
        ...(errorBody?.detail ? { details: errorBody.detail } : {}),
      });
    }

    const result = await response.json();
    if (typeof result.predicted_fertilizer !== "string") {
      return res.status(502).json({
        message: "Fertilizer recommendation service returned an invalid response",
      });
    }

    return res.json({ predicted_fertilizer: result.predicted_fertilizer });
  } catch (err) {
    console.error(err);
    return res.status(503).json({
      message: "Fertilizer recommendation service is unavailable",
    });
  }
};