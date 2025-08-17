import * as functions from "firebase-functions";
import OpenAI from "openai";
import {defineSecret} from "firebase-functions/params";

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

export const chat = functions.https.onRequest(
    {secrets: [OPENAI_API_KEY]},
    async (req, res) => {
      const client = new OpenAI({apiKey: OPENAI_API_KEY.value()});

      const {instruction, input, model = "gpt-4o-mini"} = req.body;

      const completion = await client.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: instruction || "You are a helpful assistant.",
          },
          {role: "user", content: input || ""},
        ],
      });

      res.json({answer: completion.choices[0].message.content});
    },
);

// keep your existing imports/exports here

export const ping = (await import("firebase-functions")).https.onRequest(
    async (_req, res) => res.json({ok: true}),
);
