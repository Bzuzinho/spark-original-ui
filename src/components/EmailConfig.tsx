import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { EnvelopeSimple, CheckCircle, XCircle, PaperPlaneTilt } from '@phosphor-icons/react';
import { emailService, type EmailConfig } from '@/lib/email-service';

export function EmailConfigComponent() {
  const [config, setConfig] = useState<EmailConfig>({
    provider: 'resend',
    apiKey: '',
    fromEmail: '',
    fromName: 'BSCN - Benedita Sport Clube Natação',
  });
  const [isConfigured, setIsConfigured] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const storedConfig = await emailService.loadConfig();
    if (storedConfig) {
      setConfig(storedConfig);
    }
    const configured = await emailService.isConfigured();
    setIsConfigured(configured);
  };

  const handleSave = async () => {
    if (!config.fromEmail || !config.fromName) {
      toast.error('Preencha o email e nome do remetente');
      return;
    }

    if (config.provider !== 'smtp' && !config.apiKey) {
      toast.error('Preencha a chave de API');
      return;
    }

    if (config.provider === 'smtp') {
      if (!config.smtpHost || !config.smtpPort || !config.smtpUser || !config.smtpPassword) {
        toast.error('Preencha todos os campos SMTP');
        return;
      }
    }

    setIsSaving(true);
    try {
      await emailService.saveConfig(config);
      const configured = await emailService.isConfigured();
      setIsConfigured(configured);
      toast.success('Configuração guardada com sucesso');
    } catch (error) {
      toast.error('Erro ao guardar configuração');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!config.fromEmail || !config.fromName) {
      toast.error('Preencha o email e nome do remetente antes de testar');
      return;
    }

    if (config.provider !== 'smtp' && !config.apiKey) {
      toast.error('Preencha a chave de API antes de testar');
      return;
    }

    setIsTesting(true);
    try {
      const result = await emailService.testConfiguration();
      if (result.success) {
        toast.success(result.message, { duration: 5000 });
      } else {
        toast.error(result.message, { duration: 6000 });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido ao testar configuração';
      toast.error(errorMsg, { duration: 6000 });
      console.error('Erro ao testar configuração:', error);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <EnvelopeSimple size={24} />
              Configuração de Email
            </CardTitle>
            <CardDescription>
              Configure o serviço de envio de emails para comunicações automáticas e manuais
            </CardDescription>
          </div>
          {isConfigured ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="mr-1" weight="fill" />
              Configurado
            </Badge>
          ) : (
            <Badge variant="outline">
              <XCircle className="mr-1" />
              Não Configurado
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Serviços de Email Recomendados:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li><strong>Resend</strong> - Simples e gratuito até 3.000 emails/mês (recomendado)</li>
                <li><strong>SendGrid</strong> - Gratuito até 100 emails/dia</li>
                <li><strong>Mailgun</strong> - Gratuito até 5.000 emails/mês (3 meses)</li>
              </ul>
              <p className="text-xs mt-2 text-amber-700 font-medium">
                ⚠️ Importante: O domínio do email remetente deve estar verificado no serviço escolhido.
              </p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="provider">Provedor de Email *</Label>
            <Select
              value={config.provider}
              onValueChange={(value: EmailConfig['provider']) =>
                setConfig(prev => ({ ...prev, provider: value }))
              }
            >
              <SelectTrigger id="provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resend">Resend (Recomendado)</SelectItem>
                <SelectItem value="sendgrid">SendGrid</SelectItem>
                <SelectItem value="mailgun">Mailgun</SelectItem>
                <SelectItem value="smtp">SMTP (Não disponível no browser)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.provider !== 'smtp' && (
            <div>
              <Label htmlFor="apiKey">Chave de API *</Label>
              <Input
                id="apiKey"
                type="password"
                value={config.apiKey || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder={
                  config.provider === 'resend'
                    ? 're_...'
                    : config.provider === 'sendgrid'
                    ? 'SG...'
                    : 'key-...'
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                {config.provider === 'resend' && 'Obtenha em: https://resend.com/api-keys'}
                {config.provider === 'sendgrid' && 'Obtenha em: https://app.sendgrid.com/settings/api_keys'}
                {config.provider === 'mailgun' && 'Obtenha em: https://app.mailgun.com/app/account/security/api_keys'}
              </p>
            </div>
          )}

          {config.provider === 'smtp' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpHost">Servidor SMTP *</Label>
                  <Input
                    id="smtpHost"
                    value={config.smtpHost || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                    placeholder="smtp.example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPort">Porta *</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={config.smtpPort || ''}
                    onChange={(e) =>
                      setConfig(prev => ({ ...prev, smtpPort: parseInt(e.target.value) || 587 }))
                    }
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpUser">Utilizador SMTP *</Label>
                  <Input
                    id="smtpUser"
                    value={config.smtpUser || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, smtpUser: e.target.value }))}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPassword">Palavra-passe SMTP *</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={config.smtpPassword || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, smtpPassword: e.target.value }))}
                  />
                </div>
              </div>

              <Alert variant="destructive">
                <AlertDescription>
                  SMTP direto não é suportado em aplicações web por limitações de segurança do browser.
                  Por favor, use um dos serviços de API (Resend, SendGrid ou Mailgun).
                </AlertDescription>
              </Alert>
            </>
          )}

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-4">Informações do Remetente</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="fromEmail">Email do Remetente *</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={config.fromEmail}
                  onChange={(e) => setConfig(prev => ({ ...prev, fromEmail: e.target.value }))}
                  placeholder={config.provider === 'resend' ? 'onboarding@resend.dev (para testes)' : 'noreply@seudominio.pt'}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {config.provider === 'resend' 
                    ? 'Use onboarding@resend.dev para testes ou configure o seu domínio verificado'
                    : 'Este email deve estar verificado no seu provedor de email'
                  }
                </p>
              </div>

              <div>
                <Label htmlFor="fromName">Nome do Remetente *</Label>
                <Input
                  id="fromName"
                  value={config.fromName}
                  onChange={(e) => setConfig(prev => ({ ...prev, fromName: e.target.value }))}
                  placeholder="BSCN - Benedita Sport Clube Natação"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving || config.provider === 'smtp'}
              className="flex-1"
            >
              {isSaving ? 'A guardar...' : 'Guardar Configuração'}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={isTesting || !isConfigured || config.provider === 'smtp'}
            >
              <PaperPlaneTilt className="mr-2" />
              {isTesting ? 'A testar...' : 'Testar'}
            </Button>
          </div>

          {!isConfigured && config.fromEmail && config.apiKey && (
            <Alert>
              <AlertDescription>
                <p className="text-sm">
                  💡 <strong>Dica:</strong> Depois de guardar, clique em "Testar" para validar a configuração.
                </p>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Alert>
          <AlertDescription className="text-xs">
            <div className="space-y-2">
              <p><strong>Instruções Rápidas para Resend (Recomendado):</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Crie uma conta grátis em <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">resend.com</a></li>
                <li><strong>IMPORTANTE:</strong> Adicione e verifique o seu domínio em "Domains" (ou use onboarding@resend.dev para testes)</li>
                <li>Crie uma chave de API em "API Keys" com permissões de envio</li>
                <li>Cole a chave acima e configure o email do remetente <strong>com o domínio verificado</strong></li>
                <li>Clique em "Guardar Configuração" e depois em "Testar" para validar</li>
              </ol>
              <p className="mt-3"><strong>Problemas comuns e soluções:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>"Failed to fetch" ou erro de conexão:</strong>
                  <ul className="list-disc list-inside ml-4 text-xs mt-1">
                    <li>Verifique se a chave de API está correta (deve começar com "re_")</li>
                    <li>Confirme que o domínio do email está verificado no Resend</li>
                    <li>Teste com onboarding@resend.dev se ainda não verificou o seu domínio</li>
                  </ul>
                </li>
                <li><strong>Email não verificado (erro 403):</strong> Vá em "Domains" no Resend e complete a verificação DNS</li>
                <li><strong>Chave API inválida (erro 401):</strong> Regenere a chave em "API Keys" e cole novamente</li>
                <li><strong>Limite atingido:</strong> Verifique o uso em "Usage" no painel do Resend</li>
              </ul>
              <p className="mt-3 text-amber-700 font-semibold">
                💡 Para testes rápidos: Use "onboarding@resend.dev" como email remetente (não requer verificação de domínio)
              </p>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
