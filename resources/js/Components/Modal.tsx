import { Fragment, PropsWithChildren } from 'react';

export default function Modal({
    children,
    show = false,
    maxWidth = '2xl',
    closeable = true,
    onClose = () => {},
}: PropsWithChildren<{
    show: boolean;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    closeable?: boolean;
    onClose: CallableFunction;
}>) {
    const close = () => {
        if (closeable) {
            onClose();
        }
    };

    const maxWidthClass = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
    }[maxWidth];

    return (
        <Fragment>
            {show && (
                <div className="fixed inset-0 z-50 overflow-y-auto px-4 py-6 sm:px-0">
                    <div
                        className="fixed inset-0 transform transition-all"
                        onClick={close}
                    >
                        <div className="absolute inset-0 bg-gray-500 opacity-75" />
                    </div>

                    <div
                        className={`mb-6 transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:mx-auto sm:w-full ${maxWidthClass}`}
                    >
                        {children}
                    </div>
                </div>
            )}
        </Fragment>
    );
}
