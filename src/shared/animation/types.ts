export type Formatter = (value: number) => any;

export interface AnimationBaseOptions {
  parser?: (value: any) => number;
  formatter?: Formatter;
}

export interface AnimationOptions extends AnimationBaseOptions {
  autoStart?: boolean;

  easing?: (time: number) => number;

  onStart?: () => void;
  onStop?: () => void;
  onClear?: () => void;

  onUpdate?: (value: any) => void;
  onComplete?: () => void;
}

export interface AnimationCtrl {
  stop: () => void;
  start: () => void;
  clear: () => void;
}

export type AnimationResult = AnimationCtrl & {
  promise: Promise<boolean>;
};
