import { Fragment, PropsWithChildren, ReactNode, useState } from 'react';
import { Link } from '@inertiajs/react';

export default function Dropdown({
    children,
}: PropsWithChildren<{ children: ReactNode }>) {
    return <div className="relative">{children}</div>;
}

const Trigger = ({ children }: PropsWithChildren) => {
    return <>{children}</>;
};

const Content = ({
    align = 'right',
    contentClasses = 'py-1 bg-white',
    children,
}: PropsWithChildren<{
    align?: 'left' | 'right';
    width?: '48';
    contentClasses?: string;
}>) => {
    let alignmentClasses = 'origin-top';

    if (align === 'left') {
        alignmentClasses = 'ltr:origin-top-left rtl:origin-top-right start-0';
    } else if (align === 'right') {
        alignmentClasses = 'ltr:origin-top-right rtl:origin-top-left end-0';
    }

    return (
        <div
            className={`absolute z-50 mt-2 w-48 rounded-md shadow-lg ${alignmentClasses}`}
        >
            <div
                className={
                    `rounded-md ring-1 ring-black ring-opacity-5 ` +
                    contentClasses
                }
            >
                {children}
            </div>
        </div>
    );
};

const DropdownLink = ({
    className = '',
    children,
    ...props
}: PropsWithChildren<{ className?: string; href: string }>) => {
    return (
        <Link
            {...props}
            className={
                'block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ' +
                className
            }
        >
            {children}
        </Link>
    );
};

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;
