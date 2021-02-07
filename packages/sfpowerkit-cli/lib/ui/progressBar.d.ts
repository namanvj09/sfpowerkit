export declare class ProgressBar {
  private progressBarImpl;
  create(title: string, unit: string, displayTillLogLevel: number): ProgressBar;
  start(totalSize: number): void;
  stop(): void;
  increment(count: number): void;
}
