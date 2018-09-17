import React from 'react';
import { Dropdown, Label } from 'semantic-ui-react';

const LabelDropdown = ({ add, ...props }) =>
  <Label className={add && 'add'} size='medium' basic>
    <Dropdown selectOnBlur={false} inline={!add} scrolling={true} {...props}/>
  </Label>;

export default LabelDropdown;
