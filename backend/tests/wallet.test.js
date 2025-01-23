import WalletService from '../domain/services/walletService';
import WalletRepository from '../domain/repositories/WalletRepository';
import * as redis from '../helpers/redis';
import * as utils from '../helpers/utils';

jest.mock('../domain/repositories/WalletRepository');
jest.mock('../helpers/redis');

jest.mock('../helpers/utils', () => ({
  generateEthereumAddress: jest.fn(),
}));

describe('WalletService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new wallet and store it in Redis', async () => {
    const mockWallet = {
      userId: 'test-user',
      publicKey: 'test-public-key',
      privateKey: 'test-private-key',
      tokens: [],
    };

    // Mock generateEthereumAddress to return the expected keys
    utils.generateEthereumAddress.mockReturnValue({
      publicKey: 'test-public-key',
      privateKey: 'test-private-key',
    });

    WalletRepository.createWallet.mockResolvedValue(mockWallet);
    redis.setJSON.mockResolvedValue(true);

    const wallet = await WalletService.createWallet('test-user');

    expect(wallet).toEqual(mockWallet);
    expect(WalletRepository.createWallet).toHaveBeenCalledWith(mockWallet);
    expect(redis.setJSON).toHaveBeenCalledWith(`wallet:${mockWallet.publicKey}`, mockWallet);
  });

  it('should fetch wallet from Redis if it exists', async () => {
    const mockWallet = {
      publicKey: 'test-public-key',
      privateKey: 'test-private-key',
      tokens: [],
    };

    redis.getJSON.mockResolvedValue(mockWallet);

    const wallet = await WalletService.getWalletByAddress('test-public-key');

    expect(wallet).toEqual(mockWallet);
    expect(redis.getJSON).toHaveBeenCalledWith('wallet:test-public-key');
    expect(WalletRepository.getWalletByAddress).not.toHaveBeenCalled();
  });

  it('should fetch wallet from MongoDB if not found in Redis', async () => {
    const mockWallet = {
      publicKey: 'test-public-key',
      privateKey: 'test-private-key',
      tokens: [],
    };

    redis.getJSON.mockResolvedValue(null);
    WalletRepository.getWalletByAddress.mockResolvedValue(mockWallet);
    redis.setJSON.mockResolvedValue(true);

    const wallet = await WalletService.getWalletByAddress('test-public-key');

    expect(wallet).toEqual(mockWallet);
    expect(redis.getJSON).toHaveBeenCalledWith('wallet:test-public-key');
    expect(WalletRepository.getWalletByAddress).toHaveBeenCalledWith('test-public-key');
    expect(redis.setJSON).toHaveBeenCalledWith('wallet:test-public-key', mockWallet);
  });

  it('should throw an error if wallet is not found in both Redis and MongoDB', async () => {
    redis.getJSON.mockResolvedValue(null);
    WalletRepository.getWalletByAddress.mockResolvedValue(null);

    await expect(WalletService.getWalletByAddress('nonexistent-address')).rejects.toThrow(
        'Wallet not found'
    );

    expect(redis.getJSON).toHaveBeenCalledWith('wallet:nonexistent-address');
    expect(WalletRepository.getWalletByAddress).toHaveBeenCalledWith('nonexistent-address');
  });

  it('should fetch wallets from Redis and MongoDB if necessary', async () => {
    const mockWallet1 = { publicKey: 'wallet1', tokens: [] };
    const mockWallet2 = { publicKey: 'wallet2', tokens: [] };

    redis.getJSON
        .mockResolvedValueOnce(mockWallet1) // First address is in Redis
        .mockResolvedValueOnce(null); // Second address not in Redis

    WalletRepository.getWalletsByAddresses.mockResolvedValue([mockWallet2]);
    redis.setJSON.mockResolvedValue(true);

    const wallets = await WalletService.getWalletsByAddresses(['wallet1', 'wallet2']);

    expect(wallets).toEqual([mockWallet1, mockWallet2]);
    expect(redis.getJSON).toHaveBeenCalledWith('wallet:wallet1');
    expect(redis.getJSON).toHaveBeenCalledWith('wallet:wallet2');
    expect(WalletRepository.getWalletsByAddresses).toHaveBeenCalledWith(['wallet2']);
    expect(redis.setJSON).toHaveBeenCalledWith('wallet:wallet2', mockWallet2);
  });
});
