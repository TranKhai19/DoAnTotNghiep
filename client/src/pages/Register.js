import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerApi } from "../api/authApi";

export default function RegisterPage({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      return alert("Vui lòng điền đầy đủ thông tin");
    }

    if (password !== confirmPassword) {
      return alert("Mật khẩu và xác nhận mật khẩu không khớp");
    }

    try {
      setLoading(true);
      await registerApi({ email, password });
      alert("Đăng ký thành công");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="auth-form">
      <h2>Đăng ký</h2>

      <input
        type="email"
        value={email}
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        value={password}
        placeholder="Mật khẩu"
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <input
        type="password"
        value={confirmPassword}
        placeholder="Xác nhận mật khẩu"
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Đang xử lý..." : "Đăng ký"}
      </button>

      <p>
        Đã có tài khoản? <a href="/login">Đăng nhập</a>
      </p>
    </form>
  );
}