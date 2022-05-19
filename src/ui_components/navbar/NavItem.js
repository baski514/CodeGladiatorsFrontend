import React from 'react'
import { Link } from "react-router-dom";

export default function NavItem({ item, navItemClick, isActive, isMobile }) {
    function classNames(...classes) {
        return classes.filter(Boolean).join(" ");
    }
    return (
        <div onClick={navItemClick}>
            <Link
                key={item.name}
                to={item.href}
                className={classNames(
                    isActive
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white",
                    isMobile
                        ? "block px-3 py-2 rounded-md text-sm font-medium"
                        : "px-3 py-2 rounded-md text-sm font-medium"
                )}
                aria-current={isActive ? "page" : undefined}
            >
                {item.name}
            </Link>
        </div>
    );
}
