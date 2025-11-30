import {LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer} from "recharts";
import {useSpringSimulation} from "../hooks/useSpringSimulation";

interface MotionChartProps {
    stiffness: number;
    damping: number;
    mass: number;
}

export default function MotionChart({stiffness, damping, mass}: MotionChartProps) {
    const data = useSpringSimulation({stiffness, damping, mass});

    return (
        <div className="flex h-[275px] w-[275px] md:size-[379px] bg-white/10 p-4 justify-center items-center rounded-2xl">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} className={"pointer-events-none"}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" className={"pointer-events-none"}/>
                    <XAxis dataKey="time" hide/>
                    <YAxis hide/>
                    <Line type="monotone" dataKey="position" stroke="#0B0B0Aaa" strokeWidth={2} dot={false}/>
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
