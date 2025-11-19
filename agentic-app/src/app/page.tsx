"use client";

import { FormEvent, useMemo, useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [manuscript, setManuscript] = useState("");
  const [focusArea, setFocusArea] = useState<"global" | "scene" | "character">(
    "global",
  );
  const [isSubmitted, setIsSubmitted] = useState(false);

  const result = useMemo(
    () => (manuscript.trim().length ? analyze(manuscript, focusArea) : null),
    [manuscript, focusArea],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);
  };

  const shouldShowResult = isSubmitted && result !== null;

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <header>
          <h1>Aveline · Analyste de Cohérence Narrative</h1>
          <p>
            Je me positionne en miroir critique pour éclairer vos intentions,
            sonder la cohérence structurelle et mettre en évidence les points
            faibles de rythme ou de style qui méritent votre attention.
          </p>
        </header>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="focus">
            Quel est le périmètre de votre extrait ?
          </label>
          <div className={styles.segmented}>
            <button
              type="button"
              className={
                focusArea === "global" ? styles.segmentActive : styles.segment
              }
              onClick={() => setFocusArea("global")}
            >
              Arc global
            </button>
            <button
              type="button"
              className={
                focusArea === "scene" ? styles.segmentActive : styles.segment
              }
              onClick={() => setFocusArea("scene")}
            >
              Scène
            </button>
            <button
              type="button"
              className={
                focusArea === "character"
                  ? styles.segmentActive
                  : styles.segment
              }
              onClick={() => setFocusArea("character")}
            >
              Character beat
            </button>
          </div>

          <label className={styles.label} htmlFor="manuscript">
            Copiez votre extrait ici
          </label>
          <textarea
            id="manuscript"
            name="manuscript"
            className={styles.textarea}
            placeholder="Collez votre texte pour que je puisse en dégager les points de vigilance…"
            value={manuscript}
            onChange={(event) => {
              setIsSubmitted(false);
              setManuscript(event.target.value);
            }}
            rows={14}
            required
          />

          <button type="submit" className={styles.submit}>
            Examiner l&apos;extrait
          </button>
        </form>
      </section>

      <section className={styles.analysis}>
        {shouldShowResult && result ? (
          <AnalysisView result={result} />
        ) : (
          <EmptyState />
        )}
      </section>
    </main>
  );
}

type FocusArea = "global" | "scene" | "character";

type Observation = {
  label: string;
  insight: string;
  question: string;
  suggestion?: string;
};

type AnalysisResult = {
  coherence: Observation[];
  rhythm: Observation[];
  style: Observation[];
  temperature: number;
  summary: string;
};

const analyzerSignature = "Dans votre logique narrative,";

const analyze = (text: string, focusArea: FocusArea): AnalysisResult => {
  const sentences = splitSentences(text);
  const paragraphs = text
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
  const coherence = detectCoherenceIssues(text, sentences, focusArea);
  const rhythm = detectRhythmIssues(sentences, paragraphs);
  const style = detectStyleIssues(text, sentences);
  const temperature = computeTemperature([...coherence, ...rhythm, ...style]);
  const summary = buildSummary(coherence, rhythm, style);

  return {
    coherence,
    rhythm,
    style,
    temperature,
    summary,
  };
};

const AnalysisView = ({ result }: { result: AnalysisResult }) => {
  const sections: { title: string; observations: Observation[] }[] = [
    { title: "Cohérence Structurelle", observations: result.coherence },
    { title: "Respiration et Rythme", observations: result.rhythm },
    { title: "Style et Diction", observations: result.style },
  ];

  return (
    <div className={styles.result}>
      <div className={styles.summary}>
        <h2>Lecture d&apos;Aveline</h2>
        <p>{result.summary}</p>
        <p className={styles.temperature}>
          Température critique : <span>{result.temperature}/10</span>
        </p>
      </div>
      {sections.map(({ title, observations }) => (
        <section key={title} className={styles.observationSection}>
          <header>
            <h3>{title}</h3>
            <p>
              {observations.length
                ? "Les questions ci-dessous visent à clarifier votre intention."
                : "Je n&apos;ai pas repéré de tension notable ici. Validez simplement que cela correspond bien à votre intention."}
            </p>
          </header>
          <ul className={styles.observationList}>
            {observations.length ? (
              observations.map((item) => (
                <li key={item.label} className={styles.observation}>
                  <h4>{item.label}</h4>
                  <p>{item.insight}</p>
                  <p className={styles.question}>{item.question}</p>
                  {item.suggestion ? (
                    <p className={styles.suggestion}>{item.suggestion}</p>
                  ) : null}
                </li>
              ))
            ) : (
              <li className={styles.observationMuted}>
                Rien de saillant pour l&apos;instant — poursuivez votre
                exploration.
              </li>
            )}
          </ul>
        </section>
      ))}
    </div>
  );
};

const EmptyState = () => (
  <div className={styles.empty}>
    <h2>J&apos;attends votre extrait.</h2>
    <p>
      Donnez-moi un passage substantiel : quelques paragraphes suffisent pour
      évaluer la cohérence, le souffle et les choix stylistiques.
    </p>
  </div>
);

const splitSentences = (text: string): string[] =>
  text
    .split(/(?<=[.!?…])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

const detectCoherenceIssues = (
  text: string,
  sentences: string[],
  focus: FocusArea,
): Observation[] => {
  const observations: Observation[] = [];

  if (switchesNarrativePerson(text)) {
    observations.push({
      label: "Point de vue fluctuant",
      insight:
        "J&apos;ai relevé un passage de la première personne vers la troisième personne (ou inversement) sans transition explicite.",
      question:
        "Quel est l&apos;ancrage narratif recherché ici et comment l&apos;evolution du point de vue sert-elle la progression émotionnelle ?",
      suggestion:
        "Clarifiez la bascule par un marqueur interne ou vérifiez si le changement est nécessaire dans cette séquence.",
    });
  }

  if (tensesAreMixed(sentences)) {
    observations.push({
      label: "Gestion du temps verbale",
      insight:
        "Présent et passé cohabitent étroitement. Le lecteur risque de perdre la ligne temporelle.",
      question:
        "Souhaitez-vous instaurer une sensation de simultanéité ou faut-il stabiliser le temps de narration ?",
      suggestion:
        "Uniformisez les temps ou construisez un cadre qui légitime ce chevauchement.",
    });
  }

  if (focus === "global" && !hasStructuralMarkers(text)) {
    observations.push({
      label: "Jalons dramaturgiques discrets",
      insight:
        "Je perçois peu de repères explicites sur l&apos;état initial, la bascule et la résolution.",
      question:
        "Où se situe la tension principale de ce segment et comment se manifeste-t-elle dans la progression ?",
      suggestion:
        "Insérez un indice ou un conflit clair pour guider la lecture de l&apos;arc.",
    });
  }

  return observations;
};

const detectRhythmIssues = (
  sentences: string[],
  paragraphs: string[],
): Observation[] => {
  const observations: Observation[] = [];
  const longSentences = sentences.filter((sentence) => sentence.length > 180);
  const shortSentences = sentences.filter((sentence) => sentence.length < 40);

  if (longSentences.length && longSentences.length / sentences.length > 0.3) {
    observations.push({
      label: "Respiration saturée",
      insight:
        "Plus d&apos;un tiers des phrases dépassent 180 caractères, ce qui étire la lecture.",
      question:
        "Cherchez-vous à étouffer le lecteur ou gagneriez-vous à alterner avec des phrases plus courtes ?",
      suggestion:
        "Fractionnez les segments les plus denses pour ménager l&apos;élan narratif.",
    });
  }

  if (shortSentences.length && shortSentences.length / sentences.length > 0.4) {
    observations.push({
      label: "Staccato récurrent",
      insight:
        "La majorité des phrases sont très brèves, ce qui crée un martèlement monotone.",
      question:
        "Comment cette cadence sert-elle la tension émotionnelle de la scène ?",
      suggestion:
        "Variez la longueur des phrases pour orchestrer les temps forts et les respirations.",
    });
  }

  if (paragraphs.length > 3) {
    const unevenParagraphs = paragraphs.some(
      (paragraph, index) =>
        index > 0 &&
        Math.abs(paragraph.length - paragraphs[index - 1].length) >
          paragraphs[index - 1].length * 0.6,
    );

    if (unevenParagraphs) {
      observations.push({
        label: "Découpage irrégulier",
        insight:
          "Les paragraphes alternent des blocs compacts et des fragments très courts.",
        question:
          "Quel effet dramaturgique recherchez-vous avec cette alternance ?",
        suggestion:
          "Rééquilibrez le découpage ou renforcez les transitions pour clarifier votre intention.",
      });
    }
  }

  return observations;
};

const detectStyleIssues = (
  text: string,
  sentences: string[],
): Observation[] => {
  const observations: Observation[] = [];

  if (overusesAdverbs(text)) {
    observations.push({
      label: "Adverbes omniprésents",
      insight:
        "Plus de 8% des mots se terminent par « -ment ». L&apos;impact descriptif peut se diluer.",
      question:
        "Quelle nuance spécifique souhaitez-vous préserver avec ces adverbes ?",
      suggestion:
        "Remplacez les adverbes superflus par des verbes ou images plus précis.",
    });
  }

  if (repeatsSentenceOpenings(sentences)) {
    observations.push({
      label: "Entrées de phrases répétitives",
      insight:
        "Plusieurs phrases s&apos;ouvrent par la même construction. Le lecteur peut percevoir une mécanique.",
      question:
        "Souhaitez-vous produire un effet d&apos;incantation ou gagneriez-vous à varier les accroches ?",
      suggestion:
        "Réécrivez certaines amorces pour souligner les inflexions clés.",
    });
  }

  if (!text.match(/[«“"]/) && text.toLowerCase().includes("dit")) {
    observations.push({
      label: "Dialogues implicites",
      insight:
        "Le verbe « dire » apparaît sans marqueurs de dialogue, ce qui brouille les voix.",
      question:
        "Le lecteur est-il censé entendre un discours direct ou s&apos;agit-il d&apos;une narration rapportée ?",
      suggestion:
        "Clarifiez le statut du dialogue avec des guillemets ou une paraphrase explicite.",
    });
  }

  return observations;
};

const switchesNarrativePerson = (text: string): boolean => {
  const firstPerson = text.match(/\b(je|me|moi|nous)\b/gi)?.length ?? 0;
  const thirdPerson =
    text.match(/\b(il|elle|ils|elles|lui|leur|son|sa|ses)\b/gi)?.length ?? 0;
  return (
    firstPerson > 0 &&
    thirdPerson > 0 &&
    Math.abs(firstPerson - thirdPerson) > 4
  );
};

const tensesAreMixed = (sentences: string[]): boolean => {
  let presentCount = 0;
  let pastCount = 0;
  sentences.forEach((sentence) => {
    const lowered = sentence.toLowerCase();
    if (/(?:ait|aient|èrent|âmes|it|issaient)\b/.test(lowered)) {
      pastCount += 1;
    }
    if (/\b(est|sont|fait|va|vient|pense|regarde|marche)\b/.test(lowered)) {
      presentCount += 1;
    }
  });
  return presentCount > 2 && pastCount > 2;
};

const hasStructuralMarkers = (text: string): boolean =>
  /\b(début|ouverture|bascule|crise|résolution|climax)\b/i.test(text) ||
  /\b(mais|pourtant|cependant|alors)\b/i.test(text);

const overusesAdverbs = (text: string): boolean => {
  const tokens = text.split(/\s+/).filter(Boolean);
  if (!tokens.length) {
    return false;
  }
  const adverbs = tokens.filter((word) => word.toLowerCase().endsWith("ment"));
  return adverbs.length / tokens.length > 0.08;
};

const repeatsSentenceOpenings = (sentences: string[]): boolean => {
  const openings = sentences
    .map((sentence) => sentence.split(/\s+/)[0]?.toLowerCase() ?? "")
    .filter(Boolean);
  const counts = openings.reduce<Record<string, number>>((acc, word) => {
    acc[word] = (acc[word] ?? 0) + 1;
    return acc;
  }, {});

  return Object.values(counts).some((count) => count > 2);
};

const computeTemperature = (observations: Observation[]): number => {
  const weight = observations.length;
  if (!weight) {
    return 3;
  }
  return Math.min(9, 4 + weight * 2);
};

const buildSummary = (
  coherence: Observation[],
  rhythm: Observation[],
  style: Observation[],
): string => {
  const buckets = [
    { list: coherence, label: "cohérence" },
    { list: rhythm, label: "rythme" },
    { list: style, label: "style" },
  ];

  const tensions = buckets
    .filter(({ list }) => list.length)
    .map(({ label, list }) => `${label} (${list.length})`);

  if (!tensions.length) {
    return `${analyzerSignature} rien de dissonant n&apos;émerge. Validez simplement que cette neutralité correspond à l&apos;effet recherché.`;
  }

  return `${analyzerSignature} les tensions portent surtout sur ${tensions.join(
    ", ",
  )}. Prenez le temps d&apos;explorer chaque question pour confirmer votre intention.`;
};
