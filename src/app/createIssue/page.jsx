"use client";
import React, { useState } from "react";
import { MapPin, Upload, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// Mock data for dropdowns
const categoryOptions = [
  { value: "pothole", label: "Pothole" },
  { value: "streetlight", label: "Street Light" },
  { value: "sanitation", label: "Sanitation" },
  { value: "graffiti", label: "Graffiti" },
  { value: "traffic", label: "Traffic" },
  { value: "water", label: "Water" },
  { value: "general", label: "General" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const departmentOptions = [
  { value: "public_works", label: "Public Works" },
  { value: "sanitation", label: "Sanitation" },
  { value: "traffic", label: "Traffic Management" },
  { value: "utilities", label: "Utilities" },
  { value: "parks", label: "Parks & Recreation" },
  { value: "police", label: "Police" },
  { value: "fire", label: "Fire Department" },
  { value: "general", label: "General Services" },
];

export default function CreateIssueForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "general",
    priority: "medium",
    address: "",
    department: "general",
    longitude: "",
    latitude: ""
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleGetLocation = () => {
    setLocationLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setFormData((prev) => ({
            ...prev,
            address: `${lat}, ${lng}`,
            latitude: lat.toString(),
            longitude: lng.toString(),
          }));

          setHasLocation(true);
          setLocationLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert(
            "Unable to get your location. Please enter the address manually."
          );
          setLocationLoading(false);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      setLocationLoading(false);
    }
  };

  const clearLocation = () => {
    setHasLocation(false);
    setFormData((prev) => ({
      ...prev,
      address: "",
      latitude: "",
      longitude: "",
    }));
  };

  const handleSubmit = async () => {
    console.log(formData)
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("category", formData.category);
      submitData.append("priority", formData.priority);
      submitData.append("address", formData.address);
      submitData.append("department", formData.department);
      submitData.append("longitude", formData.longitude);
      submitData.append("latitude", formData.latitude);

      if (selectedImage) {
        submitData.append("image", selectedImage);
      }

      const response = await fetch("/api/createIssue", {
        method: "POST",
        body: submitData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create issue");
      }

      // Success - reset form
      setFormData({
        title: "",
        description: "",
        category: "general",
        priority: "medium",
        address: "",
        department: "general",
        longitude: "",
        latitude: "",
      });
      setSelectedImage(null);
      setImagePreview(null);
      setHasLocation(false);
      setSubmitSuccess(true);

      // Show success message
      router.push("/user");
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "general",
      priority: "medium",
      address: "",
      department: "general",
      longitude: "",
      latitude: "",
    });
    setSelectedImage(null);
    setImagePreview(null);
    setHasLocation(false);
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-semibold text-[var(--heading-color)]">
            Report an Issue
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Help improve your community by reporting issues that need attention.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Error Display */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {submitError}
            </div>
          )}

          {/* Success Display */}
          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
              Issue created successfully!
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Brief description of the issue"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description *
            </label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Provide detailed information about the issue, including when it occurred and its impact..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Category, Priority, and Department */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <select
                name="department"
                required
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {departmentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Location (Optional)
              </label>
              <div className="flex gap-2">
                {!hasLocation ? (
                  <Button
                    type="button"
                    variant="green"
                    onClick={handleGetLocation}
                    disabled={locationLoading}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {locationLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <MapPin className="w-4 h-4 mr-2" />
                    )}
                    {locationLoading
                      ? "Getting Location..."
                      : "Get Current Location"}
                  </Button>
                ) : (
                  <button
                    type="button"
                    onClick={clearLocation}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Location
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={(e) => {
                  const { name, value } = e.target;

                  // Split based on comma and trim
                  const parts = value.split(",").map((p) => p.trim());

                  // Prepare new form data
                  let updatedFormData = { ...formData, [name]: value };

                  if (parts.length === 2) {
                    const lat = parts[0];
                    const lng = parts[1];
                    console.log("latitude:", lat);
                    console.log("longitude:", lng);
                    updatedFormData = {
                      ...updatedFormData,
                      latitude: lat,
                      longitude: lng,
                    };
                  }

                  setFormData(updatedFormData);
                }}
                placeholder="Enter the address, e.g. 31.4010204, 74.2061816"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {hasLocation && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ Location detected automatically
                </p>
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image (Optional)
            </label>

            {!selectedImage ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-12 w-12 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    <p>Click to upload an image or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded-lg object-contain"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={resetForm}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <Button
              type="button"
              variant="green"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Issue...
                </>
              ) : (
                "Create Issue"
              )}
            </Button>
          </div>
        </div>
      </div>
          
    </div>
  );
}