const Transaction = require("../models/transaction");
const { sendSuccess, sendError } = require("../utils/response");

const getTransactions = async (req, res) => {
  try {
    const {
      type,
      category,
      month,
      year,
      limit = 10,
      page = 1,
      sort = "-transactionDate"
    } = req.query;

    const query = {
      user: req.user._id
    };

    if (type) query.type = type;
    if (category) query.category = category;

    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 1);

      query.transactionDate = {
        $gte: startDate,
        $lt: endDate
      };
    }

    const numericLimit = Number(limit);
    const numericPage = Number(page);
    const skip = (numericPage - 1) * numericLimit;

    const [items, total] = await Promise.all([
      Transaction.find(query).sort(sort).skip(skip).limit(numericLimit),
      Transaction.countDocuments(query)
    ]);

    return sendSuccess(res, 200, "Transacciones obtenidas correctamente", {
      items,
      pagination: {
        page: numericPage,
        limit: numericLimit,
        total
      }
    });
  } catch (error) {
    console.error("Error en getTransactions:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return sendError(res, 404, "Transacción no encontrada");
    }

    return sendSuccess(res, 200, "Transacción obtenida correctamente", {
      transaction
    });
  } catch (error) {
    console.error("Error en getTransactionById:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const createTransaction = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      type,
      amount,
      transactionDate,
      merchant,
      icon,
      color
    } = req.body;

    if (!title || !category || !type || amount === undefined) {
      return sendError(res, 400, "Título, categoría, tipo y monto son obligatorios");
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      title,
      description,
      category,
      type,
      amount,
      transactionDate: transactionDate || new Date(),
      merchant,
      icon,
      color
    });

    return sendSuccess(res, 201, "Transacción creada correctamente", {
      transaction
    });
  } catch (error) {
    console.error("Error en createTransaction:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return sendError(res, 404, "Transacción no encontrada");
    }

    const allowedFields = [
      "title",
      "description",
      "category",
      "type",
      "amount",
      "transactionDate",
      "merchant",
      "icon",
      "color"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        transaction[field] = req.body[field];
      }
    });

    await transaction.save();

    return sendSuccess(res, 200, "Transacción actualizada correctamente", {
      transaction
    });
  } catch (error) {
    console.error("Error en updateTransaction:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return sendError(res, 404, "Transacción no encontrada");
    }

    return sendSuccess(res, 200, "Transacción eliminada correctamente");
  } catch (error) {
    console.error("Error en deleteTransaction:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
};