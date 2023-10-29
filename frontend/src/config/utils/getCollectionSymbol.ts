const getCollectionSymbol = (nftName: string | undefined): string => {
  if (nftName) {
    const nftNameArray = nftName.split(" ");
    return nftNameArray.slice(0, nftNameArray.length - 1).join('_').toLowerCase();
  }
  else {
    return ``;
  }

}

export default getCollectionSymbol;