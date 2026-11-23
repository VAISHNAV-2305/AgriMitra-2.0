from contextlib import asynccontextmanager
from pathlib import Path
import pickle

import joblib
import math
import pandas as pd
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from typing import Literal


MODEL_DIR = Path(__file__).resolve().parent / "models"
FEATURE_COLUMNS = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
FERTILIZER_INPUT_COLUMNS = [
    "N",
    "P",
    "K",
    "temperature",
    "humidity",
    "ph",
    "rainfall",
    "label",
]
YIELD_MODEL_DIR = MODEL_DIR / "yield"
YIELD_FEATURE_COLUMNS = [
    "Crop_Type",
    "N",
    "P",
    "K",
    "Soil_pH",
    "Soil_Moisture",
    "Rainfall",
    "Wind_Speed",
    "Fertilizer_Used",
]
CROP_NAMES = {
    1: "rice",
    2: "maize",
    3: "jute",
    4: "cotton",
    5: "coconut",
    6: "papaya",
    7: "orange",
    8: "apple",
    9: "muskmelon",
    10: "watermelon",
    11: "grapes",
    12: "mango",
    13: "banana",
    14: "pomegranate",
    15: "lentil",
    16: "blackgram",
    17: "mungbean",
    18: "mothbeans",
    19: "pigeonpeas",
    20: "kidneybeans",
    21: "chickpea",
    22: "coffee",
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    with (MODEL_DIR / "model.pkl").open("rb") as file:
        app.state.model = pickle.load(file)
    with (MODEL_DIR / "scaler.pkl").open("rb") as file:
        app.state.scaler = pickle.load(file)
    with (MODEL_DIR / "minmaxscaler.pkl").open("rb") as file:
        app.state.minmaxscaler = pickle.load(file)
    with (MODEL_DIR / "standscaler.pkl").open("rb") as file:
        app.state.standscaler = pickle.load(file)
    fertilizer_model_path = (
        MODEL_DIR / "fertilizer" / "fertilizer_recommendation_model.pkl"
    )
    try:
        with fertilizer_model_path.open("rb") as file:
            app.state.fertilizer_pipeline = pickle.load(file)
    except Exception as error:
        raise RuntimeError(
            f"Failed to load fertilizer recommendation model from "
            f"{fertilizer_model_path}"
        ) from error
    try:
        app.state.crop_yield_pipeline = joblib.load(
            YIELD_MODEL_DIR / "crop_yield_pipeline.pkl"
        )
        app.state.crop_yield_metadata = joblib.load(
            YIELD_MODEL_DIR / "crop_yield_metadata.pkl"
        )
        feature_columns = app.state.crop_yield_metadata.get("feature_columns")
        if feature_columns != YIELD_FEATURE_COLUMNS:
            raise RuntimeError(
                "Yield metadata feature_columns do not match the expected input contract"
            )
    except Exception as error:
        raise RuntimeError("Failed to load crop yield model artifacts") from error
    yield


app = FastAPI(lifespan=lifespan)


class CropFeatures(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

    class Config:
        allow_inf_nan = False


class FertilizerFeatures(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float
    label: str

    class Config:
        allow_inf_nan = False
        extra = "forbid"


class YieldFeatures(BaseModel):
    Crop_Type: Literal["Cotton", "Maize", "Potato", "Rice", "Sugarcane", "Wheat"]
    N: float
    P: float
    K: float
    Soil_pH: float
    Soil_Moisture: float
    Rainfall: float
    Wind_Speed: float
    Fertilizer_Used: float

    class Config:
        allow_inf_nan = False
        extra = "forbid"


@app.post("/predict")
async def predict(features: CropFeatures, request: Request):
    data = pd.DataFrame(
        [[
            features.nitrogen,
            features.phosphorus,
            features.potassium,
            features.temperature,
            features.humidity,
            features.ph,
            features.rainfall,
        ]],
        columns=FEATURE_COLUMNS,
    )

    data = request.app.state.scaler.transform(data)
    data = request.app.state.minmaxscaler.transform(data)
    data = request.app.state.standscaler.transform(data)
    predicted_crop = request.app.state.model.predict(data)[0]

    return {"predicted_crop": CROP_NAMES[int(predicted_crop)]}


@app.post("/predict-fertilizer")
async def predict_fertilizer(features: FertilizerFeatures, request: Request):
    data = pd.DataFrame(
        [[
            features.N,
            features.P,
            features.K,
            features.temperature,
            features.humidity,
            features.ph,
            features.rainfall,
            features.label,
        ]],
        columns=FERTILIZER_INPUT_COLUMNS,
    )

    try:
        predicted_fertilizer = (
            request.app.state.fertilizer_pipeline.predict(data)[0]
        )
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Fertilizer prediction failed",
        ) from error

    return {"predicted_fertilizer": str(predicted_fertilizer)}


@app.post("/predict-yield")
async def predict_yield(features: YieldFeatures, request: Request):
    try:
        feature_columns = request.app.state.crop_yield_metadata["feature_columns"]
        data = pd.DataFrame([{
            "Crop_Type": features.Crop_Type,
            "N": features.N,
            "P": features.P,
            "K": features.K,
            "Soil_pH": features.Soil_pH,
            "Soil_Moisture": features.Soil_Moisture,
            "Rainfall": features.Rainfall,
            "Wind_Speed": features.Wind_Speed,
            "Fertilizer_Used": features.Fertilizer_Used,
        }])[feature_columns]

        predicted_yield = float(
            request.app.state.crop_yield_pipeline.predict(data)[0]
        )
        if not math.isfinite(predicted_yield):
            raise ValueError("Predicted yield is not finite")

        return {"predicted_yield": predicted_yield}
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Yield prediction failed",
        ) from error
