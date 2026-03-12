const getDashboard = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Datos del dashboard obtenidos correctamente",
      data: {
        welcomeMessage: `Bienvenido, ${req.user.name}`,
        summary: {
          totalIncome: 0,
          totalExpenses: 0,
          balance: 0
        },
        note: "Este dashboard muestra datos base/simuladores en esta primera etapa del proyecto."
      }
    });
  } catch (error) {
    console.error("Error en dashboard:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
};

module.exports = {
  getDashboard
};