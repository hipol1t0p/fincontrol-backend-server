const Transaction = require("../models/transaction");
const { sendSuccess, sendError } = require("../utils/response");

const getMonthRange = (month, year) => {
  const start = new Date(Number(year), Number(month) - 1, 1);
  const end = new Date(Number(year), Number(month), 1);
  return { start, end };
};

const getOverview = async (req, res) => {
  try {
    const now = new Date();
    const month = Number(req.query.month || now.getMonth() + 1);
    const year = Number(req.query.year || now.getFullYear());

    const { start, end } = getMonthRange(month, year);

    const transactions = await Transaction.find({
      user: req.user._id,
      transactionDate: { $gte: start, $lt: end }
    });

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return sendSuccess(res, 200, "Reporte general obtenido correctamente", {
      month,
      year,
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses
    });
  } catch (error) {
    console.error("Error en getOverview:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const getIncomeVsExpenses = async (req, res) => {
  try {
    const year = Number(req.query.year || new Date().getFullYear());

    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);

    const transactions = await Transaction.find({
      user: req.user._id,
      transactionDate: { $gte: start, $lt: end }
    });

    const result = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      income: 0,
      expenses: 0
    }));

    transactions.forEach((transaction) => {
      const monthIndex = new Date(transaction.transactionDate).getMonth();
      if (transaction.type === "income") {
        result[monthIndex].income += transaction.amount;
      } else {
        result[monthIndex].expenses += transaction.amount;
      }
    });

    return sendSuccess(res, 200, "Reporte de ingresos vs gastos obtenido correctamente", {
      year,
      items: result
    });
  } catch (error) {
    console.error("Error en getIncomeVsExpenses:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const getByCategory = async (req, res) => {
  try {
    const now = new Date();
    const month = Number(req.query.month || now.getMonth() + 1);
    const year = Number(req.query.year || now.getFullYear());

    const { start, end } = getMonthRange(month, year);

    const transactions = await Transaction.find({
      user: req.user._id,
      transactionDate: { $gte: start, $lt: end }
    });

    const categoryMap = {};

    transactions.forEach((transaction) => {
      if (!categoryMap[transaction.category]) {
        categoryMap[transaction.category] = 0;
      }
      categoryMap[transaction.category] += transaction.amount;
    });

    const items = Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount
    }));

    return sendSuccess(res, 200, "Reporte por categoría obtenido correctamente", {
      month,
      year,
      items
    });
  } catch (error) {
    console.error("Error en getByCategory:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

module.exports = {
  getOverview,
  getIncomeVsExpenses,
  getByCategory
};