"use server";

import { generateText } from "@/lib/text-engine/generateText";

export async function generateTextAction(config) {
    return generateText(config);
}