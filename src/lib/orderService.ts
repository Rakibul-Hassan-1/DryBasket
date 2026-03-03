import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function updateOrderStatus(
  orderId: string,
  status:
    | "Pending"
    | "Accepted"
    | "Processing"
    | "Shipped"
    | "Delivered"
    | "Cancelled",
) {
  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: new Date(),
    });
    return { success: true, message: `Order status updated to ${status}` };
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
}
