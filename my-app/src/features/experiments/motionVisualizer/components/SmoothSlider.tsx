"use client";
import type { InputHTMLAttributes } from "react";

export default function SmoothSlider(props: InputHTMLAttributes<HTMLInputElement>) {

    return (
        <input
            type="range"
            {...props}

            className="
                appearance-none w-full
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-runnable-track]:h-3
                [&::-webkit-slider-runnable-track]:rounded-[3px]
                [&::-webkit-slider-runnable-track]:bg-mint-cream/40
                [&::-moz-range-track]:h-3
                [&::-moz-range-track]:rounded-[3px]
                [&::-moz-range-track]:bg-mint-cream/40
                [&::-ms-track]:h-3
                [&::-ms-track]:rounded-[3px]
                [&::-ms-track]:bg-mint-cream/40

                [&::-webkit-slider-thumb]:w-[28px]
                [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-[4px]
                [&::-webkit-slider-thumb]:bg-mint-cream
                [&::-webkit-slider-thumb]:bg-[url('/thumbTexture.png')]
                [&::-webkit-slider-thumb]:-mt-1
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:bg-center
                [&::-webkit-slider-thumb]:bg-cover

                [&::-moz-range-thumb]:w-[28px]
                [&::-moz-range-thumb]:h-5
                [&::-moz-range-thumb]:rounded-[4px]
                [&::-moz-range-thumb]:bg-mint-cream
                [&::-moz-range-thumb]:bg-[url('/thumbTexture.png')]
                [&::-moz-range-thumb]:cursor-pointer
                [&::-moz-range-thumb]:border-0
                [&::-moz-range-thumb]:bg-center
                [&::-moz-range-thumb]:bg-cover

                [&::-ms-thumb]:w-[28px]
                [&::-ms-thumb]:h-5
                [&::-ms-thumb]:rounded-[4px]
                [&::-ms-thumb]:bg-mint-cream
                [&::-ms-thumb]:bg-[url('/thumbTexture.png')]
                [&::-ms-thumb]:cursor-pointer
                [&::-ms-thumb]:border-0
                [&::-ms-thumb]:bg-center
                [&::-ms-thumb]:bg-cover

            "
        />
    );
}
