import { makeStyles } from '@material-ui/core';

// Define color scheme for different asset states
export const COLORS = {
  Codified: '#67CEBC',    // Codified/Managed
  Unmanaged: '#D76089',  // Not managed by IaC
  Ghost: '#F4B483',      // Ghost resources
  Drifted: '#9872FE',    // Resources that drifted from IaC
  Undetermined: '#9696A0', // Resources that thier state is unknown
  "IaC-Ignored": '#2f76cb', // Resources that their state is ignored
  Child: '#67cebc', // Child resources
  Pending: '#d76089', // Pending status
} as const;

// Define styles using Material-UI
export const useStyles = makeStyles(({
  chartContainer: {
    width: '100%',
    height: 300,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statistic: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statisticValue: {
    fontSize: '18px',
    fontWeight: 300,
  },
  statisticLabel: {
    fontSize: '14px',
  },
})); 