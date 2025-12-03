# localStorage Structure Documentation

## deployedContracts

### 新結構 (New Structure)

```typescript
{
  [deployerAddress: string]: {
    [chainId: string]: DeployedContract[]
  }
}
```

### 範例 (Example)

```json
{
  "0x1234...abcd": {
    "1": [
      {
        "address": "0xContract1...",
        "name": "MyToken",
        "abi": [...],
        "chainId": "1",
        "deployedAt": 1234567890,
        "deployer": "0x1234...abcd"
      },
      {
        "address": "0xContract2...",
        "name": "MyNFT",
        "abi": [...],
        "chainId": "1",
        "deployedAt": 1234567891,
        "deployer": "0x1234...abcd"
      }
    ],
    "137": [
      {
        "address": "0xContract3...",
        "name": "PolygonToken",
        "abi": [...],
        "chainId": "137",
        "deployedAt": 1234567892,
        "deployer": "0x1234...abcd"
      }
    ]
  },
  "0x5678...efgh": {
    "1": [
      {
        "address": "0xContract4...",
        "name": "AnotherToken",
        "abi": [...],
        "chainId": "1",
        "deployedAt": 1234567893,
        "deployer": "0x5678...efgh"
      }
    ]
  }
}
```

## 功能說明 (Features)

### 1. 按部署者隔離 (Isolation by Deployer)
- 每個錢包地址只能看到自己部署的合約
- 切換錢包時，自動顯示對應的合約列表

### 2. 按鏈分組 (Grouping by Chain)
- 在同一個錢包下，合約按 chainId 分組
- `ContractInteractor` 自動過濾當前鏈的合約

### 3. 向後兼容 (Backward Compatibility)
- 自動檢測舊的陣列格式
- 舊數據會被忽略（返回空陣列）
- 使用者需要重新部署合約以使用新結構

## API 使用 (Usage)

### useContractStorage Hook

```typescript
// 傳入當前連接的錢包地址
const { contracts, addContract, removeContract } = useContractStorage(account);

// 添加合約（必須包含 deployer 字段）
addContract({
  address: '0x...',
  name: 'MyContract',
  abi: [...],
  chainId: '1',
  deployedAt: Date.now(),
  deployer: account  // 必須！
});

// 刪除合約（需要 chainId）
removeContract(contractAddress, chainId);
```

### 在 App.tsx 中的使用

```typescript
const Dashboard: React.FC = () => {
  const { account, chainId } = useWeb3();
  // 傳入 account 以只顯示當前用戶的合約
  const { contracts, addContract, removeContract } = useContractStorage(account || undefined);

  const handleDeploy = (address: string, name: string, abi: Abi) => {
    if (chainId && account) {
      addContract({
        address,
        name,
        abi,
        chainId,
        deployedAt: Date.now(),
        deployer: account  // 使用當前帳戶
      });
    }
  };

  // ...
};
```

## 注意事項 (Notes)

1. **必須連接錢包**：只有連接錢包後才能部署和查看合約
2. **自動過濾**：`ContractInteractor` 會自動過濾出當前鏈的合約
3. **數據遷移**：舊格式的數據不會自動遷移，需要重新部署
4. **刪除限制**：只能刪除當前用戶在當前鏈上部署的合約
