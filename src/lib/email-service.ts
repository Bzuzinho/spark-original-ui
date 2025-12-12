export interface EmailConfig {
  provider: 'resend' | 'sendgrid' | 'mailgun' | 'smtp';
  apiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  fromEmail: string;
  fromName: string;
}

export interface EmailData {
  to: string[];
  subject: string;
  html: string;
  text?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

declare const spark: {
  llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>;
  llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string;
  kv: {
    get: <T>(key: string) => Promise<T | undefined>;
    set: <T>(key: string, value: T) => Promise<void>;
  };
};

export class EmailService {
  private static instance: EmailService;
  private config: EmailConfig | null = null;

  private constructor() {}

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async loadConfig(): Promise<EmailConfig | null> {
    if (this.config) return this.config;
    
    const storedConfig = await spark.kv.get<EmailConfig>('email-config');
    if (storedConfig) {
      this.config = storedConfig;
    }
    return this.config;
  }

  async saveConfig(config: EmailConfig): Promise<void> {
    this.config = config;
    await spark.kv.set('email-config', config);
  }

  async isConfigured(): Promise<boolean> {
    const config = await this.loadConfig();
    if (!config) return false;

    switch (config.provider) {
      case 'resend':
      case 'sendgrid':
      case 'mailgun':
        return !!config.apiKey && !!config.fromEmail;
      case 'smtp':
        return !!(
          config.smtpHost &&
          config.smtpPort &&
          config.smtpUser &&
          config.smtpPassword &&
          config.fromEmail
        );
      default:
        return false;
    }
  }

  async sendEmail(emailData: EmailData): Promise<EmailResult> {
    const config = await this.loadConfig();
    
    if (!config) {
      return {
        success: false,
        error: 'Configuração de email não encontrada. Configure o serviço de email nas definições.',
      };
    }

    const isConfigured = await this.isConfigured();
    if (!isConfigured) {
      return {
        success: false,
        error: 'Configuração de email incompleta. Verifique as definições.',
      };
    }

    try {
      switch (config.provider) {
        case 'resend':
          return await this.sendViaResend(config, emailData);
        case 'sendgrid':
          return await this.sendViaSendGrid(config, emailData);
        case 'mailgun':
          return await this.sendViaMailgun(config, emailData);
        case 'smtp':
          return await this.sendViaSMTP(config, emailData);
        default:
          return {
            success: false,
            error: 'Provider de email não suportado',
          };
      }
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao enviar email',
      };
    }
  }

  async sendBulkEmails(emails: EmailData[]): Promise<{ sent: number; failed: number; errors: string[] }> {
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const email of emails) {
      const result = await this.sendEmail(email);
      if (result.success) {
        results.sent++;
      } else {
        results.failed++;
        if (result.error) {
          results.errors.push(result.error);
        }
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
  }

  private async sendViaResend(config: EmailConfig, emailData: EmailData): Promise<EmailResult> {
    if (!config.apiKey) {
      return {
        success: false,
        error: 'Chave de API do Resend não configurada',
      };
    }

    try {
      const requestBody = {
        from: `${config.fromName} <${config.fromEmail}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      };

      console.log('Enviando email via Resend:', { to: emailData.to, subject: emailData.subject });

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorMessage = `Erro HTTP ${response.status}`;
        try {
          const error = await response.json();
          console.log('Resend error response:', error);
          
          if (error.message) {
            errorMessage = error.message;
          } else if (error.error) {
            errorMessage = error.error;
          } else if (error.name === 'validation_error') {
            errorMessage = `Erro de validação: ${JSON.stringify(error)}`;
          } else {
            errorMessage = `Erro do servidor: ${JSON.stringify(error)}`;
          }
          
          if (response.status === 401) {
            errorMessage = 'Chave de API inválida. Verifique as configurações.';
          } else if (response.status === 403) {
            errorMessage = 'Email não autorizado. Verifique se o domínio está verificado no Resend.';
          } else if (response.status === 422) {
            errorMessage = `Dados inválidos: ${errorMessage}`;
          }
        } catch (parseError) {
          console.error('Erro ao fazer parse da resposta:', parseError);
          try {
            const textError = await response.text();
            if (textError) {
              errorMessage = textError;
            }
          } catch {
            errorMessage = `${response.status} ${response.statusText}`;
          }
        }
        
        console.error('Resend API error:', errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }

      const data = await response.json();
      console.log('Email enviado com sucesso via Resend:', data.id);
      
      return {
        success: true,
        messageId: data.id,
      };
    } catch (error) {
      console.error('Exceção ao enviar via Resend:', error);
      console.error('Tipo do erro:', typeof error);
      console.error('Error.name:', error instanceof Error ? error.name : 'N/A');
      console.error('Error.message:', error instanceof Error ? error.message : 'N/A');
      
      let errorMessage = 'Erro desconhecido ao enviar email';
      
      if (error instanceof TypeError) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Erro de conexão. Verifique: 1) A sua ligação à internet, 2) Se a chave de API está correta, 3) Se o domínio do email está verificado no Resend.';
        } else {
          errorMessage = `Erro de rede: ${error.message}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        try {
          errorMessage = JSON.stringify(error);
        } catch {
          errorMessage = 'Erro desconhecido (objeto não serializável)';
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  private async sendViaSendGrid(config: EmailConfig, emailData: EmailData): Promise<EmailResult> {
    if (!config.apiKey) {
      return {
        success: false,
        error: 'Chave de API do SendGrid não configurada',
      };
    }

    try {
      const requestBody = {
        personalizations: [
          {
            to: emailData.to.map(email => ({ email })),
          },
        ],
        from: {
          email: config.fromEmail,
          name: config.fromName,
        },
        subject: emailData.subject,
        content: [
          {
            type: 'text/html',
            value: emailData.html,
          },
        ],
      };

      console.log('Enviando email via SendGrid:', { to: emailData.to, subject: emailData.subject });

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorMessage = `Erro HTTP ${response.status}`;
        try {
          const error = await response.json();
          console.log('SendGrid error response:', error);
          errorMessage = error.errors?.[0]?.message || error.message || errorMessage;
          
          if (response.status === 401) {
            errorMessage = 'Chave de API inválida. Verifique as configurações.';
          } else if (response.status === 403) {
            errorMessage = 'Email não autorizado. Verifique as permissões da API key.';
          }
        } catch {
          try {
            const textError = await response.text();
            if (textError) {
              errorMessage = textError;
            }
          } catch {
            errorMessage = `${response.status} ${response.statusText}`;
          }
        }
        
        console.error('SendGrid API error:', errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }

      console.log('Email enviado com sucesso via SendGrid');
      
      return {
        success: true,
        messageId: response.headers.get('x-message-id') || undefined,
      };
    } catch (error) {
      console.error('Exceção ao enviar via SendGrid:', error);
      console.error('Tipo do erro:', typeof error);
      
      let errorMessage = 'Erro desconhecido ao enviar email';
      
      if (error instanceof TypeError) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Erro de conexão. Verifique: 1) A sua ligação à internet, 2) Se a chave de API está correta.';
        } else {
          errorMessage = `Erro de rede: ${error.message}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        try {
          errorMessage = JSON.stringify(error);
        } catch {
          errorMessage = 'Erro desconhecido (objeto não serializável)';
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  private async sendViaMailgun(config: EmailConfig, emailData: EmailData): Promise<EmailResult> {
    if (!config.apiKey) {
      return {
        success: false,
        error: 'Chave de API do Mailgun não configurada',
      };
    }

    try {
      const domain = config.fromEmail.split('@')[1];
      if (!domain) {
        return {
          success: false,
          error: 'Email do remetente inválido. Não foi possível extrair o domínio.',
        };
      }

      const formData = new FormData();
      formData.append('from', `${config.fromName} <${config.fromEmail}>`);
      emailData.to.forEach(to => formData.append('to', to));
      formData.append('subject', emailData.subject);
      formData.append('html', emailData.html);
      if (emailData.text) {
        formData.append('text', emailData.text);
      }

      console.log('Enviando email via Mailgun:', { to: emailData.to, subject: emailData.subject, domain });

      const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`api:${config.apiKey}`)}`,
        },
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `Erro HTTP ${response.status}`;
        try {
          const error = await response.json();
          console.log('Mailgun error response:', error);
          errorMessage = error.message || errorMessage;
          
          if (response.status === 401) {
            errorMessage = 'Chave de API inválida. Verifique as configurações.';
          } else if (response.status === 403) {
            errorMessage = 'Domínio não autorizado. Verifique se está verificado no Mailgun.';
          }
        } catch {
          try {
            const textError = await response.text();
            if (textError) {
              errorMessage = textError;
            }
          } catch {
            errorMessage = `${response.status} ${response.statusText}`;
          }
        }
        
        console.error('Mailgun API error:', errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }

      const data = await response.json();
      console.log('Email enviado com sucesso via Mailgun:', data.id);
      
      return {
        success: true,
        messageId: data.id,
      };
    } catch (error) {
      console.error('Exceção ao enviar via Mailgun:', error);
      console.error('Tipo do erro:', typeof error);
      
      let errorMessage = 'Erro desconhecido ao enviar email';
      
      if (error instanceof TypeError) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Erro de conexão. Verifique: 1) A sua ligação à internet, 2) Se a chave de API está correta, 3) Se o domínio está verificado no Mailgun.';
        } else {
          errorMessage = `Erro de rede: ${error.message}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        try {
          errorMessage = JSON.stringify(error);
        } catch {
          errorMessage = 'Erro desconhecido (objeto não serializável)';
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  private async sendViaSMTP(config: EmailConfig, emailData: EmailData): Promise<EmailResult> {
    return {
      success: false,
      error: 'SMTP direto não é suportado no browser. Use um dos providers de API (Resend, SendGrid, Mailgun).',
    };
  }

  async testConfiguration(): Promise<{ success: boolean; message: string }> {
    const config = await this.loadConfig();
    
    if (!config || !config.fromEmail) {
      return {
        success: false,
        message: 'Configuração de email não encontrada ou incompleta. Por favor, configure primeiro.',
      };
    }

    if (!config.apiKey && config.provider !== 'smtp') {
      return {
        success: false,
        message: 'Chave de API não configurada. Por favor, insira a chave de API.',
      };
    }

    const isConfigured = await this.isConfigured();
    if (!isConfigured) {
      return {
        success: false,
        message: 'Configuração incompleta. Verifique se preencheu todos os campos obrigatórios.',
      };
    }

    console.log('Iniciando teste de configuração de email...');

    const testEmail: EmailData = {
      to: [config.fromEmail],
      subject: 'Teste de Configuração - BSCN',
      html: '<h1>Teste de Email</h1><p>Se recebeu este email, a configuração está correta!</p>',
      text: 'Teste de Email - Se recebeu este email, a configuração está correta!',
    };

    const result = await this.sendEmail(testEmail);
    
    if (result.success) {
      console.log('Teste de email bem-sucedido');
      return {
        success: true,
        message: `Email de teste enviado com sucesso para ${config.fromEmail}! Verifique a sua caixa de entrada (e spam).`,
      };
    } else {
      console.error('Teste de email falhou:', result.error);
      return {
        success: false,
        message: `Erro ao enviar email de teste: ${result.error || 'Erro desconhecido'}`,
      };
    }
  }

  generateHtmlFromTemplate(template: string, variables: Record<string, string>): string {
    let html = template;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, value);
    });
    
    return this.wrapInHtmlTemplate(html);
  }

  private wrapInHtmlTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .email-container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .email-header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #3b82f6;
    }
    .email-content {
      white-space: pre-wrap;
      margin-bottom: 30px;
    }
    .email-footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
    }
    h1 {
      color: #1e40af;
      margin: 0;
    }
    a {
      color: #3b82f6;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>BSCN - Benedita Sport Clube Natação</h1>
    </div>
    <div class="email-content">
      ${content}
    </div>
    <div class="email-footer">
      <p>Este é um email automático enviado pelo sistema de gestão BSCN.</p>
      <p>Por favor, não responda a este email.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  convertTextToHtml(text: string): string {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => `<p>${line}</p>`)
      .join('\n');
  }
}

export const emailService = EmailService.getInstance();
