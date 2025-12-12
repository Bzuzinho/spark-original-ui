import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { X, Bug } from '@phosphor-icons/react';

interface ErrorLog {
  timestamp: string;
  message: string;
  stack?: string;
  type: 'error' | 'warning';
}

export function DiagnosticOverlay() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);

  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args: any[]) => {
      originalError(...args);
      const errorMessage = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setErrors(prev => [...prev, {
        timestamp: new Date().toISOString(),
        message: errorMessage,
        stack: args[0]?.stack,
        type: 'error'
      }]);
      setIsVisible(true);
    };

    console.warn = (...args: any[]) => {
      originalWarn(...args);
      const warnMessage = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setErrors(prev => [...prev, {
        timestamp: new Date().toISOString(),
        message: warnMessage,
        type: 'warning'
      }]);
      setIsVisible(true);
    };

    window.addEventListener('error', (event) => {
      setErrors(prev => [...prev, {
        timestamp: new Date().toISOString(),
        message: event.message,
        stack: event.error?.stack,
        type: 'error'
      }]);
      setIsVisible(true);
    });

    window.addEventListener('unhandledrejection', (event) => {
      setErrors(prev => [...prev, {
        timestamp: new Date().toISOString(),
        message: `Unhandled Promise Rejection: ${event.reason}`,
        type: 'error'
      }]);
      setIsVisible(true);
    });

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  if (!isVisible) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-[9999]">
        <Button
          onClick={() => setIsMinimized(false)}
          variant="destructive"
          className="shadow-lg"
        >
          <Bug size={20} className="mr-2" />
          {errors.length} erro(s) detectado(s)
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-[500px] max-h-[600px] z-[9999] shadow-2xl border-destructive">
      <div className="bg-destructive text-destructive-foreground p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bug size={20} />
          <h3 className="font-semibold">Diagnóstico de Erros</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMinimized(true)}
            className="text-destructive-foreground hover:bg-destructive-foreground/20"
          >
            Minimizar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setErrors([]);
              setIsVisible(false);
            }}
            className="text-destructive-foreground hover:bg-destructive-foreground/20"
          >
            <X size={16} />
          </Button>
        </div>
      </div>
      
      <div className="p-3 overflow-y-auto max-h-[500px] space-y-2">
        {errors.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum erro detectado</p>
        ) : (
          errors.map((error, index) => (
            <div 
              key={index}
              className={`p-2 rounded text-xs ${
                error.type === 'error' 
                  ? 'bg-destructive/10 border border-destructive/20' 
                  : 'bg-yellow-500/10 border border-yellow-500/20'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className={`font-semibold ${
                  error.type === 'error' ? 'text-destructive' : 'text-yellow-600'
                }`}>
                  {error.type === 'error' ? '❌ ERROR' : '⚠️ WARNING'}
                </span>
                <span className="text-muted-foreground text-[10px]">
                  {new Date(error.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <pre className="whitespace-pre-wrap break-words text-[11px] mb-1">
                {error.message}
              </pre>
              {error.stack && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-[10px] text-muted-foreground hover:text-foreground">
                    Ver Stack Trace
                  </summary>
                  <pre className="mt-1 text-[10px] whitespace-pre-wrap break-words text-muted-foreground">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-2 border-t bg-muted/50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            Total: {errors.length} erro(s)
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const errorText = errors.map((e, i) => 
                `[${i + 1}] ${e.type.toUpperCase()} - ${e.timestamp}\n${e.message}\n${e.stack || ''}\n\n`
              ).join('---\n\n');
              
              const blob = new Blob([errorText], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `error-log-${Date.now()}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Exportar Log
          </Button>
        </div>
      </div>
    </Card>
  );
}
