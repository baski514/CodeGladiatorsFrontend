import React, { useState } from "react";
import { Disclosure } from "@headlessui/react";
import logo from "../../assets/brand.svg";
import NavItem from "./NavItem";
import { HiMenu, HiOutlineX } from "react-icons/hi";

const navigation = [
    { name: "Signin", href: "/signin" },
    { name: "Signup", href: "/signup"},
    { name: "Mentors", href: "/mentors" },
];

export default function SignedOutNavbar({history, activeTabName}) {
    
    return (
        <Disclosure as="nav" className="bg-gray-700">
            {({ open }) => (
                <>
                    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 ">
                        <div className="relative flex items-center justify-between h-16">
                            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                                {/* Mobile menu button*/}
                                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                                    <span className="sr-only">
                                        Open main menu
                                    </span>
                                    {open ? (
                                        <HiOutlineX size={23} />
                                    ) : (
                                        <HiMenu size={23} />
                                    )}
                                </Disclosure.Button>
                            </div>
                            <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                                <div className="flex-shrink-0 flex items-center cursor-pointer">
                                    <img
                                        className="lg:block h-20 w-auto"
                                        src={logo}
                                        alt="Workflow"
                                        onClick={() => {
                                            history.push("/");
                                        }}
                                    />
                                </div>
                                <div className="hidden sm:ml-6 sm:flex sm:flex-row sm:items-center">
                                    <div className="flex space-x-4">
                                        {navigation.map((item, index) => (
                                            <NavItem
                                                key={index}
                                                item={item}
                                                isActive={
                                                    activeTabName === item.name
                                                }
                                                isMobile={false}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Disclosure.Panel className="sm:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navigation.map((item, index) => (
                                <NavItem
                                    key={index}
                                    item={item}
                                    isActive={activeTabName === item.name}
                                    isMobile={true}
                                />
                            ))}
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    );
}
