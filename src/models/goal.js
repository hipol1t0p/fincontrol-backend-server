const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
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
    targetAmount: {
      type: Number,
      required: [true, "La meta objetivo es obligatoria"],
      min: [0, "La meta no puede ser negativa"]
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, "El progreso no puede ser negativo"]
    },
    deadline: {
      type: Date,
      default: null
    },
    color: {
      type: String,
      default: "blue"
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Goal", goalSchema);