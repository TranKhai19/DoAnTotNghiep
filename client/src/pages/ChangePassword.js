import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { changePasswordApi } from "../api/authApi";

export default function ChangePassword({ user }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleChange = async (e) => {
    e.preventDefault();

    if (!password.trim() || !confirmPassword.trim()) {
      return alert("Vui lòng nhập cả mật khẩu mới và xác nhận mật khẩu");
    }

    if (password !== confirmPassword) {
      return alert("Mật khẩu và xác nhận mật khẩu không khớp");
    }

    try {
      setLoading(true);
      await changePasswordApi({ password });
      alert("Đổi mật khẩu thành công");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleChange} className="auth-form">
      <h2>Đổi mật khẩu</h2>

      <input
        type="password"
        value={password}
        placeholder="Mật khẩu mới"
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <input
        type="password"
        value={confirmPassword}
        placeholder="Xác nhận mật khẩu mới"
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
      </button>
    </form>
  );
}