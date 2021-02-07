export default class OutputGenerator {
  generateJsonOutput(result: any, outputDir: string): Promise<void>;
  generateCSVOutput(result: string, outputDir: string): Promise<void>;
}
