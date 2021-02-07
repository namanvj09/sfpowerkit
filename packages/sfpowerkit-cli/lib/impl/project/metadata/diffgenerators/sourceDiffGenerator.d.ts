export declare class SourceDiffGenerator {
  baseline: string;
  target: string;
  constructor(baseline: string, target: string);
  compareRevisions(
    fileRevFrom: string | void,
    fileRevTo: string | void,
    filepath: string
  ): Promise<any>;
}
