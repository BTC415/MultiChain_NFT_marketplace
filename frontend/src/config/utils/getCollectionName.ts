const getCollectionName = (nftName: string | undefined): string => {
  if (nftName) {
    const nftNameArray = nftName.split(" ");
    return nftNameArray.slice(0, nftNameArray.length - 1).join(' ');
  }
  else {
    return ``;
  }
}

export default getCollectionName;