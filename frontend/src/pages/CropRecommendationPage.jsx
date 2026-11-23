import { useState } from "react";
import { ArrowLeft, Leaf, LoaderCircle, Sprout } from "lucide-react";
import { Link } from "react-router";
import api from "../lib/axios";

const cropFields = [
  { name: "nitrogen", label: "Nitrogen", unit: "kg/ha", placeholder: "e.g. 90" },
  { name: "phosphorus", label: "Phosphorus", unit: "kg/ha", placeholder: "e.g. 42" },
  { name: "potassium", label: "Potassium", unit: "kg/ha", placeholder: "e.g. 43" },
  { name: "temperature", label: "Temperature", unit: "°C", placeholder: "e.g. 20.8" },
  { name: "humidity", label: "Humidity", unit: "%", placeholder: "e.g. 82" },
  { name: "ph", label: "Soil pH", unit: "pH", placeholder: "e.g. 6.5" },
  { name: "rainfall", label: "Rainfall", unit: "mm", placeholder: "e.g. 202.9" },
];

const emptyForm = Object.fromEntries(cropFields.map(({ name }) => [name, ""]));

export default function CropRecommendationPage() {
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [predictedCrop, setPredictedCrop] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
    setErrorMessage("");
    setPredictedCrop("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isLoading) return;

    const nextErrors = {};
    const values = {};

    for (const { name, label } of cropFields) {
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

      values[name] = numericValue;
    }

    setFieldErrors(nextErrors);
    setErrorMessage("");
    setPredictedCrop("");
    if (Object.keys(nextErrors).length > 0) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setErrorMessage("Please sign in before requesting a crop recommendation.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/crop-recommendation", values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const crop = response.data?.predicted_crop;

      if (typeof crop !== "string" || !crop.trim()) {
        setErrorMessage("The recommendation service returned an invalid response. Please try again.");
        return;
      }

      setPredictedCrop(crop);
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
            <h1 className="text-3xl font-bold sm:text-4xl">Crop Recommendation</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-green-50 sm:text-base">
              Enter your soil nutrients and local climate readings to find a suitable crop.
            </p>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.7fr)]">
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Growing conditions</h2>
              <p className="mt-1 text-sm text-gray-500">Provide all seven measurements.</p>
            </div>

            <form noValidate onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                {cropFields.map(({ name, label, unit, placeholder }) => (
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
                ))}
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
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed disabled:bg-green-500 sm:w-auto sm:min-w-52"
              >
                {isLoading ? (
                  <>
                    <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
                    Recommending...
                  </>
                ) : (
                  <>
                    <Sprout className="h-5 w-5" aria-hidden="true" />
                    Recommend Crop
                  </>
                )}
              </button>
            </form>
          </section>

          <aside className="flex min-h-56 flex-col rounded-xl border border-green-200 bg-green-50 p-6 sm:p-7" aria-live="polite">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-green-700 shadow-sm">
              <Sprout className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-lg font-bold text-gray-900">Recommended crop</h2>
            {predictedCrop ? (
              <p className="mt-2 break-words text-3xl font-bold capitalize text-green-800">{predictedCrop}</p>
            ) : (
              <p className="mt-2 text-sm text-gray-600">Your result will appear here.</p>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}