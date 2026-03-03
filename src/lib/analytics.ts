import ReactGA from "react-ga4";

// Initialize Google Analytics
export const initGA = () => {
  // Replace with your Google Analytics Measurement ID
  const GA_MEASUREMENT_ID =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-XXXXXXXXXX";

  if (typeof window !== "undefined") {
    ReactGA.initialize(GA_MEASUREMENT_ID);
    console.log("✅ Google Analytics initialized");
  }
};

// Track page views
export const logPageView = (path: string) => {
  if (typeof window !== "undefined") {
    ReactGA.send({ hitType: "pageview", page: path });
  }
};

// Track events
export const logEvent = (category: string, action: string, label?: string) => {
  if (typeof window !== "undefined") {
    ReactGA.event({
      category,
      action,
      label,
    });
    console.log(`📊 Analytics Event: ${category} - ${action} - ${label || ""}`);
  }
};

// E-commerce tracking
export const logPurchase = (
  orderId: string,
  value: number,
  items: Array<{
    item_id: string;
    item_name: string;
    price: number;
    quantity: number;
  }>,
) => {
  if (typeof window !== "undefined") {
    ReactGA.event("purchase", {
      transaction_id: orderId,
      value: value,
      currency: "BDT",
      items: items.map((item) => ({
        item_id: item.item_id,
        item_name: item.item_name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
    console.log(`💰 Purchase tracked: ${orderId} - TK ${value}`);
  }
};

export const logAddToCart = (
  productId: string,
  productName: string,
  price: number,
) => {
  if (typeof window !== "undefined") {
    ReactGA.event("add_to_cart", {
      currency: "BDT",
      value: price,
      items: [
        {
          item_id: productId,
          item_name: productName,
          price: price,
        },
      ],
    });
    console.log(`🛒 Add to cart tracked: ${productName}`);
  }
};

export const logRemoveFromCart = (productId: string, productName: string) => {
  if (typeof window !== "undefined") {
    ReactGA.event("remove_from_cart", {
      items: [
        {
          item_id: productId,
          item_name: productName,
        },
      ],
    });
    console.log(`🗑️ Remove from cart tracked: ${productName}`);
  }
};

export const logViewItem = (
  productId: string,
  productName: string,
  price: number,
) => {
  if (typeof window !== "undefined") {
    ReactGA.event("view_item", {
      currency: "BDT",
      value: price,
      items: [
        {
          item_id: productId,
          item_name: productName,
          price: price,
        },
      ],
    });
  }
};

export const logBeginCheckout = (
  value: number,
  items: Array<{ id: string; name: string; price: number; quantity: number }>,
) => {
  if (typeof window !== "undefined") {
    ReactGA.event("begin_checkout", {
      currency: "BDT",
      value: value,
      items: items,
    });
    console.log(`🛒 Begin checkout tracked: TK ${value}`);
  }
};
