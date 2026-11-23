import React, { useState } from "react";
import { Leaf, Phone, Mail, Calendar, Package, DollarSign, User, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router";
import api from "../lib/axios";
import { toast } from "react-hot-toast";

const ListCropForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cropName: "",
    farmerName: "",
    city: "",
    state: "",
    harvestedDate: "",
    quantity: "",
    pricePerKg: "",
    contactPhone: "",
    contactEmail: "",
    image: null,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const value = e.target.type === "file" ? e.target.files?.[0] || null : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.cropName) newErrors.cropName = "Crop Name is required";
    if (!formData.farmerName) newErrors.farmerName = "Farmer Name is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.harvestedDate) newErrors.harvestedDate = "Harvest Date is required";
    if (!formData.quantity || isNaN(formData.quantity))
      newErrors.quantity = "Enter a valid quantity";
    if (!formData.pricePerKg || isNaN(formData.pricePerKg))
      newErrors.pricePerKg = "Enter a valid price";
    if (!formData.contactPhone) newErrors.contactPhone = "Phone is required";
    if (!formData.contactEmail) newErrors.contactEmail = "Email is required";
    return newErrors;
  };
  const token = localStorage.getItem("accessToken");
  const createCrop = async (cropData, image) => {
    try {   
      const payload = new FormData();
      Object.entries(cropData).forEach(([key, value]) => {
        payload.append(key, typeof value === "object" ? JSON.stringify(value) : String(value));
      });
      if (image) payload.append("image", image);

      const response = await api.post("/crops/create", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Crop created:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating crop:", error);
      throw error;
    }
  };
      

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length === 0) {
      console.log("Submitted Data:", formData);
      try {
        await createCrop({
          cropName: formData.cropName,
          farmerName: formData.farmerName,
          location: {
            city: formData.city,
            state: formData.state
          },
          harvestedDate: formData.harvestedDate,
          quantityKg: Number(formData.quantity),
          pricePerKg: Number(formData.pricePerKg),
          contactInfo: {
            phone: formData.contactPhone,
            email: formData.contactEmail
          }
        }, formData.image);
        toast.success("Crop listed successfully!");
        navigate("/marketplace");
      } catch {
        toast.error("Failed to list crop. Please try again.");
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-50 to-green-100 p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-12">
        
        <Link to="/marketplace" >
          <p className="text-left w-3xl hover:text-green-700 cursor-pointer">Back</p>
        </Link>
        <div className="flex flex-col items-center text-center mb-6 md:mb-10">
          <Leaf className="h-12 w-12 text-green-600 mb-2" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-800">
            List Your Crop
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Connect with buyers by listing your fresh produce
          </p>
          
        </div>

        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          
          <div>
            <label className="block text-gray-700 font-medium mb-1">Crop Name</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <Leaf className="h-5 w-5 text-green-500 mr-2" />
              <input
                type="text"
                name="cropName"
                value={formData.cropName}
                onChange={handleChange}
                placeholder="e.g., Wheat"
                className="flex-1 outline-none text-sm sm:text-base"
              />
            </div>
            {errors.cropName && <p className="text-red-500 text-xs mt-1">{errors.cropName}</p>}
          </div>

          
          <div>
            <label className="block text-gray-700 font-medium mb-1">Farmer Name</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <User className="h-5 w-5 text-green-500 mr-2" />
              <input
                type="text"
                name="farmerName"
                value={formData.farmerName}
                onChange={handleChange}
                placeholder="e.g., Ramesh Kumar"
                className="flex-1 outline-none text-sm sm:text-base"
              />
            </div>
            {errors.farmerName && <p className="text-red-500 text-xs mt-1">{errors.farmerName}</p>}
          </div>

          
          <div>
            <label className="block text-gray-700 font-medium mb-1">City</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <MapPin className="h-5 w-5 text-green-500 mr-2" />
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g., Bangalore"
                className="flex-1 outline-none text-sm sm:text-base"
              />
            </div>
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>

          
          <div>
            <label className="block text-gray-700 font-medium mb-1">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="e.g., Karnataka"
              className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base outline-none"
            />
            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
          </div>

          
          <div>
            <label className="block text-gray-700 font-medium mb-1">Harvested Date</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <Calendar className="h-5 w-5 text-green-500 mr-2" />
              <input
                type="date"
                name="harvestedDate"
                value={formData.harvestedDate}
                onChange={handleChange}
                className="flex-1 outline-none text-sm sm:text-base"
              />
            </div>
            {errors.harvestedDate && (
              <p className="text-red-500 text-xs mt-1">{errors.harvestedDate}</p>
            )}
          </div>

          
          <div>
            <label className="block text-gray-700 font-medium mb-1">Quantity (kg)</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <Package className="h-5 w-5 text-green-500 mr-2" />
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="e.g., 100"
                className="flex-1 outline-none text-sm sm:text-base"
              />
            </div>
            {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
          </div>

          
          <div>
            <label className="block text-gray-700 font-medium mb-1">Price per Kg (₹)</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <DollarSign className="h-5 w-5 text-green-500 mr-2" />
              <input
                type="number"
                name="pricePerKg"
                value={formData.pricePerKg}
                onChange={handleChange}
                placeholder="e.g., 50"
                className="flex-1 outline-none text-sm sm:text-base"
              />
            </div>
            {errors.pricePerKg && (
              <p className="text-red-500 text-xs mt-1">{errors.pricePerKg}</p>
            )}
          </div>

          
          <div>
            <label className="block text-gray-700 font-medium mb-1">Contact Phone</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <Phone className="h-5 w-5 text-green-500 mr-2" />
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="e.g., 9876543210"
                className="flex-1 outline-none text-sm sm:text-base"
              />
            </div>
            {errors.contactPhone && (
              <p className="text-red-500 text-xs mt-1">{errors.contactPhone}</p>
            )}
          </div>

          
          <div>
            <label className="block text-gray-700 font-medium mb-1">Contact Email</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <Mail className="h-5 w-5 text-green-500 mr-2" />
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="e.g., farmer@example.com"
                className="flex-1 outline-none text-sm sm:text-base"
              />
            </div>
            {errors.contactEmail && (
              <p className="text-red-500 text-xs mt-1">{errors.contactEmail}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="crop-image" className="block text-gray-700 font-medium mb-1">Crop Image</label>
            <input
              id="crop-image"
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">Optional. Maximum file size: 10 MB.</p>
          </div>
        </form>
              
        
        <div className="mt-6 sm:mt-8 flex justify-center">
          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition"
          >
            List Crop
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListCropForm;
