import React, { createContext, useContext, useCallback, useMemo } from 'react';
import axios, { AxiosInstance, AxiosError } from 'axios';

const SDK_VERSION = 'log-center-sdk-react/1.0.0';

// 類型定義
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export enum ApiDirection {
  IN = 'IN',
  OUT = 'OUT'
}

export enum Platform {
  ANDROID = 'android',
  IOS = 'ios',
  WEB = 'web'
}

export enum DeviceType {
  MOBILE = 'mobile',
  WEB = 'web',
  TABLET = 'tablet'
}

export interface LogCenterConfig {
  baseUrl: string;
  application: string;
  environment?: string;
  version?: string;
  timeout?: number;
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  debug?: boolean;
}

export interface LogResponse {
  status: number;
  data: Record<string, any>;
}

export interface LogCenterContextType {
  general: (type: string, message: string, level?: LogLevel, name?: string, trace?: string) => Promise<LogResponse>;
  api: (direction: ApiDirection, domain: string, requestMethod: string, clientIp: string, options?: ApiLogOptions) => Promise<LogResponse>;
  admin: (moduleId: number, action: string, adminId: number, ip: string, options?: AdminLogOptions) => Promise<LogResponse>;
  email: (title: string, content: string, senderEmail: string, recipientEmail: string, options?: EmailLogOptions) => Promise<LogResponse>;
  whatsapp: (recipientPhone: string, options?: WhatsAppLogOptions) => Promise<LogResponse>;
  pushNotification: (title: string, body: string, options?: PushNotificationLogOptions) => Promise<LogResponse>;
}

export interface ApiLogOptions {
  path?: string;
  statusCode?: number;
  executionTime?: number;
  requestHeader?: string;
  requestBody?: string;
  responseHeader?: string;
  responseBody?: string;
}

export interface AdminLogOptions {
  moduleName?: string;
  actionInfo?: string;
  actionData?: string;
  adminName?: string;
  executionTime?: number;
}

export interface EmailLogOptions {
  isError?: boolean;
  senderEmailName?: string;
  recipientEmailName?: string;
  ccEmail?: string;
  bccEmail?: string;
  attachmentPath?: string;
  mailDriver?: string;
}

export interface WhatsAppLogOptions {
  messageContent?: string;
  templateName?: string;
  templateLanguage?: string;
  recipientName?: string;
  whatsappProvider?: string;
  messageId?: string;
  mediaUrl?: string;
  isError?: boolean;
  errorCode?: string;
  errorMessage?: string;
}

export interface PushNotificationLogOptions {
  platform?: Platform;
  deviceType?: DeviceType;
  deviceToken?: string;
  pushProvider?: string;
  notificationId?: string;
  imageUrl?: string;
  deepLink?: string;
  dataPayload?: string;
  isError?: boolean;
  errorCode?: string;
  errorMessage?: string;
}

// Log Center Hook
export const useLogCenter = (): LogCenterContextType => {
  const context = useContext(LogCenterContext);
  if (!context) {
    throw new Error('useLogCenter must be used within a LogCenterProvider');
  }
  return context;
};

// Log Center Context
const LogCenterContext = createContext<LogCenterContextType | null>(null);

// Log Center Provider
export const LogCenterProvider: React.FC<{
  config: LogCenterConfig;
  children: React.ReactNode;
}> = ({ config, children }) => {
  const httpClient = useMemo(() => {
    return axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 5000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': SDK_VERSION,
      },
    });
  }, [config.baseUrl, config.timeout]);

  const getServerInfo = useCallback(() => {
    return {
      serverName: navigator.userAgent,
      serverIp: '127.0.0.1', // Browser limitation
    };
  }, []);

  const sendRequest = useCallback(async (endpoint: string, data: any): Promise<LogResponse> => {
    try {
      if (config.debug) {
        console.log(`[LogCenter SDK] Request: ${endpoint}`, data);
      }

      const response = await httpClient.post(endpoint, data);
      
      if (config.debug) {
        console.log(`[LogCenter SDK] Response:`, response.data);
      }

      return {
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        throw new Error(`HTTP ${axiosError.response?.status}: ${axiosError.message}`);
      }
      throw error;
    }
  }, [httpClient, config.debug]);

  const general = useCallback(async (
    type: string,
    message: string,
    level: LogLevel = LogLevel.INFO,
    name: string = 'log',
    trace?: string
  ): Promise<LogResponse> => {
    const serverInfo = getServerInfo();
    const request = {
      application: config.application,
      environment: config.environment || 'local',
      version: config.version || '1.0.0',
      sdk_version: SDK_VERSION,
      server_name: serverInfo.serverName,
      server_ip: serverInfo.serverIp,
      type,
      level,
      name,
      message,
      trace,
    };

    return sendRequest('/log-center/general-log', request);
  }, [config, sendRequest, getServerInfo]);

  const api = useCallback(async (
    direction: ApiDirection,
    domain: string,
    requestMethod: string,
    clientIp: string,
    options: ApiLogOptions = {}
  ): Promise<LogResponse> => {
    const serverInfo = getServerInfo();
    const request = {
      application: config.application,
      environment: config.environment || 'local',
      version: config.version || '1.0.0',
      sdk_version: SDK_VERSION,
      server_name: serverInfo.serverName,
      server_ip: serverInfo.serverIp,
      direction,
      domain,
      path: options.path,
      request_method: requestMethod,
      client_ip: clientIp,
      status_code: options.statusCode,
      execution_time: options.executionTime,
      request_header: options.requestHeader,
      request_body: options.requestBody,
      response_header: options.responseHeader,
      response_body: options.responseBody,
    };

    return sendRequest('/log-center/api-log', request);
  }, [config, sendRequest, getServerInfo]);

  const admin = useCallback(async (
    moduleId: number,
    action: string,
    adminId: number,
    ip: string,
    options: AdminLogOptions = {}
  ): Promise<LogResponse> => {
    const serverInfo = getServerInfo();
    const request = {
      application: config.application,
      environment: config.environment || 'local',
      version: config.version || '1.0.0',
      sdk_version: SDK_VERSION,
      server_name: serverInfo.serverName,
      server_ip: serverInfo.serverIp,
      module_id: moduleId,
      module_name: options.moduleName,
      action,
      action_info: options.actionInfo,
      action_data: options.actionData,
      admin_id: adminId,
      admin_name: options.adminName,
      ip,
      execution_time: options.executionTime,
    };

    return sendRequest('/log-center/admin-log', request);
  }, [config, sendRequest, getServerInfo]);

  const email = useCallback(async (
    title: string,
    content: string,
    senderEmail: string,
    recipientEmail: string,
    options: EmailLogOptions = {}
  ): Promise<LogResponse> => {
    const serverInfo = getServerInfo();
    const request = {
      application: config.application,
      environment: config.environment || 'local',
      version: config.version || '1.0.0',
      sdk_version: SDK_VERSION,
      server_name: serverInfo.serverName,
      server_ip: serverInfo.serverIp,
      title,
      content,
      sender_email: senderEmail,
      recipient_email: recipientEmail,
      is_error: options.isError || false,
      sender_email_name: options.senderEmailName,
      recipient_email_name: options.recipientEmailName,
      cc_email: options.ccEmail,
      bcc_email: options.bccEmail,
      attachment_path: options.attachmentPath,
      mail_driver: options.mailDriver,
    };

    return sendRequest('/log-center/email-log', request);
  }, [config, sendRequest, getServerInfo]);

  const whatsapp = useCallback(async (
    recipientPhone: string,
    options: WhatsAppLogOptions = {}
  ): Promise<LogResponse> => {
    const serverInfo = getServerInfo();
    const request = {
      application: config.application,
      environment: config.environment || 'local',
      version: config.version || '1.0.0',
      sdk_version: SDK_VERSION,
      server_name: serverInfo.serverName,
      server_ip: serverInfo.serverIp,
      recipient_phone: recipientPhone,
      message_content: options.messageContent,
      template_name: options.templateName,
      template_language: options.templateLanguage,
      recipient_name: options.recipientName,
      whatsapp_provider: options.whatsappProvider,
      message_id: options.messageId,
      media_url: options.mediaUrl,
      is_error: options.isError || false,
      error_code: options.errorCode,
      error_message: options.errorMessage,
    };

    return sendRequest('/log-center/whatsapp-log', request);
  }, [config, sendRequest, getServerInfo]);

  const pushNotification = useCallback(async (
    title: string,
    body: string,
    options: PushNotificationLogOptions = {}
  ): Promise<LogResponse> => {
    const serverInfo = getServerInfo();
    const request = {
      application: config.application,
      environment: config.environment || 'local',
      version: config.version || '1.0.0',
      sdk_version: SDK_VERSION,
      server_name: serverInfo.serverName,
      server_ip: serverInfo.serverIp,
      title,
      body,
      platform: options.platform,
      device_type: options.deviceType,
      device_token: options.deviceToken,
      push_provider: options.pushProvider,
      notification_id: options.notificationId,
      image_url: options.imageUrl,
      deep_link: options.deepLink,
      data_payload: options.dataPayload,
      is_error: options.isError || false,
      error_code: options.errorCode,
      error_message: options.errorMessage,
    };

    return sendRequest('/log-center/push-notification-log', request);
  }, [config, sendRequest, getServerInfo]);

  const contextValue = useMemo(() => ({
    general,
    api,
    admin,
    email,
    whatsapp,
    pushNotification,
  }), [general, api, admin, email, whatsapp, pushNotification]);

  return (
    <LogCenterContext.Provider value={contextValue}>
      {children}
    </LogCenterContext.Provider>
  );
};

export default LogCenterProvider;
