const mapUser = (user) => {
  if (!user) return null;

  return {
    id: user._id,
    name: user.name,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email,
    avatarUrl: user.avatarUrl,
    role: user.role,
    isActive: user.isActive,
    preferences: user.preferences,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

module.exports = {
  mapUser
};