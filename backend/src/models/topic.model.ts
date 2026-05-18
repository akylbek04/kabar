import mongoose, { Document, Schema } from "mongoose";

export interface TopicDocument extends Document {
  chatId: mongoose.Types.ObjectId;
  title: string;
  createdBy: mongoose.Types.ObjectId;
  lastMessage: mongoose.Types.ObjectId | null;
  isGeneral: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const topicSchema = new Schema<TopicDocument>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    isGeneral: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

topicSchema.index({ chatId: 1, title: 1 }, { unique: true });

const TopicModel = mongoose.model<TopicDocument>("Topic", topicSchema);
export default TopicModel;
