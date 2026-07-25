import mongoose, { Schema } from "mongoose";

const notesSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
      default: "",
    },
    detail: {
      type: String,
      enum: ["brief", "standard", "detailed"],
      default: "standard",
    },
    revisionMode: {
      type: Boolean,
      default: false,
    },
    includeDiagrams: {
      type: Boolean,
      default: false,
    },
    includeCharts: {
      type: Boolean,
      default: false,
    },
    content: {
      type: Schema.Types.Mixed,
      required: true,
    },
    quiz: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true },
);

const Notes = mongoose.model("Notes", notesSchema);
export default Notes;
