const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No autorizado. Token no proporcionado"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token inválido. Usuario no encontrado"
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error en authMiddleware:", error.message);
    return res.status(401).json({
      success: false,
      message: "No autorizado. Token inválido o expirado"
    });
  }
};

module.exports = authMiddleware;