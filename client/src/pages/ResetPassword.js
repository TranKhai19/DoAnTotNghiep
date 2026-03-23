import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { changePasswordApi } from "../api/authApi";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have access_token and refresh_token from URL
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');

    if (!accessToken || !refreshToken) {
      alert("Link reset mật khẩu không hợp lệ");
      navigate("/login");
    }
  }, [searchParams, navigate]);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!password.trim() || !confirmPassword.trim()) {
      return alert("Vui lòng nhập mật khẩu mới");
    }

    if (password !== confirmPassword) {
      return alert("Mật khẩu và xác nhận mật khẩu không khớp");
    }

    try {
      setLoading(true);
      await changePasswordApi({ password });
      alert("Đặt lại mật khẩu thành công");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Đặt lại mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleReset}>
      <h2>Đặt lại mật khẩu</h2>

      <input
        type="password"
        placeholder="Mật khẩu mới"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Xác nhận mật khẩu mới"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
      </button>
    </form>
  );
}