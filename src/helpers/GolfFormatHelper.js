import React from "react";
import { Table, TableHead, TableBody, TableRow, TableCell, Tooltip, Switch, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import LaunchIcon from '@mui/icons-material/Launch';
import {
    calculateConsecutiveOnePutts, calculateMostPutts, calculateLeastPutts, calculateLargestScoreDisparity,
    calculateSingleHoleMetrics, calculateCourseMetrics, calculateLostBallMetrics, calculateDrivingMetrics,
    calculateApproachMetrics, calculatePuttingMetrics, calculateScoringAverageMetrics
} from './GolfMetricHelper';
// Consts
import { imageSourceMappings } from "./GolfConsts";
import { courses } from "./GolfConsts";
import ScorecardFooter from "../components/ScorecardFooter";
// Components
// import { Chart } from "react-google-charts"; // Google Charts: https://developers.google.com/chart/interactive/docs/gallery/sankey


export const calculateFairways = (round) => {
    let fairways = {
        l: 0,
        r: 0,
        f: 0,
        x: 0,
        na: 0,
        f9: 0,
        b9: 0,
        possibleFairwaysF9: 0,
        possibleFairwaysB9: 0,
        possibleFairways: 0
    };
    // const numberOfHoles = round.hole10 ? 18 : 9;
    for (let hole = 1; hole <= 18; hole++) {
        if (round[`hole${hole}`]) {
            if (round[`hole${hole}`].fir !== 'NA') {
                fairways.possibleFairways++;
                if (hole < 10) {
                    fairways.possibleFairwaysF9++;
                } else {
                    fairways.possibleFairwaysB9++;
                }
            }
            if (round[`hole${hole}`].fir === 'L') {
                fairways.l++; // Left of fairway
            } else {
                if (round[`hole${hole}`].fir === 'R') {
                    fairways.r++; // Right of fairway
                } else {
                    if (round[`hole${hole}`].fir === 'F') { // Fairway in regulation
                        fairways.f++;
                        if (hole <= 9) {
                            fairways.f9++;
                        } else {
                            fairways.b9++;
                        }
                    } else {
                        if (round[`hole${hole}`].fir === 'X' || round[`hole${hole}`].fir === 'T') {
                            fairways.x++; // Short of fairway/topped/out of bounds
                        } else {
                            if (round[`hole${hole}`].fir === 'NA') {
                                fairways.na++;
                            } else {
                                console.log(`INVALID FIR VALUE FOR ROUND ${round.roundInfo.key} HOLE ${hole}: `, round[`hole${hole}`].fir);
                            }
                        }
                    }
                }
            }
        }
    }

    return fairways;
}

export const calculateGreens = (round) => {
    let greens = {
        g: 0,
        x: 0,
        gur: 0,
        gurF9: 0,
        gurB9: 0,
        f9: 0,
        b9: 0,
    };
    for (let hole = 1; hole <= 18; hole++) {
        if (round[`hole${hole}`]) {
            if (round[`hole${hole}`].gir === 'G' || round[`hole${hole}`].gir === 'G-1') { // Green in regulation
                if (round[`hole${hole}`].gir === 'G') greens.g++;
                if (round[`hole${hole}`].gir === 'G-1') {
                    greens.gur++;
                    if (hole <= 9) {
                        greens.gurF9++;
                    } else {
                        greens.gurB9++;
                    }
                }
                if (hole <= 9) {
                    greens.f9++;
                } else {
                    greens.b9++;
                }
            } else {
                if (round[`hole${hole}`].gir === 'X') greens.x++; // Green missed
                else {
                    if (round[`hole${hole}`].gir === 'G-1') greens.gur++; // Green under regulation
                    else console.log(`INVALID GIR VALUE FOR ROUND ${round.roundInfo.key} HOLE ${hole}: `, round[`hole${hole}`].gir);
                }
            }
        }
    }

    return greens;
}

export const calculatePuttLengths = (round) => {
    let puttLengths = {
        total: 0,
        f9: 0,
        b9: 0
    };

    for (let hole = 1; hole <= 18; hole++) {
        if (round[`hole${hole}`]) {
            if (hole < 10) {
                puttLengths.f9 = puttLengths.f9 + round[`hole${hole}`].puttLength;
            } else {
                puttLengths.b9 = puttLengths.b9 + round[`hole${hole}`].puttLength;
            }
            puttLengths.total = puttLengths.total + round[`hole${hole}`].puttLength;
            if (typeof round[`hole${hole}`].puttLength !== "number") {
                console.log(`INVALID PUTT LENGTH VALUE FOR HOLE ${hole}: `, round[`hole${hole}`].puttLength);
            }
        }
    }

    return puttLengths;
}

export const calculateDthAndDtgTotals = (round) => {
    let dthTotals = {
        total: 0,
        f9: 0,
        b9: 0
    };
    let dtgTotals = {
        total: 0,
        f9: 0,
        b9: 0
    };
    for (let hole = 1; hole <= 18; hole++) {
        if (round[`hole${hole}`]) {
            // console.log("typeof round[`hole${hole}`].dth !== number:",typeof round[`hole${hole}`].dth)
            if (hole < 10) {
                dthTotals.f9 = dthTotals.f9 + (typeof round[`hole${hole}`].dth === "number" ? round[`hole${hole}`].gir !== "G-1" ? round[`hole${hole}`].dth : 0 : parseInt(round[`hole${hole}`].dth.split(", ")[1]));
                dtgTotals.f9 = dtgTotals.f9 + (typeof round[`hole${hole}`].dtg === "number" ? round[`hole${hole}`].dtg : parseInt(round[`hole${hole}`].dtg.split(", ")[round[`hole${hole}`].dtg.split(", ").length - 1]));
            } else {
                dthTotals.b9 = dthTotals.b9 + (typeof round[`hole${hole}`].dth === "number" ? round[`hole${hole}`].gir !== "G-1" ? round[`hole${hole}`].dth : 0 : parseInt(round[`hole${hole}`].dth.split(", ")[1]));
                dtgTotals.b9 = dtgTotals.b9 + (typeof round[`hole${hole}`].dtg === "number" ? round[`hole${hole}`].dtg : parseInt(round[`hole${hole}`].dtg.split(", ")[round[`hole${hole}`].dtg.split(", ").length - 1]));
            }
            dthTotals.total = dthTotals.total + (typeof round[`hole${hole}`].dth === "number" ? round[`hole${hole}`].gir !== "G-1" ? round[`hole${hole}`].dth : 0 : parseInt(round[`hole${hole}`].dth.split(", ")[1]));
            dtgTotals.total = dtgTotals.total + (typeof round[`hole${hole}`].dtg === "number" ? round[`hole${hole}`].dtg : parseInt(round[`hole${hole}`].dtg.split(", ")[round[`hole${hole}`].dtg.split(", ").length - 1]));
            // if (typeof round[`hole${hole}`].dth !== "number" && ) {
            //     console.log(`INVALID DTH VALUE FOR HOLE ${hole}: `, round[`hole${hole}`].dth);
            // }
            // if (typeof round[`hole${hole}`].dtg !== "number") {
            //     console.log(`INVALID DTH VALUE FOR HOLE ${hole}: `, round[`hole${hole}`].dth);
            // }
        }
    }

    return { dthTotals, dtgTotals };
}

export const createHandicapRow = (singleCourseInfo, activeRound) => {
    let handicapRow = [];
    for (let hole = 1; hole <= 18; hole++) {
        if (activeRound[`hole${hole}`]) {
            if (hole === 9 && activeRound.roundInfo.fullFront9 && activeRound.roundInfo.fullFront9) {
                handicapRow.push(
                    <>
                        <TableCell key={`${hole}-1`} className="textCenter golfTableBorderRightSmall">{singleCourseInfo[`hole${hole}`].handicap}</TableCell>
                        <TableCell key={`${hole}-2`} className="textCenter golfTableBorderRightSmall">-</TableCell>
                    </>
                );
            } else if (hole === 18 && activeRound.roundInfo.fullBack9) {
                handicapRow.push(
                    <>
                        <TableCell key={`${hole}-1`} className="textCenter golfTableBorderRightSmall">{singleCourseInfo[`hole${hole}`].handicap}</TableCell>
                        <TableCell key={`${hole}-2`} className="textCenter golfTableBorderRightSmall">-</TableCell>
                        {activeRound.hole1 && <TableCell key={`${hole}-3`} className="textCenter">-</TableCell>} {/* Display blank hanciap cell only when front 9 is also played */}
                    </>
                );
            } else {
                handicapRow.push(<TableCell key={`${hole}-1`} className="textCenter">{singleCourseInfo[`hole${hole}`].handicap}</TableCell>);
            }
        }
    }
    // if (activeRound.additionalHoles) {
    //     for (let hole = 1; hole <= 9; hole++ ) {
    //         if (activeRound.additionalHoles[`additionalHole${hole}`]) {
    //             handicapRow.push(<TableCell key={`additionalHole${hole}-1`} className="textCenter">{courseInfo[activeRound.additionalHoles[`additionalHole${hole}`].courseKey][`hole${activeRound.additionalHoles[`additionalHole${hole}`].hole}`].handicap}</TableCell>);
    //         }
    //     }
    // }

    return handicapRow;
}

export const createDistanceRow = (singleCourseInfo, activeRound) => {
    let handicapRow = [];
    for (let hole = 1; hole <= 18; hole++) {
        if (activeRound[`hole${hole}`]) {
            if (hole === 9 && activeRound.roundInfo.fullFront9 && activeRound.roundInfo.fullFront9) {
                handicapRow.push(
                    <>
                        <TableCell key={`distanceRow${hole}-1`} className="textCenter golfTableBorderRightSmall">{singleCourseInfo[`hole${hole}`].distance}</TableCell>
                        <TableCell key={`${hole}-2`} className="textCenter golfTableBorderRightSmall">{singleCourseInfo.f9Yardage}</TableCell>
                    </>
                );
            } else if (hole === 18 && activeRound.roundInfo.fullBack9) {
                handicapRow.push(
                    <>
                        <TableCell key={`distanceRow${hole}-1`} className="textCenter golfTableBorderRightSmall">{singleCourseInfo[`hole${hole}`].distance}</TableCell>
                        <TableCell key={`distanceRow${hole}-2`} className="textCenter golfTableBorderRightSmall">{singleCourseInfo.b9Yardage}</TableCell>
                        {activeRound.hole1 && <TableCell key={`${hole}-3`} className="textCenter">{singleCourseInfo.yardage}</TableCell>} {/* Display total yardage only when front 9 is also played */}
                    </>
                );
            } else {
                handicapRow.push(<TableCell key={`distanceRow${hole}-1`} className="textCenter">{singleCourseInfo[`hole${hole}`].distance}</TableCell>);
            }
        }
    }
    // if (activeRound.additionalHoles) {
    //     for (let hole = 1; hole <= 9; hole++ ) {
    //         if (activeRound.additionalHoles[`additionalHole${hole}`]) {
    //             handicapRow.push(<TableCell key={`distanceRowAdditionalHole${hole}-1`} className="textCenter">{courseInfo[activeRound.additionalHoles[`additionalHole${hole}`].courseKey][`hole${activeRound.additionalHoles[`additionalHole${hole}`].hole}`].distance}</TableCell>);
    //         }
    //     }
    // }

    return handicapRow;
}

export const createParRow = (singleCourseInfo, activeRound) => {
    let parRow = [];
    for (let hole = 1; hole <= 18; hole++) {
        if (activeRound[`hole${hole}`]) {
            if (hole === 9 && activeRound.roundInfo.fullFront9 && activeRound.roundInfo.fullFront9) {
                parRow.push(
                    <>
                        <TableCell key={`parRow${hole}-1`} className="textCenter golfTableBorderRightSmall">{singleCourseInfo[`hole${hole}`].par}</TableCell>
                        <TableCell key={`parRow${hole}-2`} className="textCenter golfTableBorderRightSmall">{singleCourseInfo.f9Par}</TableCell>
                    </>
                );
            } else if (hole === 18 && activeRound.roundInfo.fullBack9) {
                parRow.push(
                    <>
                        <TableCell key={`parRow${hole}-1`} className="textCenter golfTableBorderRightSmall">{singleCourseInfo[`hole${hole}`].par}</TableCell>
                        <TableCell key={`parRow${hole}-2`} className="textCenter golfTableBorderRightSmall">{singleCourseInfo.b9Par}</TableCell>
                        {activeRound.hole1 && <TableCell key={`parRow${hole}-3`} className="textCenter">{singleCourseInfo.par}</TableCell>} {/* Display total row only when front 9 is also played */}
                    </>
                );
            } else {
                parRow.push(<TableCell key={`${hole}-1`} className="textCenter">{singleCourseInfo[`hole${hole}`].par}</TableCell>);
            }
        }
    }
    // if (activeRound.additionalHoles) {
    //     for (let hole = 1; hole <= 9; hole++ ) {
    //         if (activeRound.additionalHoles[`parRowAdditionalHole${hole}`]) {
    //             parRow.push(<TableCell key={`parRowAdditionalHole${hole}-1`} className="textCenter">{courseInfo[activeRound.additionalHoles[`additionalHole${hole}`].courseKey][`hole${activeRound.additionalHoles[`additionalHole${hole}`].hole}`].par}</TableCell>);
    //         }
    //     }
    // }

    return parRow;
}

export const createScoreRow = (singleCourseInfo, activeRound) => {
    let scoreRow = [];
    for (let hole = 1; hole <= 18; hole++) {
        if (activeRound[`hole${hole}`]) {
            let backgroundColorClassName = "scorecardHighlightPadding borderRadiusSmall";
            if (activeRound[`hole${hole}`].score > singleCourseInfo[`hole${hole}`].par + 1) backgroundColorClassName += " backgroundColorBogeyPlus";
            if (activeRound[`hole${hole}`].score === singleCourseInfo[`hole${hole}`].par + 1) backgroundColorClassName += " backgroundColorBogey";
            if (activeRound[`hole${hole}`].score === singleCourseInfo[`hole${hole}`].par - 1) backgroundColorClassName += " backgroundColorBirdie";
            if (activeRound[`hole${hole}`].score < singleCourseInfo[`hole${hole}`].par - 1) backgroundColorClassName += " backgroundColorEagle";

            if (hole === 9 && activeRound.roundInfo.fullFront9) {
                scoreRow.push(
                    <>
                        <TableCell key={`scoreRowHole${hole}-1`} className="textCenter golfTableBorderRightSmall"><span className={backgroundColorClassName}>{activeRound[`hole${hole}`].score}</span></TableCell>
                        <TableCell key={`${hole}-2`} className="textCenter golfTableBorderRightSmall">{activeRound.scoring.out}</TableCell>
                    </>
                );
            } else if (hole === 18 && activeRound.roundInfo.fullBack9) {
                scoreRow.push(
                    <>
                        <TableCell key={`scoreRowHole${hole}-1`} className="textCenter golfTableBorderRightSmall"><span className={backgroundColorClassName}>{activeRound[`hole${hole}`].score}</span></TableCell>
                        <TableCell key={`scoreRowHole${hole}-2`} className="textCenter golfTableBorderRightSmall">{activeRound.scoring.in}</TableCell>
                        {activeRound.hole1 && <TableCell key={`scoreRowHole${hole}-3`} className="textCenter">{activeRound.scoring.total}</TableCell>} {/* Display total row only when front 9 is also played */}
                    </>
                );
            } else {
                scoreRow.push(<TableCell key={`scoreRowHole${hole}1`} className="textCenter"><span className={backgroundColorClassName}>{activeRound[`hole${hole}`].score}</span></TableCell>);
            }
        }
    }
    // if (activeRound.additionalHoles) {
    //     for (let hole = 1; hole <= 9; hole++ ) {
    //         if (activeRound.additionalHoles[`additionalHole${hole}`]) {
    //             let backgroundColorClassName = "paddingTopSmall paddingLeftSmall paddingRightSmall paddingBottomSmall borderRadiusSmall";
    //             if (activeRound.additionalHoles[`additionalHole${hole}`].score > courseInfo[activeRound.additionalHoles[`additionalHole${hole}`].courseKey][`hole${activeRound.additionalHoles[`additionalHole${hole}`].hole}`].par + 1) backgroundColorClassName += " backgroundColorBogeyPlus";
    //             if (activeRound.additionalHoles[`additionalHole${hole}`].score === courseInfo[activeRound.additionalHoles[`additionalHole${hole}`].courseKey][`hole${activeRound.additionalHoles[`additionalHole${hole}`].hole}`].par + 1) backgroundColorClassName += " backgroundColorBogey";
    //             if (activeRound.additionalHoles[`additionalHole${hole}`].score === courseInfo[activeRound.additionalHoles[`additionalHole${hole}`].courseKey][`hole${activeRound.additionalHoles[`additionalHole${hole}`].hole}`].par - 1) backgroundColorClassName += " backgroundColorBirdie";
    //             if (activeRound.additionalHoles[`additionalHole${hole}`].score < courseInfo[activeRound.additionalHoles[`additionalHole${hole}`].courseKey][`hole${activeRound.additionalHoles[`additionalHole${hole}`].hole}`].par - 1) backgroundColorClassName += " backgroundColorEagle";
    //             scoreRow.push(<TableCell key={`scoreRowAdditionalHole${hole}-1`} className="textCenter"><span className={backgroundColorClassName}>{activeRound.additionalHoles[`additionalHole${hole}`].score}</span></TableCell>);
    //         }
    //     }
    // }

    return scoreRow;
}

export const createPuttsRow = (activeRound) => {
    let puttsRow = [];
    for (let hole = 1; hole <= 18; hole++) {
        if (activeRound[`hole${hole}`]) {
            let backgroundColorClassName = "scorecardHighlightPadding borderRadiusSmall";
            if (activeRound[`hole${hole}`].putts > 2) backgroundColorClassName += " backgroundColorBogey";
            if (activeRound[`hole${hole}`].putts === 1) backgroundColorClassName += " backgroundColorBirdie";
            if (activeRound[`hole${hole}`].putts === 0) backgroundColorClassName += " backgroundColorEagle";

            if (hole === 9 && activeRound.roundInfo.fullFront9) {
                puttsRow.push(
                    <>
                        <TableCell key={`puttsRowHole${hole}-1`} className="textCenter golfTableBorderRightSmall"><span className={backgroundColorClassName}>{activeRound[`hole${hole}`].putts}</span></TableCell>
                        <TableCell key={`puttsRowHole${hole}-2`} className="textCenter golfTableBorderRightSmall">{activeRound.putting.f9Putts}</TableCell>
                    </>
                );
            } else if (hole === 18 && activeRound.roundInfo.fullBack9) {
                puttsRow.push(
                    <>
                        <TableCell key={`puttsRowHole${hole}-1`} className="textCenter golfTableBorderRightSmall"><span className={backgroundColorClassName}>{activeRound[`hole${hole}`].putts}</span></TableCell>
                        <TableCell key={`puttsRowHole${hole}-2`} className="textCenter golfTableBorderRightSmall">{activeRound.putting.b9Putts}</TableCell>
                        {activeRound.hole1 && <TableCell key={`puttsRowHole${hole}-3`} className="textCenter">{activeRound.putting.putts}</TableCell>} {/* Display total row only when front 9 is also played */}
                    </>
                );
            } else {
                puttsRow.push(<TableCell key={`puttsRowHole${hole}-1`} className="textCenter"><span className={backgroundColorClassName}>{activeRound[`hole${hole}`].putts}</span></TableCell>);
            }
        }
    }
    if (activeRound.additionalHoles) {
        for (let hole = 1; hole <= 9; hole++ ) {
            if (activeRound.additionalHoles[`additionalHole${hole}`]) {
                let backgroundColorClassName = "paddingTopSmall paddingLeftSmall paddingRightSmall paddingBottomSmall borderRadiusSmall";
                if (activeRound.additionalHoles[`additionalHole${hole}`].putts > 2) backgroundColorClassName += " backgroundColorBogey";
                if (activeRound.additionalHoles[`additionalHole${hole}`].putts === 1) backgroundColorClassName += " backgroundColorBirdie";
                if (activeRound.additionalHoles[`additionalHole${hole}`].putts === 0) backgroundColorClassName += " backgroundColorEagle";
                puttsRow.push(<TableCell key={`puttsRowAdditionalHole${hole}-1`} className="textCenter"><span className={backgroundColorClassName}>{activeRound.additionalHoles[`additionalHole${hole}`].putts}</span></TableCell>);
            }
        }
    }
    return puttsRow;
}

export const createScrambleRow = (activeRound) => {
    let scrambleRow = [];
    let strokeMapping = {
        f9: { j: 0, m: 0, n: 0 },
        b9: { j: 0, m: 0, n: 0 },
        drives: { j: 0, m: 0 },
        putts: { j: 0, m: 0, n: 0 }
    };
    for (let hole = 1; hole <= 18; hole++) {
        if (hole <= 9) {
            for (let stroke in activeRound[`hole${hole}`].scrambleString) {
                // TODO: break down round by stroke Used X number of drives from Player Y)
                // if (stroke === 1) {
                //     if ()
                // }
                if (activeRound[`hole${hole}`].scrambleString[stroke] === "J") strokeMapping.f9.j++;
                else if (activeRound[`hole${hole}`].scrambleString[stroke] === "M") strokeMapping.f9.m++;
                else if (activeRound[`hole${hole}`].scrambleString[stroke] === "N") strokeMapping.f9.n++;
            }
        } else {
            for (let stroke in activeRound[`hole${hole}`].scrambleString) {
                if (activeRound[`hole${hole}`].scrambleString[stroke] === "J") strokeMapping.b9.j++;
                else if (activeRound[`hole${hole}`].scrambleString[stroke] === "M") strokeMapping.b9.m++;
                else if (activeRound[`hole${hole}`].scrambleString[stroke] === "N") strokeMapping.b9.n++;
            }
        }
        if (activeRound[`hole${hole}`]) {
            if (hole === 9 && activeRound.roundInfo.fullFront9) {
                scrambleRow.push(
                    <>
                        <TableCell key={`${hole}-1`} className="textCenter golfTableBorderRightSmall"><small>{activeRound[`hole${hole}`].scrambleString}</small></TableCell>
                        <TableCell key={`${hole}-2`} className="textCenter golfTableBorderRightSmall">J: <b>{strokeMapping.f9.j}</b> M: <b>{strokeMapping.f9.m}</b> N: <b>{strokeMapping.f9.n}</b></TableCell>
                    </>
                );
            } else if (hole === 18 && activeRound.roundInfo.fullBack9) {
                scrambleRow.push(
                    <>
                        <TableCell key={`${hole}-1`} className="textCenter golfTableBorderRightSmall"><small>{activeRound[`hole${hole}`].scrambleString}</small></TableCell>
                        <TableCell key={`${hole}-2`} className="textCenter golfTableBorderRightSmall">J: <b>{strokeMapping.b9.j}</b> M: <b>{strokeMapping.b9.m}</b> N: <b>{strokeMapping.b9.n}</b></TableCell>
                        {activeRound.hole1 && <TableCell key={`${hole}-3`} className="textCenter">J: <b>{strokeMapping.f9.j + strokeMapping.b9.j}</b> M: <b>{strokeMapping.f9.m + strokeMapping.b9.m}</b> N: <b>{strokeMapping.f9.n + strokeMapping.b9.n}</b></TableCell>} {/* Display total row only when front 9 is also played */}
                    </>
                );
                strokeMapping = {
                    f9: { j: 0, m: 0, n: 0 },
                    b9: { j: 0, m: 0, n: 0 }
                };
            } else {
                scrambleRow.push(<TableCell key={`${hole}-1`} className="textCenter"><small>{activeRound[`hole${hole}`].scrambleString}</small></TableCell>);
            }
        }
    }

    return scrambleRow;
}

export const createNetRow = (activeRound, course) => {
    let netRow = [];
    for (let hole = 1; hole <= 18; hole++) {
        if (activeRound[`hole${hole}`]) {
            let backgroundColorClassName = "paddingTopSmall paddingLeftSmall paddingRightSmall paddingBottomSmall borderRadiusSmall";
            if (activeRound[`hole${hole}`].netScore > course[`hole${hole}`].par + 1) backgroundColorClassName += " backgroundColorBogeyPlus";
            if (activeRound[`hole${hole}`].netScore === course[`hole${hole}`].par + 1) backgroundColorClassName += " backgroundColorBogey";
            if (activeRound[`hole${hole}`].netScore === course[`hole${hole}`].par - 1) backgroundColorClassName += " backgroundColorBirdie";
            if (activeRound[`hole${hole}`].netScore < course[`hole${hole}`].par - 1) backgroundColorClassName += " backgroundColorEagle";
            if (hole === 9 && activeRound.roundInfo.fullFront9) {
                netRow.push(
                    <>
                        <TableCell key={`${hole}-1`} className="textCenter golfTableBorderRightSmall"><span className={backgroundColorClassName}>{activeRound[`hole${hole}`].netScore}</span></TableCell>
                        <TableCell key={`${hole}-2`} className="textCenter golfTableBorderRightSmall">{activeRound.netScore}</TableCell>
                    </>
                );
            } else if (hole === 18 && activeRound.roundInfo.fullBack9) {
                netRow.push(
                    <>
                        <TableCell key={`${hole}-1`} className="textCenter golfTableBorderRightSmall"><span className={backgroundColorClassName}>{activeRound[`hole${hole}`].netScore}</span></TableCell>
                        <TableCell key={`${hole}-2`} className="textCenter golfTableBorderRightSmall">{activeRound.netScore}</TableCell>
                    </>
                );
            } else {
                netRow.push(<TableCell key={`${hole}-1`} className="textCenter"><span className={backgroundColorClassName}>{activeRound[`hole${hole}`].netScore}</span></TableCell>);
            }
        }
    }

    return netRow;
}

export const createFairwaysRow = (activeRound) => {
    let fairwaysRow = [];
    for (let hole = 1; hole <= 18; hole++) {
        if (activeRound[`hole${hole}`]) {
            if (hole === 9 && activeRound.roundInfo.fullFront9) {
                fairwaysRow.push(
                    <>
                        <TableCell key={`${hole}-1`} className="textCenter golfTableBorderRightSmall">{activeRound[`hole${hole}`].fir === "NA" ? "-" : activeRound[`hole${hole}`].fir}</TableCell>
                        <TableCell key={`${hole}-2`} className="textCenter golfTableBorderRightSmall">{activeRound.fairways.f9}</TableCell>
                    </>
                );
            } else if (hole === 18 && activeRound.roundInfo.fullBack9) {
                fairwaysRow.push(
                    <>
                        <TableCell key={`${hole}-1`} className="textCenter golfTableBorderRightSmall">{activeRound[`hole${hole}`].fir === "NA" ? "-" : activeRound[`hole${hole}`].fir}</TableCell>
                        <TableCell key={`${hole}-2`} className="textCenter golfTableBorderRightSmall">{activeRound.fairways.b9}</TableCell>
                        {activeRound.hole1 && <TableCell key={`${hole}-3`} className="textCenter">{activeRound.fairways.f} ({18 - activeRound.fairways.na})</TableCell>} {/* Display total row only when front 9 is also played */}
                    </>
                );
            } else {
                fairwaysRow.push(<TableCell key={`${hole}-1`} className="textCenter">{activeRound[`hole${hole}`].fir === "NA" ? "-" : activeRound[`hole${hole}`].fir}</TableCell>);
            }
        }
    }
    if (activeRound.additionalHoles) {
        for (let hole = 1; hole <= 9; hole++ ) {
            if (activeRound.additionalHoles[`additionalHole${hole}`]) {
                fairwaysRow.push(<TableCell key={`additionalHole${hole}-1`} className="textCenter">{activeRound[`hole${hole}`].fir === "NA" ? "-" : activeRound.additionalHoles[`additionalHole${hole}`].fir}</TableCell>);
            }
        }
    }

    return fairwaysRow;
}

export const createGreensRow = (activeRound) => {
    let greensRow = [];
    for (let hole = 1; hole <= 18; hole++) {
        if (activeRound[`hole${hole}`]) {
            if (hole === 9 && activeRound.roundInfo.fullFront9) {
                greensRow.push(
                    <>
                        <TableCell key={`${hole}-1`} className="textCenter golfTableBorderRightSmall">{activeRound[`hole${hole}`].gir}</TableCell>
                        <TableCell key={`${hole}-2`} className="textCenter golfTableBorderRightSmall">{activeRound.greens.f9}{activeRound.greens.gurF9 > 0 && ` (${activeRound.greens.gurF9})`}</TableCell>
                    </>
                );
            } else if (hole === 18 && activeRound.roundInfo.fullBack9) {
                greensRow.push(
                    <>
                        <TableCell key={`${hole}-1`} className="textCenter golfTableBorderRightSmall">{activeRound[`hole${hole}`].gir}</TableCell>
                        <TableCell key={`${hole}-2`} className="textCenter golfTableBorderRightSmall">{activeRound.greens.b9}{activeRound.greens.gurB9 > 0 && ` (${activeRound.greens.gurB9})`}</TableCell>
                        {activeRound.hole1 && <TableCell key={`${hole}-3`} className="textCenter">{activeRound.greens.g + activeRound.greens.gur}{activeRound.greens.gur > 0 && ` (${activeRound.greens.gur})`}</TableCell>} {/* Display total row only when front 9 is also played */}
                    </>
                );
            } else {
                greensRow.push(<TableCell key={`${hole}-1`} className="textCenter">{activeRound[`hole${hole}`].gir}</TableCell>);
            }
        }
    }
    if (activeRound.additionalHoles) {
        for (let hole = 1; hole <= 9; hole++ ) {
            if (activeRound.additionalHoles[`additionalHole${hole}`]) {
                greensRow.push(<TableCell key={`additionalHole${hole}-1`} className="textCenter">{activeRound.additionalHoles[`additionalHole${hole}`].gir}</TableCell>);
            }
        }
    }

    return greensRow;
}

export const createDTGRow = (activeRound) => {
    let dtgRow = [];
    for (let hole = 1; hole <= 18; hole++) {
        if (activeRound[`hole${hole}`]) {
            if (hole === 9 && activeRound.roundInfo.fullFront9) {
                dtgRow.push(
                    <>
                        <TableCell key={`${hole}-1`} className="textCenter golfTableBorderRightSmall">{activeRound[`hole${hole}`].dtg}</TableCell>
                        <TableCell key={`${hole}-2`} className="textCenter golfTableBorderRightSmall">{Math.round(activeRound.approach.dtgF9Average)}</TableCell>
                    </>
                );
            } else if (hole === 18 && activeRound.roundInfo.fullBack9) {
                dtgRow.push(
                    <>
                        <TableCell key={`${hole}-1`} className="textCenter golfTableBorderRightSmall">{activeRound[`hole${hole}`].dtg}</TableCell>
                        <TableCell key={`${hole}-2`} className="textCenter golfTableBorderRightSmall">{activeRound.approach.dtgB9Average === "-" ? activeRound.approach.dtgB9Average : `${Math.round(activeRound.approach.dtgB9Average)}`}</TableCell>
                        {activeRound.hole1 && <TableCell key={`${hole}-3`} className="textCenter">{Math.round(activeRound.approach.dtgTotalAverage)}</TableCell>} {/* Display total row only when front 9 is also played */}
                    </>
                );
            } else {
                dtgRow.push(<TableCell key={`${hole}-1`} className="textCenter">{activeRound[`hole${hole}`].dtg}</TableCell>);
            }
        }
    }
    if (activeRound.additionalHoles) {
        for (let hole = 1; hole <= 9; hole++ ) {
            if (activeRound.additionalHoles[`additionalHole${hole}`]) {
                dtgRow.push(<TableCell key={`additionalHole${hole}-1`} className="textCenter">{activeRound.additionalHoles[`additionalHole${hole}`].dtg}</TableCell>);
            }
        }
    }

    return dtgRow;
}

const formatDtg2Value = (holePar, activeRoundHole) => {
    if (holePar == 5) {
        if (activeRoundHole.gir === "G-1") {
            return 0
        } else {
            return activeRoundHole.dtg2
        }
    } else {
        return "-"
    }
}

export const createDTG2Row = (activeRound, singleCourseInfo) => {
    let dtg2Row = [];
    for (let hole = 1; hole <= 18; hole++) {
        if (activeRound[`hole${hole}`]) {
            if (hole === 9 && activeRound.roundInfo.fullFront9) {
                dtg2Row.push(
                    <>
                        <TableCell key={`${hole}-1`} className="textCenter golfTableBorderRightSmall">{formatDtg2Value(singleCourseInfo[`hole${hole}`].par, activeRound[`hole${hole}`])}</TableCell>
                        <TableCell key={`${hole}-2`} className="textCenter golfTableBorderRightSmall">{`${Math.round(activeRound.approach.dtgF9Par5Average)} / ${Math.round(activeRound.approach.dtg2F9Par5Average)}`}</TableCell>
                    </>
                );
            } else if (hole === 18 && activeRound.roundInfo.fullBack9) {
                dtg2Row.push(
                    <>
                        <TableCell key={`${hole}-1`} className="textCenter golfTableBorderRightSmall">{formatDtg2Value(singleCourseInfo[`hole${hole}`].par, activeRound[`hole${hole}`])}</TableCell>
                        <TableCell key={`${hole}-2`} className="textCenter golfTableBorderRightSmall">{`${Math.round(activeRound.approach.dtgB9Par5Average)} / ${Math.round(activeRound.approach.dtg2B9Par5Average)}`}</TableCell>
                        {activeRound.hole1 && <TableCell key={`${hole}-3`} className="textCenter">{activeRound.approach.dtgTotalPar5Average} / {activeRound.approach.dtg2TotalPar5Average}</TableCell>} {/* Display total row only when front 9 is also played */}
                    </>
                );
            } else {
                dtg2Row.push(<TableCell key={`${hole}-1`} className="textCenter">{formatDtg2Value(singleCourseInfo[`hole${hole}`].par, activeRound[`hole${hole}`])}</TableCell>);
            }
        }
    }
    if (activeRound.additionalHoles) {
        for (let hole = 1; hole <= 9; hole++ ) {
            if (activeRound.additionalHoles[`additionalHole${hole}`]) {
                dtg2Row.push(<TableCell key={`additionalHole${hole}-1`} className="textCenter">{formatDtg2Value(singleCourseInfo[`hole${hole}`].par, activeRound.additionalHoles[`additionalHole${hole}`])}</TableCell>);
            }
        }
    }

    return dtg2Row;
}

export const createDTHRow = (activeRound) => {
    let dthRow = [];
    for (let hole = 1; hole <= 18; hole++) {
        if (activeRound[`hole${hole}`]) {
            if (hole === 9 && activeRound.roundInfo.fullFront9) {
                dthRow.push(
                    <>
                        <TableCell key={`${hole}-1`} className="textCenter golfTableBorderRightSmall">{activeRound[`hole${hole}`].dth}</TableCell>
                        <TableCell key={`${hole}-2`} className="textCenter golfTableBorderRightSmall">{(activeRound.putting.dthF9 / 9).toFixed(1)}</TableCell>
                    </>
                );
            } else if (hole === 18 && activeRound.roundInfo.fullBack9) {
                dthRow.push(
                    <>
                        <TableCell key={`${hole}-1`} className="textCenter golfTableBorderRightSmall">{activeRound[`hole${hole}`].dth}</TableCell>
                        <TableCell key={`${hole}-2`} className="textCenter golfTableBorderRightSmall">{(activeRound.putting.dthB9 / 9).toFixed(1)}</TableCell>
                        {activeRound.hole1 && <TableCell key={`${hole}-3`} className="textCenter">{((activeRound.putting.dthF9 + activeRound.putting.dthB9) / 18).toFixed(1)}</TableCell>} {/* Display total row only when front 9 is also played */}
                    </>
                );
            } else {
                dthRow.push(<TableCell key={`${hole}-1`} className="textCenter">{activeRound[`hole${hole}`].dth}</TableCell>);
            }
        }
    }
    if (activeRound.additionalHoles) {
        for (let hole = 1; hole <= 9; hole++ ) {
            if (activeRound.additionalHoles[`additionalHole${hole}`]) {
                dthRow.push(<TableCell key={`additionalHole${hole}-1`} className="textCenter">{activeRound.additionalHoles[`additionalHole${hole}`].dth}</TableCell>);
            }
        }
    }

    return dthRow;
}

export const createFPMRow = (activeRound) => {
    let fpmRow = [];
    for (let hole = 1; hole <= 18; hole++) {
        if (activeRound[`hole${hole}`]) {
            if (hole === 9 && activeRound.roundInfo.fullFront9) {
                fpmRow.push(
                    <>
                        <TableCell key={`${hole}-1`} className="textCenter golfTableBorderRightSmall">{activeRound[`hole${hole}`].puttLength}</TableCell>
                        <TableCell key={`${hole}-2`} className="textCenter golfTableBorderRightSmall">{activeRound.putting.puttLengthF9} ({(activeRound.putting.puttLengthF9 / 9).toFixed(1)})</TableCell>
                    </>
                );
            } else if (hole === 18 && activeRound.roundInfo.fullBack9) {
                fpmRow.push(
                    <>
                        <TableCell key={`${hole}-1`} className="textCenter golfTableBorderRightSmall">{activeRound[`hole${hole}`].puttLength}</TableCell>
                        <TableCell key={`${hole}-2`} className="textCenter golfTableBorderRightSmall">{activeRound.putting.puttLengthB9} ({(activeRound.putting.puttLengthB9 / 9).toFixed(1)})</TableCell>
                        {activeRound.hole1 && <TableCell key={`${hole}-3`} className="textCenter">{activeRound.putting.puttLengthF9 + activeRound.putting.puttLengthB9} ({((activeRound.putting.puttLengthF9 + activeRound.putting.puttLengthB9) / 18).toFixed(1)})</TableCell>} {/* Display total row only when front 9 is also played */}
                    </>
                );
            } else {
                fpmRow.push(<TableCell key={`${hole}-1`} className="textCenter">{activeRound[`hole${hole}`].puttLength}</TableCell>);
            }
        }
    }
    if (activeRound.additionalHoles) {
        for (let hole = 1; hole <= 9; hole++ ) {
            if (activeRound.additionalHoles[`additionalHole${hole}`]) {
                fpmRow.push(<TableCell key={`additionalHole${hole}-1`} className="textCenter">{activeRound.additionalHoles[`additionalHole${hole}`].puttLength}</TableCell>);
            }
        }
    }
    return fpmRow;
}

export const createPlusMinusRow = (activeRound, singleCourseInfo, frontOrBack9 = null) => {
    let plusMinusRow = [];

    let cumulativePlusMinus = {
        f9: 0,
        b9: 0,
        total: 0
    }

    const getHoleScoreToPar = (score, holePar) => { return (score - holePar) };
    const getFormattedPlusMinus = (plusMinus) => {
        if (plusMinus > 0) {
            return `+${plusMinus}`;
        } else if (plusMinus == 0) {
            return "E";
        } else {
            return plusMinus;
        }
    }

    for (let hole = 1; hole <= 18; hole++) {
        if (activeRound[`hole${hole}`]) {
            const holePlusMinus = getHoleScoreToPar(activeRound[`hole${hole}`].score, singleCourseInfo[`hole${hole}`].par);
            cumulativePlusMinus.total = cumulativePlusMinus.total + holePlusMinus;
            if ((frontOrBack9 && frontOrBack9 === "front" && hole === 9) || (hole === 9 && !frontOrBack9)) {
                cumulativePlusMinus.f9 = cumulativePlusMinus.f9 + holePlusMinus;
                plusMinusRow.push(
                    <>
                        <TableCell style={{ backgroundColor: frontOrBack9 ? "white" : null, color: frontOrBack9 ? "black" : null }} key={`${hole}-1`} className={`textCenter golfTableBorderRightSmall${cumulativePlusMinus.total < 0 ? " redFont" : ""}`}>{getFormattedPlusMinus(cumulativePlusMinus.total)}</TableCell>
                        <TableCell style={{ backgroundColor: frontOrBack9 ? "white" : null, color: frontOrBack9 ? "black" : null }} key={`${hole}-2`} className={`textCenter golfTableBorderRightSmall${cumulativePlusMinus.f9 < 0 ? " redFont" : ""}`} style={{ backgroundColor: frontOrBack9 ? "white" : null, color: frontOrBack9 ? "black": null }}>{getFormattedPlusMinus(cumulativePlusMinus.f9)}</TableCell>
                    </>
                );
            } else if ((frontOrBack9 && frontOrBack9 === "back" && hole === 18) || (hole === 18 && !frontOrBack9)) {
                cumulativePlusMinus.b9 = cumulativePlusMinus.b9 + holePlusMinus;
                plusMinusRow.push(
                    <>
                        <TableCell style={{ backgroundColor: frontOrBack9 ? "white" : null, color: frontOrBack9 ? "black" : null }} key={`${hole}-1`} className={`textCenter golfTableBorderRightSmall${cumulativePlusMinus.total < 0 ? " redFont" : ""}`}>{getFormattedPlusMinus(cumulativePlusMinus.total)}</TableCell>
                        <TableCell style={{ backgroundColor: frontOrBack9 ? "white" : null, color: frontOrBack9 ? "black" : null }} key={`${hole}-2`} className={`textCenter golfTableBorderRightSmall${cumulativePlusMinus.b9 < 0 ? " redFont" : ""}`} style={{ backgroundColor: frontOrBack9 ? "white" : null, color: frontOrBack9 ? "black": null }}>{getFormattedPlusMinus(cumulativePlusMinus.b9)}</TableCell>
                        {activeRound.hole1 && <TableCell key={`${hole}-3`} className={`textCenter${cumulativePlusMinus.total < 0 ? " redFont" : ""}`} style={{ backgroundColor: frontOrBack9 ? "white" : null, color: frontOrBack9 ? "black": null }}>{getFormattedPlusMinus(cumulativePlusMinus.total)}</TableCell>} {/* Display total row only when front 9 is also played */}
                    </>
                );
            } else {
                if (hole < 10 && !(frontOrBack9 && frontOrBack9 === "back")) {
                    cumulativePlusMinus.f9 = cumulativePlusMinus.f9 + holePlusMinus;
                } else if (hole >= 10 && !(frontOrBack9 && frontOrBack9 === "front")) {
                    cumulativePlusMinus.b9 = cumulativePlusMinus.b9 + holePlusMinus;
                }
                if (!frontOrBack9 || ((frontOrBack9 === "front" && hole < 10) || (frontOrBack9 === "back" && hole >= 10)))
                plusMinusRow.push(<TableCell style={{ backgroundColor: frontOrBack9 ? "white" : null, color: frontOrBack9 ? "black" : null }} key={`${hole}-1`} className={`textCenter${cumulativePlusMinus.total < 0 ? " redFont" : ""}`}>{getFormattedPlusMinus(cumulativePlusMinus.total)}</TableCell>);
            }
        }
    }
    if (activeRound.additionalHoles) {
        for (let hole = 1; hole <= 9; hole++ ) {
            if (activeRound.additionalHoles[`additionalHole${hole}`]) {
                plusMinusRow.push(<TableCell style={{ backgroundColor: frontOrBack9 ? "white" : null, color: frontOrBack9 ? "black" : null }} key={`additionalHole${hole}-1`} className="textCenter">{getFormattedPlusMinus(cumulativePlusMinus.total)}</TableCell>);
            }
        }
    }

    return plusMinusRow;
}

export const createNotesRow = (activeRound) => {
    let notesRow = [];
    for (let hole = 1; hole <= 18; hole++) {
        if (activeRound[`hole${hole}`]) {
            if (hole === 9 && activeRound.roundInfo.fullFront9) {
                notesRow.push(
                    <>
                        <TableCell key={`${hole}-1`} className="textCenter golfTableBorderRightSmall"><small>{activeRound[`hole${hole}`].notes}</small></TableCell>
                        <TableCell key={`${hole}-2`} className="textCenter golfTableBorderRightSmall"></TableCell>
                    </>
                );
            } else if (hole === 18 && activeRound.roundInfo.fullBack9) {
                notesRow.push(
                    <>
                        <TableCell key={`${hole}-1`} className="textCenter golfTableBorderRightSmall"><small>{activeRound[`hole${hole}`].notes}</small></TableCell>
                        <TableCell key={`${hole}-2`} className="textCenter golfTableBorderRightSmall"></TableCell>
                        {activeRound.hole1 && <TableCell key={`${hole}-3`} className="textCenter"></TableCell>} {/* Display total row only when front 9 is also played */}
                    </>
                );
            } else {
                notesRow.push(<TableCell key={`${hole}-1`} className="textCenter"><small>{activeRound[`hole${hole}`].notes}</small></TableCell>);
            }
        }
    }
    if (activeRound.additionalHoles) {
        for (let hole = 1; hole <= 9; hole++ ) {
            if (activeRound.additionalHoles[`additionalHole${hole}`]) {
                notesRow.push(<TableCell key={`additionalHole${hole}-1`} className="textCenter">{activeRound.additionalHoles[`additionalHole${hole}`].notes}</TableCell>);
            }
        }
    }

    return notesRow;
}

const createScorecardHoleRow = (activeRound) => {
    let holeRow = [];
    let keyValue = 2;
    for (let hole = 1; hole <= 18; hole++) {
        if (activeRound[`hole${hole}`]) {
            holeRow.push(<TableCell key={keyValue} style={{ maxWidth: "60px", width: "55px" }} className={`textCenter${(hole === 9 && activeRound.roundInfo.fullFront9) || (hole === 18 && activeRound.roundInfo.fullBack9) ? ' golfTableBorderRightSmall' : ''}`}><b>{hole}</b></TableCell>);
            keyValue++;
        }
        if (hole === 9 && activeRound.roundInfo.fullFront9) {
            holeRow.push(<TableCell key={keyValue} className="textCenter golfTableBorderRightSmall"><b>OUT</b></TableCell>);
            keyValue++;
        }
        if (hole === 18 && activeRound.roundInfo.fullBack9) {
            holeRow.push(<TableCell key={keyValue} className="textCenter golfTableBorderRightSmall"><b>IN</b></TableCell>);
            keyValue++;
            if (activeRound.roundInfo.fullFront9) holeRow.push(<TableCell key={keyValue} className="textCenter golfTableBorderRightSmall"><b>TOTAL</b></TableCell>);
        }
    }

    return holeRow;
}

export const createScorecard = (courseInfo, activeRound, expandScorecard, setExpandScorecard, toggleCourseInfo, setToggleCourseInfo, editScorecard) => {
    const singleCourseInfoArray = courseInfo.filter(info => info.courseKey === activeRound.roundInfo.courseKey);
    const singleCourseInfo = singleCourseInfoArray[0];
    return (
        <Table
            style={{ margin: "-24px !important", width: !(activeRound.roundInfo.fullFront9 && activeRound.roundInfo.fullBack9) ? "800px" : "100%", marginLeft: !(activeRound.roundInfo.fullFront9 && activeRound.roundInfo.fullBack9) ? "calc(50% - 400px)" : 0 }}
            className={`subTable negativeMarginTop backgroundColorWhite borderRadiusSmall${activeRound.aceRound ? " backgroundColorEagleGlow" : ""}`}
        >
            <TableHead>
                {toggleCourseInfo &&
                    <TableRow key={1}>
                        <TableCell className="golfTableBorderRightSmall paddingLeftMedium">HDCP</TableCell>
                        {createHandicapRow(singleCourseInfo, activeRound)}
                    </TableRow>
                }
                {toggleCourseInfo &&
                    <TableRow key={2}>
                        <TableCell className="golfTableBorderRightSmall paddingLeftMedium">Distance</TableCell>
                        {createDistanceRow(singleCourseInfo, activeRound)}
                    </TableRow>
                }
                <TableRow>
                    <TableCell key={3} className="golfTableBorderRightSmall paddingLeftMedium"><b>HOLE</b></TableCell>
                    {createScorecardHoleRow(activeRound)}
                    {activeRound.additionalHoles && 
                        Object.keys(activeRound.additionalHoles).map((hole, i) => {
                            return (
                                <TableCell key={22 + i} className="textCenter">
                                    <b>
                                        {activeRound.additionalHoles[`additionalHole${i + 1}`].scoreCardHoleAbbreviation} {activeRound.additionalHoles[`additionalHole${i + 1}`].scoreCardHoleAbbreviation !== "" ? "#" : ""}{activeRound.additionalHoles[`additionalHole${i + 1}`].hole}
                                    </b>
                                </TableCell>
                            );
                        })
                    }
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow key={1}>
                    <TableCell className="golfTableBorderRightSmall paddingLeftMedium">Par</TableCell>
                    {createParRow(singleCourseInfo, activeRound)}
                </TableRow>
                <TableRow key={2}>
                    <TableCell className="golfTableBorderRightSmall paddingLeftMedium">Score</TableCell>
                    {createScoreRow(singleCourseInfo, activeRound)}
                </TableRow>
                {expandScorecard &&
                    <>
                        {activeRound.nonGhinRounds.scrambleRound && 
                            <TableRow key={3}>
                                <TableCell className="golfTableBorderRightSmall paddingLeftMedium">Strokes</TableCell>
                                {createScrambleRow(activeRound)}
                            </TableRow>
                        }
                        {activeRound.nonGhinRounds.leagueRound &&
                            <TableRow key={4}>
                                <TableCell className="golfTableBorderRightSmall paddingLeftMedium">Net</TableCell>
                                {createNetRow(activeRound, singleCourseInfo)}
                            </TableRow>
                        }
                        {!activeRound.nonGhinRounds.leagueRound && 
                            <>
                                <TableRow key={5}>
                                    <TableCell className="golfTableBorderRightSmall paddingLeftMedium">Putts</TableCell>
                                    {createPuttsRow(activeRound)}
                                </TableRow>
                                <TableRow key={6}>
                                    <TableCell className="golfTableBorderRightSmall paddingLeftMedium">FIR</TableCell>
                                    {createFairwaysRow(activeRound)}
                                </TableRow>
                                <TableRow key={7}>
                                    <TableCell className="golfTableBorderRightSmall paddingLeftMedium">GIR</TableCell>
                                    {createGreensRow(activeRound)}
                                </TableRow>
                                <TableRow key={8}>
                                    <TableCell className="golfTableBorderRightSmall paddingLeftMedium">DTG</TableCell>
                                    {createDTGRow(activeRound)}
                                </TableRow>
                                <TableRow key={9}>
                                    <TableCell className="golfTableBorderRightSmall paddingLeftMedium">DTG2 - add tooltip</TableCell>
                                    {createDTG2Row(activeRound, singleCourseInfo)}
                                </TableRow>
                                <TableRow key={10}>
                                    <TableCell className="golfTableBorderRightSmall paddingLeftMedium">DTH</TableCell>
                                    {createDTHRow(activeRound)}
                                </TableRow>
                                <TableRow key={11}>
                                    <TableCell className="golfTableBorderRightSmall paddingLeftMedium">FPM</TableCell>
                                    {createFPMRow(activeRound)}
                                </TableRow>
                                <TableRow className="scorecardPlusMinorRedFontOverrider" key={12}>
                                    <TableCell className="golfTableBorderRightSmall paddingLeftMedium">+/-</TableCell>
                                    {createPlusMinusRow(activeRound, singleCourseInfo)}
                                </TableRow>
                                <TableRow key={13} id="notesRow">
                                    <TableCell className="golfTableBorderRightSmall paddingLeftMedium">Notes</TableCell>
                                    {createNotesRow(activeRound)}
                                </TableRow>
                            </>
                        }
                    </>
                }
                
                <ScorecardFooter
                    colSpan={"22"}
                    editScorecard={editScorecard}
                    activeRound={activeRound}
                    setToggleCourseInfo={setToggleCourseInfo}
                    toggleCourseInfo={toggleCourseInfo}
                    expandScorecard={expandScorecard}
                    setExpandScorecard={setExpandScorecard}
                    renderExpandCollapse={!activeRound.nonGhinRounds.legacyRound}
                />
            </TableBody>
        </Table>
    );
}

export const createLostBallsTable = (lostBallMetrics) => {
    const sortedByDateLostBallMetrics = lostBallMetrics.lostBallsByDate.sort((a, b) => {
        const dateA = new Date(a.date.split("/").reverse().join("-"));
        const dateB = new Date(b.date.split("/").reverse().join("-"));
        return dateA - dateB; // Ascending order
        // return dateB - dateA; // Descending order
    });

    return (
        <div>
            <Table className="golfTable subTable backgroundColorWhite borderRadiusSmall marginTopMedium">
                <TableHead>
                    <TableRow>
                        <TableCell key={1} className="golfTableBorderRightSmall"><b>Total</b></TableCell>
                        <TableCell key={2} className="golfTableBorderRightSmall"><b>Par 3</b></TableCell>
                        <TableCell key={3} className="golfTableBorderRightSmall"><b>Par 4</b></TableCell>
                        <TableCell key={4} className="golfTableBorderRightSmall"><b>Par 5</b></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell key={1} className="golfTableBorderRightSmall">{lostBallMetrics.totalLostBalls}</TableCell>
                        <TableCell key={2} className="golfTableBorderRightSmall">{lostBallMetrics.par3LostBalls}</TableCell>
                        <TableCell key={3} className="golfTableBorderRightSmall">{lostBallMetrics.par4LostBalls}</TableCell>
                        <TableCell key={4} className="golfTableBorderRightSmall">{lostBallMetrics.par5LostBalls}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <Table className="golfTable subTable backgroundColorWhite borderRadiusSmall marginTopMedium">
                <TableHead>
                    <TableRow>
                        <TableCell key={1} className="golfTableBorderRightSmall"><b>Date</b></TableCell>
                        <TableCell key={2} className="golfTableBorderRightSmall"><b>Course</b></TableCell>
                        <TableCell key={3} className="golfTableBorderRightSmall"><b>Lost Ball Holes</b></TableCell>
                        <TableCell key={4} className="golfTableBorderRightSmall"><b>Total</b></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedByDateLostBallMetrics.map((round) => {
                        return (
                            <TableRow>
                                <TableCell key={1} className="golfTableBorderRightSmall">{round.date}</TableCell>
                                <TableCell key={2} className="golfTableBorderRightSmall">{round.course}</TableCell>
                                <TableCell key={3} className="golfTableBorderRightSmall">
                                    {Object.keys(round.lostBallHoles).map((hole, index) => {
                                        const holesString = `${index > 0 ? ", " : "#"}${hole.replace("hole", "")}`
                                        const numBallsLostString = round.lostBallHoles[hole] == 1 ? "" : ` (${round.lostBallHoles[hole]})`;
                                        return holesString + numBallsLostString
                                    })}
                                </TableCell>
                                <TableCell key={4} className="golfTableBorderRightSmall">{round.total}</TableCell>
                            </TableRow>
                        )
                    })}
                    <TableRow>
                        <TableCell colSpan={4} align="center">
                            <b>Total: {lostBallMetrics.totalLostBalls}</b>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    )
}

export const createDrivingTable = (drivingMetrics) => {
    const distances = Object.keys(drivingMetrics).sort(function(a,b) { return ( a.lowerBound > b.lowerBound ? 1 : a.lowerBound < b.lowerBound ? -1 : 0); });

    return (
        <Table className="golfTable subTable backgroundColorWhite borderRadiusSmall">
            <TableHead>
                <TableRow>
                    <TableCell key={1} className="golfTableBorderRightSmall"><b>Distance (yards)</b></TableCell>
                    {/* <TableCell key={2} className="golfTableBorderRightSmall textCenter flexRow alignCenter"><b>Miscue</b><Tooltip disableFocusListener disableTouchListener title="Top/Layup/Long" placement="top" className="alignCenter"><InfoIcon fontSize="small"/></Tooltip></TableCell> Could condense title to have parentheses for GIR % */}
                    <TableCell key={3} className="golfTableBorderRightSmall textCenter"><b>Left</b></TableCell>
                    <TableCell key={4} className="golfTableBorderRightSmall textCenter" style={{backgroundColor: "#00440022"}}><b>FIR</b></TableCell>
                    <TableCell key={5} className="golfTableBorderRightSmall textCenter"><b>Right</b></TableCell> {/* Add right border */}
                    {/* <TableCell key={6} className="golfTableBorderRightSmall textCenter"><b>Miscue to GIR %</b></TableCell> */}
                    <TableCell key={7} className="golfTableBorderRightSmall textCenter"><b>Left to GIR</b></TableCell>
                    <TableCell key={8} className="golfTableBorderRightSmall textCenter" style={{backgroundColor: "#00440022"}}><b>FIR to GIR</b></TableCell>
                    <TableCell key={9} className="golfTableBorderRightSmall textCenter"><b>Right to GIR</b></TableCell> {/* Add right border */}
                    <TableCell key={10} className="golfTableBorderRightSmall textCenter"><b>Accuracy %</b></TableCell>
                    <TableCell key={11} className="golfTableBorderRightSmall textCenter"><b>Distribution %</b></TableCell>
                    <TableCell key={12} className="golfTableBorderRightSmall textCenter"><b>Total</b></TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {distances.map(distance => {
                    return (
                        <TableRow key={distance}>
                            <TableCell className="golfTableBorderRightSmall"><b>{drivingMetrics[distance].customTitle || `${drivingMetrics[distance].lowerBound} - ${drivingMetrics[distance].upperBound}`}</b></TableCell>
                            {/* <TableCell className="golfTableBorderRightSmall textCenter">{drivingMetrics[distance].x} ({(drivingMetrics[distance].x / drivingMetrics[distance].total * 100).toFixed(1)})</TableCell> */}
                            <TableCell className="golfTableBorderRightSmall textCenter">{drivingMetrics[distance].l} ({(drivingMetrics[distance].l / drivingMetrics[distance].total * 100).toFixed(1)})</TableCell>
                            <TableCell className="golfTableBorderRightSmall textCenter"style={{backgroundColor: "#00440022"}}>{drivingMetrics[distance].f} ({(drivingMetrics[distance].f / drivingMetrics[distance].total * 100).toFixed(1)})</TableCell>
                            <TableCell className="golfTableBorderRightSmall textCenter">{drivingMetrics[distance].r} ({(drivingMetrics[distance].r / drivingMetrics[distance].total * 100).toFixed(1)})</TableCell> {/* Add right border */}
                            {/* <TableCell className="golfTableBorderRightSmall textCenter">{drivingMetrics[distance].xGir} ({drivingMetrics[distance].x !== 0 ? (drivingMetrics[distance].xGir / drivingMetrics[distance].x * 100).toFixed(1) : "0.0"})</TableCell> Prevent NaN's when 0 xGir */}
                            <TableCell className="golfTableBorderRightSmall textCenter">{drivingMetrics[distance].lGir} ({(drivingMetrics[distance].lGir / drivingMetrics[distance].l * 100).toFixed(1)})</TableCell>
                            <TableCell className="golfTableBorderRightSmall textCenter"style={{backgroundColor: "#00440022"}}>{drivingMetrics[distance].fGir} ({(drivingMetrics[distance].fGir / drivingMetrics[distance].f * 100).toFixed(1)})</TableCell>
                            <TableCell className="golfTableBorderRightSmall textCenter">{drivingMetrics[distance].rGir} ({(drivingMetrics[distance].rGir / drivingMetrics[distance].r * 100).toFixed(1)})</TableCell> {/* Add right border */}
                            <TableCell className="golfTableBorderRightSmall textCenter">{(drivingMetrics[distance].f / drivingMetrics[distance].total * 100).toFixed(1)}</TableCell>
                            <TableCell className="golfTableBorderRightSmall textCenter">{(drivingMetrics[distance].total / drivingMetrics.total.total * 100).toFixed(1)}</TableCell>
                            <TableCell className="golfTableBorderRightSmall textCenter">{drivingMetrics[distance].total}</TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}

export const createApproachTable = (approachMetrics, approachView) => {
    const ranges = Object.keys(approachMetrics).sort(function(a,b) { return ( a.lowerBound > b.lowerBound ? 1 : a.lowerBound < b.lowerBound ? -1 : 0); });

    const formatScore = (score) => {
        if (approachView === "differential" && score !== "-") {
            if (score > 0) {
                return `+${score}`;
            } else if (score == 0) {
                return "E"
            } else {
                return score;
            }
        } else {
            return score == 0 ? "-" : score;
        }
    }
    return (
        <Table className="golfTable subTable backgroundColorWhite borderRadiusSmall">
            <TableHead>
                <TableRow>
                    <TableCell key={1} colSpan={1} className="golfTableBorderRightSmall"><p className="noPadding"><b>Category</b></p></TableCell>
                    <TableCell key={2} colSpan={1} className="golfTableBorderRightSmall textCenter">-</TableCell>
                    <TableCell key={3} colSpan={3} className="golfTableBorderRightSmall textCenter">Missed GIR</TableCell>
                    <TableCell key={4} colSpan={3} className="golfTableBorderRightSmall textCenter">GIR</TableCell>
                    <TableCell key={5} colSpan={2} className="golfTableBorderRightSmall textCenter">Par 3</TableCell>
                    <TableCell key={6} colSpan={3} className="golfTableBorderRightSmall textCenter">Green Under Regulation</TableCell>
                    <TableCell key={7} colSpan={1} className="golfTableBorderRightSmall textCenter">-</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell key={1} className="golfTableBorderRightSmall"><p className="noPadding"><b>Distance</b></p></TableCell>
                    <TableCell key={1} className="golfTableBorderRightSmall textCenter"><b>Club</b></TableCell>
                    <TableCell key={2} className="golfTableBorderRightSmall textCenter"><b>L, X</b></TableCell>
                    <TableCell key={3} className="golfTableBorderRightSmall textCenter" style={{backgroundColor: "#00440022"}}>
                        <b>F, X</b>
                        <small className="marginLeftExtraSmall">(G%)</small>
                    </TableCell>
                    <TableCell key={4} className="golfTableBorderRightSmall textCenter"><b>R, X</b></TableCell>
                    <TableCell key={5} className="golfTableBorderRightSmall textCenter"><b>L, G</b></TableCell>
                    <TableCell key={6} className="golfTableBorderRightSmall textCenter" style={{backgroundColor: "#00440022"}}>
                        <b>F, G</b>
                        <small className="marginLeftExtraSmall">(G%)</small>
                    </TableCell>
                    <TableCell key={7} className="golfTableBorderRightSmall textCenter"><b>R, G</b></TableCell>
                    <TableCell key={8} className="golfTableBorderRightSmall textCenter"><b>Par 3 X</b></TableCell>
                    <TableCell key={9} className="golfTableBorderRightSmall textCenter" style={{backgroundColor: "#00440022"}}><b>Par 3 G</b></TableCell>
                    <TableCell key={10} className="golfTableBorderRightSmall textCenter"><b>L, G-1</b></TableCell>
                    <TableCell key={12} className="golfTableBorderRightSmall textCenter" style={{backgroundColor: "#00440022"}}><b>F, G-1</b></TableCell>
                    <TableCell key={11} className="golfTableBorderRightSmall textCenter"><b>R, G-1</b></TableCell>
                    <TableCell key={13} className="golfTableBorderRightSmall textCenter"><b>Total</b></TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {ranges.map(range => {
                    return (
                        <TableRow key={range}>
                            <TableCell className="golfTableBorderRightSmall"><b>{approachMetrics[range].customTitle || `${approachMetrics[range].lowerBound} - ${approachMetrics[range].upperBound}`}</b></TableCell>
                            <TableCell className="golfTableBorderRightSmall textCenter">{approachMetrics[range].club}</TableCell>
                            <TableCell className="golfTableBorderRightSmall textCenter">{formatScore(approachMetrics[range][`lx${approachView === "differential" ? "Differential" : ""}`])}</TableCell>
                            <TableCell className="golfTableBorderRightSmall textCenter" style={{backgroundColor: "#00440022"}}>
                                {formatScore(approachMetrics[range][`fx${approachView === "differential" ? "Differential" : ""}`])}
                                {(approachMetrics[range].fx * 100 / (approachMetrics[range].fx + approachMetrics[range].fg)) !== 0 && <small className="marginLeftExtraSmall">({(approachMetrics[range].fx * 100 / (approachMetrics[range].fx + approachMetrics[range].fg)).toFixed(1)})</small>}
                            </TableCell>
                            <TableCell className="golfTableBorderRightSmall textCenter">{formatScore(approachMetrics[range][`rx${approachView === "differential" ? "Differential" : ""}`])}</TableCell>
                            <TableCell className="golfTableBorderRightSmall textCenter">{formatScore(approachMetrics[range][`lg${approachView === "differential" ? "Differential" : ""}`])}</TableCell>
                            <TableCell className="golfTableBorderRightSmall textCenter" style={{backgroundColor: "#00440022"}}>
                                {formatScore(approachMetrics[range][`fg${approachView === "differential" ? "Differential" : ""}`])}
                                {(approachMetrics[range].fg * 100 / (approachMetrics[range].fx + approachMetrics[range].fg)) !== 0 && <small className="marginLeftExtraSmall">({(approachMetrics[range].fg * 100 / (approachMetrics[range].fx + approachMetrics[range].fg)).toFixed(1)})</small>}
                            </TableCell>
                            <TableCell className="golfTableBorderRightSmall textCenter">{formatScore(approachMetrics[range][`rg${approachView === "differential" ? "Differential" : ""}`])}</TableCell>
                            <TableCell className="golfTableBorderRightSmall textCenter">{formatScore(approachMetrics[range][`nax${approachView === "differential" ? "Differential" : ""}`])}</TableCell>
                            <TableCell className="golfTableBorderRightSmall textCenter" style={{backgroundColor: "#00440022"}}>{formatScore(approachMetrics[range][`nag${approachView === "differential" ? "Differential" : ""}`])}</TableCell>
                            <TableCell className="golfTableBorderRightSmall textCenter">{formatScore(approachMetrics[range][`lgur${approachView === "differential" ? "Differential" : ""}`])}</TableCell>
                            <TableCell className="golfTableBorderRightSmall textCenter" style={{backgroundColor: "#00440022"}}>{formatScore(approachMetrics[range][`fgur${approachView === "differential" ? "Differential" : ""}`])}</TableCell>
                            <TableCell className="golfTableBorderRightSmall textCenter">{formatScore(approachMetrics[range][`rgur${approachView === "differential" ? "Differential" : ""}`])}</TableCell>
                            <TableCell className="golfTableBorderRightSmall textCenter">{formatScore(approachMetrics[range][`total${approachView === "differential" ? "Differential" : ""}`])}{range !== "total" && ` (${(approachMetrics[range].total / approachMetrics.total.total * 100).toFixed(1)}%)`}</TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    )
}


const createCumulativeGraphs = (displayedRounds, drivingMetrics, puttingMetrics) => {
    const sankeyGraphDistance = drivingMetrics.total;
    const totalGir = sankeyGraphDistance.lGir + sankeyGraphDistance.fGir + sankeyGraphDistance.rGir + sankeyGraphDistance.xGir;
    const totalMissedGreen = sankeyGraphDistance.total - totalGir;
    const totalByScore = puttingMetrics.allPutts.totalByScore;

    // console.log("puttingMetrics",puttingMetrics)
    
    const sankeyGraphData = [
        ["From", "To", "Weight"],
        // Driving data
        [`F: ${sankeyGraphDistance.f} (${sankeyGraphDistance.fGir} to G, ${sankeyGraphDistance.total - sankeyGraphDistance.fGir} to X)`, `G: ${totalGir}`, sankeyGraphDistance.fGir],
        [`L: ${sankeyGraphDistance.l}`, `G: ${totalGir}`, sankeyGraphDistance.lGir],
        [`R: ${sankeyGraphDistance.r}`, `G: ${totalGir}`, sankeyGraphDistance.rGir],
        [`F: ${sankeyGraphDistance.f} (${sankeyGraphDistance.fGir} to G, ${sankeyGraphDistance.total - sankeyGraphDistance.fGir} to X)`, `X GIR: ${totalMissedGreen}`, sankeyGraphDistance.total - sankeyGraphDistance.fGir],
        [`L: ${sankeyGraphDistance.l}`, `X GIR: ${totalMissedGreen}`, sankeyGraphDistance.total - sankeyGraphDistance.lGir],
        [`R: ${sankeyGraphDistance.r}`, `X GIR: ${totalMissedGreen}`, sankeyGraphDistance.total - sankeyGraphDistance.rGir],

        // Putting data
        [`G: ${totalGir}`, `1 Putts: ${totalByScore.num1Putts.total}`, totalByScore.num1Putts.total],
        [`G: ${totalGir}`, `2 Putts: ${totalByScore.num2Putts.total}`, totalByScore.num2Putts.total],
        [`G: ${totalGir}`, `3 Putts: ${totalByScore.num3Putts.total}`, totalByScore.num3Putts.total],
        [`X GIR: ${totalMissedGreen}`, `1 Putts: ${totalByScore.num1Putts.total}`, totalByScore.num1Putts.total],
        [`X GIR: ${totalMissedGreen}`, `2 Putts: ${totalByScore.num2Putts.total}`, totalByScore.num2Putts.total],
        [`X GIR: ${totalMissedGreen}`, `3 Putts: ${totalByScore.num3Putts.total}`, totalByScore.num3Putts.total],
    ];

    // Score data - GIR
    let totalHoles = 0;
    const scoreToParLabelMap = {
        scoreMinus2: "Eagle",
        scoreMinus1: "Birdie",
        score0: "Par",
        score1: "Bogey",
        score2: "Double",
        score3: "Triple",
        // score4: "Quad"
    }
    let pieChartData = [["Hole", "Score Distribution to Par"]];
    for (let score of Object.keys(scoreToParLabelMap)) {
        for (let i = 0; i < 4; i++) {
            if (totalByScore[`num${i}Putts`][score] !== 0) {
                sankeyGraphData.push([`${i} Putts: ${totalByScore[`num${i}Putts`].total}`, `${scoreToParLabelMap[score]}: ${totalByScore.byScore[score]}`, totalByScore.byScore[score]]);
            }
        }
        if (score === "score2") {
            pieChartData.push(["Bogey+", totalByScore.byScore.score2 + totalByScore.byScore.score3]);
        } else {
            if (score !== "score3") {
                pieChartData.push([scoreToParLabelMap[score], totalByScore.byScore[score]]);
            }
        }
    }

    if (sankeyGraphDistance.xGir) {
        sankeyGraphData.push([`X: ${sankeyGraphDistance.x}`, `X GIR: ${totalMissedGreen}`, sankeyGraphDistance.total - sankeyGraphDistance.g]);
        sankeyGraphData.push([`X: ${sankeyGraphDistance.x}`, `G: ${totalGir}`, sankeyGraphDistance.xGir]);
    }

    // Round totals
    let roundTotalTableData = [
        [
            "Date",
            "Score",
            "Handicap"
        ]
    ];
    let roundTotalTableDataNine = [
        [
            "Date",
            "Score",
            "Handicap"
        ]
    ];
    const sortedDisplayedRounds = displayedRounds.sort(function (a, b) {
        a = a.roundInfo.date.split('/');
        b = b.roundInfo.date.split('/');
        return a[2] - b[2] || a[0] - b[0] || a[1] - b[1];
    });
    let currentHandicap = {strokes: 0, rounds: 0};
    let currentHandicapNine = {strokes: 0, rounds: 0};
    for (let i = 0; i < sortedDisplayedRounds.length; i++) {
        const strokesOverPar = sortedDisplayedRounds[i].scoring.total - sortedDisplayedRounds[i].scoring.coursePar;
        if (sortedDisplayedRounds[i].roundInfo.fullFront9 && sortedDisplayedRounds[i].roundInfo.fullBack9) {
            roundTotalTableData.push([
                sortedDisplayedRounds[i].roundInfo.date,
                sortedDisplayedRounds[i].scoring.total,
                currentHandicap.rounds === 0 ? sortedDisplayedRounds[i].scoring.coursePar : currentHandicap.strokes/currentHandicap.rounds.toFixed(1) + sortedDisplayedRounds[i].scoring.coursePar
            ]);

            currentHandicap.strokes = currentHandicap.strokes + strokesOverPar;
            currentHandicap.rounds = currentHandicap.rounds + 1;
        } else {
            roundTotalTableDataNine.push([
                sortedDisplayedRounds[i].roundInfo.date,
                sortedDisplayedRounds[i].scoring.total,
                currentHandicapNine.rounds === 0 ? sortedDisplayedRounds[i].scoring.coursePar : currentHandicapNine.strokes/currentHandicapNine.rounds.toFixed(1) + sortedDisplayedRounds[i].scoring.coursePar
            ]);

            currentHandicapNine.strokes = currentHandicapNine.strokes + strokesOverPar;
            currentHandicapNine.rounds = currentHandicapNine.rounds + 1;
        }
    }

    // console.log("roundTotalTableData",roundTotalTableData)
    // console.log("roundTotalTableDataNine",roundTotalTableDataNine)

    return (
        <div>
            {/* <div id="holeSankey">
                <Chart
                    chartType="Sankey"
                    width="100%"
                    // height="400px"
                    data={sankeyGraphData}
                    options={{
                        sankey: {
                            // link: { color: { fill: "#d799ae" } },
                            // node: {
                            //     colors: ["#a61d4c"],
                            //     label: { color: "#871b47" },
                            // },
                            // iterations: 0
                        }
                    }}
                />
            </div> */}
            <div className="marginTopSmall marginBottomLarge flexRow justifySpaceBetween">
                <h3>Driving</h3>
                <h3>Approach</h3>
                <h3>Putting</h3>
                <h3>Scoring</h3>
            </div>
            {/* <h1>Score Distribution</h1>
            <div id="cumulativePie" key="cumulativePie">
                <Chart
                    chartType="ColumnChart"
                    data={pieChartData}
                    options={{is3D: true, backgroundColor: "#00000000" }}
                    width="600px"
                />
            </div>
            <div id="roundTotals">
                <Chart
                    chartType="LineChart"
                    width="100%"
                    height="400px"
                    data={roundTotalTableData}
                    // options={options}
                />
            </div>
            <div id="roundTotalsNine">
                <Chart
                    chartType="LineChart"
                    width="100%"
                    height="400px"
                    data={roundTotalTableDataNine}
                    // options={options}
                />
            </div> */}
        </div>
    )
}

export const createPuttingTable = (puttingMetrics) => {
    const distances = Object.keys(puttingMetrics.makeByDistance).sort(
        function(a,b) {
            return (
                parseInt(a.substring(4, a.length)) > parseInt(b.substring(4, b.length))
                    ? 1 : (parseInt(a.substring(4, a.length)) < parseInt(b.substring(4, b.length))
                        ? -1 : 0)
            );
        }
    );

    return (
        <Table className="golfTable subTable backgroundColorWhite borderRadiusSmall">
            <TableHead>
                <TableRow>
                    <TableCell key={"puttingTable1"} className="golfTableBorderRightSmall"><b>Distance (feet)</b></TableCell>
                    {distances.map(distance => {
                        return <TableCell key={`puttingTableDistance${distance}`} className="textCenter golfTableBorderRightSmall"><b>{distance === "from60" ? "60+" : distance.substring(4, distance.length)}</b></TableCell>
                    })}
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow key={1}>
                    <TableCell className="golfTableBorderRightSmall"><b>Total putts</b></TableCell>
                    {distances.map(distance => {
                        return <TableCell key={distance} className="textCenter golfTableBorderRightSmall">{puttingMetrics.makeByDistance[distance].totalPutts}</TableCell>
                    })}
                </TableRow>
                <TableRow key={2}>
                    <TableCell className="golfTableBorderRightSmall"><b>Distribution by range %</b></TableCell>
                    {distances.map(distance => {
                        return <TableCell key={distance} className="textCenter golfTableBorderRightSmall">{(puttingMetrics.makeByDistance[distance].totalPutts / puttingMetrics.totalPutts * 100).toFixed(1)}</TableCell>
                    })}
                </TableRow>                
                <TableRow key={3}>
                    <TableCell className="golfTableBorderRightSmall"><b>Total made</b></TableCell>
                    {distances.map(distance => {
                        return <TableCell key={distance} className="textCenter golfTableBorderRightSmall">{distance === "from0" ? puttingMetrics.makeByDistance[distance].num0Putts : puttingMetrics.makeByDistance[distance].num1Putts}</TableCell>
                    })}
                </TableRow>
                <TableRow key={4}>
                    <TableCell className="golfTableBorderRightSmall"><b>2-Putts</b></TableCell>
                    {distances.map(distance => {
                        return <TableCell key={distance} className="textCenter golfTableBorderRightSmall">{distance === "from0" ? "NA" : puttingMetrics.makeByDistance[distance].num2Putts}</TableCell>
                    })}
                </TableRow>
                <TableRow key={5}>
                    <TableCell className="golfTableBorderRightSmall"><b>3-Putts</b></TableCell>
                    {distances.map(distance => {
                        return <TableCell key={distance} className="textCenter golfTableBorderRightSmall">{distance === "from0" ? "NA" : puttingMetrics.makeByDistance[distance].num3Putts}</TableCell>
                    })}
                </TableRow>
                {/* <TableRow key={6}>
                    <TableCell className="golfTableBorderRightSmall"><b>4-Putts</b></TableCell>
                    {distances.map(distance => {
                        return <TableCell key={distance} className="textCenter golfTableBorderRightSmall">{distance === "from0" ? "NA" : puttingMetrics.makeByDistance[distance].num4Putts}</TableCell>
                    })}
                </TableRow> */}
                <TableRow key={7}>
                    <TableCell className="golfTableBorderRightSmall" style={{backgroundColor: "#00440022"}}><b>Make %</b></TableCell>
                    {distances.map(distance => {
                        return <TableCell key={distance} className="textCenter golfTableBorderRightSmall" style={{backgroundColor: "#00440022"}}>{distance === "from0" ? "100" : (puttingMetrics.makeByDistance[distance].num1Putts / puttingMetrics.makeByDistance[distance].totalPutts * 100).toFixed(1)}</TableCell>
                    })}
                </TableRow>
                <TableRow key={8}>
                    <TableCell className="golfTableBorderRightSmall"><b>2-Putt %</b></TableCell>
                    {distances.map(distance => {
                        return <TableCell key={distance} className="textCenter golfTableBorderRightSmall">{distance === "from0" ? "NA" : (puttingMetrics.makeByDistance[distance].num2Putts / puttingMetrics.makeByDistance[distance].totalPutts * 100).toFixed(1)}</TableCell>
                    })}
                </TableRow>
                <TableRow key={9}>
                    <TableCell className="golfTableBorderRightSmall"><b>3-Putt %</b></TableCell>
                    {distances.map(distance => {
                        return <TableCell key={distance} className="textCenter golfTableBorderRightSmall">{distance === "from0" ? "NA" : (puttingMetrics.makeByDistance[distance].num3Putts / puttingMetrics.makeByDistance[distance].totalPutts * 100).toFixed(1)}</TableCell>
                    })}
                </TableRow>
                {/* <TableRow key={10}>
                    <TableCell className="golfTableBorderRightSmall"><b>4-Putt %</b></TableCell>
                    {distances.map(distance => {
                        return <TableCell key={distance} className="textCenter golfTableBorderRightSmall">{distance === "from0" ? "NA" : (puttingMetrics.makeByDistance[distance].num4Putts / puttingMetrics.makeByDistance[distance].totalPutts * 100).toFixed(1)}</TableCell>
                    })}
                </TableRow> */}
            </TableBody>
        </Table>
    );
}

const calculateCourseRecords = (courseInfo, courseMetrics) => {

    let tableRows = [];

    console.log("courseMetrics",courseMetrics)
    
    Object.keys(courseMetrics).forEach(courseMetric => {
        const singleCourseInfo = courseInfo.find(info => info.courseKey === courseMetric)
        // if (courseMetric !== "andersonGlen" && courseMetric !== "gileadHighlands") {
            // console.log("courseMetric",courseMetric)
            // console.log("courseMetrics[courseMetric]",courseMetrics[courseMetric])
            const courseName = courses.find(course => course.courseKey === courseMetric).displayName;
            
            // let f9Date = courseMetrics[courseMetric].out === 100 ? "-" : courseMetrics[courseMetric].outDate;
            let f9String = courseMetrics[courseMetric].out === 100 ? "-" : `${courseMetrics[courseMetric].out} (${courseMetrics[courseMetric].out - singleCourseInfo.f9Par > 0 ? "+" : courseMetrics[courseMetric].out == singleCourseInfo.f9Par ? "E" : ""}${courseMetrics[courseMetric].out !== singleCourseInfo.f9Par ? courseMetrics[courseMetric].out - singleCourseInfo.f9Par : ""})`;
            
            // let b9Date = courseMetrics[courseMetric].in === 100 ? "-" : courseMetrics[courseMetric].inDate;
            let b9String = courseMetrics[courseMetric].in === 100 ? "-" : `${courseMetrics[courseMetric].in} (${courseMetrics[courseMetric].in - singleCourseInfo.b9Par > 0 ? "+" : courseMetrics[courseMetric].in == singleCourseInfo.b9Par ? "E" : ""}${courseMetrics[courseMetric].in !== singleCourseInfo.b9Par ? courseMetrics[courseMetric].in - singleCourseInfo.b9Par : ""})`;

            // let totalDate = (courseMetrics[courseMetric].out !== 100 && courseMetrics[courseMetric].in !== 100) ? courseMetrics[courseMetric].totalDate : "-";
            let totalString = (courseMetrics[courseMetric].out !== 100 && courseMetrics[courseMetric].in !== 100) ? `${courseMetrics[courseMetric].total} (${courseMetrics[courseMetric].out} - ${courseMetrics[courseMetric].in}: ${courseMetrics[courseMetric].total - singleCourseInfo.par > 0 ? "+" : courseMetrics[courseMetric].total == singleCourseInfo.par ? "E" : ""}${courseMetrics[courseMetric].total !== singleCourseInfo.par ? courseMetrics[courseMetric].total - singleCourseInfo.par : ""})` : "-";

            // if (f9Date === b9Date) {
            //     f9Date = "";
            //     b9Date = "";
            // }
            // if (courseMetrics[courseMetric].out === 100) {
            //     scoreString = `${courseMetrics[courseMetric].in} (B9: ${courseMetrics[courseMetric].in - singleCourseInfo.b9Par > 0 ? "+" : courseMetrics[courseMetric].in == singleCourseInfo.b9Par ? "E" : ""}${courseMetrics[courseMetric].in !== singleCourseInfo.b9Par ? courseMetrics[courseMetric].in - singleCourseInfo.b9Par : ""})`;
            // } else {
            //     if (courseMetrics[courseMetric].in === 100) {
            //         console.log("courseInfo",courseInfo)
            //         scoreString = `${courseMetrics[courseMetric].out} (F9: ${courseMetrics[courseMetric].out - singleCourseInfo.f9Par > 0 ? "+" : courseMetrics[courseMetric].out == singleCourseInfo.f9Par ? "E" : ""}${courseMetrics[courseMetric].out !== singleCourseInfo.f9Par ? courseMetrics[courseMetric].out - singleCourseInfo.f9Par : ""})`;
            //     } else {
            //         scoreString = `${courseMetrics[courseMetric].total} (${courseMetrics[courseMetric].out} - ${courseMetrics[courseMetric].in}: ${courseMetrics[courseMetric].total - singleCourseInfo.par > 0 ? "+" : courseMetrics[courseMetric].total == singleCourseInfo.par ? "E" : ""}${courseMetrics[courseMetric].total !== singleCourseInfo.par ? courseMetrics[courseMetric].total - singleCourseInfo.par : ""})`;
            //     }
            // }
            // return (
            //     <div className="flexRow alignCenter marginBottomSmall" key={courseName}>
            //         <h3 className="marginRightExtraSmall">{courseName} -</h3>
            //         <h3 className="strongFont">{scoreString}</h3>
            //     </div> 
            // )

            if (!(courseMetrics[courseMetric].out === 100 && courseMetrics[courseMetric].in === 100)) {
                tableRows.push([
                    courseName,
                    // f9Date,
                    f9String,
                    // b9Date,
                    b9String,
                    // totalDate,
                    totalString
                ]);
            }
        // } else return null;
    })

    return (
        <table className="golfTable marginTopMassive marginBottomMassive">
            <tr>
                <th><h1 className="paddingBottomMedium floatLeft">Course Records</h1></th>

                {/* <th className="paddingLeftMassive"><small>(Date)</small></th> */}
                <th className="paddingLeftMassive"><h1 className="paddingBottomMedium">Front</h1></th>
                
                {/* <th className="paddingLeftMassive"><small>(Date)</small></th> */}
                <th className="paddingLeftMassive"><h1 className="paddingBottomMedium">Back</h1></th>

                {/* <th className="paddingLeftMassive"><small>(Date)</small></th> */}
                <th className="paddingLeftMassive"><h1 className="paddingBottomMedium">Total</h1></th>
            </tr>
            {tableRows.map(tableRow => {
                return (
                    <tr>
                        {tableRow.map((tableData, j) => {
                            return <td className={j == 0 ? "" : "paddingLeftMassive"}>{tableData}</td>
                        })}
                    </tr>
                )
            })}
        </table>
    )
}

const calculateScoringAverageTotals = (scoringAverageMetrics) => {
    let scoringAverageTotals = {
        numHoles: 0,
        scoreToPar: 0,
        eagle: 0,
        birdie: 0,
        par: 0,
        bogey: 0,
        double: 0,
        triple: 0,
        quad: 0,
        threePutts: 0
    };

    for (let category of Object.keys(scoringAverageMetrics)) {
        console.log("\n\ncategory",category)
        if (category !== "eagleSummary" && category !== "par3Course" && category !== "par3All") {
            scoringAverageTotals.numHoles = scoringAverageTotals.numHoles + scoringAverageMetrics[category].numHoles;
            console.log("scoringAverageTotals.scoreToPar",scoringAverageTotals.scoreToPar)
            console.log("scoringAverageMetrics[category].scoreToPar",scoringAverageMetrics[category].scoreToPar)
            scoringAverageTotals.scoreToPar = scoringAverageTotals.scoreToPar + scoringAverageMetrics[category].scoreToPar;
            scoringAverageTotals.eagle = scoringAverageTotals.eagle + scoringAverageMetrics[category].eagle;
            scoringAverageTotals.birdie = scoringAverageTotals.birdie + scoringAverageMetrics[category].birdie;
            scoringAverageTotals.par = scoringAverageTotals.par + scoringAverageMetrics[category].par;
            scoringAverageTotals.bogey = scoringAverageTotals.bogey + scoringAverageMetrics[category].bogey;
            scoringAverageTotals.double = scoringAverageTotals.double + scoringAverageMetrics[category].double;
            scoringAverageTotals.triple = scoringAverageTotals.triple + scoringAverageMetrics[category].triple;
            scoringAverageTotals.quad = scoringAverageTotals.quad + scoringAverageMetrics[category].quad;
            scoringAverageTotals.threePutts = scoringAverageTotals.threePutts + scoringAverageMetrics[category].threePutts;
        }
    }

    return scoringAverageTotals;
}

const calculateScorePlot = (displayedRounds) => {
    let plotData = [["Score", "Putts"]];
    for (let round of displayedRounds) {
        if (round.roundInfo.fullFront9 && round.roundInfo.fullBack9 && !round.roundInfo.key.includes("Par3") && !round.nonGhinRounds.boozeRound && !round.nonGhinRounds.scrambleRound) plotData.push([round.scoring.total, round.putting.putts]);
    }
    return plotData;
}

export const calculateStats = (courseInfo, allRounds, puttingData, displayedRounds, handicap, displayedRoundsToggle, setDisplayedRoundsToggle, approachView, setApproachView) => {

    const scoringAverageMetrics = calculateScoringAverageMetrics(courseInfo, displayedRoundsToggle ? displayedRounds : allRounds)
    const singleHoleMetrics = calculateSingleHoleMetrics(courseInfo, displayedRoundsToggle ? displayedRounds : allRounds);
    const courseMetrics = calculateCourseMetrics(courseInfo, displayedRoundsToggle ? displayedRounds : allRounds);
    const lostBallMetrics = calculateLostBallMetrics(courseInfo, displayedRoundsToggle ? displayedRounds : allRounds);
    const drivingMetrics = calculateDrivingMetrics(courseInfo, displayedRoundsToggle ? displayedRounds : allRounds);
    const approachMetrics = calculateApproachMetrics(courseInfo, displayedRoundsToggle ? displayedRounds : allRounds);
    const puttingMetrics = calculatePuttingMetrics(puttingData, displayedRoundsToggle ? displayedRounds : allRounds);

    const sortedEagleSummary = scoringAverageMetrics.eagleSummary.sort(function(a,b) {return parseFloat(a.sequence) - parseFloat(b.sequence)})
    console.log("sortedEagleSummary",sortedEagleSummary)

    console.log("scoringAverageMetrics",scoringAverageMetrics)
    const scoringAverageTotals = calculateScoringAverageTotals(scoringAverageMetrics);

    const scorePlot = calculateScorePlot(displayedRoundsToggle ? displayedRounds : allRounds);

    let alreadyDisplayed = [];
                    
    return (
        <>
            {/* Toggle All or Displayed rounds */}
            <div className="width100Percent flexRow justifyCenter alignCenter">
                <span className="whiteFont marginTop">All Rounds</span>
                <Switch onChange={() => setDisplayedRoundsToggle(!displayedRoundsToggle)} checked={displayedRoundsToggle} />
                <span className="whiteFont">Displayed Rounds</span>
            </div>

            {/* Plot scores and putts in scatter plot */}
            {/* <Chart
                chartType="ScatterChart"
                data={scorePlot}
                width="80vw"
                height="600px"
                legendToggle
            /> */}

            {/* Handicap Metrics */}
            <h1 className="marginTopExtraLarge marginBottomMedium">Handicap: {handicap < 0 ? `+${Math.abs(handicap)}` : handicap}</h1>
            {/* <div className="flexRow alignCenter marginBottomSmall">
                <h3 className="marginRightSmall">Anderson Glen -</h3>
                <h3 className="strongFont">Front 9: ({handicapMetrics.andersonGlen.f9}), Back 9: ({handicapMetrics.andersonGlen.b9}), Total: ({handicapMetrics.andersonGlen.total})</h3>
            </div>
            <div className="flexRow alignCenter marginBottomSmall">
                <h3 className="marginRightSmall">Gilead Highlands -</h3>
                <h3 className="strongFont">Front 9: ({handicapMetrics.gileadHighlands.f9}), Back 9: ({handicapMetrics.gileadHighlands.b9}), Total: ({handicapMetrics.gileadHighlands.total})</h3>
            </div> */}
            {/* <div className="flexRow alignCenter marginBottomSmall">
                <h3 className="marginRightSmall">Overall -</h3>
                <h3 className="strongFont">{handicap}</h3>
            </div> */}
            <a className="largeFont textDecoration flexRow" target="_blank" href="https://www.ghin.com/golfer-lookup/golfer/53616c7465645f5fb1bfd60c7a95cfbe55d98b538abde9084b6424809c6ac4e7/club/54858"><h2>GHIN Profile</h2><LaunchIcon fontSize="small" className="marginLeftSmall"/></a>
            {/* <br/>
            <small className="marginTopMedium">*Based on best 8 rounds of last 20 full rounds</small> */}

            {/* <h1 className="marginTopExtraLarge marginBottomLarge">Scoring averages</h1> */}
            <Table style={{ width: "80vw" }} className="golfTable marginTopMassive">
                <TableHead>
                    <TableRow>
                        <TableCell key="scoringAverageHeader1" className="noPaddingLeft"><h1>Scoring averages</h1></TableCell>
                        <TableCell key="scoringAverageHeader2"><h1>#Holes</h1></TableCell>
                        <TableCell key="scoringAverageHeader3"><h1>+/-</h1></TableCell>
                        <TableCell key="scoringAverageHeader4"><h1>Eagle</h1></TableCell>
                        <TableCell key="scoringAverageHeader5"><h1>Birdie</h1></TableCell>
                        <TableCell key="scoringAverageHeader6"><h1>Par</h1></TableCell>
                        <TableCell key="scoringAverageHeader7"><h1>Bogey</h1></TableCell>
                        <TableCell key="scoringAverageHeader8"><h1>Double</h1></TableCell>
                        <TableCell key="scoringAverageHeader9"><h1>Triple</h1></TableCell>
                        <TableCell key="scoringAverageHeader10"><h1>Quad</h1></TableCell>
                        <TableCell key="scoringAverageHeader11"><h1>3-putts</h1></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.keys(scoringAverageMetrics).map((category) => {
                        if (category !== "par3Course" && category !== "par3All" && category !== "eagleSummary" && !alreadyDisplayed.includes(category)) {
                            alreadyDisplayed = [...alreadyDisplayed, category]
                            console.log("alreadyDisplayed",alreadyDisplayed)

                            return (
                                <TableRow key={category}>
                                    <TableCell key={`${scoringAverageMetrics[category]}1`} className="noPaddingLeft">{scoringAverageMetrics[category].header}</TableCell>
                                    <TableCell key={`${scoringAverageMetrics[category]}2`}>{scoringAverageMetrics[category].numHoles}</TableCell>
                                    <TableCell key={`${scoringAverageMetrics[category]}3`}>{(scoringAverageMetrics[category].scoreToPar > 0) ? "+" : ""}{scoringAverageMetrics[category].scoreToPar} <small>({(((scoringAverageMetrics[category].scoreToPar / scoringAverageMetrics[category].numHoles) + (scoringAverageMetrics[category].header.includes(3) ? 3 : scoringAverageMetrics[category].header.includes(4) ? 4 : 5)).toFixed(2))})</small></TableCell>
                                    <TableCell key={`${scoringAverageMetrics[category]}4`}>{scoringAverageMetrics[category].eagle} <small>({(scoringAverageMetrics[category].eagle / scoringAverageMetrics[category].numHoles * 100).toFixed(2)}%)</small></TableCell>
                                    <TableCell key={`${scoringAverageMetrics[category]}5`}>{scoringAverageMetrics[category].birdie} <small>({(scoringAverageMetrics[category].birdie / scoringAverageMetrics[category].numHoles * 100).toFixed(2)}%)</small></TableCell>
                                    <TableCell key={`${scoringAverageMetrics[category]}6`}>{scoringAverageMetrics[category].par} <small>({(scoringAverageMetrics[category].par / scoringAverageMetrics[category].numHoles * 100).toFixed(2)}%)</small></TableCell>
                                    <TableCell key={`${scoringAverageMetrics[category]}7`}>{scoringAverageMetrics[category].bogey} <small>({(scoringAverageMetrics[category].bogey / scoringAverageMetrics[category].numHoles * 100).toFixed(2)}%)</small></TableCell>
                                    <TableCell key={`${scoringAverageMetrics[category]}8`}>{scoringAverageMetrics[category].double} {scoringAverageTotals.double !== 0 && <small>({(scoringAverageMetrics[category].double / scoringAverageMetrics[category].numHoles * 100).toFixed(2)}%)</small>}</TableCell>
                                    <TableCell key={`${scoringAverageMetrics[category]}9`}>{scoringAverageMetrics[category].triple} {scoringAverageTotals.triple !== 0 && <small>({(scoringAverageMetrics[category].triple / scoringAverageMetrics[category].numHoles * 100).toFixed(2)}%)</small>}</TableCell>
                                    <TableCell key={`${scoringAverageMetrics[category]}10`}>{scoringAverageMetrics[category].quad} {scoringAverageTotals.quad !== 0 && <small>({(scoringAverageMetrics[category].quad / scoringAverageMetrics[category].numHoles * 100).toFixed(2)}%)</small>}</TableCell>
                                    <TableCell key={`${scoringAverageMetrics[category]}11`}>{scoringAverageMetrics[category].threePutts} {scoringAverageTotals.threePutts !== 0 && <small>({(scoringAverageMetrics[category].threePutts / scoringAverageMetrics[category].numHoles * 100).toFixed(2)}%)</small>}</TableCell>
                                </TableRow>
                            );
                        }
                    })}
                    {/* Summary Row */}
                    <TableRow key="scoringAverageMetricsTotalRow" className="hideTableBottomBorderLastChildCell">
                        <TableCell key="scoringAverageMetricsTotal1" className="noPaddingLeft">Total</TableCell>
                        <TableCell key="scoringAverageMetricsTotal2">{scoringAverageTotals.numHoles}</TableCell>
                        <TableCell key="scoringAverageMetricsTotal3">{scoringAverageTotals.scoreToPar > 0 ? "+" : ""}{scoringAverageTotals.scoreToPar} <small>({(scoringAverageTotals.scoreToPar / scoringAverageTotals.numHoles).toFixed(2)})</small></TableCell>
                        <TableCell key="scoringAverageMetricsTotal4">{scoringAverageTotals.eagle} <small>({(scoringAverageTotals.eagle / scoringAverageTotals.numHoles * 100).toFixed(2)}%)</small></TableCell>
                        <TableCell key="scoringAverageMetricsTotal5">{scoringAverageTotals.birdie} <small>({(scoringAverageTotals.birdie / scoringAverageTotals.numHoles * 100).toFixed(2)}%)</small></TableCell>
                        <TableCell key="scoringAverageMetricsTotal6">{scoringAverageTotals.par} <small>({(scoringAverageTotals.par / scoringAverageTotals.numHoles * 100).toFixed(2)}%)</small></TableCell>
                        <TableCell key="scoringAverageMetricsTotal7">{scoringAverageTotals.bogey} <small>({(scoringAverageTotals.bogey / scoringAverageTotals.numHoles * 100).toFixed(2)}%)</small></TableCell>
                        <TableCell key="scoringAverageMetricsTotal8">{scoringAverageTotals.double} {scoringAverageTotals.double !== 0 && <small>({(scoringAverageTotals.double / scoringAverageTotals.numHoles * 100).toFixed(2)}%)</small>}</TableCell>
                        <TableCell key="scoringAverageMetricsTotal9">{scoringAverageTotals.triple} {scoringAverageTotals.triple !== 0 && <small>({(scoringAverageTotals.triple / scoringAverageTotals.numHoles * 100).toFixed(2)}%)</small>}</TableCell>
                        <TableCell key="scoringAverageMetricsTotal10">{scoringAverageTotals.quad} {scoringAverageTotals.quad !== 0 && <small>({(scoringAverageTotals.quad / scoringAverageTotals.numHoles * 100).toFixed(2)}%)</small>}</TableCell>
                        <TableCell key="scoringAverageMetricsTotal11">{scoringAverageTotals.threePutts} {scoringAverageTotals.threePutts !== 0 && <small>({(scoringAverageTotals.threePutts / scoringAverageTotals.numHoles * 100).toFixed(2)}%)</small>}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>

            {/* Best Anderson Glen */}
            {/* <h1 className="marginTopExtraLarge marginBottomLarge">Best Anderson Glen</h1>
            <div className="flexRow alignCenter marginBottomSmall">
                <h3 className="marginRightExtraSmall">Best score on Front 9 -</h3>
                <h3 className="strongFont">({courseMetrics.andersonGlen.out}) {courseMetrics.andersonGlen.outDate} {courseMetrics.andersonGlen.outPutts} putts</h3>
            </div>
            <div className="flexRow alignCenter marginBottomSmall">
                <h3 className="marginRightExtraSmall">Best score on Back 9 -</h3>
                <h3 className="strongFont">({courseMetrics.andersonGlen.in}) {courseMetrics.andersonGlen.inDate} {courseMetrics.andersonGlen.inPutts} putts</h3>
            </div>
            <div className="flexRow alignCenter marginBottomSmall">
                <h3 className="marginRightExtraSmall">Best score on 18 holes -</h3>
                <h3 className="strongFont">({courseMetrics.andersonGlen.totalOut} + {courseMetrics.andersonGlen.totalIn} = {courseMetrics.andersonGlen.total}) {courseMetrics.andersonGlen.totalDate} {courseMetrics.andersonGlen.totalPutts} putts</h3>
            </div> */}

            {/* Best Gilelad Highlands */}
            {/* <h1 className="marginTopExtraLarge marginBottomLarge">Best Gilead Highlands</h1>
            <div className="flexRow alignCenter marginBottomSmall">
                <h3 className="marginRightExtraSmall">Best score on Front 9 -</h3>
                <h3 className="strongFont">({courseMetrics.gileadHighlands.out}) {courseMetrics.gileadHighlands.outDate} {courseMetrics.gileadHighlands.outPutts} putts</h3>
            </div>
            <div className="flexRow alignCenter marginBottomSmall">
                <h3 className="marginRightExtraSmall">Best score on Back 9 -</h3>
                <h3 className="strongFont">({courseMetrics.gileadHighlands.in}) {courseMetrics.gileadHighlands.inDate} {courseMetrics.gileadHighlands.inPutts} putts</h3>
            </div>
            <div className="flexRow alignCenter marginBottomSmall">
                <h3 className="marginRightExtraSmall">Best score on 18 holes -</h3>
                <h3 className="strongFont">({courseMetrics.gileadHighlands.totalOut} + {courseMetrics.gileadHighlands.totalIn} = {courseMetrics.gileadHighlands.total}) {courseMetrics.gileadHighlands.totalDate} {courseMetrics.gileadHighlands.totalPutts} putts</h3>
            </div> */}

            {/* Course Records */}
            {/* <h1 className="marginTopExtraLarge marginBottomLarge">Course Records</h1> */}
            {calculateCourseRecords(courseInfo, courseMetrics)}

            {/* {Object.keys(courseMetrics).map(courseMetric => {
                // if (courseMetric !== "andersonGlen" && courseMetric !== "gileadHighlands") {
                    console.log("courseMetric",courseMetric)
                    console.log("courseMetrics[courseMetric]",courseMetrics[courseMetric])
                    const courseName = courses.find(course => course.courseKey === courseMetric).displayName;
                    let scoreString = "";
                    if (courseMetrics[courseMetric].out === 100) {
                        scoreString = `${courseMetrics[courseMetric].in} (B9: ${courseMetrics[courseMetric].in - courseInfo[courseMetric].b9Par > 0 ? "+" : courseMetrics[courseMetric].in == courseInfo[courseMetric].b9Par ? "E" : ""}${courseMetrics[courseMetric].in !== courseInfo[courseMetric].b9Par ? courseMetrics[courseMetric].in - courseInfo[courseMetric].b9Par : ""})`;
                    } else {
                        if (courseMetrics[courseMetric].in === 100) {
                            console.log("courseInfo",courseInfo)
                            scoreString = `${courseMetrics[courseMetric].out} (F9: ${courseMetrics[courseMetric].out - courseInfo[courseMetric].f9Par > 0 ? "+" : courseMetrics[courseMetric].out == courseInfo[courseMetric].f9Par ? "E" : ""}${courseMetrics[courseMetric].out !== courseInfo[courseMetric].f9Par ? courseMetrics[courseMetric].out - courseInfo[courseMetric].f9Par : ""})`;
                        } else {
                            scoreString = `${courseMetrics[courseMetric].total} (${courseMetrics[courseMetric].out} - ${courseMetrics[courseMetric].in}: ${courseMetrics[courseMetric].total - courseInfo[courseMetric].par > 0 ? "+" : courseMetrics[courseMetric].total == courseInfo[courseMetric].par ? "E" : ""}${courseMetrics[courseMetric].total !== courseInfo[courseMetric].par ? courseMetrics[courseMetric].total - courseInfo[courseMetric].par : ""})`;
                        }
                    }
                    return (
                        <div className="flexRow alignCenter marginBottomSmall" key={courseName}>
                            <h3 className="marginRightExtraSmall">{courseName} -</h3>
                            <h3 className="strongFont">{scoreString}</h3>
                        </div> 
                    )
                // } else return null;
            })} */}

            {/* <h1 className="marginTopExtraLarge marginBottomLarge">Eagle Summary</h1> */}
            <Table style={{ width: "80vw" }} className="golfTable marginTopMassive marginBottomMassive">
                <TableHead>
                    <TableRow>
                        <TableCell key="eagleSummaryHeader1"><h1>Eagle Summary</h1></TableCell>
                        <TableCell key="eagleSummaryHeader2"><h1>Course</h1></TableCell>
                        <TableCell key="eagleSummaryHeader3"><h1>Hole</h1></TableCell>
                        <TableCell key="eagleSummaryHeader4"><h1>Distance</h1></TableCell>
                        <TableCell key="eagleSummaryHeader5"><h1>Par</h1></TableCell>
                        <TableCell key="eagleSummaryHeader6"><h1>Score</h1></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedEagleSummary.map((eagle) => {
                        return (
                            <TableRow key="" className="hideTableBottomBorderLastChildCell">
                                <TableCell>{eagle.date}</TableCell>
                                <TableCell>{eagle.course}</TableCell>
                                <TableCell>{eagle.hole}</TableCell>
                                <TableCell>{eagle.distance}</TableCell>
                                <TableCell>{eagle.par}</TableCell>
                                <TableCell>{eagle.score}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            {/* Single Hole Metrics */}
            <h1 className="marginTopExtraLarge marginBottomLarge">Single Hole Metrics</h1>
            <div className="flexRow alignCenter marginBottomSmall">
                <h3 className="marginRightExtraSmall">Most birdies on a single hole:</h3>
                <h3 className="strongFont">({singleHoleMetrics.birdies.mostBirdies}) {singleHoleMetrics.birdies.mostBirdiesCourse} Par {singleHoleMetrics.birdies.mostBirdiesPar} Hole {singleHoleMetrics.birdies.mostBirdiesHole} played {singleHoleMetrics.birdies.mostBirdiesRounds} times</h3>
            </div>
            {/* <div className="flexRow alignCenter marginBottomSmall">
                <h3 className="marginRightExtraSmall">Least bogey+ on a single hole -</h3>
                <h3 className="strongFont">({singleHoleMetrics.bogeyPlus.leastBogeyPlus}) {singleHoleMetrics.bogeyPlus.leastBogeyPlusCourse} Par {singleHoleMetrics.bogeyPlus.leastBogeyPlusPar} Hole {singleHoleMetrics.bogeyPlus.leastBogeyPlusHole} played {singleHoleMetrics.bogeyPlus.leastBogeyPlusRounds} times</h3>
            </div> */}
            <div className="flexRow alignCenter marginBottomSmall">
                <h3 className="marginRightExtraSmall">Most bogey+ on a single hole:</h3>
                <h3 className="strongFont">({singleHoleMetrics.bogeyPlus.mostBogeyPlus}) {singleHoleMetrics.bogeyPlus.mostBogeyPlusCourse} Par {singleHoleMetrics.bogeyPlus.mostBogeyPlusPar} Hole {singleHoleMetrics.bogeyPlus.mostBogeyPlusHole} played {singleHoleMetrics.bogeyPlus.mostBogeyPlusRounds} times</h3>
            </div>
            <div className="flexRow alignCenter marginBottomSmall">
                <h3 className="marginRightExtraSmall">Best cumulative score to par on a single hole:</h3>
                <h3 className="strongFont">({singleHoleMetrics.bestCumulativeScoreSingle.cumulativeScoreToPar > 0 ? "+" : ""}{singleHoleMetrics.bestCumulativeScoreSingle.cumulativeScoreToPar}) {singleHoleMetrics.bestCumulativeScoreSingle.course} Par {singleHoleMetrics.bestCumulativeScoreSingle.par} Hole {singleHoleMetrics.bestCumulativeScoreSingle.hole} played {singleHoleMetrics.bestCumulativeScoreSingle.rounds} times</h3>
            </div>
            <div className="flexRow alignCenter marginBottomSmall">
                <h3 className="marginRightExtraSmall">Worst cumulative score on a single hole:</h3>
                <h3 className="strongFont">({singleHoleMetrics.worstCumulativeScoreSingle.cumulativeScoreToPar < 0 ? "-" : singleHoleMetrics.worstCumulativeScoreSingle.cumulativeScoreToPar > 0 ? "+" : ""}{singleHoleMetrics.worstCumulativeScoreSingle.cumulativeScoreToPar}) {singleHoleMetrics.worstCumulativeScoreSingle.course} Par {singleHoleMetrics.worstCumulativeScoreSingle.par} Hole {singleHoleMetrics.worstCumulativeScoreSingle.hole} played {singleHoleMetrics.worstCumulativeScoreSingle.rounds} times</h3>
            </div>

            {/* CTP */}
            {/* <h1 className="marginTopExtraLarge marginBottomLarge">Closest to the Pin</h1>
            {Object.keys(singleHoleMetrics.ctp).map((hole) => {
                const ctp = singleHoleMetrics.ctp[hole];
                // if (ctp.course === "Anderson Glen" || ctp.course === "Gilead Highlands") {
                    return (
                        <div className="flexRow alignCenter marginBottomSmall" key={hole + ctp.hole}>
                            <h3 className="marginRightExtraSmall">{ctp.course} {ctp.hole} ({ctp.distance} yards) -</h3>
                            <h3 className="strongFont">{ctp.dth} feet ({ctp.date} Score: {ctp.score})</h3>
                        </div>
                    );
                // } else {
                //     return null;
                // }
            })} */}

            {/* Miscellaneous Metrics */}
            <h1 className="marginTopExtraLarge marginBottomLarge">Miscellaneous Metrics</h1>
            <div className="flexRow alignCenter marginBottomSmall">
                <h3 className="marginRightExtraSmall">Most consecutive 1 putts -</h3>
                {calculateConsecutiveOnePutts(displayedRounds)}
            </div>
            <div className="flexRow alignCenter marginBottomSmall">
                <h3 className="marginRightExtraSmall">Most putts in 9 holes & 18 holes -</h3>
                {calculateMostPutts(displayedRounds)}
            </div>
            <div className="flexRow alignCenter marginBottomSmall">
                <h3 className="marginRightExtraSmall">Least putts in 9 holes & 18 holes -</h3>
                {calculateLeastPutts(displayedRounds)}
            </div>
            <div className="flexRow alignCenter marginBottomSmall">
                <h3 className="marginRightExtraSmall">Largest score disparity between front 9 and back 9 -</h3>
                {calculateLargestScoreDisparity(displayedRounds)}
            </div>
            {/* <div className="flexRow alignCenter marginBottomSmall">
                <h3 className="marginRightExtraSmall">Longest putt made -</h3>
                {puttingMetrics.longestPutt}
            </div> */}
            
            {/* <div className="flexRow alignCenter marginBottomSmall">
                <h3 className="marginRightSmall">Most FIR and GIR on the same hole in 9 holes & 18 holes -</h3>
                
            </div>
            <div className="flexRow alignCenter marginBottomSmall">
                <h3 className="marginRightSmall">Longest streak without losing a ball -</h3>
                
            </div>
            <div className="flexRow alignCenter marginBottomSmall">
                <h3 className="marginRightSmall">Most FIR in 9 holes & 18 holes -</h3>
                
            </div>
            <div className="flexRow alignCenter marginBottomSmall">
                <h3 className="marginRightSmall">Most GIR in 9 holes & 18 holes -</h3>
                
            </div>
            <div className="flexRow alignCenter marginBottomSmall">
                <h3 className="marginRightSmall">Most lost balls in 9 holes & 18 holes -</h3>
                
            </div>
            <div className="flexRow alignCenter marginBottomSmall">
                <h3 className="marginRightSmall">Most miscues in 9 holes & 18 holes -</h3>
                
            </div> */}

            {/* Lost Balls */}
            <h1 className="marginTopExtraLarge marginBottomLarge">Lost Balls</h1>
            <div className="flexRow alignCenter marginBottomSmall">
                {createLostBallsTable(lostBallMetrics)}
            </div>

            {/* Driving */}
            <h1 className="marginTopExtraLarge marginBottomLarge">Driving</h1>
            <div className="flexRow alignCenter marginBottomSmall">
                {createDrivingTable(drivingMetrics)}
            </div>

            {/* Approach */}
            <div className="flexRow justifySpaceBetween alignCenter">
                <h1 className="marginTopLarge marginBottomLarge">Approach</h1>
                <FormControl size="small">
                    <InputLabel id="approach-table-select-label">View</InputLabel>
                    <Select
                        labelId="approach-table-select-label"
                        id="approach-table-select"
                        value={approachView}
                        label="Age"
                        onChange={(e) => {
                            console.log("e.target.event", e.target.event)
                            setApproachView(e.target.value)}
                        }>
                        <MenuItem value="distribution">Distribution</MenuItem>
                        <MenuItem value="differential">Score Differentials</MenuItem>
                        {/* <MenuItem value={30}>Thirty</MenuItem> */}
                    </Select>
                </FormControl>
            </div>
            <div className="flexRow alignCenter marginBottomSmall">
                {createApproachTable(approachMetrics, approachView, setApproachView)}
            </div>
            
            {/* Putting */}
            <h1 className="marginTopExtraLarge marginBottomLarge">Putting</h1>
            <div className="flexRow alignCenter marginBottomSmall">
                {createPuttingTable(puttingMetrics)}
            </div>

            {/* Sand */}
            {/* <h1 className="marginTopExtraLarge marginBottomLarge">Sand</h1>
            <div className="flexRow alignCenter marginBottomSmall">
                {createPuttingTable(puttingMetrics)}
            </div> */}

            <h1 className="marginTopExtraLarge marginBottomLarge">Hole Flow</h1>
            {createCumulativeGraphs(displayedRounds, drivingMetrics, puttingMetrics)}
        </>
    );
}

const createSingleHoleGraph = (courseInfo, singleHoleMetrics) => {
    let scoringMetrics = {
        gir: { score1: 0, score2: 0, score3: 0, score4: 0, score5: 0, score6: 0, score7: 0, score8: 0, score9: 0, score0: 0 },
        nonGir: { score1: 0, score2: 0, score3: 0, score4: 0, score5: 0, score6: 0, score7: 0, score8: 0, score9: 0, score0: 0 }
    }

    let drivingMetrics = {
        notInRangeOfGreen: { lowerBound: 0, upperBound: 0, customTitle: "Not in range of green", f: 0, l: 0, r: 0, x: 0, xGir: 0, lGir: 0, fGir: 0, rGir: 0, total: 0 },
        lessThan200: { lowerBound: 1, upperBound: 199, customTitle: "< 200", f: 0, l: 0, r: 0, x: 0, xGir: 0, lGir: 0, fGir: 0, rGir: 0, total: 0 }, // Tops & lay-ups
        between200and220: { lowerBound: 200, upperBound: 220, f: 0, l: 0, r: 0, x: 0, xGir: 0, lGir: 0, fGir: 0, rGir: 0, total: 0 },
        between221and240: { lowerBound: 221, upperBound: 240, f: 0, l: 0, r: 0, x: 0, xGir: 0, lGir: 0, fGir: 0, rGir: 0, total: 0 },
        between241and260: { lowerBound: 241, upperBound: 260, f: 0, l: 0, r: 0, x: 0, xGir: 0, lGir: 0, fGir: 0, rGir: 0, total: 0 },
        between261and280: { lowerBound: 261, upperBound: 280, f: 0, l: 0, r: 0, x: 0, xGir: 0, lGir: 0, fGir: 0, rGir: 0, total: 0 },
        between281and300: { lowerBound: 281, upperBound: 300, f: 0, l: 0, r: 0, x: 0, xGir: 0, lGir: 0, fGir: 0, rGir: 0, total: 0 },
        greaterThan300: { lowerBound: 300, upperBound: 1000, customTitle: "300+", f: 0, l: 0, r: 0, x: 0, xGir: 0, lGir: 0, fGir: 0, rGir: 0, total: 0 },
        total: { lowerBound: 1000, upperBound: 1000, customTitle: "Total", f: 0, l: 0, r: 0, x: 0, xGir: 0, lGir: 0, fGir: 0, rGir: 0, total: 0 }
    };

    const singleCourseInfo = courseInfo.find(info => info.courseKey === singleHoleMetrics.courseKey);

    let individualCourseData = singleCourseInfo[`hole${singleHoleMetrics.hole}`];
    for (let round of singleHoleMetrics.roundsData) {
        if (round.fir !== "NA") { // Exclude par 3's
            drivingMetrics.total[round.fir.toLowerCase()]++;
            drivingMetrics.total.total++;

            let dtgForCalculation = 1000;
            if (
                individualCourseData.par === 4 // Par 4 DTG
                || (individualCourseData.par === 5 && round.gir === "G-1") // Par 5 G-1
            ) {
                dtgForCalculation = parseInt(round.dtg); // Use raw DTG
            } else {
                if (individualCourseData.par === 5 && typeof round.dtg === "string") { // DTG recorded after drive and approach
                    dtgForCalculation = parseInt(round.dtg.split(", ")[0]); // Use first DTG value in array
                }
            }

            if (dtgForCalculation === 1000) { // Not in range of green, cannot calculate driving distance
                drivingMetrics.notInRangeOfGreen[round.fir.toLowerCase()]++;
                drivingMetrics.notInRangeOfGreen.total++;
                if (round.gir === "G-1" || round.gir === "G") {
                    drivingMetrics.notInRangeOfGreen[`${round.fir.toLowerCase()}Gir`]++;
                    scoringMetrics.gir[`score${round.score}`]++;
                } else {
                    scoringMetrics.nonGir[`score${round.score}`]++;
                }
            } else {
                const driveDistance = parseInt(individualCourseData.distance) - dtgForCalculation;
                let drivingMetricRange = "";
                if (driveDistance < 200) { drivingMetricRange = "lessThan200"; } else {
                if (220 > driveDistance && driveDistance >= 200) { drivingMetricRange = "between200and220"; } else {
                if (240 > driveDistance && driveDistance >= 220) { drivingMetricRange = "between221and240"; } else { 
                if (260 > driveDistance && driveDistance >= 240) { drivingMetricRange = "between241and260"; } else { 
                if (280 > driveDistance && driveDistance >= 260) { drivingMetricRange = "between261and280"; } else {
                if (300 > driveDistance && driveDistance >= 280) { drivingMetricRange = "between281and300"; } else {
                if (driveDistance >= 300) { drivingMetricRange = "greaterThan300"; }}}}}}}

                if (drivingMetricRange === "") {
                    console.log(`INVALID DTG VALUE FOR ROUND ${round.roundInfo.key.toUpperCase()}, HOLE ${singleHoleMetrics.hole}:`, round.dtg);
                } else {
                    drivingMetrics[drivingMetricRange][round.fir.toLowerCase()]++;
                    drivingMetrics[drivingMetricRange].total++;
                    if (round.gir === "G-1" || round.gir === "G") {
                        drivingMetrics[drivingMetricRange][`${round.fir.toLowerCase()}Gir`]++;
                        drivingMetrics.total[`${round.fir.toLowerCase()}Gir`]++;
                        scoringMetrics.gir[`score${round.score}`]++;
                    } else {
                        scoringMetrics.nonGir[`score${round.score}`]++;
                    }
                }
            }
        } else { // Scoring metrics for par 3s
            if (round.gir === "G") {
                drivingMetrics.total.fGir++;
                scoringMetrics.gir[`score${round.score}`]++;
            } else {
                scoringMetrics.nonGir[`score${round.score}`]++;
            }
            drivingMetrics.total.total++;
        }
    }

    const sankeyGraphDistance = drivingMetrics.total;
    const totalGir = sankeyGraphDistance.lGir + sankeyGraphDistance.fGir + sankeyGraphDistance.rGir + sankeyGraphDistance.xGir;
    const totalMissedGreen = sankeyGraphDistance.total - totalGir;
    const sankeyGraphData = [["Fairway", "To", "Green"]];

    // FIR
    if (singleHoleMetrics.par !== 3) {
        sankeyGraphData.push([`FIR: ${sankeyGraphDistance.f}`, `GIR: ${totalGir}`, sankeyGraphDistance.fGir]);
        sankeyGraphData.push([`FIR: ${sankeyGraphDistance.f}`, `X: ${totalMissedGreen}`, sankeyGraphDistance.total - sankeyGraphDistance.lGir]);
        sankeyGraphData.push([`Left: ${sankeyGraphDistance.l}`, `GIR: ${totalGir}`, sankeyGraphDistance.lGir]);
        sankeyGraphData.push([`Right: ${sankeyGraphDistance.r}`, `GIR: ${totalGir}`, sankeyGraphDistance.rGir]);
        sankeyGraphData.push([`Left: ${sankeyGraphDistance.l}`, `X: ${totalMissedGreen}`, sankeyGraphDistance.total - sankeyGraphDistance.fGir]);
        sankeyGraphData.push([`Right: ${sankeyGraphDistance.r}`, `X: ${totalMissedGreen}`, sankeyGraphDistance.total - sankeyGraphDistance.rGir]);
        // Non-FIR
        if (sankeyGraphDistance.x !== 0) {
            sankeyGraphData.push([`Miscue: ${sankeyGraphDistance.x}`, `GIR: ${totalGir}`, typeof sankeyGraphDistance.xGir == "number" ? sankeyGraphDistance.xGir : 0]);
            sankeyGraphData.push([`Miscue: ${sankeyGraphDistance.x}`, `X: ${totalMissedGreen}`, sankeyGraphDistance.total - sankeyGraphDistance.xGir]);
        }
    }

    // Score distribution
    for (let score of Object.keys(scoringMetrics.gir)) {
        if (scoringMetrics.gir[score] !== 0) {
            sankeyGraphData.push([`GIR: ${totalGir}`, `${score.substring(score.length - 1, score.length)}: ${scoringMetrics.gir[score] + scoringMetrics.nonGir[score]}`, scoringMetrics.gir[score]]);
        }
        if (scoringMetrics.nonGir[score] !== 0) {
            sankeyGraphData.push([`X: ${totalMissedGreen}`, `${score.substring(score.length - 1, score.length)}: ${scoringMetrics.gir[score] + scoringMetrics.nonGir[score]}`, scoringMetrics.nonGir[score]]);
        }
    }

    return null

    // return (
        // <Chart
        //     chartType="Sankey"
        //     width="220px"
        //     data={sankeyGraphData}
        //     options={{
        //         // sankey: {
        //         //     link: { color: { fill: "#d799ae" } },
        //         //     node: {
        //         //         colors: ["#a61d4c"],
        //         //         label: { color: "#871b47" },
        //         //     }
        //         // }
        //     }}
        // />
    // )
}

export const courseSummary = (courseInfo, allRounds, expandSingleHoleMetric, handleSetExpandSingleHoleMetric, courseTours, displayedRounds, displayedRoundsToggle, setDisplayedRoundsToggle) => {
    const singleHoleMetrics = calculateSingleHoleMetrics(courseInfo, displayedRoundsToggle ? displayedRounds : allRounds);
    // console.log("singleHoleMetrics",singleHoleMetrics)
    const nonHoleMetrics = ["bestCumulativeScoreSingle", "worstCumulativeScoreSingle", "birdies", "bogeyPlus", "mostPutts", "ctp", "longestDrive"];

    let selectedCourseTours = [];
    // const courseNames = Object.keys(courseInfo);
    // const courseNames = [];
    // for (let course of courseInfo) courseNames.push(course.displayName);
    console.log("courseTours",courseTours)
    for (let course of courseTours) {
        if (course !== "Signature Holes") {
            // const selectedCourse = courseNames.filter(function(courseName) {
            //     if (courseInfo[courseName].displayName === course) return course;
            // })
            // selectedCourseTours.push(selectedCourse[0])
            selectedCourseTours.push(courseInfo.find(info => info.displayName === course).displayName)
        }
    }

    // console.log("courseNames",courseNames)
    console.log("selectedCourseTours",selectedCourseTours)

    console.log("singleHoleMetrics",singleHoleMetrics)

    const sortedObj = Object.keys(singleHoleMetrics).sort(
        function(a,b) {
            return (
                singleHoleMetrics[a].courseKey > singleHoleMetrics[b].courseKey || (singleHoleMetrics[a].hole > singleHoleMetrics[b].courseKey && singleHoleMetrics[a].hole < singleHoleMetrics[b].courseKey))
                ? 1
                : ((singleHoleMetrics[b].courseKey > singleHoleMetrics[a].courseKey) ? -1 : 0
            );
        }
    );

    console.log("sortedObj",sortedObj)

    const isHoleMetric = (hole) => {
        // console.log("secondCheck\n\nhole",hole) // ex: southsuburbanhole1
        // console.log("!nonHoleMetrics.includes(hole)",!nonHoleMetrics.includes(hole)) // check is metric, not hole
        console.log("selectedCourseTours.includes(singleHoleMetrics[hole].courseKey)",selectedCourseTours.includes(singleHoleMetrics[hole].course))
        if (selectedCourseTours.includes(singleHoleMetrics[hole].course)) console.log("hole",hole)
        return (
            !nonHoleMetrics.includes(hole) && selectedCourseTours.includes(singleHoleMetrics[hole].course)
        )
    };


    return (
        <div className="singleHoleMetricContainer flexFlowRowWrap marginBottomExtraLarge justifyCenter">
            {/* Toggle All or Displayed rounds */}
            <div className="width100Percent flexRow justifyCenter alignCenter">
                <span className="whiteFont marginTop">All Rounds</span>
                <Switch onChange={() => setDisplayedRoundsToggle(!displayedRoundsToggle)} checked={displayedRoundsToggle} />
                <span className="whiteFont">Displayed Rounds</span>
            </div>


            {/* {console.log("nonHoleMetrics",nonHoleMetrics)} */}
            {/* ["bestCumulativeScoreSingle", "worstCumulativeScoreSingle", "birdies", "bogeyPlus", "mostPutts", "ctp", "longestDrive"]; */}


            {sortedObj.map((hole) => {
                // console.log("hole",hole) ex: southSuburbanHole1
                console.log("singleHoleMetrics[hole]",singleHoleMetrics[hole])                
                if (isHoleMetric(hole)) {
                    const holeSummaryRef = React.createRef();
                    const executeScroll = () => holeSummaryRef.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                    return (
                        <div ref={holeSummaryRef} id={hole.key} className={`holeData flexRow${expandSingleHoleMetric.expanded && expandSingleHoleMetric.hole === hole ? " expanded" : ""}`} key={hole.key}>
                            <img src={imageSourceMappings[hole]} style={{ height: `${expandSingleHoleMetric.expanded && expandSingleHoleMetric.hole === hole ? "700px" : "476px"}`, marginRight: "8px", borderTopLeftRadius: "12px", borderBottomLeftRadius: "12px" }} alt={`${hole}SingleHoleMetric`} />
                            <div className="flexRow width100Percent justifySpaceAround">
                                {expandSingleHoleMetric.expanded && expandSingleHoleMetric.hole === hole &&
                                    <div className="flexColumn marginTopMedium dynamicPanel">
                                        <div className="flexRow width100Percent justifySpaceBetween marginTopSmall positionSticky">
                                            <div className="stickyBackgroundColor width76px paddingBottomSmall">Date</div>
                                            <div className="stickyBackgroundColor width76px paddingBottomSmall">Score</div>
                                            <div className="stickyBackgroundColor width76px paddingBottomSmall">Putts</div>
                                            {singleHoleMetrics[hole].par !== 3 && <div className="stickyBackgroundColor width76px paddingBottomSmall">FIR</div>}
                                            <div className="stickyBackgroundColor width76px paddingBottomSmall">GIR</div>
                                            <div className="stickyBackgroundColor width76px paddingBottomSmall">DTG</div>
                                            <div className="stickyBackgroundColor width76px paddingBottomSmall">DTH</div>
                                            <div className="stickyBackgroundColor width76px paddingBottomSmall">Putt Length</div>
                                            <div className="stickyBackgroundColor width76px paddingBottomSmall">Notes:</div>
                                        </div>
                                        {singleHoleMetrics[hole].roundsData.sort(function(a,b) {return (a.sequence > b.sequence) ? 1 : ((b.sequence > a.sequence) ? -1 : 0);}).map((round) => {
                                            return (
                                                <div className="flexRow width100Percent justifySpaceBetween borderTopSmall" key={round.sequence}>
                                                    <div className="width76px paddingTopSmall paddingBottomSmall">{round.date}</div>
                                                    <div className="width76px paddingTopSmall paddingBottomSmall">{round.score}</div>
                                                    <div className="width76px paddingTopSmall paddingBottomSmall">{round.putts}</div>
                                                    {singleHoleMetrics[hole].par !== 3 && <div className="width76px paddingTopSmall paddingBottomSmall">{round.fir}</div>}
                                                    <div className="width76px paddingTopSmall paddingBottomSmall">{round.gir}</div>
                                                    <div className="width76px paddingTopSmall paddingBottomSmall">{round.dtg}</div>
                                                    <div className="width76px paddingTopSmall paddingBottomSmall">{round.dth}</div>
                                                    <div className="width76px paddingTopSmall paddingBottomSmall">{round.puttLength}</div>
                                                    <div className="width76px paddingTopSmall paddingBottomSmall">{round.notes}</div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                }
                                <div className="flexColumn justifySpaceBetween">
                                    <div className="flexColumn paddingTopMedium paddingLeftSmall paddingRightSmall marginBottomExtraSmall">
                                        <h2>{singleHoleMetrics[hole].course} #{singleHoleMetrics[hole].hole}</h2>
                                        <h3>Par {singleHoleMetrics[hole].par}, {singleHoleMetrics[hole].distance} Yards, {singleHoleMetrics[hole].handicap} HDCP</h3>
                                        <div className="flexColumn marginTopSmall marginBottomExtraSmall">
                                            <h3>Score Distribution</h3>
                                            <p className="flexRow justifySpaceBetween"><span>Eagles: </span> <b>{singleHoleMetrics[hole].numEagles}</b></p>
                                            <p className="flexRow justifySpaceBetween"><span>Birdies: </span> <b>{singleHoleMetrics[hole].numBirdies}</b></p>
                                            <p className="flexRow justifySpaceBetween"><span>Pars: </span> <b>{singleHoleMetrics[hole].numPars}</b></p>
                                            <p className="flexRow justifySpaceBetween"><span>Bogey: </span> <b>{singleHoleMetrics[hole].numBogeys}</b></p>
                                            <p className="flexRow justifySpaceBetween"><span>Bogey+: </span> <b>{singleHoleMetrics[hole].numBogeyPlus}</b></p>
                                            <p className="flexRow justifySpaceBetween marginTopSmall paddingTopExtraSmall" style={{ borderTop: "1px solid white" }}><span>Cumulative Score: </span> <b>{singleHoleMetrics[hole].cumulativeScoreToPar > 0 ? `+${singleHoleMetrics[hole].cumulativeScoreToPar}` : singleHoleMetrics[hole].cumulativeScoreToPar}</b> <small style={{ paddingTop: "2px" }}>({(singleHoleMetrics[hole].cumulativeScoreToPar / singleHoleMetrics[hole].rounds) > 0 ? "+" : ""}{(singleHoleMetrics[hole].cumulativeScoreToPar / singleHoleMetrics[hole].rounds) == 0 ? "E" : (singleHoleMetrics[hole].cumulativeScoreToPar / singleHoleMetrics[hole].rounds).toFixed(1)})</small></p>
                                        </div>
                                        <div className="flexColumn marginTopSmall marginBottomExtraSmall">
                                            <h3>Cumulative Metrics</h3>
                                            {/* <p className="flexRow justifySpaceBetween"><span>Best Score: </span> <b>{singleHoleMetrics[hole].best}</b></p>
                                            <p className="flexRow justifySpaceBetween"><span>Worst Score: </span> <b>{singleHoleMetrics[hole].worst}</b></p> */}
                                            {singleHoleMetrics[hole].par !== 3 && singleHoleMetrics.longestDrive[`${singleHoleMetrics[hole].courseKey}Hole${singleHoleMetrics[hole].hole}`] && <p className="flexRow justifySpaceBetween"><span>Long Drive: </span> <span><b>{singleHoleMetrics.longestDrive[`${singleHoleMetrics[hole].courseKey}Hole${singleHoleMetrics[hole].hole}`].longestDrive}</b> <small>({singleHoleMetrics.longestDrive[`${singleHoleMetrics[hole].courseKey}Hole${singleHoleMetrics[hole].hole}`].distance - singleHoleMetrics.longestDrive[`${singleHoleMetrics[hole].courseKey}Hole${singleHoleMetrics[hole].hole}`].longestDrive} DTG)</small></span></p>}
                                            {singleHoleMetrics[hole].par === 3 && singleHoleMetrics.ctp[`${singleHoleMetrics[hole].courseKey}Hole${singleHoleMetrics[hole].hole}`] && <p className="flexRow justifySpaceBetween"><span>CTP (feet): </span> <b>{singleHoleMetrics.ctp[`${singleHoleMetrics[hole].courseKey}Hole${singleHoleMetrics[hole].hole}`].dth}</b></p>}
                                        </div>
                                        {singleHoleMetrics[hole].par !== 3 &&
                                            <>
                                                <div className="flexColumn marginTopSmall marginBottomExtraSmall">
                                                    <h3>Fairways</h3>
                                                    <div className="flexRow justifySpaceBetween">
                                                        <div className="flexColumn">
                                                            <p>L: {singleHoleMetrics[hole].fairways.l > 0 && <small>({(singleHoleMetrics[hole].fairways.l / singleHoleMetrics[hole].rounds * 100).toFixed(1)}%)</small>}</p>
                                                            <p><b>{singleHoleMetrics[hole].fairways.l}</b> {singleHoleMetrics[hole].fairways.l > 0 && <small>({(singleHoleMetrics[hole].fairways.lScoreToPar) > 0 ? '+' : ''}{(singleHoleMetrics[hole].fairways.lScoreToPar / singleHoleMetrics[hole].fairways.l).toFixed(1)})</small>}</p>
                                                        </div>
                                                        <div className="flexColumn">
                                                            <p>F: {singleHoleMetrics[hole].fairways.f > 0 && <small>({(singleHoleMetrics[hole].fairways.f / singleHoleMetrics[hole].rounds * 100).toFixed(1)}%)</small>}</p>
                                                            <p><b>{singleHoleMetrics[hole].fairways.f}</b> {singleHoleMetrics[hole].fairways.f > 0 && <small>({(singleHoleMetrics[hole].fairways.fScoreToPar) > 0 ? '+' : ''}{(singleHoleMetrics[hole].fairways.fScoreToPar / singleHoleMetrics[hole].fairways.f).toFixed(1)})</small>}</p>
                                                        </div>
                                                        <div className="flexColumn">
                                                            <p>R: {singleHoleMetrics[hole].fairways.r > 0 && <small>({(singleHoleMetrics[hole].fairways.r / singleHoleMetrics[hole].rounds * 100).toFixed(1)}%)</small>}</p>
                                                            <p><b>{singleHoleMetrics[hole].fairways.r}</b> {singleHoleMetrics[hole].fairways.r > 0 && <small>({(singleHoleMetrics[hole].fairways.rScoreToPar) > 0 ? '+' : ''}{(singleHoleMetrics[hole].fairways.rScoreToPar / singleHoleMetrics[hole].fairways.r).toFixed(1)})</small>}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        }
                                        <div className="flexColumn marginTopSmall marginBottomExtraSmall">
                                            <h3>Greens</h3>
                                            <div className="flexRow justifySpaceBetween">
                                                <div className="flexColumn">
                                                    <p>X: {singleHoleMetrics[hole].greens.x > 0 && <small>({Math.round(100 * singleHoleMetrics[hole].greens.x / (singleHoleMetrics[hole].greens.x + singleHoleMetrics[hole].greens.g + singleHoleMetrics[hole].greens.gur))}%)</small>}</p>
                                                    <p><b>{singleHoleMetrics[hole].greens.x}</b> {singleHoleMetrics[hole].greens.x > 0 && <small>({(singleHoleMetrics[hole].greens.xScoreToPar) > 0 ? "+" : ""}{(singleHoleMetrics[hole].greens.xScoreToPar / singleHoleMetrics[hole].greens.x) === 0 ? "E" : (singleHoleMetrics[hole].greens.xScoreToPar / singleHoleMetrics[hole].greens.x).toFixed(1)})</small>}</p>
                                                </div>
                                                <div className="flexColumn">
                                                    <p>G: {singleHoleMetrics[hole].greens.g > 0 && <small>({Math.round(100 * singleHoleMetrics[hole].greens.g / (singleHoleMetrics[hole].greens.x + singleHoleMetrics[hole].greens.g + singleHoleMetrics[hole].greens.gur))}%)</small>}</p>
                                                    <p><b>{singleHoleMetrics[hole].greens.g}</b> {singleHoleMetrics[hole].greens.g > 0 && <small>({(singleHoleMetrics[hole].greens.gScoreToPar) > 0 ? "+" : ""}{(singleHoleMetrics[hole].greens.gScoreToPar / singleHoleMetrics[hole].greens.g) === 0 ? "E" : (singleHoleMetrics[hole].greens.gScoreToPar / singleHoleMetrics[hole].greens.g).toFixed(1)})</small>}</p>
                                                </div>
                                                {singleHoleMetrics[hole].par === 5 &&
                                                    <div className="flexColumn">
                                                        <p>G-1: {singleHoleMetrics[hole].greens.gur > 0 && <small>({Math.round(100 * singleHoleMetrics[hole].greens.gur / (singleHoleMetrics[hole].greens.x + singleHoleMetrics[hole].greens.g + singleHoleMetrics[hole].greens.gur))}%)</small>}</p>
                                                        <p><b>{singleHoleMetrics[hole].greens.gur}</b> {singleHoleMetrics[hole].greens.gur > 0 && <small>({(singleHoleMetrics[hole].greens.gurScoreToPar) > 0 ? "+" : ""}{(singleHoleMetrics[hole].greens.gurScoreToPar / singleHoleMetrics[hole].greens.gur) === 0 ? "E" : (singleHoleMetrics[hole].greens.gurScoreToPar / singleHoleMetrics[hole].greens.gur).toFixed(1)})</small>}</p>
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                        <div className="flexColumn marginTopSmall marginBottomExtraSmall">
                                            <h3>Putting <small>(Avg: {(singleHoleMetrics[hole].putts / singleHoleMetrics[hole].roundsData.length).toFixed(1)})</small></h3>
                                            <div className="flexRow justifySpaceBetween">
                                                {singleHoleMetrics[hole].putts0 > 0 &&
                                                    <div className="flexColumn">
                                                        <p>0: <small>({Math.round(100 * singleHoleMetrics[hole].putts0 / (singleHoleMetrics[hole].putts0 + singleHoleMetrics[hole].putts1 + singleHoleMetrics[hole].putts2 + singleHoleMetrics[hole].putts3))}%)</small></p>
                                                        <b>{singleHoleMetrics[hole].putts0}</b>
                                                    </div>
                                                }
                                                <div className="flexColumn">
                                                    <p>1: <small>({Math.round(100 * singleHoleMetrics[hole].putts1 / (singleHoleMetrics[hole].putts0 + singleHoleMetrics[hole].putts1 + singleHoleMetrics[hole].putts2 + singleHoleMetrics[hole].putts3))}%)</small></p>
                                                    <b>{singleHoleMetrics[hole].putts1}</b>
                                                </div>
                                                <div className="flexColumn">
                                                    <p>2: <small>({Math.round(100 * singleHoleMetrics[hole].putts2 / (singleHoleMetrics[hole].putts0 + singleHoleMetrics[hole].putts1 + singleHoleMetrics[hole].putts2 + singleHoleMetrics[hole].putts3))}%)</small></p>
                                                    <b>{singleHoleMetrics[hole].putts2}</b>
                                                </div>
                                                <div className="flexColumn">
                                                    <p>3: <small>({Math.round(100 * singleHoleMetrics[hole].putts3 / (singleHoleMetrics[hole].putts0 + singleHoleMetrics[hole].putts1 + singleHoleMetrics[hole].putts2 + singleHoleMetrics[hole].putts3))}%)</small></p>
                                                    <b>{singleHoleMetrics[hole].putts3}</b>
                                                </div>
                                            </div>
                                        </div>
                                        {expandSingleHoleMetric.expanded && expandSingleHoleMetric.hole === hole &&
                                            <div id="singleHoleMetricsSankey">
                                                {createSingleHoleGraph(courseInfo, singleHoleMetrics[hole])}
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                            {/* Changing Expand positioning when course tour hole images are unavailable */}
                            <span className="cursorPointer marginBottomSmall" style={{ width: "0", position: "relative", top: expandSingleHoleMetric.expanded && expandSingleHoleMetric.hole === hole ? "670px" : "452px", right: "60px" }} onClick={() => { executeScroll(); handleSetExpandSingleHoleMetric(hole); }}>{expandSingleHoleMetric.expanded && expandSingleHoleMetric.hole === hole ? "Collapse" : "Expand"}</span>
                            {/* <span className="cursorPointer marginBottomSmall" style={{ width: "0", position: "relative", bottom: "-24px", right: "60px" }} onClick={() => { executeScroll(); handleSetExpandSingleHoleMetric(hole); }}>{expandSingleHoleMetric.expanded && expandSingleHoleMetric.hole === hole ? "Collapse" : "Expand"}</span> */}
                        </div>
                    );
                } else return null;
            })}
        </div>
    );
}