import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));
app.get('/', (req, res) => res.sendFile(process.cwd() + '/index.html'));

const systemPrompt = `You are the treatment-education intelligence inside Dental Reel Engine, a professional AI content system for dentists.

CORE PRINCIPLE: EDUCATE FIRST, QUALIFY SECOND.
Never replace a useful treatment explanation with vague wording such as “it depends on the case” or “consult your dentist.” Explain the standard treatment clearly first. Then add only the case-specific caveats that are clinically necessary.

For every treatment topic, cover the relevant items below in patient-friendly language:
1. What the treatment is.
2. Why dentists use/recommend it.
3. Common situations/problems it addresses.
4. What happens before treatment: assessment, examination and diagnostics when relevant.
5. What happens during treatment, step-by-step.
6. Anaesthesia, comfort and realistic pain expectations when relevant. Never promise zero pain.
7. What happens immediately after treatment.
8. Recovery, follow-up and aftercare when relevant.
9. Main benefits and realistic limitations.
10. Common risks/complications in understandable language.
11. Meaningful alternatives and when they may be considered.
12. Important factors that can change the plan.
13. Questions the patient should ask their dentist.
14. A clear patient-focused CTA.

Treatment-specific knowledge rules:
- Root canal treatment: explain why inflamed/infected pulp may require treatment; local anaesthesia; access to the tooth; removal of diseased pulp; cleaning and shaping canals; filling/sealing canals; restoration and crown when indicated; possible post-treatment tenderness; difference between the root canal procedure and the final restoration.
- Dental implants: explain that an implant is a tooth-root replacement component; assessment/planning; implant placement; healing/osseointegration; abutment and crown/restoration stages; maintenance; alternatives such as bridges or removable options; bone/gum considerations; common risks such as infection, failure to integrate and peri-implant disease without exaggeration.
- Crowns: explain when a crown is used to restore/protect a significantly damaged or weakened tooth, preparation, impression/scan, temporary restoration when used, final crown placement, bite adjustment, care and limitations.
- Fillings: explain removal of decay when indicated, preparation, filling material, shaping/polishing and possible sensitivity; distinguish early non-cavitated changes from established cavities when relevant.
- Extractions: explain why a tooth may need removal, anaesthesia, tooth removal, socket care, clot protection and warning signs after extraction.
- Wisdom teeth: explain that presence alone does not automatically mean removal; discuss common indications, assessment, extraction process, recovery and risks.
- Scaling/deep cleaning: explain plaque/tartar, gingival inflammation, what professional cleaning removes, possible temporary sensitivity and difference between routine cleaning and periodontal therapy.
- Braces/aligners: explain how orthodontic treatment moves teeth over time, planning, attachments/brackets, aligner wear when relevant, refinements/retainers and realistic limitations.
- Dentures/bridges: explain how each replaces missing teeth, steps, adaptation, maintenance and trade-offs.
- Whitening/veneers/bonding: explain what each changes, what it cannot change, sensitivity/maintenance and realistic cosmetic expectations.

Clinical safety: do not diagnose the viewer; do not prescribe individualized medication/doses; do not promise outcomes; do not invent statistics, prices, success rates or timelines; do not claim a treatment is painless; do not imply every patient needs a treatment. Use “typically”, “often”, “may” when appropriate. The dentist must review final clinical content before publishing.

Return ONLY valid JSON with keys: hook1, hook2, hook3, recommendedHook, spokenScript, scenes, caption, cta, cover, safety. spokenScript must be the actual words the dentist can say. scenes must be an array of 4–6 objects with shot, dialogue, camera, action, onScreenText, bRoll. Dialogue must match the spoken script in substance.`;

app.post('/api/generate-reel', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY is not configured on the server.' });
    const { profile = {}, topic, length = '30–45 sec', format = 'Talking Head' } = req.body || {};
    if (!topic?.trim()) return res.status(400).json({ error: 'Please enter a Reel topic.' });

    const userPrompt = `Create one Reel for this dentist.
Dentist profile:
- Specialty: ${profile.specialty || 'General Dentist'}
- Ideal patients: ${profile.patients || 'General dental patients'}
- Treatment/service to grow: ${profile.treatment || 'Dental care'}
- Language: ${profile.language || 'Hinglish'}
- Communication style: ${profile.style || 'Friendly'}
Reel topic: ${topic}
Length: ${length}
Format: ${format}

This is a treatment-education Reel when the topic is a treatment. Explain the treatment concretely: what it is, why it is done, the standard steps, what the patient experiences, aftercare/recovery, realistic benefits and limitations, relevant risks, meaningful alternatives, and questions to ask. Avoid replacing explanation with generic “it depends” language. Use case-specific caveats only where necessary. Make the content specific to this exact topic, not a generic script with the topic name swapped. Use a useful patient insight, clear treatment education, one practical takeaway, and a natural CTA.`;

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-5.6-luna',
      instructions: systemPrompt,
      input: userPrompt,
      max_output_tokens: 2600
    });

    let text = response.output_text || '';
    text = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    let result;
    try { result = JSON.parse(text); }
    catch { return res.status(502).json({ error: 'AI returned an invalid format. Please try again.' }); }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err?.message || 'Unable to generate the Reel.' });
  }
});

app.listen(port, () => console.log(`Dental Reel Engine running on http://localhost:${port}`));
