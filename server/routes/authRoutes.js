const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// REGISTER
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) return res.status(400).json({ message: error.message });

  res.json({ message: "Đăng ký thành công", user: data.user });
});

//  LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(400).json({ message: error.message });

  res.json(data);
});

//  LOGOUT
router.post("/logout", async (req, res) => {
  const { error } = await supabase.auth.signOut();

  if (error) return res.status(400).json({ message: error.message });

  res.json({ message: "Đăng xuất thành công" });
});

//  CHANGE PASSWORD
router.post("/change-password", async (req, res) => {
  const { password } = req.body;

  const { data, error } = await supabase.auth.updateUser({
    password,
  });

  if (error) return res.status(400).json({ message: error.message });

  res.json({ message: "Đổi mật khẩu thành công" });
});

//  LOGIN GOOGLE
router.get("/google", async (req, res) => {
  const { data } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });

  res.json({ url: data.url });
});

// LOGIN FACEBOOK
router.get("/facebook", async (req, res) => {
  const { data } = await supabase.auth.signInWithOAuth({
    provider: "facebook",
  });

  res.json({ url: data.url });
});

module.exports = router;