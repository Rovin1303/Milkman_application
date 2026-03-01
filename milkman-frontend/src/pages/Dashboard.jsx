import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem("customer_name");

  useEffect(() => {
    const token = localStorage.getItem("customer_token");
    if (!token) {
      navigate("/");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_name");
    navigate("/");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome {name}</h1>
      <h2>Milkman Customer Dashboard</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;