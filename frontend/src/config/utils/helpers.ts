export const finacial = (value: any): number => {
  const convert = Number.parseFloat(value).toFixed(2);
  return Number.parseFloat(convert);
}

export const groupBy = (x: any, f: any) => x.reduce((a: any, b: any, i: any) => ((a[f(b, i, x)] ||= []).push(b), a), {});