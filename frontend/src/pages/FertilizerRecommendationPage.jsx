import { useState } from "react";
import { ArrowLeft, Leaf, LoaderCircle, Sprout } from "lucide-react";
import { Link } from "react-router";
import api from "../lib/axios";

const numericFields = [
  { name: "nitrogen", apiName: "N", label: "Nitrogen", unit: "value", placeholder: "e.g. 80" },
  { name: "phosphorus", apiName: "P", label: "Phosphorus", unit: "value", placeholder: "e.g. 40" },
  { name: "potassium", apiName: "K", label: "Potassium", unit: "value", placeholder: "e.g. 50" },
  { name: "temperature", apiName: "temperature", label: "Temperature", unit: "°C", placeholder: "e.g. 24" },
  { name: "humidity", apiName: "humidity", label: "Humidity", unit: "%", placeholder: "e.g. 82" },
  { name: "ph", apiName: "ph", label: "Soil pH", unit: "pH", placeholder: "e.g. 6.5" },
  { name: "rainfall", apiName: "rainfall", label: "Rainfall", unit: "mm", placeholder: "e.g. 200" },
];

const crops = [
  "Adzuki Beans",
  "Black gram",
  "Chickpea",
  "Coconut",
  "Coffee",
  "Cotton",
  "Ground Nut",
  "Jute",
  "Kidney Beans",
  "Lentil",
  "Moth Beans",
  "Mung Bean",
  "Peas",
  "Pigeon Peas",
  "Rubber",
  "Sugarcane",
  "Tea",
  "Tobacco",
  "apple",
  "banana",
  "grapes",
  "maize",
  "mango",
  "millet",
  "muskmelon",
  "orange",
  "papaya",
  "pomegranate",
  "rice",
  "watermelon",
  "wheat",
];

const emptyForm = {
  ...Object.fromEntries(numericFields.map(({ name }) => [name, ""])),
  crop: "",
};

export default function FertilizerRecommendationPage() {
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [predictedFertilizer, setPredictedFertilizer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
    setErrorMessage("");
    setPredictedFertilizer("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isLoading) return;

    const nextErrors = {};
    const numericValues = {};

    for (const { name, label } of numericFields) {
      const rawValue = form[name].trim();
      if (!rawValue) {
        nextErrors[name] = `${label} is required.`;
        continue;
      }

      const numericValue = Number(rawValue);
      if (!Number.isFinite(numericValue)) {
        nextErrors[name] = `Enter a finite number for ${label}.`;
        continue;
      }

      numericValues[name] = numericValue;
    }

    if (!form.crop) nextErrors.crop = "Crop name is required.";

    setFieldErrors(nextErrors);
    setErrorMessage("");
    setPredictedFertilizer("");
    if (Object.keys(nextErrors).length > 0) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setErrorMessage("Please sign in before requesting a fertilizer recommendation.");
      return;
    }

    const payload = {
      N: numericValues.nitrogen,
      P: numericValues.phosphorus,
      K: numericValues.potassium,
      temperature: numericValues.temperature,
      humidity: numericValues.humidity,
      ph: numericValues.ph,
      rainfall: numericValues.rainfall,
      label: form.crop.trim().toLowerCase(),
    };

    setIsLoading(true);
    try {
      const response = await api.post("/fertilizer-recommendation", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fertilizer = response.data?.predicted_fertilizer;

      if (typeof fertilizer !== "string" || !fertilizer.trim()) {
        setErrorMessage("The recommendation service returned an invalid response. Please try again.");
        return;
      }

      setPredictedFertilizer(fertilizer);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        setErrorMessage("Your session is not valid. Please sign in again.");
      } else if (error.response) {
        setErrorMessage(
          error.response.data?.message || "The prediction failed. Please review your values and try again."
        );
      } else {
        setErrorMessage("Could not reach the recommendation service. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderNumericField = ({ name, label, unit, placeholder }) => (
    <div key={name}>
      <label htmlFor={name} className="mb-1.5 flex items-center justify-between gap-2 text-sm font-semibold text-gray-700">
        <span>{label}</span>
        <span className="text-xs font-medium text-gray-400">{unit}</span>
      </label>
      <input
        id={name}
        name={name}
        type="number"
        step="any"
        required
        inputMode="decimal"
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        aria-invalid={Boolean(fieldErrors[name])}
        aria-describedby={fieldErrors[name] ? `${name}-error` : undefined}
        className={`w-full rounded-lg border bg-gray-50 px-3.5 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:bg-white focus:ring-4 ${
          fieldErrors[name]
            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
            : "border-gray-200 focus:border-green-600 focus:ring-green-100"
        }`}
      />
      {fieldErrors[name] && (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-600">
          {fieldErrors[name]}
        </p>
      )}
    </div>
  );

  const renderSelectField = (name, label, options, placeholder) => (
    <div key={name}>
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <select
        id={name}
        name={name}
        required
        value={form[name]}
        onChange={handleChange}
        aria-invalid={Boolean(fieldErrors[name])}
        aria-describedby={fieldErrors[name] ? `${name}-error` : undefined}
        className={`w-full rounded-lg border bg-gray-50 px-3.5 py-3 text-gray-900 outline-none transition focus:bg-white focus:ring-4 ${
          fieldErrors[name]
            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
            : "border-gray-200 focus:border-green-600 focus:ring-green-100"
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {fieldErrors[name] && (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-600">
          {fieldErrors[name]}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f7f1] text-gray-900">
      <header className="border-b border-green-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-green-800 transition hover:text-green-950">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Home
          </Link>
          <div className="flex items-center gap-2 font-bold text-green-800">
            <Leaf className="h-5 w-5" aria-hidden="true" />
            AgriMitra
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
        <section className="relative overflow-hidden rounded-xl bg-green-900 px-6 py-7 text-white sm:px-9 sm:py-9">
          <div className="absolute -right-8 -top-10 text-green-800" aria-hidden="true">
            <Sprout className="h-48 w-48" strokeWidth={1} />
          </div>
          <div className="relative max-w-2xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-lime-200">Farm planning</p>
            <h1 className="text-3xl font-bold sm:text-4xl">Fertilizer Recommendation</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-green-50 sm:text-base">
              Add your nutrient levels, growing conditions, and crop to get a fertilizer recommendation.
            </p>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.7fr)]">
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Growing conditions</h2>
              <p className="mt-1 text-sm text-gray-500">Provide all seven measurements and choose the crop name.</p>
            </div>

            <form noValidate onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                {numericFields.map(renderNumericField)}
                {renderSelectField("crop", "Crop name", crops, "Select crop")}
              </div>

              {errorMessage && (
                <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {errorMessage}
                  {errorMessage.startsWith("Please sign in") && (
                    <Link to="/login" className="ml-1 font-semibold underline underline-offset-2">
                      Sign in
                    </Link>
                  )}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed disabled:bg-green-500 sm:w-auto sm:min-w-60"
              >
                {isLoading ? (
                  <>
                    <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
                    Recommending...
                  </>
                ) : (
                  <>
                    <Sprout className="h-5 w-5" aria-hidden="true" />
                    Recommend Fertilizer
                  </>
                )}
              </button>
            </form>
          </section>

          <aside className="flex min-h-56 flex-col rounded-xl border border-green-200 bg-green-50 p-6 sm:p-7" aria-live="polite">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-green-700 shadow-sm">
              <Sprout className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-lg font-bold text-gray-900">Recommended fertilizer</h2>
            {predictedFertilizer ? (
              <p className="mt-2 break-words text-2xl font-bold text-green-800">{predictedFertilizer}</p>
            ) : (
              <p className="mt-2 text-sm text-gray-600">Your result will appear here.</p>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}