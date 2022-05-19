import React from 'react'
import {AiOutlineBell}  from "react-icons/ai";
export default function Alert({ alert, clickHandler }) {
    return (
        <div
            className={
                alert.className
                    ? alert.className +
                      " text-white px-6 py-4 border-0 rounded relative mb-4"
                    : "text-white px-6 py-4 border-0 rounded relative mb-4"
            }
        >
            <span className="text-xl inline-block mr-5 align-middle">
                <AiOutlineBell/>
            </span>
            <span className="inline-block align-middle md:mr-8">
                <b className="capitalize">{alert.header}</b> {alert.message}
            </span>
            <button
                className="absolute bg-transparent text-2xl font-semibold leading-none right-0 top-0 mt-4 mr-6 outline-none focus:outline-none"
                onClick={clickHandler("CLOSE")}
            >
                <span>×</span>
            </button>
        </div>
    );
}
