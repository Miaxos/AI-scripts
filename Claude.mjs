import { Anthropic } from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { exec } from "child_process";
import { promisify } from "util";

async function getAnthropicKey() {
  const token = ((await promisify(exec)("op item get yd5qlqirps2mvihzw4wah4edhm --fields password")).stdout);
  if (token === undefined) {
    console.error("Error: openai token not found");
    process.exit(1);
  } else {
    return token.trim();
  }
}

export async function ask({ system, prompt, max_tokens, model = 'claude-3-opus-20240229', temperature = 1, debug = true }) {
  const anthropic = new Anthropic({ apiKey: await getAnthropicKey() });
  console.log("wait");
  console.log("wait");
  console.log("wait");
  if (debug) {
    const stream = anthropic.messages.stream({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: max_tokens || 4096,
      temperature,
      ...(system && { system }),
    }).on('text', (text) => process.stdout.write(text));
    const message = await stream.finalMessage();
    console.log(); // Add a newline at the end
    return message.content[0].text;
  } else {
    const message = await anthropic.messages.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: max_tokens || 4096,
      temperature,
      ...(system && { system }),
    });
    return message.content[0].text;
  }
}
