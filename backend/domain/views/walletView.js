export default (user) => ({
  _id: user._id.toString(),
  walletAddress: user.publicKey,
  tokens: (user.tokens || []).map((token) => ({
    symbol: token.symbol,
    amount: token.amount,
  })),
});
