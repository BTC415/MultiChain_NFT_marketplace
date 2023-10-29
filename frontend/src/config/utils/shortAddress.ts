const shortAddress = (address: string | undefined): string => {
  if (address && address != `undefined`) {
    return `${address.substr(0, 4)}...${address.substr(address.length - 4, 4)}`;
  }
  return ``;
}

export default shortAddress;