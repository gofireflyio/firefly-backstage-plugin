import React from 'react';
import { Pie } from '@ant-design/plots';
import { PieConfig } from '@ant-design/plots';
import {
    InfoCard,
    EmptyState,
} from '@backstage/core-components';
import round from "lodash/round";
import { useStyles, COLORS } from './IaCCoveragePieChart.styles';
import { Entity } from '@backstage/catalog-model';

// Define props interface for the component
interface IaCCoveragePieChartProps {
    relatedEntities: Entity[];
}

/**
 * Component that displays a pie chart of dependencies IaC coverage
 * @param relatedEntities - Array of related entities to analyze for IaC coverage
 */
export const IaCCoveragePieChart: React.FC<IaCCoveragePieChartProps> = ({ relatedEntities }) => {
    const classes = useStyles();
    const hoveredType = 'Unmanaged';

    // Process the data for the pie chart
    const statusesCounts = {
        Codified: 0,
        Unmanaged: 0,
        Ghost: 0,
        Drifted: 0,
        Undetermined: 0,
        "IaC-Ignored": 0,
        Child: 0,
        Pending: 0,
    };

    // Count the different lifecycle states
    relatedEntities.forEach(relatedEntity => {
        if (relatedEntity?.metadata?.annotations?.['firefly.ai/asset-id'] === undefined) {
            return;
        }
        const lifecycle = relatedEntity?.spec?.lifecycle;
        switch (lifecycle) {
            case 'managed':
                statusesCounts.Codified++;
                break;
            case 'unmanaged':
                statusesCounts.Unmanaged++;
                break;
            case 'ghost':
                statusesCounts.Ghost++;
                break;
            case 'drifted':
                statusesCounts.Drifted++;
                break;
            case 'undetermined':
                statusesCounts.Undetermined++;
                break;
            case 'iacIgnored':
                statusesCounts["IaC-Ignored"]++;
                break;
            case 'child':
                statusesCounts.Child++;
                break;
            case 'pending':
                statusesCounts.Pending++;
                break;
            default:
                statusesCounts.Undetermined++;
                break;
        }
    });

    const data = Object.entries(statusesCounts).map(([type, value]) => ({
        type: type as keyof typeof COLORS,
        value,
    }));

    const total = data.reduce((sum, item) => sum + item.value, 0);
    const hoveredItem = data.find(item => item.type === hoveredType);
    const hoveredPercentage = hoveredItem
        ? Math.round((hoveredItem.value / total) * 100)
        : 0;
    const isZero = total === 0;
    const unmangedVal = data?.find((item) => item.type === "Unmanaged")?.value;
    const unmanagedPercent = unmangedVal ? round((unmangedVal / total) * 100, 2).toFixed(0) : 0;

    if (isZero) {
        return (
            <InfoCard title="Resources IaC Coverage">
                <EmptyState
                    missing="data"
                    title="No Resource Dependencies Found"
                    description="This entity does not have any resource dependencies defined in the catalog."
                />
            </InfoCard>
        );
    }

    const handleEvents = (plot: any) => {
        plot.on("element:mouseenter", (event: any) => {
            const { value = 0, type = "" } = event?.data?.data || {};
            const percentElement = document.getElementById("pieInfoPercent");
            const infoElement = document.getElementById("pieInfo");
            const descElement = document.getElementById("pieInfoDesc");

            if (percentElement) {
                percentElement.textContent = `${round((value / total) * 100, 2).toFixed(0)}% (${value})`;
            }
            if (infoElement) {
                infoElement.style.color = COLORS[type as keyof typeof COLORS] || "#ccc";
            }
            if (descElement) {
                descElement.textContent = type;
            }
        });

        plot.on("element:mouseleave", () => {
            const percentElement = document.getElementById("pieInfoPercent");
            const infoElement = document.getElementById("pieInfo");
            const descElement = document.getElementById("pieInfoDesc");

            if (percentElement) {
                percentElement.textContent = `${unmanagedPercent}% (${unmangedVal})`;
            }
            if (infoElement) {
                infoElement.style.color = COLORS.Unmanaged;
            }
            if (descElement) {
                descElement.textContent = "Unmanaged";
            }
        });
    }

    const config: PieConfig = {
        appendPadding: 0,
        data,
        angleField: 'value',
        colorField: 'type',
        radius: 1,
        innerRadius: 0.8,
        tooltip: false,
        legend: false,
        label: {
            type: "spider",
            offset: "-50%",
            style: {
                textAlign: "center",
                fill: "rgba(255, 255, 255, 0)",
            },
            position: "bottom",
            autoRotate: false,
        },
        color: (datum: any) => COLORS[datum.type as keyof typeof COLORS] || "#C7C7C7",
        pieStyle: {
            lineWidth: 1,
            cursor: "pointer",
        },
        statistic: {
            title: false,
            content: {
                style: {
                    whiteSpace: 'pre-wrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    padding: '10px 0'
                },
                customHtml: () => {
                    const element = (<div
                        id="pieInfo"
                        style={{
                            fontSize: 18,
                            display: 'flex',
                            flexDirection: "column",
                            gap: '5px',
                            fontWeight: 300,
                            color: COLORS[hoveredType as keyof typeof COLORS],
                        }}
                    >
                        <span id="pieInfoPercent">{hoveredPercentage}% ({hoveredItem?.value})</span>
                        <span id="pieInfoDesc">{hoveredType}</span>
                    </div>);

                    return element as unknown as string;
                },
            },
        },
        onReady: handleEvents,
    };

    return (
        <InfoCard title="Resources IaC Coverage">
            <div className={classes.chartContainer}>
                <Pie {...config} />
            </div>
        </InfoCard>
    );
}; 