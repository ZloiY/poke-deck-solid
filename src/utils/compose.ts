export const compose = (args: Function[]) =>
 (initialValue: any) =>
 args.reduceRight((result, curFunction) => curFunction(result), initialValue);
