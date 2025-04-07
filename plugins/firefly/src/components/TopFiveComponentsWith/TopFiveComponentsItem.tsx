import React from 'react';
import { numberWithCommas } from '../common';
import { useStyles } from './TopFiveComponents.styles';

interface TopFiveComponentsItemProps {
  name: string;
  count: number;
  color: string;
}

/**
 * Component that displays information about a single component and its count
 */
export const TopFiveComponentsItem: React.FC<TopFiveComponentsItemProps> = ({ name, count, color }) => {
  const classes = useStyles();
  const namespace = name.split('/')[0];
  const cleanName = name.replace(`${namespace}/`, '');

  return (
    <div className={`${classes.item} ${classes.row}`}>
      <div className={`${classes.itemText} ${classes.col}`} style={{ gap: '0px' }}>
        <span className={classes.itemTextCount}>
          {numberWithCommas(count.toString())}
        </span>
        <span className={`${classes.itemTextName}`} style={{ color: color }}>
          <a href={`/catalog/${namespace}/component/${cleanName}`}>{cleanName}</a>
        </span>
      </div>
    </div>
  );
};

export default TopFiveComponentsItem; 