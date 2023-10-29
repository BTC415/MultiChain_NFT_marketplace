import axios from "axios";

export const getCoinPrice = async (coin: string) => {
  const { data } = await axios.get(`https://api.coinbase.com/v2/exchange-rates`);
  return 1 / data.data.rates[coin];
}

export const getSOLTps = async () => {
  const { data }= await axios.get(`https://api.solscan.io/chaininfo?cluster=`);
  return data?.data?.networkInfo?.tps;
}

export const calcFloorPrice = (floor: number, prices: any[]) => {
  console.log('floor', floor)
  let newFloor = floor;
  for (let i = 0; i < prices.length; i ++) {
    if (prices[i].count > 0 && prices[i].price < floor) {
      newFloor = prices[i].price;
      console.log('new floor', newFloor);
    }
  }

  return newFloor;
}