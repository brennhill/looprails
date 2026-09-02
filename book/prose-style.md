# House Voice for *Measure Twice, Prompt Once*

The book should sound like a sharp colleague explaining the work over coffee: warm, specific, mildly mischievous, and willing to say when a number is wearing a costume.

## The voice

- Talk to one curious practitioner, not a conference hall.
- Prefer concrete verbs and ordinary nouns. If a sentence's nouns appear to be wearing neckties, loosen something.
- Keep the technical term when it is the precise term. An eval harness is a harness; calling it an “operational enablement framework” would be a small crime.
- Vary sentence length. A short sentence should land a real point or joke, not manufacture drama.
- Use contractions when they sound natural.
- Let jokes grow from the subject. Haunted CI is welcome. Random whimsy arriving by parachute is not.
- State a view. Do not sand every tradeoff into vague balance.

## AI-isms to catch

The project audit flags clusters, not guilt. A single word proves nothing. Repetition and empty ceremony are the problem [STYLE-01] [STYLE-03].

Watch for:

- stock vocabulary such as *delve*, *tapestry*, *pivotal*, *seamless*, *robust*, and *crucial* when a plainer word says more;
- business fog such as *leverage*, *unlock*, *elevate*, *streamline*, and *navigate*;
- throat-clearing such as “it is important to note,” “at its core,” and “in conclusion”;
- classroom stage directions such as “let's unpack this” and “this chapter will explore”;
- false suspense such as “here's where it gets interesting”;
- repeated “This is not X. It is Y.” and “X isn't just Y; it's Z.” constructions;
- tidy triples added for rhythm after the point is already complete;
- paragraph endings that summarize the paragraph that just summarized the section;
- abstract nouns where a person, system, or action could take the subject position;
- cautious prose that becomes so balanced it no longer has an opinion.

## Corpus-based vocabulary watch

Several corpus studies identify words that appear disproportionately often in LLM output or surged after widespread LLM-assisted writing. The evidence comes from scientific abstracts, parallel human–model writing across several genres, and a large sample of public webpages [STYLE-05] [STYLE-06] [STYLE-07] [STYLE-08]. The audit uses that evidence in two tiers.

**Flag every prose occurrence:** forms of *delve*, *boast*, *underscore*, *intricate*, *showcase*, *surpass*, *garner*, *comprehend*, *emphasize*, *meticulous*, *tapestry*, *testament*, *realm*, *groundbreaking*, *advancement*, *pivotal*, *palpable*, *camaraderie*, *vibrant*, *unwavering*, *transformative*, *grapple*, *fleeting*, *ignite*, *unspoken*, *amidst*, *cacophony*, *unravel*, *solace*, *commendable*, *noteworthy*, *unveil*, and *prowess*. The exact form *aligns* is included too. These are prompts to inspect, not automatic deletions.

**Flag suspicious density:** *important*, *useful*, *meaningful*, *valuable*, *significant*, *key*, *insight*, *highlight*, *align*, *enhance*, *additional*, *particularly*, *effectively*, and *nuance*. These words are ordinary and sometimes exact. The audit complains only when one recurs unusually often within a file.

The scanner ignores fenced code, inline code, URLs, citation IDs, and table rows. That protects terms such as `idempotency_key`, source titles, and literal schema fields from a prose rule they never volunteered for.

Do not use this watchlist to infer who wrote a passage. Vocabulary-only detection varies sharply across models and genres; one published test found a fixed list much weaker on Claude essays than on ChatGPT essays [STYLE-09]. Its job here is editorial: catch verbal habits before they become wallpaper.

## Things that are allowed

Em dashes are punctuation, not contraband. Use one when it earns the interruption; do not scatter them like parsley. Lists of three are fine when reality contains three things. Technical contrasts are fine when the distinction does work. The goal is lively, precise prose, not evasive prose trained to fool a detector [STYLE-02] [STYLE-04].

## The edit test

For each paragraph, ask:

1. Who or what is doing the action?
2. Could the first sentence begin with the point instead of announcing it?
3. Does each contrast clarify a real boundary?
4. Did a list grow because the content needed it or because three items sounded finished?
5. Is a repeated summary helping the reader turn a corner?
6. Can one concrete example replace an abstract claim?
7. Does the joke reveal something true about the work?
8. Would a practitioner say this aloud without borrowing a lectern?

Run the mechanical check with:

```sh
node book/scripts/audit-prose.mjs
```

Then read the prose. The script can find “tapestry” and count “valuable.” It cannot tell whether a sentence has a pulse.
