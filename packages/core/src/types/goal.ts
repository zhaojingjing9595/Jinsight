export type Goal = {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: Date | null;
  createdAt: Date;
};

export type GoalWithProgress = Goal & {
  percentComplete: number;
  remaining: number;
  isComplete: boolean;
};
