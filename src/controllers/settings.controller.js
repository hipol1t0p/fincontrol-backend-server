const User = require("../models/user");
const { sendSuccess, sendError } = require("../utils/response");

const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("preferences");
    if (!user) {
      return sendError(res, 404, "Usuario no encontrado");
    }

    return sendSuccess(res, 200, "Configuración obtenida correctamente", {
      preferences: user.preferences
    });
  } catch (error) {
    console.error("Error en getSettings:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const updateSettings = async (req, res) => {
  try {
    const { currency, language, theme } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, 404, "Usuario no encontrado");
    }

    if (typeof currency === "string") user.preferences.currency = currency;
    if (typeof language === "string") user.preferences.language = language;
    if (typeof theme === "string") user.preferences.theme = theme;

    await user.save();

    return sendSuccess(res, 200, "Configuración actualizada correctamente", {
      preferences: user.preferences
    });
  } catch (error) {
    console.error("Error en updateSettings:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

module.exports = {
  getSettings,
  updateSettings
};