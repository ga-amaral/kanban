"use client"

import { PatternFormat } from "react-number-format"

export function PhoneInput({ ...props }: any) {
    return (
        <PatternFormat
            {...props}
            format="+55 (##) #####-####"
            allowEmptyFormatting
            mask="_"
            className="w-full bg-slate-950 border border-slate-800 text-sm p-2.5 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
        />
    )
}
