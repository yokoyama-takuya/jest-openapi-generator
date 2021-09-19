export = Reporter;
declare class Reporter {
    constructor(_: any, opts: any);
    output: any;
    silent: any;
    onRunComplete(): void;
}
