import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Login" />

            <div className="flex min-h-screen items-center justify-center bg-gray-100 p-3">
                <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-5 text-center">
                        <img
                            src="/images/logo-cutout.png"
                            alt="Logo BSCN"
                            className="mx-auto h-16 w-auto object-contain"
                        />
                        <h1 className="mt-3 text-xl font-bold text-gray-900">Gestão de Clube</h1>
                        <p className="mt-1 text-base text-gray-600">Bem-vindo ao sistema de gestão BSCN</p>
                    </div>

                    {status && (
                        <div className="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-3.5">
                        <div>
                            <InputLabel htmlFor="email" value="Email" className="text-base font-medium text-gray-900" />

                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1.5 block w-full rounded-lg border-gray-300 px-3.5 py-2 text-base"
                                autoComplete="username"
                                isFocused={true}
                                placeholder="seu.email@exemplo.com"
                                onChange={(e) => setData('email', e.target.value)}
                            />

                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="Palavra-passe" className="text-base font-medium text-gray-900" />

                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1.5 block w-full rounded-lg border-gray-300 px-3.5 py-2 text-base"
                                autoComplete="current-password"
                                placeholder="••••••••"
                                onChange={(e) => setData('password', e.target.value)}
                            />

                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-700 px-4 py-2 text-base font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {processing ? 'A entrar...' : 'Entrar'}
                        </button>

                        {canResetPassword && (
                            <div className="pt-0.5 text-center">
                                <Link
                                    href={route('password.request')}
                                    className="text-base text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Esqueceu a palavra-passe?
                                </Link>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </>
    );
}
