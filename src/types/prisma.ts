export interface CommitMetadata {
  message: string;
  time: Date;
}

export interface MessageMetadata {
  length: number;
  time: Date;
  isAngry: boolean;
}

export interface TaskMetadata {
  status: string;
  statusChangeTime: Date;
}

export interface AppliacationActivityMetadata {
  hours: number;
  time: Date;
}
