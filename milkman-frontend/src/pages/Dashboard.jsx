import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // ✅ Safe Fetch Functions
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

  // ✅ useEffect fixed
  useEffect(() => {
    const token = localStorage.getItem("customer_token");
    if (!token) {
      navigate("/");
      return;
    }

    fetchProducts();
    fetchCategories();
  }, []);

  // ✅ Filter Logic Safe
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  // ✅ Static Image Function (NO DB STORAGE)
  const getProductImage = (name) => {
    if (!name) return "https://via.placeholder.com/250";

    if (name.toLowerCase().includes("cow"))
      return "https://images.unsplash.com/photo-1580910051074-3eb694886505";

    if (name.toLowerCase().includes("butter"))
      return "https://images.unsplash.com/photo-1589985270958-bcbf2c07f6e4";

    if (name.toLowerCase().includes("ghee"))
      return "https://images.unsplash.com/photo-1615486364553-d8b90c0f05d1";

    return "https://via.placeholder.com/250";
  };

  return (
    <div className="dashboard-container">

      {/* Navbar */}
      <div className="navbar">
        <h2>🥛 Milkman</h2>
        <div>
          <span className="nav-item">Cart 🛒</span>
        </div>
      </div>

      {/* Welcome */}
      <div className="welcome-card">
        <h2>Welcome to Milkman App</h2>
      </div>

      {/* Categories */}
      <div className="category-container">
        <button
          className="category-btn"
          onClick={() => setSelectedCategory(null)}
        >
          All
        </button>

        {categories.length > 0 &&
          categories.map((cat) => (
            <button
              key={cat.id}
              className="category-btn"
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
      </div>

      {/* Product Cards */}
      <div className="cards-container">
        {filteredProducts.length === 0 ? (
          <p>No products available</p>
        ) : (
          filteredProducts.map((product) => (
            <div className="product-card" key={product.id}>
              
              <img
                src={getProductImage(product.name)}
                alt={product.name}
                className="product-image"
              />

              <h3>{product.name}</h3>

              <p className="price">₹ {product.price}</p>

              <p className="subscription">
                Subscription: ₹ {product.subscription_amount}
              </p>

              <button className="add-cart-btn">
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