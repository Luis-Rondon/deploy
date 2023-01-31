export const getPlagiocephalyIndex = (
  plagiocephalyIndexA,
  plagiocephalyIndexB,
) => {
  // PLAGIOCEFALIA --> Index plagiocefálico (mm) = |A-B|
  const plagiocephalyIndex = parseFloat(plagiocephalyIndexA) - parseFloat(plagiocephalyIndexB);
  if (!plagiocephalyIndex && plagiocephalyIndex !== 0) return 'N/A';
  const plagiocephalyIndexAbsolute = plagiocephalyIndex < 0
    ? plagiocephalyIndex * -1 : plagiocephalyIndex;
  return parseFloat(plagiocephalyIndexAbsolute.toFixed(2));
};

export const getBrachyphalyIndex = (brachyphalySd, brachyphalyAp) => {
  // BRAQUICEFALIA Y ESCAFOCEFALIA --> Index craneal (IC %) = (SD/AP)*100
  const index = (parseFloat(brachyphalySd) / parseFloat(brachyphalyAp)) * 100;
  if (!index && index !== 0) return 'N/A';
  return parseFloat(index.toFixed(2));
};
