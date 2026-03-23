import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi, loginGoogle, loginFacebook } from "../api/authApi";

export default function LoginPage({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginApi({ email, password });
      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
      alert("Đăng nhập thành công");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  const handleGoogle = async () => {
    try {
      const res = await loginGoogle();
      if (res?.data?.url) window.location.href = res.data.url;
    } catch (err) {
      alert(err.response?.data?.message || "Google login thất bại");
    }
  };

  const handleFacebook = async () => {
    try {
      const res = await loginFacebook();
      if (res?.data?.url) window.location.href = res.data.url;
    } catch (err) {
      alert(err.response?.data?.message || "Facebook login thất bại");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Đăng nhập</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Mật khẩu"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type="submit">Đăng nhập</button>

      <button type="button" onClick={handleGoogle}>
        Đăng nhập bằng Google
      </button>

      <button type="button" onClick={handleFacebook}>
        Đăng nhập bằng Facebook
      </button>

      <p>
        <a href="/forgot-password">Quên mật khẩu?</a>
      </p>

      <p>
        Chưa có tài khoản? <a href="/register">Đăng ký</a>
      </p>
    </form>
  );
}