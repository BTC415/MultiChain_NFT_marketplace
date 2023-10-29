const cryptoList = [
  {
    abr: "ETH",
    iconUrl: "/images/crypt/ETH.svg",
    bigUrl: "/images/crypt/big/ETH.svg",
  },
  {
    abr: "SOL",
    iconUrl: "/images/crypt/SOL.svg",
    bigUrl: "",
  },
];
const getCryptoSvg = (x: any, big: any) => {
  const arr = cryptoList.filter((obj) => obj.abr === x);
  if (big) return arr[0]?.bigUrl;
  return arr[0]?.iconUrl;
};

export default getCryptoSvg;
