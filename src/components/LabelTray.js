import React from 'react';
import { Label } from 'semantic-ui-react';
import LabelDropdown from './LabelDropdown';

const LabelTray = ({ options, selected, addLabel, onChange, l10n }) => {
  const unselected = options.filter(e => !selected.includes(e.value));
  return <React.Fragment>
    { unselected.length > 0 &&
      <LabelDropdown add text={addLabel} options={unselected}
        onChange={(e, d) => { onChange([...selected, d.value]); }}/>}
    { selected.length > 0 && selected.map(e =>
      <Label key={e} size='medium' basic as='a'
        onClick={() => { onChange(selected.filter(f => f !== e)); }}>
        {l10n ? l10n[e] : e}
      </Label>)}
  </React.Fragment>;
};

export default LabelTray;
