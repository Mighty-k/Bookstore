import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronRight, Save, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import type { Address } from "../../types";

const shippingSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  street: z.string().min(5, "Street address is required"),
  apartment: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "ZIP code is required"),
  country: z.string().min(2, "Country is required"),
  saveAddress: z.boolean().optional(),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

interface ShippingFormProps {
  initialAddress?: Address;
  onSubmit: (address: Address, useForBilling: boolean) => void;
  onBack: () => void;
}

const ShippingForm: React.FC<ShippingFormProps> = ({
  initialAddress,
  onSubmit,
  onBack,
}) => {
  const [useForBilling, setUseForBilling] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: initialAddress
      ? {
          fullName: initialAddress.fullName,
          email: initialAddress.email,
          phone: initialAddress.phone,
          street: initialAddress.street,
          apartment: initialAddress.apartment,
          city: initialAddress.city,
          state: initialAddress.state,
          zipCode: initialAddress.zipCode,
          country: initialAddress.country,
        }
      : {
          country: "United States",
        },
  });

  // Auto-fill from user profile
  const handleUseSavedAddress = () => {
    // This would typically fetch from user profile
    setValue("fullName", "John Doe");
    setValue("email", "john@example.com");
    setValue("phone", "(555) 123-4567");
    setValue("street", "123 Main St");
    setValue("city", "San Francisco");
    setValue("state", "CA");
    setValue("zipCode", "94105");
    toast.success("Saved address loaded");
  };

  const onFormSubmit = async (data: ShippingFormData) => {
    setIsSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const address: Address = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      street: data.street,
      apartment: data.apartment,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      country: data.country,
    };

    onSubmit(address, useForBilling);
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Shipping Address</h2>
        <button
          type="button"
          onClick={handleUseSavedAddress}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          <Save className="w-4 h-4 mr-1" />
          Use saved address
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            {...register("fullName")}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.fullName ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="John Doe"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            {...register("email")}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            {...register("phone")}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="(555) 123-4567"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        {/* Street Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Street Address
          </label>
          <input
            type="text"
            {...register("street")}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.street ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="123 Main St"
          />
          {errors.street && (
            <p className="mt-1 text-sm text-red-600">{errors.street.message}</p>
          )}
        </div>

        {/* Apartment */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Apartment, Suite, etc. (optional)
          </label>
          <input
            type="text"
            {...register("apartment")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Apt 4B"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <input
            type="text"
            {...register("city")}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.city ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="San Francisco"
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
          )}
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State
          </label>
          <input
            type="text"
            {...register("state")}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.state ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="CA"
          />
          {errors.state && (
            <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
          )}
        </div>

        {/* ZIP Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ZIP Code
          </label>
          <input
            type="text"
            {...register("zipCode")}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.zipCode ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="94105"
          />
          {errors.zipCode && (
            <p className="mt-1 text-sm text-red-600">
              {errors.zipCode.message}
            </p>
          )}
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country
          </label>
          <select
            {...register("country")}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.country ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Australia">Australia</option>
          </select>
          {errors.country && (
            <p className="mt-1 text-sm text-red-600">
              {errors.country.message}
            </p>
          )}
        </div>
      </div>

      {/* Billing Address Option */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="useForBilling"
            checked={useForBilling}
            onChange={(e) => setUseForBilling(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="useForBilling" className="ml-2 text-sm text-gray-700">
            Use this address for billing
          </label>
        </div>

        {!useForBilling && (
          <p className="mt-2 text-sm text-yellow-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            You'll be prompted for billing address in the next step
          </p>
        )}
      </div>

      {/* Save Address Option */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="saveAddress"
          {...register("saveAddress")}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="saveAddress" className="ml-2 text-sm text-gray-700">
          Save this address to my profile for future orders
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back to Cart
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isSaving}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
              Saving...
            </>
          ) : (
            <>
              Continue to Payment
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ShippingForm;
