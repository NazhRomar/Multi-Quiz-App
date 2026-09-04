import { useState } from 'react';

// Ports toggleCategory(): CSS hides the sibling content via
// ".dropdown-header.collapsed + .dropdown-category-content".
export default function DropdownCategory({ title, children }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <>
      <div className={`dropdown-header ${collapsed ? 'collapsed' : ''}`} onClick={() => setCollapsed((c) => !c)}>
        {title}
      </div>
      <div className="dropdown-category-content">{children}</div>
    </>
  );
}
