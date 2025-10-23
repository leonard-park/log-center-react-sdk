import React, { useState, useEffect } from 'react';
import { LogCenterClient } from '@log-center/react-sdk';

const BasicUsageExample: React.FC = () => {
  const [lastLogId, setLastLogId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 初始化 Log Center 客戶端
  const logCenterClient = new LogCenterClient({
    baseUrl: 'http://localhost:3000',
    application: 'my-react-app',
    environment: 'production',
  });

  useEffect(() => {
    // 記錄組件初始化
    logCenterClient.general({
      type: 'component',
      message: 'BasicUsageExample component mounted',
      level: 'info'
    }).catch(error => {
      console.error('Failed to log component initialization:', error);
    });
  }, []);

  const handleLogAction = async (action: () => Promise<any>, actionName: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const result = await action();
      setLastLogId(result.data.id);
    } catch (error) {
      setErrorMessage(`Failed to ${actionName}: ${error}`);
      setLastLogId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const sendGeneralLog = async () => {
    await handleLogAction(async () => {
      return await logCenterClient.general({
        type: 'user-action',
        message: 'User clicked send general log button',
        level: 'info',
        name: 'button-click'
      });
    }, 'send general log');
  };

  const sendApiLog = async () => {
    await handleLogAction(async () => {
      return await logCenterClient.api({
        direction: 'IN',
        domain: 'api.example.com',
        request_method: 'GET',
        client_ip: '192.168.1.100',
        path: '/api/users',
        status_code: 200,
        execution_time: 150
      });
    }, 'send API log');
  };

  const sendWhatsAppLog = async () => {
    await handleLogAction(async () => {
      return await logCenterClient.whatsapp({
        recipient_phone: '+85298765432',
        message_content: 'Hello from React app!',
        template_name: 'welcome_template',
        template_language: 'zh_HK',
        recipient_name: 'John Doe',
        whatsapp_provider: 'twilio'
      });
    }, 'send WhatsApp log');
  };

  const sendPushNotificationLog = async () => {
    await handleLogAction(async () => {
      return await logCenterClient.pushNotification({
        title: '新訊息',
        body: '您有新訂單',
        platform: 'ios',
        device_type: 'mobile',
        device_token: 'device_token_123',
        push_provider: 'fcm',
        deep_link: 'myapp://orders/123'
      });
    }, 'send push notification log');
  };

  const sendBatchLogs = async () => {
    await handleLogAction(async () => {
      const logs = [
        {
          type: 'general',
          data: {
            type: 'batch-test',
            message: 'Batch log test 1',
            level: 'info'
          }
        },
        {
          type: 'general',
          data: {
            type: 'batch-test',
            message: 'Batch log test 2',
            level: 'info'
          }
        },
        {
          type: 'api',
          data: {
            direction: 'IN',
            domain: 'api.example.com',
            request_method: 'POST',
            client_ip: '192.168.1.100',
            path: '/api/batch',
            status_code: 201
          }
        }
      ];

      return await logCenterClient.batch(logs);
    }, 'send batch logs');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>🚀 Log Center React SDK - 基本使用範例</h2>
      
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '10px', 
        margin: '20px 0' 
      }}>
        <button 
          onClick={sendGeneralLog} 
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? '發送中...' : '發送一般日誌'}
        </button>
        
        <button 
          onClick={sendApiLog} 
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? '發送中...' : '發送 API 日誌'}
        </button>
        
        <button 
          onClick={sendWhatsAppLog} 
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? '發送中...' : '發送 WhatsApp 日誌'}
        </button>
        
        <button 
          onClick={sendPushNotificationLog} 
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? '發送中...' : '發送推送通知日誌'}
        </button>
        
        <button 
          onClick={sendBatchLogs} 
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ffc107',
            color: 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? '發送中...' : '批次發送日誌'}
        </button>
      </div>
      
      {lastLogId && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          borderRadius: '5px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6'
        }}>
          <h3>✅ 最後發送的日誌 ID:</h3>
          <p style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
            {lastLogId}
          </p>
        </div>
      )}
      
      {errorMessage && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          borderRadius: '5px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          color: '#721c24'
        }}>
          <h3>❌ 錯誤訊息:</h3>
          <p>{errorMessage}</p>
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
        <h3>📚 使用說明</h3>
        <ul>
          <li><strong>一般日誌</strong>: 用於記錄應用程式的一般事件和狀態</li>
          <li><strong>API 日誌</strong>: 用於記錄 API 請求和回應的詳細資訊</li>
          <li><strong>WhatsApp 日誌</strong>: 用於記錄 WhatsApp 消息發送</li>
          <li><strong>推送通知日誌</strong>: 用於記錄推送通知發送</li>
          <li><strong>批次發送</strong>: 一次發送多個日誌，提高效率</li>
        </ul>
      </div>
    </div>
  );
};

export default BasicUsageExample;
