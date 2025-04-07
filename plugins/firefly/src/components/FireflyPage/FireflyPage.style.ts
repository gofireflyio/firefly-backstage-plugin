import { makeStyles } from '@material-ui/core';

/**
 * Styles for the FireflyPage component
 * Includes gradient text styling for metrics display
 */
export const useStyles = makeStyles(({
  gradientText: {
    background: 'linear-gradient(92.57deg, #9872fe 4.91%, #59fee0 95.86%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: '35px',
    animation: 'moveAndRotate 1s',
  },
}));