const Transaction = require("../models/transaction");
const Goal = require("../models/goal");
const Budget = require("../models/budget");

const getCurrentMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end, now };
};

const getPreviousMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 1);
  return { start, end };
};

const buildDashboardData = async (user) => {
  const { start, end, now } = getCurrentMonthRange();
  const previousMonth = getPreviousMonthRange();

  const [allTransactions, currentMonthTransactions, previousMonthTransactions, goals, budget] =
    await Promise.all([
      Transaction.find({ user: user._id }).sort({ transactionDate: -1 }),
      Transaction.find({
        user: user._id,
        transactionDate: { $gte: start, $lt: end }
      }).sort({ transactionDate: -1 }),
      Transaction.find({
        user: user._id,
        transactionDate: { $gte: previousMonth.start, $lt: previousMonth.end }
      }),
      Goal.find({ user: user._id }).sort({ createdAt: -1 }),
      Budget.findOne({
        user: user._id,
        month: now.getMonth() + 1,
        year: now.getFullYear()
      })
    ]);

  const totalIncome = allTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = allTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = totalIncome - totalExpenses;

  const currentMonthIncome = currentMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthExpenses = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const previousMonthIncome = previousMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const previousMonthExpenses = previousMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const previousBalance = previousMonthIncome - previousMonthExpenses;
  const changePercent =
    previousBalance > 0
      ? Number((((totalBalance - previousBalance) / previousBalance) * 100).toFixed(1))
      : 0;

  const incomeTarget = budget?.monthlyIncomeTarget || 0;
  const expenseLimit = budget?.monthlyExpenseLimit || 0;

  const incomeProgressPercent =
    incomeTarget > 0 ? Math.min(100, Number(((currentMonthIncome / incomeTarget) * 100).toFixed(0))) : 0;

  const expenseUsedPercent =
    expenseLimit > 0 ? Math.min(100, Number(((currentMonthExpenses / expenseLimit) * 100).toFixed(0))) : 0;

  const amountBelowBudget =
    expenseLimit > currentMonthExpenses ? Number((expenseLimit - currentMonthExpenses).toFixed(2)) : 0;

  const recentTransactions = currentMonthTransactions.slice(0, 5).map((transaction) => ({
    id: transaction._id,
    title: transaction.title,
    category: transaction.category,
    type: transaction.type,
    amount: transaction.amount,
    transactionDate: transaction.transactionDate,
    icon: transaction.icon,
    merchant: transaction.merchant
  }));

  const goalItems = goals.slice(0, 3).map((goal) => {
    const progressPercent =
      goal.targetAmount > 0
        ? Math.min(100, Number(((goal.currentAmount / goal.targetAmount) * 100).toFixed(0)))
        : 0;

    return {
      id: goal._id,
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      progressPercent,
      deadline: goal.deadline,
      color: goal.color,
      isCompleted: goal.isCompleted
    };
  });

  const averageGoalProgress =
    goalItems.length > 0
      ? Number(
          (
            goalItems.reduce((sum, goal) => sum + goal.progressPercent, 0) / goalItems.length
          ).toFixed(0)
        )
      : 0;

  let subtitle = "Comienza a registrar tus movimientos para obtener un resumen financiero.";
  if (goalItems.length > 0) {
    subtitle = `Tu salud financiera se ve sólida este mes. Has alcanzado el ${averageGoalProgress}% de tu meta de ahorro.`;
  }

  return {
    header: {
      greeting: `¡Bienvenido de nuevo, ${user.firstName || user.name}!`,
      subtitle
    },
    summaryCards: {
      totalBalance: {
        amount: Number(totalBalance.toFixed(2)),
        currency: user.preferences?.currency || "DOP",
        changePercent,
        changeLabel: "desde el mes pasado"
      },
      monthlyIncome: {
        amount: Number(currentMonthIncome.toFixed(2)),
        currency: user.preferences?.currency || "DOP",
        progressPercent: incomeProgressPercent,
        label: "de los ingresos mensuales proyectados"
      },
      monthlyExpenses: {
        amount: Number(currentMonthExpenses.toFixed(2)),
        currency: user.preferences?.currency || "DOP",
        budgetUsedPercent: expenseUsedPercent,
        label:
          expenseLimit > 0
            ? `Por debajo del presupuesto por RD$${amountBelowBudget.toFixed(2)}`
            : "Aún no hay presupuesto configurado"
      }
    },
    recentTransactions,
    goals: goalItems,
    notifications: {
      unreadCount: 1
    }
  };
};

module.exports = {
  buildDashboardData
};