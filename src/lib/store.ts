import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

function removeUndefinedFields<T extends Record<string, unknown>>(payload: T) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  price: number;
  stock: number;
  weight?: string; // e.g., "500g", "1kg"
  createdAt?: unknown;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  weight?: string; // e.g., "500g", "1kg"
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderRecord {
  id: string;
  userId: string;
  userEmail: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  status: string;
  subtotal: number;
  deliveryCharge: number;
  grandTotal: number;
  items: OrderItem[];
  createdAt?: unknown;
}

export const sampleDryFoods: Omit<Product, "id">[] = [
  {
    name: "Premium Basmati Rice",
    description: "Long-grain aromatic rice, 5kg pack.",
    category: "Grains",
    imageUrl:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80",
    price: 1962, // TK
    stock: 45,
    weight: "5kg",
  },
  {
    name: "Organic Red Lentils",
    description: "High-protein masoor dal, 2kg bag.",
    category: "Pulses",
    imageUrl:
      "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=1200&q=80",
    price: 981, // TK
    stock: 60,
    weight: "2kg",
  },
  {
    name: "Whole Wheat Flour",
    description: "Stone-ground atta, 5kg bag.",
    category: "Flour",
    imageUrl:
      "https://images.unsplash.com/photo-1604908177522-050264f4dce5?auto=format&fit=crop&w=1200&q=80",
    price: 1308, // TK
    stock: 50,
    weight: "5kg",
  },
  {
    name: "Raw Peanuts",
    description: "Fresh dry peanuts, 1kg pouch.",
    category: "Nuts",
    imageUrl:
      "https://images.unsplash.com/photo-1569288063648-5d987a6ebc83?auto=format&fit=crop&w=1200&q=80",
    price: 654, // TK
    stock: 80,
    weight: "1kg",
  },
  {
    name: "Medjool Dates",
    description: "Naturally sweet dry dates, 500g box.",
    category: "Dry Fruits",
    imageUrl:
      "https://images.unsplash.com/photo-1594995669939-5f68703d4b9f?auto=format&fit=crop&w=1200&q=80",
    price: 1199, // TK
    stock: 35,
    weight: "500g",
  },
  {
    name: "Cashew Nuts",
    description: "Crunchy premium cashews, 500g pack.",
    category: "Dry Fruits",
    imageUrl:
      "https://images.unsplash.com/photo-1615485737651-1f71fca7e0f0?auto=format&fit=crop&w=1200&q=80",
    price: 1526, // TK
    stock: 40,
    weight: "500g",
  },
];

export async function seedProductsIfEmpty() {
  const productsRef = collection(db, "products");
  const snapshot = await getDocs(productsRef);

  if (!snapshot.empty) return;

  await Promise.all(
    sampleDryFoods.map((product) =>
      addDoc(productsRef, {
        ...product,
        createdAt: serverTimestamp(),
      }),
    ),
  );
}

export async function getProducts(): Promise<Product[]> {
  const productsRef = collection(db, "products");
  const q = query(productsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((productDoc) => ({
    id: productDoc.id,
    ...(productDoc.data() as Omit<Product, "id">),
  }));
}

export async function addProduct(product: Omit<Product, "id" | "createdAt">) {
  const cleanProduct = removeUndefinedFields(
    product as Record<string, unknown>,
  );

  await addDoc(collection(db, "products"), {
    ...cleanProduct,
    createdAt: serverTimestamp(),
  });
}

export async function updateProduct(
  productId: string,
  updates: Partial<Omit<Product, "id" | "createdAt">>,
) {
  const productRef = doc(db, "products", productId);
  const cleanUpdates = removeUndefinedFields(
    updates as Record<string, unknown>,
  );

  await updateDoc(productRef, cleanUpdates);
}

export async function placeOrder(
  userId: string,
  userEmail: string,
  orderPayload: {
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
    paymentMethod: string;
    items: CartItem[];
  },
) {
  try {
    const orderItems: OrderItem[] = orderPayload.items.map((item) => ({
      productId: item.id,
      name: item.name,
      weight: item.weight,
      quantity: item.quantity,
      unitPrice: item.price,
      lineTotal: item.price * item.quantity,
    }));

    const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const deliveryCharge = 120; // Always 120 TK
    const grandTotal = subtotal + deliveryCharge;

    console.log("🚀 Placing order for user:", userId);
    console.log("📦 Order items:", orderItems);
    console.log(
      "💰 Subtotal:",
      subtotal,
      "Delivery:",
      deliveryCharge,
      "Total:",
      grandTotal,
    );

    // Update product stock
    console.log("📊 Updating product stock...");
    try {
      await Promise.all(
        orderPayload.items.map(async (item) => {
          const productRef = doc(db, "products", item.id);
          console.log(
            `📦 Updating stock for ${item.name}: ${item.stock} -> ${item.stock - item.quantity}`,
          );
          await updateDoc(productRef, { stock: item.stock - item.quantity });
        }),
      );
      console.log("✅ Product stock updated successfully");
    } catch (stockError) {
      console.error("❌ Stock update error:", stockError);
      throw new Error(
        `Stock update failed: ${stockError instanceof Error ? stockError.message : "Unknown error"}`,
      );
    }

    // Create order
    console.log("💾 Creating order in Firestore...");

    // Clean order items - remove undefined fields
    const cleanItems = orderItems.map((item) => {
      const cleanItem: Record<string, unknown> = {
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      };
      if (item.weight) {
        cleanItem.weight = item.weight;
      }
      return cleanItem;
    });

    const orderData = {
      userId,
      userEmail,
      shippingName: orderPayload.shippingName,
      shippingPhone: orderPayload.shippingPhone,
      shippingAddress: orderPayload.shippingAddress,
      paymentMethod: orderPayload.paymentMethod,
      status: "Pending",
      subtotal,
      deliveryCharge,
      grandTotal,
      items: cleanItems,
      createdAt: serverTimestamp(),
    };
    console.log("📝 Order data to save:", orderData);
    console.log("🔐 User ID in order:", userId);
    console.log("🔑 User Email:", userEmail);

    try {
      const docRef = await addDoc(collection(db, "orders"), orderData);
      console.log("✅ Order created successfully with ID:", docRef.id);
      return docRef.id;
    } catch (createError) {
      console.error("❌ Order creation error details:", {
        error: createError,
        message: createError instanceof Error ? createError.message : "Unknown",
        code: (createError as { code?: string })?.code,
        errorType:
          createError instanceof Error
            ? createError.constructor.name
            : typeof createError,
      });
      throw createError;
    }
  } catch (error) {
    console.error("❌ Complete error in placeOrder:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error code:", (error as { code?: string }).code);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
}

export async function getOrdersByUser(userId: string): Promise<OrderRecord[]> {
  const ordersRef = collection(db, "orders");
  const q = query(ordersRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((orderDoc) => ({
      id: orderDoc.id,
      ...(orderDoc.data() as Omit<OrderRecord, "id">),
    }))
    .sort((a, b) => {
      const dateA = (a.createdAt as { seconds?: number })?.seconds ?? 0;
      const dateB = (b.createdAt as { seconds?: number })?.seconds ?? 0;
      return dateB - dateA;
    });
}

export async function getOrdersForVerification(): Promise<OrderRecord[]> {
  try {
    console.log("🔍 Fetching all orders for verification...");
    const ordersRef = collection(db, "orders");
    const snapshot = await getDocs(ordersRef);

    console.log("✅ Successfully fetched orders count:", snapshot.docs.length);

    const orders = snapshot.docs.map((orderDoc) => ({
      id: orderDoc.id,
      ...(orderDoc.data() as Omit<OrderRecord, "id">),
    }));

    console.log(
      "📋 Orders data:",
      orders.map((o) => ({
        id: o.id,
        invoiceNum: `INV-${o.id.substring(0, 12).toUpperCase()}`,
        grandTotal: o.grandTotal,
      })),
    );

    return orders;
  } catch (error) {
    console.error("❌ Error fetching orders for verification:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error code:", (error as { code?: string })?.code);
    }
    return [];
  }
}
