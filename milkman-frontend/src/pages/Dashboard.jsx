import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import CustomerNavbar from "../components/CustomerNavbar";
import "./Dashboard.css";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1550583874-b2661d440523?w=400&h=300&fit=crop";

// Ordered keyword map so specific matches win before broad category fallbacks.
const PRODUCT_IMAGE_RULES = [
  { keyword: "amul milk", image: "https://tse4.mm.bing.net/th/id/OIP.WCvs2pG_zlGA9T_SMehVXAHaHa?pid=Api&P=0&h=180" },
  { keyword: "chitle milk", image: "https://tse4.mm.bing.net/th/id/OIP.OwOi6NYrqASpoEMoWMzhhAHaHa?pid=Api&P=0&h=180" },
  { keyword: "buffalo milk", image: "https://tse1.mm.bing.net/th/id/OIP.v9IyvgdaqRRjqRqTjwyY7AHaHl?pid=Api&P=0&h=180" },
  { keyword: "cow ghee", image: "https://tse1.mm.bing.net/th/id/OIP.clUALlMhA8pVSXMOz0oISwHaHa?pid=Api&P=0&h=180" },
  { keyword: "buffalo ghee", image: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400&h=300&fit=crop" },
  { keyword: "desi ghee", image: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400&h=300&fit=crop" },
  { keyword: "ghee", image: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400&h=300&fit=crop" },
  { keyword: "salted butter", image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=300&fit=crop" },
  { keyword: "whole milk powder", image: "https://tse1.mm.bing.net/th/id/OIP.En_ptV695iVz59sRuTuIfQHaHa?pid=Api&P=0&h=180" },
  { keyword: "butter", image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=300&fit=crop" },

  { keyword: "greek yogurt", image: "https://tse3.mm.bing.net/th/id/OIP.kbApZcy7DehH6qQnfn8vkwHaHa?pid=Api&P=0&h=180" },
  { keyword: "set curd", image: "https://tse3.mm.bing.net/th/id/OIP.luPZEteoJYA0qKW_-gjTUAHaHQ?pid=Api&P=0&h=180https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop" },
  { keyword: "yogurt", image: "https://tse2.mm.bing.net/th/id/OIP.m7EiXu5pTuVmd0aFo9JVgQHaD5?pid=Api&P=0&h=180" },

  { keyword: "mozzarella", image: "https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=400&h=300&fit=crop" },
  { keyword: "cheddar", image: "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400&h=300&fit=crop" },
  { keyword: "feta", image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=300&fit=crop" },
  { keyword: "parmesan", image: "https://tse1.mm.bing.net/th/id/OIP.19iEUkj2ZBKgLgLajR9cswHaE8?pid=Api&P=0&h=180" },
  { keyword: "gouda", image: "https://tse4.mm.bing.net/th/id/OIP.I7deRR_79W4OYhYd9x2YhwHaE8?pid=Api&P=0&h=180" },
  { keyword: "cheese slices", image: "https://tse2.mm.bing.net/th/id/OIP.2u-Gj-FCYhnON9XwbX5A1wHaHa?pid=Api&P=0&h=180" },
  { keyword: "cheese spread", image: "https://tse2.mm.bing.net/th/id/OIP.M694CKKvN2tFC55S8yMr6gHaFj?pid=Api&P=0&h=180" },
  { keyword: "monterey jack", image: "https://tse4.mm.bing.net/th/id/OIP.k5LDRIhJiArMW-CNbxCXBQHaEf?pid=Api&P=0&h=180" },

  { keyword: "paneer", image: "https://tse4.mm.bing.net/th/id/OIP.xsDL3kKe5a-bMLHf8EJJNgHaHa?pid=Api&P=0&h=180" },
  { keyword: "lassi", image: "https://tse1.mm.bing.net/th/id/OIP.SfUYBTDUrCbZKOvihj2P7gHaHa?pid=Api&P=0&h=180" },
  { keyword: "chaas", image: "https://tse1.mm.bing.net/th/id/OIP.GCXQoJcgAQhq_CfFKpEfdwHaHa?pid=Api&P=0&h=180" },
  { keyword: "Buttermilk", image: "https://tse3.mm.bing.net/th/id/OIP.RQMk_rhp-NkYT3dtTPXD-wHaHa?pid=Api&P=0&h=180" },
  { keyword: "fresh cream", image: "https://tse3.mm.bing.net/th/id/OIP.NN22BL1yMZwWkz7Qr8PzQQHaHa?pid=Api&P=0&h=180" },
  { keyword: "cooking cream", image: "https://tse2.mm.bing.net/th/id/OIP.HtVv7L5cqj96d6ShVuQeoAHaHa?pid=Api&P=0&h=180" },
  { keyword: "whipping cream", image: "https://tse4.mm.bing.net/th/id/OIP.ilou_EmSsrQFZuIyxz2ulQHaGy?pid=Api&P=0&h=180" },

  { keyword: "rasgulla", image: "https://tse2.mm.bing.net/th/id/OIP.X6r2xXa2aD_yluA9bgX7OgHaHa?pid=Api&P=0&h=180" },
  { keyword: "gulab jamun", image: "https://tse1.mm.bing.net/th/id/OIP.qeTDREvMjFiacjT1PoUYBQHaHa?pid=Api&P=0&h=180" },
  { keyword: "rabri", image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&h=300&fit=crop" },
  { keyword: "kheer", image: "https://tse2.mm.bing.net/th/id/OIP.trMmYRD6d6kkZUJX_MRdHAHaHa?pid=Api&P=0&h=180" },
];

function Dashboard() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const fetchProducts = async () => {
    try {
      const response = await api.get("product/");
      console.log("PRODUCT RESPONSE:", response.data);
      setProducts(response.data);
    } catch (error) {
      console.error("PRODUCT ERROR:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("category/");
      setCategories(response.data || []);
    } catch (error) {
      console.error("Category error:", error);
    }
  };

  useEffect(() => {
    // allow browsing even when not authenticated
    fetchProducts();
    fetchCategories();

    // if someone lands on dashboard but then loses token (e.g. logged out in another tab)
    const token = localStorage.getItem("customer_token");
    if (!token) {
      // no redirect needed here; they can stay and browse
    }
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  const addToCart = async (product) => {
    const customerId = localStorage.getItem("customer_id");
    if (!customerId) {
      if (window.confirm("You need to be signed in to add items to cart. Go to login page?")) {
        navigate("/login");
      }
      return;
    }
    try {
      await api.post("cart/", { customer: customerId, product: product.id, quantity: 1 });
      window.dispatchEvent(new CustomEvent("cart:increment", { detail: { delta: 1 } }));
      setFeedback({ type: "success", text: `${product.name} added to cart successfully.` });
    } catch (err) {
      console.error("Add to cart error", err);
      setFeedback({ type: "error", text: "Could not add product to cart. Please try again." });
    }
  };

  const getProductImage = (name) => {
    if (!name) return DEFAULT_IMAGE;

    const lowerName = name.toLowerCase();
    const match = PRODUCT_IMAGE_RULES.find((rule) => lowerName.includes(rule.keyword));
    return match ? match.image : DEFAULT_IMAGE;
  };

  return (
    <div className="dashboard-container">
      <CustomerNavbar />

      <div className="welcome-card">
        <h2>Welcome to Milkman</h2>
        <p>Fresh and quality dairy products delivered to your doorstep.</p>
      </div>

      {feedback.text ? (
        <div className={`dashboard-feedback ${feedback.type === "error" ? "error" : "success"}`}>
          {feedback.text}
        </div>
      ) : null}

      <div className="dashboard-metrics">
        <div className="metric-card">
          <span>Products</span>
          <strong>{products.length}</strong>
        </div>
        <div className="metric-card">
          <span>Categories</span>
          <strong>{categories.length}</strong>
        </div>
        <div className="metric-card">
          <span>Visible Items</span>
          <strong>{filteredProducts.length}</strong>
        </div>
      </div>

      <div className="category-container">
        <h3>Browse Categories</h3>
        <button
          className={`category-btn ${selectedCategory === null ? "active" : ""}`}
          onClick={() => setSelectedCategory(null)}
        >
          All Products
        </button>

        {categories.length > 0 &&
          categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-btn ${selectedCategory === cat.id ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
      </div>

      <div className="cards-container">
        {filteredProducts.length === 0 ? (
          <p>No products available in this category</p>
        ) : (
          filteredProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <img
                src={getProductImage(product.name)}
                alt={product.name}
                className="product-image"
              />

              <h3>{product.name}</h3>
              <p>{product.description || "Premium quality dairy product"}</p>
              <div className="product-price">Rs. {product.price}</div>

              <button className="btn" onClick={() => addToCart(product)}>
                Add to Cart
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;
