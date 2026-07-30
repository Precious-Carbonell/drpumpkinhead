import { useState } from 'react';
import { User, Users, Sparkles, Clock, Check, X as XIcon, ChevronDown, Film } from 'lucide-react';
import './PriceList.css';

const soloItems = [
  { type: 'Icon', php: 150, usd: 5 },
  { type: 'Bust-up', php: 200, usd: 10 },
];

const coupleItems = [
  { type: 'Icon', php: 250, usd: 11 },
  { type: 'Bust-up', php: 350, usd: 16 },
];

const chibiItems = [
  { type: 'Head-only', php: 150, usd: 5 },
  { type: 'Bust-up', php: 180, usd: 7 },
];

const tweeningItems = [
  { type: 'Easy', php: 300, usd: 15 },
  { type: 'Medium', php: 600, usd: 25 },
  { type: 'Difficult', php: 900, usd: 35 },
];

const frameByFrameItems = [
  { type: 'Easy', php: 800, usd: 30 },
  { type: 'Medium', php: 1400, usd: 45 },
  { type: 'Difficult', php: 2000, usd: 60 },
];

const comboItems = [
  { type: 'Easy', php: 1000, usd: 40 },
  { type: 'Medium', php: 1800, usd: 60 },
  { type: 'Difficult', php: 2600, usd: 80 },
];

const dosList = [
  'Yumeship',
  'Ships',
  'OCs',
  'Real people',
  'Fictional characters',
  'Light gore (still training)',
  'Simple backgrounds',
];

const dontsList = [
  'Complex poses',
  'Mecha',
  'Furry',
  'Realism',
  'NSFW',
  'Hate art',
  'Detailed backgrounds',
];

const tosItems = [
  'No reposting unless credited.',
  'Artist draws only in their own art style.',
  '50% downpayment or full payment upfront (GCash/PayPal).',
  'Client receives progress updates.',
  'Artist may reject commissions that are too difficult.',
  'Final output delivered via Google Drive.',
  'Strictly no refunds once work has started.',
];

function MiniTable({ items }: { items: { type: string; php: number; usd: number }[] }) {
  return (
    <table className="bento-mini-table">
      <tbody>
        {items.map((item) => (
          <tr key={item.type}>
            <td className="mini-type">{item.type}</td>
            <td className="mini-price">₱{item.php} / ${item.usd}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function PriceList() {
  const [tosOpen, setTosOpen] = useState(false);

  return (
    <main className="pricelist-page">
      {/* Page heading image */}
      <div className="pricelist-header">
        <img src="/pricing.png" alt="Pricing" className="page-heading-img" />
      </div>

      <div className="bento-grid">
        {/* ART COMMISSIONS PRICING */}
        <div className="bento-tile tile-pricing">
          <img src="/greenrib.png" alt="" className="pricing-ribbon" aria-hidden="true" />
          <img src="/artcomms.png" alt="Art Commissions" className="tile-heading-img" />
          <div className="pricing-columns">
            <div className="pricing-col">
              <div className="col-icon solo"><User size={18} /></div>
              <h3>Solo</h3>
              <MiniTable items={soloItems} />
            </div>
            <div className="pricing-col">
              <div className="col-icon couple"><Users size={18} /></div>
              <h3>Couple / Duo</h3>
              <MiniTable items={coupleItems} />
            </div>
            <div className="pricing-col">
              <div className="col-icon chibi"><Sparkles size={18} /></div>
              <h3>Chibi</h3>
              <MiniTable items={chibiItems} />
            </div>
          </div>
          <div className="card-tat">
            <Clock size={14} />
            <span>TAT: ~1 week per commission</span>
          </div>
        </div>

        {/* ANIMATION PRICING */}
        <div className="bento-tile tile-animation">
          <img src="/animcomms.png" alt="Animation Commissions" className="tile-heading-img" />
          <div className="pricing-columns">
            <div className="pricing-col">
              <div className="col-icon anim"><Film size={18} /></div>
              <h3>Tweening</h3>
              <MiniTable items={tweeningItems} />
            </div>
            <div className="pricing-col">
              <div className="col-icon anim"><Film size={18} /></div>
              <h3>Frame by Frame</h3>
              <MiniTable items={frameByFrameItems} />
            </div>
            <div className="pricing-col">
              <div className="col-icon anim"><Film size={18} /></div>
              <h3>Tween + FbF</h3>
              <MiniTable items={comboItems} />
            </div>
          </div>
          <div className="card-tat">
            <Clock size={14} />
            <span>TAT: 1–2 weeks · Prices depend on complexity, length, character count, details, and editing</span>
          </div>
        </div>

        {/* DOs */}
        <div className="bento-tile tile-dos">
          <img src="/pinkrib.png" alt="" className="dos-ribbon" aria-hidden="true" />
          <h3 className="tile-label">DOs</h3>
          <ul className="check-list">
            {dosList.map((item) => (
              <li key={item}><Check size={14} />{item}</li>
            ))}
          </ul>
        </div>

        {/* DON'Ts */}
        <div className="bento-tile tile-donts">
          <h3 className="tile-label">DON'Ts</h3>
          <ul className="check-list">
            {dontsList.map((item) => (
              <li key={item}><XIcon size={14} />{item}</li>
            ))}
          </ul>
        </div>

        {/* PAYMENT METHODS */}
        <div className="bento-tile tile-payment">
          <h3 className="tile-label">Available Payment Methods:</h3>
          <div className="payment-badges">
            <div className="pay-badge gcash">
              <span className="pay-icon">G</span>
              <span>GCash</span>
            </div>
            <div className="pay-badge paypal">
              <span className="pay-icon">P</span>
              <span>PayPal</span>
            </div>
          </div>
        </div>

        {/* TERMS OF SERVICE — accordion */}
        <div className="bento-tile tile-terms">
          <button
            className={`terms-toggle ${tosOpen ? 'open' : ''}`}
            onClick={() => setTosOpen(!tosOpen)}
            aria-expanded={tosOpen}
          >
            <h3 className="tile-label">Terms of Service</h3>
            <ChevronDown size={18} className="chevron" />
          </button>
          <div className={`terms-body ${tosOpen ? 'expanded' : ''}`}>
            <ul className="tos-list">
              {tosItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
