import { Product } from "../pages/VendorDashboard";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "mock-1",
    title: "Introduction to Computer Science Textbook",
    price: 15000,
    category: "Textbooks",
    vendor_id: "vendor-123",
    condition: "Good",
    description: "Slightly used textbook for CSC 101. No highlights.",
    image_url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800",
    is_sold: false,
    quantity: Math.floor(Math.random() * 5) + 1,
    created_at: new Date().toISOString()
  },
  {
    id: "mock-2",
    title: "HP Laptop 15 - Core i5",
    price: 120000,
    category: "Electronics",
    vendor_id: "vendor-456",
    condition: "Used - Like New",
    description: "HP laptop, 8GB RAM, 256GB SSD. Works perfectly.",
    image_url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800",
    is_sold: false,
    quantity: Math.floor(Math.random() * 5) + 1,
    created_at: new Date().toISOString()
  },
  {
    id: "mock-3",
    title: "Mini Fridge for Dorm",
    price: 35000,
    category: "Dorm",
    vendor_id: "vendor-123",
    condition: "Good",
    description: "Compact fridge perfect for dorm rooms. Chills well.",
    image_url: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&q=80&w=800",
    is_sold: false,
    quantity: Math.floor(Math.random() * 5) + 1,
    created_at: new Date().toISOString()
  },
  {
    id: "mock-4",
    title: "Scientific Calculator",
    price: 5000,
    category: "Supplies",
    vendor_id: "vendor-789",
    condition: "New",
    description: "Brand new Casio scientific calculator.",
    image_url: "https://images.unsplash.com/photo-1574607383476-f517f260d30b?auto=format&fit=crop&q=80&w=800",
    is_sold: false,
    quantity: Math.floor(Math.random() * 5) + 1,
    created_at: new Date().toISOString()
  }
];
