# Log Center React SDK

Log Center 的官方 React SDK，支援 React Hooks 和 Context API。

## 🚀 快速開始

### 安裝

```bash
npm install @log-center/react-sdk
```

### 基本使用

```tsx
import React from 'react';
import { LogCenterProvider, useLogCenter } from '@log-center/react-sdk';

function App() {
  return (
    <LogCenterProvider
      baseUrl="http://localhost:3000"
      application="my-react-app"
      environment="production"
    >
      <MyComponent />
    </LogCenterProvider>
  );
}

function MyComponent() {
  const logger = useLogCenter();
  
  const handleClick = async () => {
    await logger.general('ui', 'Button clicked');
  };
  
  return <button onClick={handleClick}>Click me</button>;
}
```

## 📋 支援的日誌類型

- **General Log**: 一般應用程式日誌
- **API Log**: API 請求/回應日誌
- **Admin Log**: 管理後台操作日誌
- **Email Log**: 電子郵件發送日誌
- **WhatsApp Log**: WhatsApp 消息發送日誌
- **Push Notification Log**: 推送通知日誌

## 🔧 配置選項

```tsx
interface LogCenterConfig {
  baseUrl: string;           // Log Center API 基礎 URL
  application: string;        // 應用程式名稱
  environment?: string;      // 環境 (local/staging/production)
  version?: string;          // 應用版本
  timeout?: number;          // 請求超時時間 (毫秒)
  enableRetry?: boolean;      // 啟用自動重試
  maxRetries?: number;       // 最大重試次數
  retryDelay?: number;       // 重試延遲 (毫秒)
  debug?: boolean;           // 啟用除錯模式
}
```

## 🎯 React Hooks 支援

```tsx
import { useLogCenter } from '@log-center/react-sdk';

function UserProfile() {
  const logger = useLogCenter();
  
  useEffect(() => {
    logger.general('page', 'User profile loaded');
  }, [logger]);
  
  const handleUpdateProfile = async () => {
    try {
      await logger.admin(1, 'UserManagement', 'UPDATE', 1, 'admin');
      // 更新邏輯
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  };
  
  return (
    <div>
      <button onClick={handleUpdateProfile}>Update Profile</button>
    </div>
  );
}
```

## 🔄 Context API 整合

```tsx
import { LogCenterContext } from '@log-center/react-sdk';

function CustomComponent() {
  const logger = useContext(LogCenterContext);
  
  const logApiCall = async () => {
    await logger.api('OUT', 'api.example.com', 'POST', '192.168.1.100');
  };
  
  return <button onClick={logApiCall}>Make API Call</button>;
}
```

## 📚 範例

查看 `examples/` 目錄中的完整範例：

- `BasicUsageExample.tsx` - 基本使用方式
- `HookIntegrationExample.tsx` - Hooks 整合

## 🧪 測試

```bash
npm test
```

## 📄 授權

ISC
