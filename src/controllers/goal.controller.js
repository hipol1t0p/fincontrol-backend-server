const Goal = require("../models/goal");
const { sendSuccess, sendError } = require("../utils/response");

const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });

    const items = goals.map((goal) => ({
      ...goal.toObject(),
      progressPercent:
        goal.targetAmount > 0
          ? Math.min(100, Number(((goal.currentAmount / goal.targetAmount) * 100).toFixed(0)))
          : 0
    }));

    return sendSuccess(res, 200, "Metas obtenidas correctamente", {
      items
    });
  } catch (error) {
    console.error("Error en getGoals:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!goal) {
      return sendError(res, 404, "Meta no encontrada");
    }

    const progressPercent =
      goal.targetAmount > 0
        ? Math.min(100, Number(((goal.currentAmount / goal.targetAmount) * 100).toFixed(0)))
        : 0;

    return sendSuccess(res, 200, "Meta obtenida correctamente", {
      goal: {
        ...goal.toObject(),
        progressPercent
      }
    });
  } catch (error) {
    console.error("Error en getGoalById:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const createGoal = async (req, res) => {
  try {
    const { title, targetAmount, currentAmount, deadline, color, isCompleted } = req.body;

    if (!title || targetAmount === undefined) {
      return sendError(res, 400, "El título y el monto objetivo son obligatorios");
    }

    const goal = await Goal.create({
      user: req.user._id,
      title,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline: deadline || null,
      color: color || "blue",
      isCompleted: Boolean(isCompleted)
    });

    return sendSuccess(res, 201, "Meta creada correctamente", {
      goal: {
        ...goal.toObject(),
        progressPercent:
          goal.targetAmount > 0
            ? Math.min(100, Number(((goal.currentAmount / goal.targetAmount) * 100).toFixed(0)))
            : 0
      }
    });
  } catch (error) {
    console.error("Error en createGoal:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!goal) {
      return sendError(res, 404, "Meta no encontrada");
    }

    const allowedFields = [
      "title",
      "targetAmount",
      "currentAmount",
      "deadline",
      "color",
      "isCompleted"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        goal[field] = req.body[field];
      }
    });

    await goal.save();

    return sendSuccess(res, 200, "Meta actualizada correctamente", {
      goal: {
        ...goal.toObject(),
        progressPercent:
          goal.targetAmount > 0
            ? Math.min(100, Number(((goal.currentAmount / goal.targetAmount) * 100).toFixed(0)))
            : 0
      }
    });
  } catch (error) {
    console.error("Error en updateGoal:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!goal) {
      return sendError(res, 404, "Meta no encontrada");
    }

    return sendSuccess(res, 200, "Meta eliminada correctamente");
  } catch (error) {
    console.error("Error en deleteGoal:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

module.exports = {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal
};