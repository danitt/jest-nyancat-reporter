import { Context, Reporter, ReporterOnStartOptions, Test, TestResult } from '@jest/reporters';
import { AggregatedResult } from '@jest/test-result';
import { ReporterConfig } from '@jest/types/build/Config';

import { ColorType, color, cursor, epilogue, printFailureMessages, useColors, window } from './helpers';

const write = (str: string) => process.stdout.write(str);

interface GlobalOptions {
  suppressErrorReporter?: boolean;
  renderOnRunCompletely?: boolean;
}

class CustomReporter implements Omit<Reporter, 'getLastError'> {
  public globalConfig: ReporterConfig;
  public globalOptions: unknown;

  private nyanCatWidth = 11;
  private colorIndex = 0;
  private numberOfLines = 4;
  private rainbowColors: number[];
  private scoreboardWidth = 5;
  private tick = false;
  private trajectories: string[][] = [[], [], [], []];
  private trajectoryWidthMax: number;
  private suppressErrorReporter: boolean;
  private renderOnRunCompletely: boolean;

  constructor(globalConfig: ReporterConfig, globalOptions: GlobalOptions) {
    // Constructor params
    this.globalConfig = globalConfig;
    this.globalOptions = globalOptions;

    const width = window.width * 0.75 || 0;

    this.rainbowColors = this.generateColors();
    this.trajectoryWidthMax = width - this.nyanCatWidth;

    this.suppressErrorReporter = globalOptions?.suppressErrorReporter || false;
    this.renderOnRunCompletely = globalOptions?.renderOnRunCompletely || false;
  }

  /**
   * TEST HOOKS
   */
  onRunStart(results: AggregatedResult, options: ReporterOnStartOptions) {
    console.info('Input options', options);

    cursor.CR();
    cursor.hide();

    if (!this.renderOnRunCompletely) {
      this.draw(results);
    }
  }

  onTestStart(test: Test) {
    console.log(`onTestResult`, !!test);
  }

  onTestResult(test: Test, testResult: TestResult, results: AggregatedResult) {
    if (!this.renderOnRunCompletely) {
      this.draw(results);
    }
  }

  onRunComplete(contexts: Set<Context>, results: AggregatedResult) {
    this.draw(results);
    cursor.show();
    for (let i = 0; i < this.numberOfLines; i++) {
      write('\n');
    }

    epilogue(results);

    if (!this.suppressErrorReporter) {
      printFailureMessages(results);
    }
  }

  /**
   * NYAN METHODS
   */

  // Generate rainbow colors
  private generateColors(): number[] {
    const colors = new Array(6);
    for (let i = 0; i < 6 * 7; i++) {
      const pi3 = Math.floor(Math.PI / 3);
      const n = i * (1.0 / 6);
      const r = Math.floor(3 * Math.sin(n) + 3);
      const g = Math.floor(3 * Math.sin(n + 2 * pi3) + 3);
      const b = Math.floor(3 * Math.sin(n + 4 * pi3) + 3);
      colors[i] = 36 * r + 6 * g + b + 16;
    }
    return colors;
  }

  private drawScoreboard(results: AggregatedResult) {
    const { numPassedTests, numFailedTests, numPendingTests, numTotalTests } = results;
    this.drawType('total tests', numTotalTests || 0);
    this.drawType('green', numPassedTests || 0);
    this.drawType('fail', numFailedTests || 0);
    this.drawType('pending', numPendingTests || 0);

    this.cursorUp(this.numberOfLines);
  }

  /**
   * Draws the type of stat along with a color
   */
  private drawType(type: ColorType, n: number) {
    write(' ');
    write(color(type, n));
    write('\n');
  }

  /**
   * Append the rainbow.
   */
  private appendRainbow() {
    const segment = this.tick ? '_' : '-';
    const rainbowified = this.rainbowify(segment);

    for (let index = 0; index < this.numberOfLines; index++) {
      const trajectory = this.trajectories[index];
      if (trajectory.length >= this.trajectoryWidthMax) {
        trajectory.shift();
      }
      trajectory.push(rainbowified);
    }
  }

  /**
   * Main draw function to draw the output of the reporter
   */
  private draw(results: AggregatedResult) {
    this.appendRainbow();
    this.drawScoreboard(results);
    this.drawRainbow();
    this.drawNyanCat(results);

    this.tick = !this.tick;
  }

  /**
   * Draw the Nyan Cat
   */
  private drawNyanCat(results: AggregatedResult) {
    const startWidth = this.scoreboardWidth + this.trajectories[0].length;
    const dist = `\u001b[${startWidth}C`;
    let padding = '';

    write(dist);
    write('_,------,');
    write('\n');

    write(dist);
    padding = this.tick ? '  ' : '   ';
    write(`_|${padding}/\\_/\\ `);
    write('\n');

    write(dist);
    padding = this.tick ? '_' : '__';
    const tail = this.tick ? '~' : '^';
    write(`${tail}|${padding}${this.face(results)} `);
    write('\n');

    write(dist);
    padding = this.tick ? ' ' : '  ';
    write(`${padding}""  "" `);
    write('\n');

    this.cursorUp(this.numberOfLines);
  }

  private face(results: AggregatedResult) {
    if (results.numFailedTests) {
      return '( x .x)';
    }
    if (results.numPendingTests) {
      return '( o .o)';
    }
    if (results.numPassedTests) {
      return '( ^ .^)';
    }
    return '( - .-)';
  }

  /**
   * Draw the rainbow
   */
  private drawRainbow() {
    this.trajectories.forEach((line) => {
      write(`\u001b[${this.scoreboardWidth}C`);
      write(line.join(''));
      write('\n');
    });

    this.cursorUp(this.numberOfLines);
  }

  private rainbowify(str: string) {
    if (!useColors) {
      return str;
    }

    const color = this.rainbowColors[this.colorIndex % this.rainbowColors.length];
    this.colorIndex += 1;
    return `\u001b[38;5;${color}m${str}\u001b[0m`;
  }

  /**
   * Move cursor up `n`
   */
  private cursorUp(n: number) {
    write(`\u001b[${n}A`);
  }

  /**
   * Move cursor down `n`
   */
  private cursorDown(n: number) {
    write(`\u001b[${n}B`);
  }
}

module.exports = CustomReporter;
