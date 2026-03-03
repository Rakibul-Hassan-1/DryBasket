"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../src/contexts/AuthContext";
import {
  addProduct,
  getProducts,
  Product,
  updateProduct,
} from "../../src/lib/store";

const CATEGORY_OPTIONS = [
  "Dry Foods",
  "Dry Fruits",
  "Nuts",
  "Grains",
  "Pulses",
  "Flour",
  "Seeds",
];

const formatTk = (amount: number) => `৳${amount.toLocaleString("bn-BD")}`;

type ProductEditDraft = {
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  price: string;
  stock: string;
  weight: string;
};

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Dry Foods");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [weight, setWeight] = useState("");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ProductEditDraft | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState("");

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin = Boolean(user?.email && user.email === adminEmail);

  const loadProducts = async () => {
    setFetching(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!loading && isAdmin) {
      loadProducts();
    }
  }, [loading, isAdmin]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setMessage("Please upload a valid image file.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setMessage("Image size must be under 5MB.");
        return;
      }

      setImageFile(file);
      setImageUrl("");
      setMessage("");

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      // Cloudinary Configuration from environment variables
      const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      if (!CLOUD_NAME) {
        throw new Error(
          "Cloudinary not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME.",
        );
      }

      const uploadPreset =
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
        "drybasket_products";

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", "drybasket");

      console.log("Uploading to Cloudinary...");
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Cloudinary error:", errorData);
        throw new Error(errorData.error?.message || "Cloudinary upload failed");
      }

      const data = await response.json();
      console.log("Upload successful:", data.secure_url);
      return data.secure_url;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const handleAddProduct = async () => {
    setMessage("");

    if (!name.trim() || !description.trim() || !category.trim()) {
      setMessage("Please complete all product fields.");
      return;
    }

    if (!imageFile && !imageUrl.trim()) {
      setMessage("Please upload an image or provide an image URL.");
      return;
    }

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);
    if (
      Number.isNaN(parsedPrice) ||
      parsedPrice <= 0 ||
      !Number.isInteger(parsedPrice) ||
      Number.isNaN(parsedStock) ||
      parsedStock < 0 ||
      !Number.isInteger(parsedStock)
    ) {
      setMessage("Price and stock must be valid whole numbers.");
      return;
    }

    setSaving(true);
    setUploading(false);
    try {
      let finalImageUrl = imageUrl.trim();

      // Upload image if file is selected
      if (imageFile) {
        setUploading(true);
        setMessage("Uploading image to Cloudinary...");
        try {
          finalImageUrl = await uploadImage(imageFile);
          setMessage("Image uploaded successfully!");
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          setMessage(
            `Image upload failed: ${uploadError instanceof Error ? uploadError.message : "Unknown error"}. Check Cloudinary preset settings.`,
          );
          setSaving(false);
          setUploading(false);
          return;
        }
        setUploading(false);
      }

      setMessage("Saving product to database...");
      await addProduct({
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        imageUrl: finalImageUrl,
        price: parsedPrice,
        stock: parsedStock,
        weight: weight.trim() || undefined,
      });

      setName("");
      setDescription("");
      setCategory("Dry Foods");
      setImageUrl("");
      setImageFile(null);
      setImagePreview("");
      setPrice("");
      setStock("");
      setWeight("");
      setMessage("Product added successfully.");
      await loadProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      setMessage("Failed to add product. Check Firebase configuration.");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProductId(product.id);
    setEditDraft({
      name: product.name,
      description: product.description,
      category: product.category,
      imageUrl: product.imageUrl,
      price: String(product.price),
      stock: String(product.stock),
      weight: product.weight || "",
    });
    setEditImageFile(null);
    setEditImagePreview("");
    setMessage("");
  };

  const closeEditModal = () => {
    setEditingProductId(null);
    setEditDraft(null);
    setEditImageFile(null);
    setEditImagePreview("");
  };

  const handleEditField = (field: keyof ProductEditDraft, value: string) => {
    setEditDraft((previous) =>
      previous
        ? {
            ...previous,
            [field]: value,
          }
        : previous,
    );
  };

  const handleEditImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please upload a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image size must be under 5MB.");
      return;
    }

    setEditImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setMessage("");
  };

  const handleUpdateProduct = async () => {
    if (!editingProductId || !editDraft) return;

    if (
      !editDraft.name.trim() ||
      !editDraft.description.trim() ||
      !editDraft.category.trim() ||
      !editDraft.imageUrl.trim()
    ) {
      setMessage("Please complete all required edit fields.");
      return;
    }

    const parsedPrice = Number(editDraft.price);
    const parsedStock = Number(editDraft.stock);

    if (
      Number.isNaN(parsedPrice) ||
      parsedPrice <= 0 ||
      !Number.isInteger(parsedPrice) ||
      Number.isNaN(parsedStock) ||
      parsedStock < 0 ||
      !Number.isInteger(parsedStock)
    ) {
      setMessage("Edited price and stock must be valid whole numbers.");
      return;
    }

    setSaving(true);
    try {
      let nextImageUrl = editDraft.imageUrl.trim();
      if (editImageFile) {
        setUploading(true);
        nextImageUrl = await uploadImage(editImageFile);
        setUploading(false);
      }

      await updateProduct(editingProductId, {
        name: editDraft.name.trim(),
        description: editDraft.description.trim(),
        category: editDraft.category.trim(),
        imageUrl: nextImageUrl,
        price: parsedPrice,
        stock: parsedStock,
        weight: editDraft.weight.trim() || undefined,
      });

      setMessage("Product updated successfully.");
      closeEditModal();
      await loadProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      setMessage("Failed to update product. Please try again.");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-600">
        Loading admin panel...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto p-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-700">
          Admin access only. Set `NEXT_PUBLIC_ADMIN_EMAIL` and login with that
          email.
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-2 gap-6">
      <div className="bg-white border border-gray-200 rounded-xl p-5 h-fit">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Admin Product Manager
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          Create catalog-ready products with clean pricing, stock, and media.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">
              Product Name
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter product name"
              className="w-full border-2 border-gray-400 bg-white rounded-lg px-3 py-2.5 text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Enter product description"
              rows={3}
              className="w-full border-2 border-gray-400 bg-white rounded-lg px-3 py-2.5 text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full border-2 border-gray-400 bg-white rounded-lg px-3 py-2.5 text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">
              Product Image
            </label>

            {/* Image Upload Button */}
            <div className="space-y-3">
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <div className="w-full border-2 border-dashed border-indigo-400 bg-indigo-50 rounded-lg px-4 py-8 text-center cursor-pointer hover:bg-indigo-100 transition">
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-sm font-bold text-indigo-700">
                    Click to Upload Image
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    PNG, JPG, WEBP up to 5MB
                  </p>
                </div>
              </label>

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-md text-xs font-bold hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* OR Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="text-xs font-bold text-gray-500">OR</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              {/* Image URL Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Image URL (Optional)
                </label>
                <input
                  value={imageUrl}
                  onChange={(event) => {
                    setImageUrl(event.target.value);
                    if (event.target.value) {
                      setImageFile(null);
                      setImagePreview("");
                    }
                  }}
                  placeholder="https://example.com/image.jpg"
                  className="w-full border-2 border-gray-400 bg-white rounded-lg px-3 py-2 text-sm text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  disabled={!!imageFile}
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">
                Price (৳)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="1200"
                className="w-full border-2 border-gray-400 bg-white rounded-lg px-3 py-2.5 text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">
                Stock
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(event) => setStock(event.target.value)}
                placeholder="50"
                className="w-full border-2 border-gray-400 bg-white rounded-lg px-3 py-2.5 text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">
              Weight / Pack Size (Optional)
            </label>
            <input
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              placeholder="e.g., 500g, 1kg, 5kg"
              className="w-full border-2 border-gray-400 bg-white rounded-lg px-3 py-2.5 text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        {message && (
          <p className="mt-4 text-sm rounded-md px-3 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700">
            {message}
          </p>
        )}

        <button
          onClick={handleAddProduct}
          disabled={saving || uploading}
          className="mt-4 w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 font-semibold"
        >
          {uploading
            ? "Uploading Image..."
            : saving
              ? "Saving..."
              : "Add Product"}
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Current Products
        </h2>

        {fetching ? (
          <p className="text-gray-600">Loading products...</p>
        ) : !products.length ? (
          <p className="text-gray-600">No products yet.</p>
        ) : (
          <div className="space-y-3 max-h-[70vh] overflow-auto pr-1">
            {products.map((product) => (
              <article
                key={product.id}
                className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-white transition"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-14 h-14 rounded-md object-cover border border-gray-300"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">
                        {product.name}
                      </h3>
                      <p className="text-sm font-semibold text-gray-700">
                        {product.category}
                      </p>
                      {product.weight && (
                        <p className="text-xs font-medium text-gray-500 mt-1">
                          {product.weight}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-700 text-lg">
                      {formatTk(product.price)}
                    </p>
                    <p
                      className={`text-xs font-semibold mt-1 ${
                        product.stock > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {product.stock > 0 ? "Active" : "Out of stock"}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-800 mt-2">
                  Stock: {product.stock} units
                </p>
                <button
                  onClick={() => openEditModal(product)}
                  className="mt-3 w-full bg-gray-900 text-white py-2 rounded-md text-sm font-semibold hover:bg-black transition"
                >
                  Edit Product
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      {editingProductId && editDraft && (
        <div className="fixed inset-0 z-50 bg-black/50 p-3 sm:p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 shadow-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Edit Product</h3>
              <button
                onClick={closeEditModal}
                className="px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              <input
                value={editDraft.name}
                onChange={(event) =>
                  handleEditField("name", event.target.value)
                }
                placeholder="Product name"
                className="w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 text-gray-900"
              />
              <textarea
                value={editDraft.description}
                onChange={(event) =>
                  handleEditField("description", event.target.value)
                }
                rows={3}
                placeholder="Product description"
                className="w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 text-gray-900"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={editDraft.category}
                  onChange={(event) =>
                    handleEditField("category", event.target.value)
                  }
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 text-gray-900"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <input
                  value={editDraft.weight}
                  onChange={(event) =>
                    handleEditField("weight", event.target.value)
                  }
                  placeholder="Weight, e.g. 500g"
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 text-gray-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Price (৳)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={editDraft.price}
                    onChange={(event) =>
                      handleEditField("price", event.target.value)
                    }
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={editDraft.stock}
                    onChange={(event) =>
                      handleEditField("stock", event.target.value)
                    }
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Image URL
                  </label>
                  <input
                    value={editDraft.imageUrl}
                    onChange={(event) =>
                      handleEditField("imageUrl", event.target.value)
                    }
                    placeholder="https://example.com/image.jpg"
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Change Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="border border-gray-200 rounded-lg p-2">
                  <p className="text-xs font-semibold text-gray-500 mb-2">
                    Current / URL Image
                  </p>
                  <img
                    src={editDraft.imageUrl}
                    alt="Current product"
                    className="w-full h-36 object-cover rounded-md"
                  />
                </div>
                <div className="border border-gray-200 rounded-lg p-2">
                  <p className="text-xs font-semibold text-gray-500 mb-2">
                    New Upload Preview
                  </p>
                  {editImagePreview ? (
                    <img
                      src={editImagePreview}
                      alt="New preview"
                      className="w-full h-36 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-36 rounded-md bg-gray-100 text-gray-500 text-sm flex items-center justify-center">
                      No new image selected
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleUpdateProduct}
                  disabled={saving || uploading}
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-300"
                >
                  {uploading
                    ? "Uploading..."
                    : saving
                      ? "Updating..."
                      : "Save Changes"}
                </button>
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
