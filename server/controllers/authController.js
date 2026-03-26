const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const JWT_SECRET = process.env.JWT_SECRET || "secret";

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  const { error } = await supabase
    .from('users')
    .insert([{ name, email, password: hash }]);

  if (error) return res.status(400).json({ error });

  res.json({ message: 'Register success' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (!data) return res.status(400).json({ message: 'User not found' });

  const match = await bcrypt.compare(password, data.password);
  if (!match) return res.status(400).json({ message: 'Wrong password' });

  const token = jwt.sign({ id: data.id }, JWT_SECRET);

  res.json({ token, user: data });
};

exports.logout = (req, res) => {
  res.json({ message: 'Logout success' });
};

exports.changePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  const match = await bcrypt.compare(oldPassword, data.password);
  if (!match) return res.status(400).json({ message: 'Wrong old password' });

  const hash = await bcrypt.hash(newPassword, 10);

  await supabase
    .from('users')
    .update({ password: hash })
    .eq('email', email);

  res.json({ message: 'Password updated' });
};