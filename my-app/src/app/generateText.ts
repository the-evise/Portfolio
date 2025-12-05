"use server";

import { generateText, type GenerateTextOptions } from "@/lib/text-engine/generateText";

export async function generateTextAction(config: GenerateTextOptions) {
    return generateText(config);
}
