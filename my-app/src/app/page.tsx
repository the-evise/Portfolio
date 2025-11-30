import Navigation from "@/components/Navigation";
import AboutMeCard from "@/components/AboutMeCard";
import TreeCard from "@/components/TreeCard";
import MotionVisualizer from "@/features/experiments/motionVisualizer/components/MotionVisualizer";
import Headline from "@/components/Headline";
import Progress from "@/components/Progress";


export default function Home() {
    return (
        <div className={"h-screen w-screen overflow-y-scroll snap-y snap-mandatory"}>
            <div
                className="mt-20 flex flex-col justify-center items-center gap-4 p-2 bg-mint-cream font-sans w-full h-fit mx-auto">

                <AboutMeCard/>

                <TreeCard
                    variant="hard"
                    textPosition="right"
                    className={"md:pr-[60px]"}
                    textSlot={
                        <div
                            className="flex flex-col items-center justify-center gap-4 text-center sm:items-end sm:text-left overflow-hidden">
                            <div
                                className="flex w-[calc(100%+80px)] max-w-[417px] flex-col gap-0 sm:w-full md:w-fit lg:max-w-[800px] sm:place-self-end md:place-self-end">
                                <h2 className="--font-dm-sans relative right-8 self-end text-[64px] font-extralight text-night sm:right-0 sm:text-[6vw] lg:text-[96px]">
                                    Design
                                </h2>
                                <h3 className="sm:self-end inline-block text-[87px] sm:text-[48px] md:text-[9vw] xl:text-[192px] font-display bg-[linear-gradient(0deg,#9D81E7_0%,#5794E4_100%)] bg-clip-text text-transparent -mt-[30px] sm:-mt-4 md:-mt-[40px] xl:-mt-[90px]">
                                    in <span className="italic">motion</span>
                                </h3>
                            </div>
                        </div>
                    }
                />

                <TreeCard
                    variant="soft"
                    textPosition="left"
                    className={"md:pl-[60px]"}
                    textSlot={
                        <div className="flex flex-col items-center justify-center gap-4 text-left overflow-hidden">
                            <div
                                className="flex w-[calc(100%+20px)] max-w-[417px] flex-col gap-0 sm:w-full md:w-fit lg:max-w-[800px] sm:place-self-end md:place-self-start">
                                <h2 className="sm:self-end inline-block text-[87px] sm:text-[48px] md:text-[9vw] xl:text-[192px] font-display bg-[linear-gradient(0deg,#9D81E7_0%,#5794E4_100%)] bg-clip-text text-transparent -mt-[30px] sm:-mt-4 md:-mt-[40px] xl:-mt-[90px]">
                                    structure
                                    <div className={"-mt-12 sm:-mt-6 xl:-mt-24"}>in</div>
                                </h2>
                                <div className="flex items-start gap-2 -mt-20 sm:-mt-2 xl:-mt-40 place-self-end">
                                    <span
                                        className="text-night/30 text-[48px] sm:text-[4vw] leading-none select-none">*</span>
                                    <h3 className="--font-dm-sans self-end text-[64px] font-extralight text-night sm:right-0 sm:text-[6vw] lg:text-[96px]">
                                        Logic<span className="text-night/30">,</span>
                                    </h3>
                                </div>
                            </div>
                        </div>
                    }
                />

            </div>
            <div className="my-12 flex flex-col w-full justify-center items-center px-8 gap-[66px] bg-mint-cream shadow-[0_0_10px_rgba(87,148,228,0.1)] rounded-2xl mx-auto">
                <Headline text={"I like it smooooth!"}/>
                <div className={"relative flex flex-row justify-center items-center gap-2 w-full"}>
                    <Progress value={1} max={7} orientation={"vertical"} className={"absolute -left-6"}/>
                    <MotionVisualizer />
                </div>
            </div>

        </div>
    );
}
