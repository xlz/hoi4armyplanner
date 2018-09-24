import React from 'react';
import { Accordion } from 'semantic-ui-react';

const Drawer = ({title, children}) =>
  <Accordion panels={[{
    key: 0,
    title: title,
    content: { content: children }
  }]}/>;

export default Drawer;
