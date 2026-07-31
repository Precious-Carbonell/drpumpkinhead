import { useState, useEffect } from 'react';
import { User, Users, Sparkles, Clock, Check, X as XIcon, ChevronDown, Film, Loader } from 'lucide-react';
import './PriceList.css';

const API_URL = import.meta.env.VITE_API_URL || '';

interface PriceItem {
  category: string;
  commission_type: string;
  description: string;
  price_php: number;
  price_usd: number;
  turnaround_days: number;
}

const dosList = [
  'Yumeship',
  'Ships',
  'OCs',
  'Real people',
  'Suggestive',
  'Darkships',
  'Fictional characters',
  'Light gore (still training)',
  'Simple backgrounds',
];

const dontsList = [
  'Complex poses',
  'Mecha',
  'Furry',
  'Realism',
  'Full on NSFW',
  'Hate art',
  'Detailed backgrounds',
];

const tosItems = [
  'Do not repost as your own, I only allow it if im credited',
  'I only draw in my art style',
  '50% downpayment or full payment upfront (GCash/PayPal)',
  'I will send updates',
  'I can reject a comm if its too difficult',
  'The final output will be given through gdrive',
  'Strictly no refunds once work has started',
  'Strictly no refunds once work has started',
  'Custom comms are negotiable!',
  'No rush comms since im doing my internship and thesis as well'
];

function getCategoryIcon(category: string) {
  switch (category) {
    case 'Solo': return <User size={18} />;
    case 'Couple / Duo': return <Users size={18} />;
    case 'Chibi': return <Sparkles size={18} />;
    default: return <Film size={18} />;
  }
}

function getCategoryIconClass(category: string) {
  switch (category) {
    case 'Solo': return 'solo';
    case 'Couple / Duo': return 'couple';
    case 'Chibi': return 'chibi';
    default: return 'anim';
  }
}

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

// Group prices by category
function groupByCategory(prices: PriceItem[]) {
  const groups: Record<string, { type: string; php: number; usd: number }[]> = {};
  for (const p of prices) {
    if (!groups[p.category]) groups[p.category] = [];
    groups[p.category].push({ type: p.commission_type, php: p.price_php, usd: p.price_usd });
  }
  return groups;
}

const artCategories = ['Solo', 'Couple / Duo', 'Chibi'];
const animCategories = ['Tweening', 'Frame by Frame', 'Tweening + FbF'];

export default function PriceList() {
  const [tosOpen, setTosOpen] = useState(false);
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/prices/public`)
      .then(res => res.json())
      .then(data => {
        setPrices(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const grouped = groupByCategory(prices);
  const artGroups = artCategories.filter(c => grouped[c]);
  const animGroups = animCategories.filter(c => grouped[c]);

  // Get max turnaround for each section
  const artTat = prices.filter(p => artCategories.includes(p.category)).reduce((max, p) => Math.max(max, p.turnaround_days || 0), 0);
  const animTat = prices.filter(p => animCategories.includes(p.category)).reduce((max, p) => Math.max(max, p.turnaround_days || 0), 0);

  return (
    <main className="pricelist-page">
      {/* Page heading image */}
      <div className="pricelist-header">
        <img src="/pricing.png" alt="Pricing" className="page-heading-img" />
      </div>

      {loading ? (
        <div className="price-loading">
          <Loader size={24} className="spin" />
          <span>Loading prices...</span>
        </div>
      ) : (
        <div className="bento-grid">
          {/* ART COMMISSIONS PRICING */}
          <div className="bento-tile tile-pricing">
            <img src="/greenrib.png" alt="" className="pricing-ribbon" aria-hidden="true" />
            <img src="/artcomms.png" alt="Art Commissions" className="tile-heading-img" />
            <div className="pricing-columns">
              {artGroups.map(cat => (
                <div key={cat} className="pricing-col">
                  <div className={`col-icon ${getCategoryIconClass(cat)}`}>{getCategoryIcon(cat)}</div>
                  <h3>{cat}</h3>
                  <MiniTable items={grouped[cat]} />
                </div>
              ))}
            </div>
            {artTat > 0 && (
              <div className="card-tat">
                <Clock size={14} />
                <span>TAT: ~{artTat} days per commission</span>
              </div>
            )}
          </div>

          {/* ANIMATION PRICING */}
          <div className="bento-tile tile-animation">
            <img src="/animcomms.png" alt="Animation Commissions" className="tile-heading-img" />
            <div className="pricing-columns">
              {animGroups.map(cat => (
                <div key={cat} className="pricing-col">
                  <div className={`col-icon ${getCategoryIconClass(cat)}`}>{getCategoryIcon(cat)}</div>
                  <h3>{cat === 'Tweening + FbF' ? 'Tween + FbF' : cat}</h3>
                  <MiniTable items={grouped[cat]} />
                </div>
              ))}
            </div>
            {animTat > 0 && (
              <div className="card-tat">
                <Clock size={14} />
                <span>TAT: ~{animTat} days · Prices depend on complexity, length, character count, details, and editing</span>
              </div>
            )}
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
            <h3 className="tile-label">Payment</h3>
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
      )}
    </main>
  );
}
