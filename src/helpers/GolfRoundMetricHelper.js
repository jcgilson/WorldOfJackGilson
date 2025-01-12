import * as moment from 'moment'

import {
    calculateFairways, calculateGreens
} from "./GolfFormatHelper"


export const golfRoundMetricHelper = (roundData, value, field, hole, allRounds, editingExistingScorecard, activeScorecardEntryCourseInfo, currentCourseKey = null) => {
    let tempScorecardEntryData = roundData;

    // When putts == 0, set dth/puttLength to 0
    if (value && field && hole) {
        if (field === "putts") {
            if (value == 0) {
                // Zero putts should automatically set dth and puttLength
                tempScorecardEntryData[hole].dth = 0;
                tempScorecardEntryData[hole].puttLength = 0;
            } else if (value == 1) {
                // One putts should set puttLength equal to dth
                tempScorecardEntryData[hole].puttLength = tempScorecardEntryData[hole].dth;
            }
        }

        // For one putts, dth updates should also update puttLength
        if (field === "dth" && tempScorecardEntryData[hole].putts == 1) tempScorecardEntryData[hole].puttLength = value;
    }





    // ROUND INFO - 1/2
    // Should already contain roundInfo if roundNotes have been added - to avoid overwriting, setting here
    if (!tempScorecardEntryData.roundInfo) tempScorecardEntryData.roundInfo = { roundNotes: "" };
    if (!tempScorecardEntryData.roundInfo.roundNotes) tempScorecardEntryData.roundInfo.roundNotes = "";

    // this needs to become a value taken from scorecard - notes is probably not saved anywhere yet
    // tempScorecardEntryData.roundNotes = [];

    // Get round metrics
    // FIR
    let fairways = calculateFairways(tempScorecardEntryData)
    tempScorecardEntryData.fairways = fairways;
    // GIR
    let greens = calculateGreens(tempScorecardEntryData)
    tempScorecardEntryData.greens = greens;

    // Misc. Round information
    // Round Key - Calculate number of rounds at submitting course
    // tempScorecardEntryData.roundInfo.sequence = sequence + 1;
    
    // roundNotes is populated by input entry
    // tempScorecardEntryData.roundInfo.roundNotes = scorecardEntryData.roundInfo.roundNotes;
    
    // Prevent manipulating existing scorecards roundInfo
    if (!editingExistingScorecard) {
        let numRoundsAtCourse = 0;
        // let sequence = 0;
        if (allRounds.length > 0) {
            for (let round of allRounds) {
                // if (round.roundInfo.sequence > sequence) sequence = round.roundInfo.sequence;
                if (round.roundInfo.courseKey === activeScorecardEntryCourseInfo.courseKey) numRoundsAtCourse++;
            }
        }
        tempScorecardEntryData.roundInfo.key = currentCourseKey ? currentCourseKey : `${activeScorecardEntryCourseInfo.courseKey}${numRoundsAtCourse + 1}`
        // Sequence
        tempScorecardEntryData.roundInfo.sequence = allRounds.length + 1;
        delete tempScorecardEntryData.date;
        // Date
        const tempDate = tempScorecardEntryData.roundInfo.date;
        const tempFormattedDate = moment(tempDate).format('MM/DD/YY');
        tempScorecardEntryData.roundInfo.date = tempFormattedDate;
        // Course info
        tempScorecardEntryData.roundInfo.course = activeScorecardEntryCourseInfo.displayName;
        tempScorecardEntryData.roundInfo.courseKey = activeScorecardEntryCourseInfo.courseKey;
    }
    tempScorecardEntryData.roundInfo.f9Holes = 0;
    tempScorecardEntryData.roundInfo.b9Holes = 0;
    


    // Eventually sets: numHoles, partialFront9, partialBack9, fullFront9, fullBack9
    // SCORING - 1/2
    tempScorecardEntryData.scoring = {
        numEagles: 0,
        numBirdies: 0,
        numPars: 0,
        numBogey: 0,
        numBogeyPlus: 0,
        scoreToPar: 0,
        in: 0,
        out: 0
        // f9Holes: 0,
        // b9Holes: 0
    }

    // APPROACH - 1/2
    tempScorecardEntryData.approach = {
        dtgF9: 0,
        dtgB9: 0,
        dtgF9Par5: 0,
        dtgB9Par5: 0,
        dtg2F9Par5: 0,
        dtg2B9Par5: 0,
        dtgF9Gur: 0,
        dtgB9Gur: 0,
        f9Par5s: 0,
        b9Par5s: 0
    }

    // PUTTING INFO - 1/2
    tempScorecardEntryData.putting = {
        // Putt Totals
        putts: 0,
        num3Putts: 0,
        num3PuttsF9: 0,
        num3PuttsB9: 0,
        f9Putts: 0, // Synonymous with below?
        b9Putts: 0, // Synonymous with below?
        // DTH
        dthF9Total: 0, // Synonymous with above?
        dthB9Total: 0, // Synonymous with above?
        dthTotal: 0,
        dthF9: 0,
        dthB9: 0,
        // PuttLength
        puttLengthF9: 0,
        puttLengthB9: 0,
        puttLengthTotal: 0,
        // FPM
        fpmF9Total: 0,
        fpmB9Total: 0,
        fpmTotal: 0,

        // The following stats are calculated below
        // dthF9Average, dthB9Average, dthTotalAverage, fpmF9Average, fpmB9Average, fpmTotalAverage
    }
    
    // Begin iterating every holes and calculate above metrics
    for (let hole = 1; hole <= 18; hole++) {
        // TODO: probably should redefine check below based on holes that are not being entered
        if (Object.keys(tempScorecardEntryData).includes(`hole${hole}`) && tempScorecardEntryData[`hole${hole}`].score > 0) {
            // Scoring
            const tempScorecardEntryDataHole = tempScorecardEntryData[`hole${hole}`]
            const holeScore = tempScorecardEntryDataHole.score;
            
            // Putting
            const holePutts = tempScorecardEntryDataHole.putts;
            const puttLength = tempScorecardEntryDataHole.puttLength;
            const fpm = tempScorecardEntryDataHole.fpm;
            tempScorecardEntryData.putting.putts = tempScorecardEntryData.putting.putts + holePutts;
            if (holePutts > 2) tempScorecardEntryData.putting.num3Putts = tempScorecardEntryData.putting.num3Putts + 1;
            // DTH
            const holeDth = tempScorecardEntryData[`hole${hole}`].putts == 0 ?
                0 :
                tempScorecardEntryData[`hole${hole}`].putts == 1 ?
                    tempScorecardEntryDataHole.puttLength : 
                    tempScorecardEntryDataHole.dth;
            tempScorecardEntryData.putting.dthTotal = tempScorecardEntryData.putting.dthTotal + holeDth;
            // Approach
            // DTG is calculated with the furthest DTG value available (Same with Par 5's)
            let holeDtg = tempScorecardEntryDataHole.dtg;
            let holeDtg2 = tempScorecardEntryDataHole.dtg2 ? parseInt(tempScorecardEntryDataHole.dtg2) : 0;
            // Set hole DTH to string "dtg, dtg2" when dtg2 is available, other wise just dtg
            // tempScorecardEntryData[`hole${hole}`].dtg = tempScorecardEntryDataHole.dtg2 && tempScorecardEntryDataHole.dtg2 !== 1000 ? `${tempScorecardEntryDataHole.dtg}, ${tempScorecardEntryDataHole.dtg2}` : tempScorecardEntryDataHole.dtg;


            if (hole < 10) { // Front 9
                if (activeScorecardEntryCourseInfo[`hole${hole}`].par == 5) {
                    tempScorecardEntryData.approach.f9Par5s = parseInt(tempScorecardEntryData.approach.f9Par5s) + 1;
                    tempScorecardEntryData.approach.dtgF9Par5 = parseInt(tempScorecardEntryData.approach.dtgF9Par5) + holeDtg;
                    // TODO: will need to take into account when Par 5 is G-1, don't need to add distance to totals
                    tempScorecardEntryData.approach.dtg2F9Par5 = parseInt(tempScorecardEntryData.approach.dtg2F9Par5) + holeDtg2;
                    if (tempScorecardEntryDataHole.gir !== "G-1") {
                        tempScorecardEntryData.approach.dtgF9Gur = parseInt(tempScorecardEntryData.approach.dtgF9Gur) + 1;
                    }
                } else {
                    tempScorecardEntryData.approach.dtgF9 = parseInt(tempScorecardEntryData.approach.dtgF9) + holeDtg;
                }
                if (holePutts > 2) tempScorecardEntryData.putting.num3PuttsF9 = tempScorecardEntryData.putting.num3PuttsF9 + 1;
                tempScorecardEntryData.scoring.out = tempScorecardEntryData.scoring.out + holeScore;
                tempScorecardEntryData.roundInfo.f9Holes++;
                tempScorecardEntryData.putting.dthF9Total = tempScorecardEntryData.putting.dthF9Total + holeDth;
                tempScorecardEntryData.putting.dthF9 = tempScorecardEntryData.putting.dthF9 + holeDth;
                tempScorecardEntryData.putting.f9Putts = tempScorecardEntryData.putting.f9Putts + holePutts;
                tempScorecardEntryData.putting.puttLengthF9 = tempScorecardEntryData.putting.puttLengthF9 + puttLength;
                tempScorecardEntryData.putting.dthF9Total = tempScorecardEntryData.putting.dthF9Total + holeDth;
                tempScorecardEntryData.putting.fpmF9Total = tempScorecardEntryData.putting.fpmF9Total + fpm;
            } else { // Back 9
                if (activeScorecardEntryCourseInfo[`hole${hole}`].par == 5) {
                    tempScorecardEntryData.approach.b9Par5s = parseInt(tempScorecardEntryData.approach.b9Par5s) + 1;
                    tempScorecardEntryData.approach.dtgB9Par5 = parseInt(tempScorecardEntryData.approach.dtgB9Par5) + holeDtg;
                    // TODO: will need to take into account when Par 5 is G-1, don't need to add distance to totals
                    tempScorecardEntryData.approach.dtg2B9Par5 = parseInt(tempScorecardEntryData.approach.dtg2B9Par5) + holeDtg2;
                    if (tempScorecardEntryDataHole.gir !== "G-1") {
                        tempScorecardEntryData.approach.dtgB9Gur = parseInt(tempScorecardEntryData.approach.dtgB9Gur) + 1;
                    }
                } else {
                    tempScorecardEntryData.approach.dtgB9 = parseInt(tempScorecardEntryData.approach.dtgB9) + holeDtg;
                }
                if (holePutts > 2) tempScorecardEntryData.putting.num3PuttsB9 = tempScorecardEntryData.putting.num3PuttsB9 + 1;
                tempScorecardEntryData.scoring.in = tempScorecardEntryData.scoring.in + holeScore;
                tempScorecardEntryData.roundInfo.b9Holes++;
                // One of the below should not be needed
                tempScorecardEntryData.putting.dthB9Total = tempScorecardEntryData.putting.dthB9Total + holeDth;
                tempScorecardEntryData.putting.dthB9 = tempScorecardEntryData.putting.dthB9 + holeDth;
                tempScorecardEntryData.putting.b9Putts = tempScorecardEntryData.putting.b9Putts + holePutts;
                tempScorecardEntryData.putting.puttLengthB9 = tempScorecardEntryData.putting.puttLengthB9 + puttLength;
                tempScorecardEntryData.putting.dthB9Total = tempScorecardEntryData.putting.dthB9Total + holeDth;
                tempScorecardEntryData.putting.fpmB9Total = tempScorecardEntryData.putting.fpmB9Total + fpm;
            }

            // Scoring
            if (holeScore - activeScorecardEntryCourseInfo[`hole${hole}`].par == -2) {
                tempScorecardEntryData.scoring.numEagles++;
            } else if (holeScore - activeScorecardEntryCourseInfo[`hole${hole}`].par == -1) {
                tempScorecardEntryData.scoring.numBirdies++;
            } else if (holeScore == activeScorecardEntryCourseInfo[`hole${hole}`].par) {
                tempScorecardEntryData.scoring.numPars++;
            } else if (holeScore - activeScorecardEntryCourseInfo[`hole${hole}`].par == 1) {
                tempScorecardEntryData.scoring.numBogey++;
            } else {
                tempScorecardEntryData.scoring.numBogeyPlus++;
            }
            tempScorecardEntryData.scoring.scoreToPar = tempScorecardEntryData.scoring.scoreToPar + holeScore - activeScorecardEntryCourseInfo[`hole${hole}`].par;
            tempScorecardEntryData.putting.puttLengthTotal = tempScorecardEntryData.putting.puttLengthTotal + puttLength;
            // Currently not calculating scramble stats // TODO: remove all scramble stats
        }
    }

    // ROUND INFO - 2/2
    // Number of holes played, partial/full 9's
    tempScorecardEntryData.roundInfo = {
        ...tempScorecardEntryData.roundInfo,
        numHoles: tempScorecardEntryData.roundInfo.f9Holes + tempScorecardEntryData.roundInfo.b9Holes,
        partialFront9: tempScorecardEntryData.roundInfo.f9Holes > 0 && tempScorecardEntryData.roundInfo.f9Holes < 9,
        partialBack9: tempScorecardEntryData.roundInfo.b9Holes > 0 && tempScorecardEntryData.roundInfo.b9Holes < 9,
        fullFront9: tempScorecardEntryData.roundInfo.f9Holes == 9,
        fullBack9: tempScorecardEntryData.roundInfo.b9Holes == 9
    }
    delete tempScorecardEntryData.scoring.f9Holes;
    delete tempScorecardEntryData.scoring.b9Holes;

    // APPROACH - 1/2
    tempScorecardEntryData.approach = {
        ...tempScorecardEntryData.approach,
        dtgF9Average: parseInt((tempScorecardEntryData.approach.dtgF9 / (9 - tempScorecardEntryData.approach.f9Par5s)).toFixed(0)),
        dtgB9Average: parseInt((tempScorecardEntryData.approach.dtgB9 / (9 - tempScorecardEntryData.approach.b9Par5s)).toFixed(0)),
        dtgTotal: tempScorecardEntryData.approach.dtgF9 + tempScorecardEntryData.approach.dtgB9,
        dtgTotalAverage: parseInt(((tempScorecardEntryData.approach.dtgF9 + tempScorecardEntryData.approach.dtgB9) / (18 - tempScorecardEntryData.approach.f9Par5s - tempScorecardEntryData.approach.b9Par5s)).toFixed(0)),

        dtgF9Par5Average: parseInt((tempScorecardEntryData.approach.dtgF9Par5 / tempScorecardEntryData.approach.f9Par5s).toFixed(0)),
        dtgB9Par5Average: parseInt((tempScorecardEntryData.approach.dtgB9Par5 / tempScorecardEntryData.approach.b9Par5s).toFixed(0)),

        dtg2F9Par5Average: parseInt((parseInt(tempScorecardEntryData.approach.dtg2F9Par5) / parseInt(tempScorecardEntryData.approach.f9Par5s)).toFixed(0)),
        dtg2B9Par5Average: parseInt((parseInt(tempScorecardEntryData.approach.dtg2B9Par5) / parseInt(tempScorecardEntryData.approach.b9Par5s)).toFixed(0)),
        
        dtgTotalPar5Average: parseInt(parseInt(parseInt(tempScorecardEntryData.approach.dtgF9Par5) + parseInt(tempScorecardEntryData.approach.dtgB9Par5)) / parseInt(parseInt(tempScorecardEntryData.approach.f9Par5s) + parseInt(tempScorecardEntryData.approach.b9Par5s)).toFixed(0)),
        dtg2TotalPar5Average: parseInt(parseInt(parseInt(tempScorecardEntryData.approach.dtg2F9Par5) + parseInt(tempScorecardEntryData.approach.dtg2B9Par5)) / parseInt(parseInt(tempScorecardEntryData.approach.f9Par5s) + parseInt(tempScorecardEntryData.approach.b9Par5s)).toFixed(0))
    }


    // PUTTING 2/2 (reference below stats in PUTTING 1/2)
    tempScorecardEntryData.putting = {
        ...tempScorecardEntryData.putting,
        dthF9Average: parseInt((tempScorecardEntryData.putting.dthF9 / 9).toFixed(1)),
        dthB9Average: parseInt((tempScorecardEntryData.putting.dthB9 /9).toFixed(1)),
        dthTotalAverage: parseInt((tempScorecardEntryData.putting.dthTotal / 18).toFixed(1)),
        fpmTotalAverage: parseInt((tempScorecardEntryData.putting.fpmTotal / 18).toFixed(1)),
    }

    // SCORING
    // Set course par based on holes played
    let courseParBasedOnHolesPlayed = 0;
    // Full front 9
    if (tempScorecardEntryData.roundInfo.fullFront9) {
        if (tempScorecardEntryData.roundInfo.fullBack9) {
            courseParBasedOnHolesPlayed = activeScorecardEntryCourseInfo.par;
        } else {
            courseParBasedOnHolesPlayed = activeScorecardEntryCourseInfo.f9Par;
        }
    } else {
        courseParBasedOnHolesPlayed = activeScorecardEntryCourseInfo.b9Par;
    }
    // Currently not getting scoreToPar correctly, should be correct now
    tempScorecardEntryData.scoring = {
        ...tempScorecardEntryData.scoring,
        coursePar: courseParBasedOnHolesPlayed,
        underParRound: tempScorecardEntryData.scoring.scoreToPar < 0,
        total: tempScorecardEntryData.scoring.out + tempScorecardEntryData.scoring.in
    }

    // NON GHIN ROUNDS
    tempScorecardEntryData.nonGhinRounds = {
        scrambleRound: tempScorecardEntryData.roundInfo.roundNotes.includes("Scramble") ? true : false,
        leagueRound: tempScorecardEntryData.roundInfo.roundNotes.includes("League") ? true : false,
        legacyRound: tempScorecardEntryData.roundInfo.roundNotes.includes("Legacy") ? true : false,
        boozeRound: tempScorecardEntryData.roundInfo.roundNotes.includes("Booze") ? true : false, // justForFun round
    }

    return tempScorecardEntryData;
}