const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: [true, "El título es obligatorio"],
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    category: {
      type: String,
      required: [true, "La categoría es obligatoria"],
      trim: true
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: [true, "El tipo es obligatorio"]
    },
    amount: {
      type: Number,
      required: [true, "El monto es obligatorio"],
      min: [0, "El monto no puede ser negativo"]
    },
    transactionDate: {
      type: Date,
      required: [true, "La fecha es obligatoria"],
      default: Date.now
    },
    merchant: {
      type: String,
      default: ""
    },
    icon: {
      type: String,
      default: "wallet"
    },
    color: {
      type: String,
      default: "default"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);