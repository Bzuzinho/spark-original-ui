import { useMemo, useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, Bell, Check, CheckCheck, ChevronDown, LogOut, MailOpen, Send, Shield, Trash2 } from 'lucide-react';
import { ClubMark } from '@/Components/ClubMark';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Textarea } from '@/Components/ui/textarea';
import type { CommunicationAlertItem, CommunicationMemberOption, PageProps as SharedPageProps } from '@/types';

interface PortalHeaderProps {
    clubName: string;
    clubShortName: string;
    clubLogoUrl: string | null;
    unreadNotifications: number;
    alerts: CommunicationAlertItem[];
    canAccessAdmin: boolean;
    currentUserName?: string;
    currentUserSubtitle?: string | null;
    currentUserAvatarUrl?: string | null;
    onNotifications: () => void;
    onAdmin: () => void;
    onLogout?: () => void;
}

function getInitials(name?: string | null): string {
    const parts = (name || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }

    return (parts[0]?.slice(0, 2) || 'U').toUpperCase();
}

export default function PortalHeader({
    clubName,
    clubShortName,
    clubLogoUrl,
    unreadNotifications,
    alerts,
    canAccessAdmin,
    currentUserName,
    currentUserSubtitle,
    currentUserAvatarUrl,
    onNotifications,
    onAdmin,
    onLogout,
}: PortalHeaderProps) {
    const { auth, communicationMembers = [] } = usePage<SharedPageProps>().props;
    const resolvedClubName = clubName?.trim() || 'ClubOS';
    const resolvedClubShortName = clubShortName?.trim() || 'BSCN';
    const resolvedClubLogoUrl = clubLogoUrl || null;
    const currentUserId = auth.user ? String(auth.user.id) : null;
    const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
    const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [alertAction, setAlertAction] = useState<'read' | 'unread' | 'delete' | null>(null);
    const [recipientSearch, setRecipientSearch] = useState('');
    const unreadAlerts = useMemo(() => alerts.filter((alert) => !alert.is_read), [alerts]);
    const visibleAlerts = unreadAlerts.length > 0 ? unreadAlerts : alerts;
    const selectedAlert = alerts.find((alert) => alert.id === selectedAlertId) ?? null;
    const composeForm = useForm<{
        recipient_ids: string[];
        subject: string;
        message: string;
        type: 'info' | 'warning' | 'success' | 'error';
        parent_id: string | null;
    }>({
        recipient_ids: [],
        subject: '',
        message: '',
        type: 'info',
        parent_id: null,
    });

    const selectableMembers = useMemo(() => {
        return communicationMembers
            .filter((member) => String(member.id) !== currentUserId)
            .filter((member) => {
                const needle = recipientSearch.trim().toLowerCase();

                if (!needle) {
                    return true;
                }

                return [
                    member.nome_completo || member.name || '',
                    member.numero_socio || '',
                    member.email || '',
                ].some((value) => value.toLowerCase().includes(needle));
            })
            .sort((left, right) => (left.nome_completo || left.name || '').localeCompare(right.nome_completo || right.name || '', 'pt'));
    }, [communicationMembers, currentUserId, recipientSearch]);

    const formatAlertDate = (value: string) => {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return new Intl.DateTimeFormat('pt-PT', {
            dateStyle: 'short',
            timeStyle: 'short',
        }).format(date);
    };

    const alertTypeLabel: Record<CommunicationAlertItem['type'], string> = {
        info: 'Informação',
        warning: 'Aviso',
        success: 'Sucesso',
        error: 'Erro',
    };

    const alertTypeClassName: Record<CommunicationAlertItem['type'], string> = {
        info: 'border-sky-200 bg-sky-100 text-sky-800',
        warning: 'border-amber-200 bg-amber-100 text-amber-800',
        success: 'border-emerald-200 bg-emerald-100 text-emerald-800',
        error: 'border-rose-200 bg-rose-100 text-rose-800',
    };

    const handleMarkRead = (alertId: string, onSuccess?: () => void) => {
        setAlertAction('read');

        router.post(route('portal.communications.read'), {
            source: 'alert',
            alert_id: alertId,
        }, {
            preserveScroll: true,
            preserveState: true,
            only: ['internalCommunications', 'communications', 'communicationAlerts', 'flash'],
            onSuccess: () => {
                onSuccess?.();
            },
            onFinish: () => {
                setAlertAction(null);
            },
        });
    };

    const handleMarkUnread = (alertId: string) => {
        setAlertAction('unread');

        router.post(route('portal.communications.unread'), {
            source: 'alert',
            alert_id: alertId,
        }, {
            preserveScroll: true,
            preserveState: true,
            only: ['internalCommunications', 'communications', 'communicationAlerts', 'flash'],
            onFinish: () => {
                setAlertAction(null);
            },
        });
    };

    const handleDeleteAlert = (alertId: string) => {
        setAlertAction('delete');

        router.delete(route('portal.communications.received.destroy'), {
            data: {
                source: 'alert',
                alert_id: alertId,
            },
            preserveScroll: true,
            preserveState: true,
            only: ['internalCommunications', 'communications', 'communicationAlerts', 'flash'],
            onSuccess: () => {
                setIsAlertDialogOpen(false);
                setSelectedAlertId(null);
            },
            onFinish: () => {
                setAlertAction(null);
            },
        });
    };

    const handleOpenAlert = (alert: CommunicationAlertItem) => {
        setSelectedAlertId(alert.id);
        setIsAlertDialogOpen(true);

        if (!alert.is_read) {
            handleMarkRead(alert.id);
        }
    };

    const handleAlertDialogChange = (open: boolean) => {
        setIsAlertDialogOpen(open);

        if (!open) {
            setSelectedAlertId(null);
        }
    };

    const memberDisplayName = (member: CommunicationMemberOption) => member.nome_completo || member.name || 'Utilizador sem nome';

    const subjectForReply = (subject: string) => subject.toLowerCase().startsWith('re:') ? subject : `Re: ${subject}`;

    const resetCompose = (alert?: CommunicationAlertItem | null) => {
        composeForm.reset();
        composeForm.clearErrors();
        composeForm.setData({
            recipient_ids: alert?.sender?.id ? [alert.sender.id] : [],
            subject: alert ? subjectForReply(alert.title) : '',
            message: alert ? `\n\n--- Mensagem original ---\n${alert.message}` : '',
            type: 'info',
            parent_id: null,
        });
        setRecipientSearch('');
    };

    const handleToggleRecipient = (memberId: string, checked: boolean) => {
        composeForm.setData('recipient_ids', checked
            ? [...composeForm.data.recipient_ids, memberId]
            : composeForm.data.recipient_ids.filter((currentId) => currentId !== memberId));
    };

    const handleRespond = (alert: CommunicationAlertItem) => {
        resetCompose(alert);
        setIsAlertDialogOpen(false);
        setIsComposeOpen(true);
    };

    const submitCompose = () => {
        composeForm.post(route('portal.communications.store'), {
            preserveScroll: true,
            preserveState: true,
            only: ['internalCommunications', 'communications', 'communicationAlerts', 'flash', 'errors'],
            onSuccess: () => {
                setIsComposeOpen(false);
                resetCompose(null);
            },
        });
    };

    return (
        <>
            <header className="rounded-[24px] border border-slate-200/80 bg-white px-3 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)] md:px-4 md:py-3.5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <ClubMark
                            logoUrl={resolvedClubLogoUrl}
                            clubName={resolvedClubName}
                            clubShortName={resolvedClubShortName}
                            className="h-11 w-11 shrink-0 border border-slate-200 bg-white text-[11px] md:h-12 md:w-12"
                            imageClassName="h-11 w-11 shrink-0 object-contain md:h-12 md:w-12"
                        />

                        <div className="min-w-0">
                            <h1 className="truncate text-[1.2rem] font-bold leading-tight text-slate-900 md:text-[1.35rem]">{resolvedClubShortName}</h1>
                            <p className="truncate text-[11px] text-slate-500 md:text-xs">{resolvedClubName}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {currentUserName ? (
                            <div className="hidden min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-right sm:flex">
                                {currentUserAvatarUrl ? (
                                    <img src={currentUserAvatarUrl} alt={currentUserName} className="h-9 w-9 rounded-full border border-slate-200 object-cover" />
                                ) : (
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-[11px] font-semibold text-slate-700">
                                        {getInitials(currentUserName)}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="truncate text-[11px] font-semibold text-slate-800">{currentUserName}</p>
                                    <p className="truncate text-[10px] text-slate-500">{currentUserSubtitle || 'Portal pessoal'}</p>
                                </div>
                            </div>
                        ) : null}

                        {canAccessAdmin ? (
                            <button
                                type="button"
                                onClick={onAdmin}
                                className="hidden rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5 text-left text-[10px] font-semibold text-orange-600 shadow-sm transition hover:bg-orange-100 sm:block"
                            >
                                <span className="inline-flex items-center gap-1"><Shield className="h-3 w-3" /> Administração</span>
                                <span className="block text-[9px] font-medium text-orange-400">apenas admins</span>
                            </button>
                        ) : null}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="relative inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-700 md:h-9 md:w-9"
                                    aria-label="Abrir notificações"
                                >
                                    <Bell className="h-[11px] w-[11px] md:h-[12px] md:w-[12px]" />
                                    {unreadNotifications > 0 ? (
                                        <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-semibold text-white">
                                            {unreadNotifications}
                                        </span>
                                    ) : null}
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[360px] rounded-2xl border-slate-200 p-1.5">
                                <DropdownMenuLabel className="flex items-center justify-between gap-3 px-3 py-2">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">Notificações</p>
                                        <p className="text-[11px] font-normal text-slate-500">
                                            {unreadNotifications > 0 ? `${unreadNotifications} por ler` : 'Sem notificações por ler'}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={onNotifications}>
                                        Ver todas
                                    </Button>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {visibleAlerts.length === 0 ? (
                                    <DropdownMenuItem disabled className="px-3 py-3 text-xs text-slate-500">
                                        Sem notificações recentes.
                                    </DropdownMenuItem>
                                ) : visibleAlerts.slice(0, 6).map((alert) => (
                                    <DropdownMenuItem
                                        key={alert.id}
                                        className="cursor-pointer rounded-xl px-3 py-3 focus:bg-slate-50"
                                        onSelect={() => handleOpenAlert(alert)}
                                    >
                                        <div className="flex w-full items-start gap-3">
                                            <div className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${alert.is_read ? 'bg-slate-300' : 'bg-blue-500'}`} />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-3">
                                                    <p className="line-clamp-1 text-sm font-semibold text-slate-900">{alert.title}</p>
                                                    <span className="shrink-0 text-[10px] text-slate-400">{formatAlertDate(alert.created_at)}</span>
                                                </div>
                                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{alert.message}</p>
                                            </div>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {onLogout ? (
                            <button
                                type="button"
                                onClick={onLogout}
                                className="inline-flex h-8 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 text-[10px] font-semibold text-slate-600 shadow-sm transition hover:border-rose-200 hover:text-rose-600 md:h-9 md:px-3"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Sair</span>
                            </button>
                        ) : null}
                    </div>
                </div>
            </header>

            <Dialog open={isAlertDialogOpen} onOpenChange={handleAlertDialogChange}>
                <DialogContent className="sm:max-w-lg">
                    {selectedAlert ? (
                        <>
                            <DialogHeader className="space-y-3 text-left">
                                <div className="flex flex-wrap items-center gap-2 pr-8">
                                    <Badge className={alertTypeClassName[selectedAlert.type]} variant="outline">
                                        {alertTypeLabel[selectedAlert.type]}
                                    </Badge>
                                    <Badge variant={selectedAlert.is_read ? 'secondary' : 'default'}>
                                        {selectedAlert.is_read ? 'Lida' : 'Não lida'}
                                    </Badge>
                                </div>
                                <DialogTitle className="pr-8 leading-snug">{selectedAlert.title}</DialogTitle>
                                <DialogDescription>
                                    Recebida em {formatAlertDate(selectedAlert.created_at)}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                        {selectedAlert.message}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-between">
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleDeleteAlert(selectedAlert.id)}
                                        disabled={alertAction !== null}
                                        className="sm:min-w-[10.5rem]"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Apagar comunicação
                                    </Button>

                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <Button
                                            variant="outline"
                                            onClick={() => handleRespond(selectedAlert)}
                                            disabled={alertAction !== null}
                                        >
                                            <ArrowRight className="mr-2 h-4 w-4" />
                                            Responder
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                if (selectedAlert.is_read) {
                                                    handleMarkUnread(selectedAlert.id);
                                                    return;
                                                }

                                                handleMarkRead(selectedAlert.id);
                                            }}
                                            disabled={alertAction !== null}
                                        >
                                            {selectedAlert.is_read ? (
                                                <MailOpen className="mr-2 h-4 w-4" />
                                            ) : (
                                                <CheckCheck className="mr-2 h-4 w-4" />
                                            )}
                                            {selectedAlert.is_read ? 'Marcar como não lida' : 'Marcar como lida'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : null}
                </DialogContent>
            </Dialog>

            <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Responder à comunicação</DialogTitle>
                        <DialogDescription>
                            Envie uma comunicação interna e ajuste os destinatários, assunto e mensagem antes de enviar.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <Label>Para</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="justify-between text-sm font-normal">
                                        <span className="truncate">
                                            {composeForm.data.recipient_ids.length === 0
                                                ? 'Selecionar utilizadores'
                                                : `${composeForm.data.recipient_ids.length} utilizador(es) selecionado(s)`}
                                        </span>
                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="w-[340px] p-3">
                                    <div className="space-y-3">
                                        <Input
                                            placeholder="Pesquisar destinatários..."
                                            value={recipientSearch}
                                            onChange={(event) => setRecipientSearch(event.target.value)}
                                            className="h-8 text-xs"
                                        />
                                        <ScrollArea className="h-56 pr-3">
                                            <div className="space-y-2">
                                                {selectableMembers.map((member) => {
                                                    const checked = composeForm.data.recipient_ids.includes(String(member.id));

                                                    return (
                                                        <label key={member.id} className="flex cursor-pointer items-start gap-2 rounded-md border p-2 text-sm hover:border-primary/40">
                                                            <Checkbox
                                                                checked={checked}
                                                                onCheckedChange={(value) => handleToggleRecipient(String(member.id), value === true)}
                                                            />
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate font-medium">{memberDisplayName(member)}</p>
                                                                <p className="truncate text-xs text-muted-foreground">
                                                                    {member.email || '-'}
                                                                    {member.numero_socio ? ` · Nº ${member.numero_socio}` : ''}
                                                                </p>
                                                            </div>
                                                            {checked ? <Check className="h-4 w-4 shrink-0 text-primary" /> : null}
                                                        </label>
                                                    );
                                                })}
                                                {selectableMembers.length === 0 ? (
                                                    <p className="text-xs text-muted-foreground">Nenhum utilizador encontrado.</p>
                                                ) : null}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            {composeForm.errors.recipient_ids ? <p className="text-xs text-destructive">{composeForm.errors.recipient_ids}</p> : null}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="portal-header-reply-subject">Assunto</Label>
                            <Input
                                id="portal-header-reply-subject"
                                value={composeForm.data.subject}
                                onChange={(event) => composeForm.setData('subject', event.target.value)}
                                placeholder="Assunto da comunicação"
                            />
                            {composeForm.errors.subject ? <p className="text-xs text-destructive">{composeForm.errors.subject}</p> : null}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="portal-header-reply-message">Mensagem</Label>
                            <Textarea
                                id="portal-header-reply-message"
                                rows={8}
                                value={composeForm.data.message}
                                onChange={(event) => composeForm.setData('message', event.target.value)}
                                placeholder="Escreva a resposta"
                            />
                            {composeForm.errors.message ? <p className="text-xs text-destructive">{composeForm.errors.message}</p> : null}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={submitCompose} disabled={composeForm.processing}>
                            <Send className="mr-2 h-4 w-4" />
                            {composeForm.processing ? 'A enviar...' : 'Enviar comunicação'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}