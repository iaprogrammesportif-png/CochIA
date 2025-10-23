import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const body = await req.json();
    const { user_id, objectif, niveau, disponibilite } = body;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const prompt = `
      Crée un programme sportif personnalisé pour quelqu’un avec les informations suivantes :
      - Objectif : ${objectif}
      - Niveau : ${niveau}
      - Disponibilité : ${disponibilite}

      Donne un plan clair jour par jour, avec les types d’exercices et leur durée.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const programme = completion.choices[0].message.content;

    const { data, error } = await supabase
      .from("programmes")
      .insert([{ utilisateur_id: user_id, contenu: programme }]);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, programme }), {
      status: 200,
    });
  } catch (error) {
    console.error("Erreur :", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}
