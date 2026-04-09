const User = require("../models/user");
const { sendSuccess, sendError } = require("../utils/response");
const { mapUser } = require("../utils/user.mapper");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return sendError(res, 404, "Usuario no encontrado");
    }

    return sendSuccess(res, 200, "Perfil obtenido correctamente", {
      user: mapUser(user)
    });
  } catch (error) {
    console.error("Error en getProfile:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, avatarUrl } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, 404, "Usuario no encontrado");
    }

    if (typeof firstName === "string") user.firstName = firstName.trim();
    if (typeof lastName === "string") user.lastName = lastName.trim();
    if (typeof avatarUrl === "string") user.avatarUrl = avatarUrl.trim() || null;

    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    if (fullName) {
      user.name = fullName;
    }

    await user.save();

    return sendSuccess(res, 200, "Perfil actualizado correctamente", {
      user: mapUser(user)
    });
  } catch (error) {
    console.error("Error en updateProfile:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

module.exports = {
  getProfile,
  updateProfile
};