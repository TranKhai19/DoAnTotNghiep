import { useState } from "react";
import { forgotPasswordApi } from "../api/authApi";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      return alert("Vui lòng nhập email");
    }

    try {
      setLoading(true);
      await forgotPasswordApi({ email });
      alert("Email reset mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.");
    } catch (err) {
      alert(err.response?.data?.message || "Gửi email thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleForgot}>
      <h2>Quên mật khẩu</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <button>Gửi email reset mật khẩu</button>

      <p>
        <a href="/login">Quay lại đăng nhập</a>
      </p>
    </form>
  );
}