import { useState } from 'react';

// Replaces the old foldable/accordion sections: instead of stacking every
// category and expanding/collapsing them, show one at a time behind tabs.
export default function DropdownTabs({ tabs }) {
  const [active, setActive] = useState(0);

  return (
    <div className="dropdown-tabs">
      <div className="dropdown-tab-bar" role="tablist">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            className={`dropdown-tab ${active === i ? 'dropdown-tab--active' : ''}`}
            role="tab"
            aria-selected={active === i}
            onClick={() => setActive(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="dropdown-tab-panel">{tabs[active].content}</div>
    </div>
  );
}
