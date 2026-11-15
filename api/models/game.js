import { model, Schema, Types } from 'mongoose';

const Game = model(
  'Game',
  new Schema(
    {
      chat: { type: Types.ObjectId, ref: 'Chat', required: true, index: true },
      type: { type: String, enum: ['tic_tac_toe', 'reaction'], required: true },
      players: [{ type: Types.ObjectId, ref: 'User', required: true }],
      botOpponent: { type: Boolean, default: false },
      botWinner: { type: Boolean, default: false },
      status: { type: String, enum: ['active', 'completed'], default: 'active', index: true },
      board: { type: [String], default: () => Array(9).fill('') },
      turn: { type: Types.ObjectId, ref: 'User' },
      winner: { type: Types.ObjectId, ref: 'User', default: null },
      falseStarts: [{ type: Types.ObjectId, ref: 'User' }],
      startedAt: { type: Date, default: Date.now },
      botRespondsAt: { type: Date, default: null },
      finishedAt: { type: Date, default: null }
    },
    { timestamps: true }
  )
);

Game.schema.index({ chat: 1, createdAt: -1 });

export default Game;
