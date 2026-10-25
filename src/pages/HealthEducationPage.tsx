import React, { useState } from 'react';
import { BookOpen, Search, Filter, Volume2, Sparkles, ExternalLink } from 'lucide-react';
import { TextToSpeechPlayer } from '../components/TextToSpeechPlayer';

interface Article {
  id: string;
  category: 'Menstrual Health' | 'PCOS' | 'Perimenopause' | 'Lab Reports' | 'Sleep & Wellness';
  title: string;
  summary: string;
  fullContent: string;
  evidenceSource: string;
  readTime: string;
}

const ARTICLES: Article[] = [
  {
    id: 'art_1',
    category: 'Menstrual Health',
    title: 'Understanding the Four Phases of the Menstrual Cycle',
    summary: 'How estrogen and progesterone fluctuate throughout the menstrual, follicular, ovulatory, and luteal phases.',
    fullContent: 'The menstrual cycle averages between 24 and 38 days in healthy adult women and is divided into four main phases: the menstrual phase (days 1-5, shedding of uterine lining), follicular phase (days 1-13, follicle development driven by FSH), ovulatory phase (around day 14, LH surge releasing a mature oocyte), and the luteal phase (days 15-28, progesterone rise by corpus luteum). Recognizing energy shifts across these phases helps you understand natural fluctuations in mood, sleep, and physical endurance.',
    evidenceSource: 'American College of Obstetricians and Gynecologists (ACOG)',
    readTime: '3 min read'
  },
  {
    id: 'art_2',
    category: 'PCOS',
    title: 'The Role of Insulin and Androgens in PCOS',
    summary: 'A clear clinical overview of why hyperinsulinemia can stimulate ovarian androgen production.',
    fullContent: 'Polycystic Ovary Syndrome (PCOS) is primarily driven by complex endocrine interactions. In many women with PCOS, peripheral cells exhibit insulin resistance. Elevated circulating insulin stimulates the ovarian theca cells to produce excess androgens (such as testosterone and androstenedione), which can interfere with normal follicular maturation, leading to irregular ovulation, hormonal acne, or hirsutism. Dietary fiber balance, resistance exercise, and medical therapies (such as metformin or myo-inositol) are common clinical strategies evaluated by healthcare providers.',
    evidenceSource: 'Endocrine Society Clinical Practice Guidelines',
    readTime: '4 min read'
  },
  {
    id: 'art_3',
    category: 'Lab Reports',
    title: 'How to Interpret Haemoglobin and Ferritin for Fatigue',
    summary: 'Understanding the difference between circulating red cell protein and long-term iron storage.',
    fullContent: 'Haemoglobin (Hb) is the iron-rich protein in red blood cells that carries oxygen to tissues. Normal female reference ranges are typically 12.0 to 15.5 g/dL. However, serum ferritin measures your bone marrow and liver iron reserves. It is clinically possible to have a normal haemoglobin count while experiencing depleted ferritin stores ("latent iron deficiency without anaemia"), leading to profound fatigue, brain fog, and cold intolerance. Discussing both markers with your doctor offers a clearer picture than testing haemoglobin alone.',
    evidenceSource: 'World Health Organization (WHO) Guidelines on Anaemia Assessment',
    readTime: '3 min read'
  },
  {
    id: 'art_4',
    category: 'Perimenopause',
    title: 'Navigating Vasomotor Symptoms & Sleep Architecture',
    summary: 'What causes hot flashes and night sweats during the perimenopausal transition.',
    fullContent: 'Vasomotor symptoms—commonly experienced as sudden waves of intense heat and sweating—occur due to erratic estrogen withdrawal altering norepinephrine and serotonin regulation in the hypothalamus. These episodes commonly manifest at night, causing fragmented REM sleep and next-day fatigue. Maintaining a cool bedroom environment, wearing breathable cotton layers, and discussing non-hormonal or hormone replacement therapies with a gynecologist are effective management avenues.',
    evidenceSource: 'The North American Menopause Society (NAMS)',
    readTime: '4 min read'
  },
  {
    id: 'art_5',
    category: 'Sleep & Wellness',
    title: 'The Bidirectional Link Between Sleep Disruption and Headaches',
    summary: 'Why inconsistent sleep triggers trigeminal pain pathways and tension headaches.',
    fullContent: 'Clinical neurology research demonstrates a reciprocal relationship between sleep and primary headache disorders like migraines and tension-type headaches. Sleep deprivation triggers cortical hyperexcitability and lowers pain thresholds via central sensitization. Conversely, irregular sleep architecture (such as sleeping in late after late nights) can alter circadian cortisol rhythms, provoking weekend migraines. Establishing a fixed wake-up time is often the most powerful first-line lifestyle intervention.',
    evidenceSource: 'International Headache Society (IHS)',
    readTime: '3 min read'
  }
];

export const HealthEducationPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const filtered = ARTICLES.filter(art => {
    if (selectedCategory !== 'all' && art.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        art.title.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        art.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Header */}
      <div className="pb-4 border-b border-border-soft">
        <h1 className="font-serif text-3xl font-bold text-deep-sage tracking-tight">
          Health Education Library
        </h1>
        <p className="text-xs text-text-secondary mt-1 font-accent italic text-base">
          Evidence-grounded medical education with accessible summaries and audio read-aloud.
        </p>
      </div>

      {/* Search & Categories */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-card border border-border-soft shadow-soft">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search health articles..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'Menstrual Health', 'PCOS', 'Lab Reports', 'Perimenopause', 'Sleep & Wellness'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs rounded-pill whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-pale-sage text-deep-sage font-bold border border-botanical-green/40'
                  : 'bg-[#FAF8F2] text-text-secondary border border-border-soft'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(art => (
          <div
            key={art.id}
            className="p-6 rounded-card-lg bg-white border border-border-soft shadow-soft flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-pale-sage text-deep-sage font-semibold uppercase tracking-wider">
                  {art.category}
                </span>
                <span className="text-[11px] text-text-secondary font-mono">{art.readTime}</span>
              </div>

              <h3 className="font-serif text-lg font-bold text-deep-sage mb-2">
                {art.title}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed mb-4">
                {art.summary}
              </p>
            </div>

            <div>
              <div className="pt-3 border-t border-border-soft/60 flex items-center justify-between">
                <TextToSpeechPlayer
                  textToRead={`${art.title}. ${art.fullContent}`}
                  label="Listen"
                />

                <button
                  onClick={() => setSelectedArticle(art)}
                  className="text-xs font-semibold text-deep-sage hover:underline"
                >
                  Read Full Article →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/30 backdrop-blur-sm">
          <div className="bg-white rounded-card-lg shadow-soft-lg w-full max-w-xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 border border-border-soft">
            <div className="flex items-center justify-between pb-3 border-b border-border-soft mb-4">
              <span className="text-[10px] uppercase font-bold text-deep-sage bg-pale-sage px-2.5 py-0.5 rounded-pill">
                {selectedArticle.category}
              </span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-text-secondary hover:text-text-primary text-xs"
              >
                Close ✕
              </button>
            </div>

            <h2 className="font-serif text-2xl font-bold text-deep-sage mb-3">
              {selectedArticle.title}
            </h2>

            <div className="mb-4">
              <TextToSpeechPlayer
                textToRead={`${selectedArticle.title}. ${selectedArticle.fullContent}`}
                label="Listen to Audio Narration"
              />
            </div>

            <div className="text-xs text-text-primary leading-relaxed space-y-3 font-sans">
              <p className="whitespace-pre-line leading-relaxed">{selectedArticle.fullContent}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-border-soft text-[11px] text-text-secondary">
              <span className="font-semibold text-text-primary">Clinical Evidence Reference: </span>
              {selectedArticle.evidenceSource}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
