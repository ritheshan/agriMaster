export const getCurrentUser = (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  res.status(200).json(req.user);
};