"use client";
import {useEffect, useState} from "react";

export default function SmoothSlider(props) {
    // const [thumbBg, setThumbBg] = useState("#F7FFF6");

    // useEffect(() => {
    //     // Lazy-load PNG only after the component mounts
    //     const img = new Image();
    //     img.src = "/thumbTexture.png"; // your PNG noise/art
    //     img.onload = () => setThumbBg("url('/thumbTexture.png')");
    // }, []);

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

                [&::-webkit-slider-thumb]:w-[28px]
                [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-[4px]
                [&::-webkit-slider-thumb]:bg-mint-cream
                [&::-webkit-slider-thumb]:bg-[url('/thumbTexture.png')]
                [&::-webkit-slider-thumb]:-mt-1
                [&::-webkit-slider-thumb]:cursor-pointer

                [&::-webkit-slider-thumb]:bg-center
                [&::-webkit-slider-thumb]:bg-cover

            "
        />
    );
}
