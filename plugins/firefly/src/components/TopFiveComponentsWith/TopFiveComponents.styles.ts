import { makeStyles } from '@material-ui/core/styles';

export const colors: Record<string, string> = {
  resources: '#67CEBC',   
  unmanaged: '#D76089', 
  drifted: '#9872FE',   
};

/**
 * Styles for the TopFiveComponentsWithResources component
 */
export const useStyles = makeStyles({
  // Main container styles
  topFiveComponents: {
    width: '100%',
    height: '100%',
    gap: '45px',
    position: 'relative',
  },
  
  // List container styles
  list: {
    width: '100%',
    height: '100%',
    gap: '15px',
  },
  
  // Vertical line styles
  line: {
    minWidth: '5px',
    minHeight: '97%',
    marginBottom: '3%',
    borderRadius: '7px',
    display: 'block',
    height: '100%',
    position: 'absolute',
    left: '23px', 
    top: '0', 
  },

  // Circle styles
  circle: {
    borderRadius: '50%',
    position: 'absolute',
    left: '10px',
    top: '50px',
    padding: '7px',
  },
  
  // SVG icon inside circle
  circleIcon: {
    color: 'white',
    fontSize: '18px',
  },
  
  // Item styles
  item: {
    gap: '20px',
    position: 'relative',
    transition: '0.2s',
  },
  
  // Text container in item
  itemText: {
    gap: '5px',
    fontWeight: 200,
    transition: '0.2s',
    wordBreak: 'break-all',
  },
  
  // Count text style
  itemTextCount: {
    fontWeight: 500,
    fontSize: '18px',
  },

  // Count text style
  itemTextName: {
    fontWeight: 500,
    fontSize: '16px',
  },

  basicCard: {
    padding: 10,
    border: 'none',
  },

  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },

  col: {
    display: 'flex',
    flexDirection: 'column',
  },

  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});