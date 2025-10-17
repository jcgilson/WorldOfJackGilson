import {
    calculateFairways,
    calculateGreens,
    calculatePuttLengths,
    calculateDthAndDtgTotals,

} from "./GolfFormatHelper";
const Excel = require('exceljs');

export const importFile = (
    file,
    setIsLoading,
    courses,
    yearFilter,
    setRoundYears,
    setHandicapCutoffRoundKey,
    setHandicap,
    setHandicapMetrics,
    setCourseInfo,
    setPuttingData,
    setAllRounds,
    setDisplayedRounds,
    handleUpdateSummaryRow,
    setTableSort,
    setDisplayUploadButton
) => {
    setIsLoading(true);

    // const file = e.target.files[0];

    if (file) {
        const filetype = file.name.split('.')[file.name.split('.').length - 1];
        if (filetype !== 'xlsx') {
            console.log("NOT AN EXCEL FILE")
            return;
        }
    }

    const excel = new Excel.Workbook();
    const reader = new FileReader();

    reader.readAsArrayBuffer(file);
    reader.onload = () => {
        const buffer = reader.result;
        excel.xlsx.load(buffer)
            .then(wkbk => {
                let courseData = {
                    // Sample course data:
                    // andersonGlen: {
                        // hole1: {
                            // par: 4,
                            // distance: 300,
                            // handicap: 1
                        // },
                        // ...
                        // f9Par: 36,
                        // f9Yardage: 3000,
                        // b9Par: 36,
                        // b9Yardage: 3000,
                        // par: 72,
                        // yardage: 6000
                    // }
                };
                let workSheets = {};
                for (let course of courses) {
                    workSheets[course.courseKey] = wkbk.getWorksheet(course.displayName);
                    if (!workSheets[course.courseKey]) {
                        console.log("Course name does not match worksheet:", course.displayName);
                        return;
                    }
                    const workSheetData = workSheets[course.courseKey].getRow(2).values;
                    courseData[course.courseKey] = {};
                    courseData[course.courseKey].displayName = course.displayName;
                    let column = 2; // Data starts on line 2
                    for (let hole = 1; hole <= 18; hole++ ) {
                        courseData[course.courseKey][`hole${hole}`] = {};
                        courseData[course.courseKey][`hole${hole}`].hole = parseInt(hole);
                        courseData[course.courseKey][`hole${hole}`].par = parseInt(workSheetData[column]);
                        courseData[course.courseKey][`hole${hole}`].distance = parseInt(workSheetData[column + 1]);
                        courseData[course.courseKey][`hole${hole}`].handicap = parseInt(workSheetData[column + 2]);

                        // F9/B9 Yardage and Par
                        if (hole <= 9) {
                            if (hole === 1) {
                                courseData[course.courseKey].f9Par = parseInt(workSheetData[column]);
                                courseData[course.courseKey].f9Yardage = parseInt(workSheetData[column + 1]);
                            } else {
                                courseData[course.courseKey].f9Par += parseInt(workSheetData[column]);
                                courseData[course.courseKey].f9Yardage += parseInt(workSheetData[column + 1]);
                            }
                        } else {
                            if (hole === 10) {
                                courseData[course.courseKey].b9Par = parseInt(workSheetData[column]);
                                courseData[course.courseKey].b9Yardage = parseInt(workSheetData[column + 1]);
                            } else {
                                courseData[course.courseKey].b9Par += parseInt(workSheetData[column]);
                                courseData[course.courseKey].b9Yardage += parseInt(workSheetData[column + 1]);
                            }
                        }
                        column = column + 7; // Skip empty columns
                    }

                    // Total par and yardages
                    courseData[course.courseKey].par = courseData[course.courseKey].f9Par + courseData[course.courseKey].b9Par;
                    courseData[course.courseKey].yardage = courseData[course.courseKey].f9Yardage + courseData[course.courseKey].b9Yardage;
                }

                let allPutts = [];
                let allHoles = [];
                let allRounds = [];
                for (let course of courses) {
                    workSheets[course.courseKey].eachRow((row, rowNumber) => {
                        if (rowNumber > 3) { // Excel data starts on row 4
                            // Round data
                            const row = workSheets[course.courseKey].getRow(rowNumber).values;
                            // let roundData = {
                            //     // Round details
                            //     sequence: parseInt(row[1].split("\n")[row[1].split("\n").length - 1]),
                            //     key: `${course.courseKey}${rowNumber - 1}`,
                            //     course: course.displayName,
                            //     courseKey: course.courseKey,
                            //     date: row[1].split("\n")[0],
                            //     formattedDate: new Date(row[1].split("\n")[0]),
                            //     scrambleRound: row[1].split("\n").includes("Scramble"),
                            //     leagueRound: row[1].split("\n").includes("League"),
                            //     legacyRound: row[1].split("\n").includes("Legacy"),
                            //     boozeRound: row[1].split("\n").includes("Booze"),
                            //     numHoles: 0,
                            //     // Round metrics
                            //     f9Putts: 0,
                            //     b9Putts: 0,
                            //     putts: 0,
                            //     num3Putts: 0,
                            //     f9PuttTotal: 0,
                            //     b9PuttTotal: 0,
                            //     out: 0,
                            //     in: 0,
                            //     total: 0,
                            //     // DTG, FPM, DTH for averages
                            //     // F9
                            //     dtgF9Total: 0,
                            //     dthF9Total: 0,
                            //     fpmF9Total: 0,
                            //     // B9
                            //     dtgB9Total: 0,
                            //     dthB9Total: 0,
                            //     fpmB9Total: 0,
                            //     // Total
                            //     dtgTotal: 0,
                            //     dthTotal: 0,
                            //     fpmTotal: 0,
                            //     // Averages
                            //     dtgF9Average: 0,
                            //     dtgB9Average: 0,
                            //     dtgTotalAverage: 0,
                            //     dthF9Average: 0,
                            //     dthB9Average: 0,
                            //     dthTotalAverage: 0,
                            //     fpmF9Average: 0,
                            //     fpmB9Average: 0,
                            //     fpmTotalAverage: 0,
                            //     // Cumulative scores
                            //     numEagles: 0,
                            //     numBirdies: 0,
                            //     numPars: 0,
                            //     numBogey: 0,
                            //     numBogeyPlus: 0,
                            //     // Total Score
                            //     coursePar: 0,
                            //     scoreToPar: 0
                            // };

                            let roundData = {
                                // Round details
                                roundInfo: {
                                    // sequence: parseInt(row[1].split("\n")[row[1].split("\n").length - 1]), // dont use for now, should calculate on the fly
                                    key: `${course.courseKey}${rowNumber - 3}`, // key should account for 3 rows atop excel sheet
                                    course: course.displayName,
                                    courseKey: course.courseKey,
                                    date: row[1].split("\n")[0],
                                    // formattedDate: new Date(row[1].split("\n")[0]),
                                    numHoles: 0,
                                    fullFront9: false,
                                    fullBack9: false,
                                    partialFront9: false,
                                    partialBack9: false
                                },
                                nonGhinRounds: {
                                    scrambleRound: row[1].split("\n").includes("Scramble"),
                                    leagueRound: row[1].split("\n").includes("League"),
                                    legacyRound: row[1].split("\n").includes("Legacy"),
                                    boozeRound: row[1].split("\n").includes("Booze"), // justForFun round
                                },
                                // Round metrics
                                putting: {
                                    f9Putts: 0,
                                    b9Putts: 0,
                                    putts: 0,
                                    num3Putts: 0,
                                    num3PuttsF9: 0,
                                    num3PuttsB9: 0,
                                    // These should be covered by f9Putts and b9Putts
                                    // f9PuttTotal: 0,
                                    // b9PuttTotal: 0,
                                    
                                    // dthF9Average: 0, // Not used?
                                    // dthB9Average: 0, // Not used?
                                    // dthTotalAverage: 0, // Not used?
                                    fpmF9Total: 0,
                                    fpmB9Total: 0,
                                    fpmTotal: 0,
                                    // fpmF9Average: 0, // Not used?
                                    // fpmB9Average: 0, // Not used?
                                    // fpmTotalAverage: 0, // Not used?
                                    dthF9Total: 0,
                                    dthB9Total: 0,
                                    dthTotal: 0,

                                    puttLengthF9: 0,
                                    puttLengthB9: 0,
                                    puttLengthTotal: 0
                                },
                                approach: {
                                    // dtgF9Total: 0,
                                    // dtgB9Total: 0,
                                    // dtgTotal: 0,
                                    // dtgF9Average: 0, // Not used?
                                    // dtgB9Average: 0, // Not used?
                                    // dtgTotalAverage: 0, // Not used?

                                    // Changing to separate P5 stats
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
                                },
                                scoring: {
                                    // IN/OUT/Total
                                    out: 0,
                                    in: 0,
                                    total: 0,
                                    // Cumulative scores
                                    numEagles: 0,
                                    numBirdies: 0,
                                    numPars: 0,
                                    numBogey: 0,
                                    numBogeyPlus: 0,
                                    // +/-
                                    coursePar: 0,
                                    scoreToPar: 0,
                                    underParRound: false
                                },
                            };

                            if (roundData.nonGhinRounds.leagueRound) roundData.netScore = 0;

                            let columnCount = 2;
                            const holeCount =  workSheets[course.courseKey].getRow(3).values[65] === "Additional Hole #1 Course" ? 9 : 18; // Determine if 9/18 hole course
                            for (let hole = 1; hole <= holeCount ; hole++) {
                                if (row[columnCount] && row[columnCount] !== "") {
                                    roundData.roundInfo.numHoles++;

                                    let score = (roundData.nonGhinRounds.scrambleRound || (roundData.nonGhinRounds.leagueRound && typeof row[columnCount] === 'string'))? parseInt(row[columnCount].split(", ")[0]) : parseInt(row[columnCount]);
                                    let holePar = parseInt(courseData[course.courseKey][`hole${hole}`].par);

                                    if (score === 1) roundData.scoring.underParRound = true;
                                    if (holePar >= score + 2) roundData.scoring.numEagles++; // Eagle
                                    if (holePar === score + 1) roundData.scoring.numBirdies++; // Birdie
                                    if (holePar === score) roundData.scoring.numPars++; // Par
                                    if (holePar === score - 1) roundData.scoring.numBogey++; // Bogey
                                    if (holePar <= score - 2) roundData.scoring.numBogeyPlus++; // Bogey Plus

                                    roundData.scoring.coursePar = roundData.scoring.coursePar + parseInt(holePar);
                                    roundData.scoring.scoreToPar =  roundData.scoring.scoreToPar + score - parseInt(holePar);

                                    // Debugging
                                    // console.log("typeof", parseInt(row[columnCount + 5].split(", ")[0]))
                                    // console.log("row[columnCount + 5]",row[columnCount + 5])
//                                     console.log("roundData.key:", roundData.roundInfo.key, "\nhole:", hole, "\nvalue:", row[columnCount + 5])

//                                     if (!roundData.nonGhinRounds.legacyRound && typeof parseInt(row[columnCount + 5]) !== "number" && typeof parseInt(row[columnCount + 5].split(", ")[0]) !== "number") {
//                                         console.log(`INVALID FPM VALUE FOR ROUND ${roundData.roundInfo.key} HOLE ${hole}`, parseInt(row[columnCount + 5].split(", ")[0]),"")
//                                     }
                                    
// console.log("dtg typeof parseInt(row[columnCount + 4]) === number ? parseInt(row[columnCount + 4]) : parseInt(row[columnCount + 4].split()[0])", typeof parseInt(row[columnCount + 4]) === "number" ? parseInt(row[columnCount + 4]) : parseInt(row[columnCount + 4].split(", ")[0]))
// console.log("dtg2 typeof parseInt(row[columnCount + 4]) === number ? parseInt(row[columnCount + 4]) : parseInt(row[columnCount + 4].split()[1]", typeof parseInt(row[columnCount + 4]) === "number" ? parseInt(row[columnCount + 4]) : parseInt(row[columnCount + 4].split(", ")[1]))
// console.log("dth roundData.nonGhinRounds.legacyRound && !row[columnCount + 5] ? null : typeof parseInt(row[columnCount + 5]) === number ? parseInt(row[columnCount + 5]) : parseInt(row[columnCount + 5].split()[0])", roundData.nonGhinRounds.legacyRound && !row[columnCount + 5] ? null : typeof parseInt(row[columnCount + 5]) === "number" ? parseInt(row[columnCount + 5]) : parseInt(row[columnCount + 5].split(", ")[0]))
// console.log("puttLength roundData.nonGhinRounds.legacyRound && !row[columnCount + 5] ? null : typeof parseInt(row[columnCount + 5]) === number ? parseInt(row[columnCount + 5]) : parseInt(row[columnCount + 5].split()[row[columnCount + 5].split().length - 1])", roundData.nonGhinRounds.legacyRound && !row[columnCount + 5] ? null : typeof parseInt(row[columnCount + 5]) === "number" ? parseInt(row[columnCount + 5]) : parseInt(row[columnCount + 5].split(", ")[row[columnCount + 5].split(", ").length - 1]))


// evaluate if values include "," - not typeof === "number"
                                    // console.log("row[columnCount + 4]",row[columnCount + 4] )


                                    // console.log("\nroundData",roundData)
                                    // console.log("hole",hole)
                                    // console.log("row", row)

                                    // Single hole data
                                    roundData[`hole${hole}`] = {
                                        score: parseInt(score),
                                        putts: roundData.nonGhinRounds.legacyRound && !row[columnCount + 1] ? null : parseInt(row[columnCount + 1]),
                                        fir: roundData.nonGhinRounds.legacyRound && !row[columnCount + 2] ? null : row[columnCount + 2],
                                        gir: roundData.nonGhinRounds.legacyRound && !row[columnCount + 3] ? null : row[columnCount + 3],
                                        dtg: typeof row[columnCount + 4] === "number" || (typeof row[columnCount + 4] !== "number" && !row[columnCount + 4].includes(",")) ? parseInt(row[columnCount + 4]) : parseInt(row[columnCount + 4].split(", ")[0]),
                                        dtg2: typeof row[columnCount + 4] === "number" || (typeof row[columnCount + 4] !== "number" && !row[columnCount + 4].includes(",")) ? parseInt(row[columnCount + 4]) : parseInt(row[columnCount + 4].split(", ")[1]),// For use on Par 5's only
                                        dth: roundData.nonGhinRounds.legacyRound && !row[columnCount + 5] ? null : typeof row[columnCount + 5] === "number" || (typeof row[columnCount + 5] !== "number" && !row[columnCount + 5].includes(",")) ? parseInt(row[columnCount + 5]) : parseInt(row[columnCount + 5].split(", ")[0]),
                                        puttLength: roundData.nonGhinRounds.legacyRound && !row[columnCount + 5] ? null : typeof row[columnCount + 5] === "number" || (typeof row[columnCount + 5] !== "number" && !row[columnCount + 5].includes(",")) ? parseInt(row[columnCount + 5]) : parseInt(row[columnCount + 5].split(", ")[row[columnCount + 5].split(", ").length - 1]),
                                        notes: roundData.nonGhinRounds.legacyRound && !row[columnCount + 6] ? null : row[columnCount + 6] ? row[columnCount + 6] : ""
                                    }

                                    if ((roundData.sequence > 8 || parseInt(row[columnCount + 1]) === 0 || parseInt(row[columnCount + 1]) === 1) && !roundData.nonGhinRounds.scrambleRound && !roundData.nonGhinRounds.leagueRound && !(roundData.nonGhinRounds.legacyRound && !row[columnCount + 1])) {
                                        allPutts.push({
                                            round: `${course.courseKey}${rowNumber - 1}`,
                                            date: row[1].split("\n")[0],
                                            putts: row[columnCount + 1],
                                            dth: roundData[`hole${hole}`].dth,
                                            fpm: roundData[`hole${hole}`].puttLength,
                                            gir: roundData[`hole${hole}`].gir,
                                            scoreToPar: score - holePar
                                        });
                                    }

                                    // Scramble rounds
                                    if (roundData.nonGhinRounds.scrambleRound) {
                                        roundData[`hole${hole}`].scrambleString = row[columnCount].split(", ")[1];
                                    }

                                    // League rounds
                                    if (roundData.nonGhinRounds.leagueRound) {
                                        if (typeof row[columnCount] === 'string') {
                                            roundData.netScore = roundData.netScore + parseInt(row[columnCount].split(", ")[1]);
                                            roundData[`hole${hole}`].netScore = parseInt(row[columnCount].split(", ")[1]);
                                        } else {
                                            roundData.netScore = roundData.netScore + row[columnCount];
                                            roundData[`hole${hole}`].netScore = row[columnCount];
                                        }
                                    }

                                    const roundDataHole = roundData[`hole${hole}`];
                                    const holeDtg = roundDataHole.dtg;
                                    const holeDtg2 = holePar == 5 ? roundDataHole.dtg2 : 0;

                                    // F9/B9 data
                                    if (hole < 10) {
                                        if (holePar == 5) {
                                            roundData.approach.f9Par5s = parseInt(roundData.approach.f9Par5s) + 1;
                                            roundData.approach.dtgF9Par5 = parseInt(roundData.approach.dtgF9Par5) + holeDtg;
                                            // TODO: will need to take into account when Par 5 is G-1, don't need to add distance to totals
                                            roundData.approach.dtg2F9Par5 = parseInt(roundData.approach.dtg2F9Par5) + holeDtg2;
                                            if (roundDataHole.gir !== "G-1") {
                                                roundData.approach.dtgF9Gur = parseInt(roundData.approach.dtgF9Gur) + 1;
                                            }
                                        } else {
                                            roundData.approach.dtgF9 = parseInt(roundData.approach.dtgF9) + holeDtg;
                                        }
                                        roundData.scoring.out = roundData.scoring.out + score;
                                        roundData.putting.f9Putts = roundData.putting.f9Putts + parseInt(row[columnCount + 1]);
                                        if (!(roundData.nonGhinRounds.legacyRound && !row[columnCount + 1]) && row[columnCount + 1] > 2) roundData.putting.num3PuttsF9 = roundData.putting.num3PuttsF9 + 1;

                                        // DTG, FPM, DTH totals for averages (DTG uses number closest to green)
                                        roundData.putting.fpmF9Total = roundData.putting.fpmF9Total + (typeof row[columnCount + 5] === "number" ? row[columnCount + 5] : parseInt(row[columnCount + 5].split(", ")[row[columnCount + 5].split(", ").length - 1]));
                                        roundData.putting.fpmTotal = roundData.putting.fpmTotal + (typeof row[columnCount + 5] === "number" ? row[columnCount + 5] : parseInt(row[columnCount + 5].split(", ")[row[columnCount + 5].split(", ").length - 1]));
                                        roundData.putting.dthF9Total = roundData.putting.dthF9Total + (typeof row[columnCount + 5] === "number" ? row[columnCount + 5] : parseInt(row[columnCount + 5].split(", ")[0]));
                                        roundData.putting.dthTotal = roundData.putting.dthTotal + (typeof row[columnCount + 5] === "number" ? row[columnCount + 5] : parseInt(row[columnCount + 5].split(", ")[0]));
                                    } else {
                                        if (holePar == 5) {
                                            roundData.approach.b9Par5s = parseInt(roundData.approach.b9Par5s) + 1;
                                            roundData.approach.dtgB9Par5 = parseInt(roundData.approach.dtgB9Par5) + holeDtg;
                                            // TODO: will need to take into account when Par 5 is G-1, don't need to add distance to totals
                                            roundData.approach.dtg2B9Par5 = parseInt(roundData.approach.dtg2B9Par5) + holeDtg2;
                                            if (roundDataHole.gir !== "G-1") {
                                                roundData.approach.dtgB9Gur = parseInt(roundData.approach.dtgB9Gur) + 1;
                                            }
                                        } else {
                                            roundData.approach.dtgB9 = parseInt(roundData.approach.dtgB9) + holeDtg;
                                        }
                                        roundData.scoring.in = roundData.scoring.in + score;
                                        roundData.putting.b9Putts = roundData.putting.b9Putts + parseInt(row[columnCount + 1]);
                                        if (!(roundData.nonGhinRounds.legacyRound && !row[columnCount + 1]) && parseInt(row[columnCount + 1]) > 2) roundData.putting.num3PuttsB9 = roundData.putting.num3PuttsB9 + 1;

                                        // DTG, FPM, DTH totals for averages (DTG uses number closest to green)
                                        roundData.putting.fpmB9Total = roundData.putting.fpmB9Total + (typeof row[columnCount + 5] === "number" ? row[columnCount + 5] : parseInt(row[columnCount + 5].split(", ")[row[columnCount + 5].split(", ").length - 1]));
                                        roundData.putting.fpmTotal = roundData.putting.fpmTotal + (typeof row[columnCount + 5] === "number" ? row[columnCount + 5] : parseInt(row[columnCount + 5].split(", ")[row[columnCount + 5].split(", ").length - 1]));
                                        roundData.putting.dthB9Total = roundData.putting.dthB9Total + (typeof row[columnCount + 5] === "number" ? row[columnCount + 5] : parseInt(row[columnCount + 5].split(", ")[0]));
                                        roundData.putting.dthTotal = roundData.putting.dthTotal + (typeof row[columnCount + 5] === "number" ? row[columnCount + 5] : parseInt(row[columnCount + 5].split(", ")[0]));
                                    }
                                    roundData.scoring.total = roundData.scoring.total + score;
                                    roundData.putting.putts = roundData.putting.putts + parseInt(row[columnCount + 1]);
                                    if (!(roundData.nonGhinRounds.legacyRound && !row[columnCount + 1]) && parseInt(row[columnCount + 1]) > 2) roundData.putting.num3Putts = roundData.putting.num3Putts + 1;

                                    // CTP for Par 3's (first 8 rounds)
                                    const isPar3 = holePar === 3;
                                    if (
                                        isPar3 &&
                                        (row[columnCount + 3] === 'G' || row[columnCount + 3] === 'G-1') &&
                                        (roundData.sequence >= 9 || parseInt(row[columnCount + 1]) === 0 || parseInt(row[columnCount + 1]) === 1) // Started capturing DTH on 9th round of year, can still contribute if 0 or 1 putted
                                    ) {
                                        roundData[`hole${hole}`].dth = typeof row[columnCount + 5] === "number" ? row[columnCount + 5] : parseInt(row[columnCount + 5].split(", ")[0]);
                                    }
                                }
                                columnCount = columnCount + 7; // 7 more columns of data added
                            }

                            roundData.roundInfo.fullFront9 = roundData.hole1 && roundData.hole2 && roundData.hole3 && roundData.hole4 && roundData.hole5 && roundData.hole6 && roundData.hole7 && roundData.hole8 && roundData.hole9 ? true : false;
                            roundData.roundInfo.fullBack9 = roundData.hole10 && roundData.hole11 && roundData.hole12 && roundData.hole13 && roundData.hole14 && roundData.hole15 && roundData.hole16 && roundData.hole17 && roundData.hole18 ? true : false;
                            roundData.roundInfo.partialFront9 = !roundData.roundInfo.fullFront9 && (roundData.hole1 || roundData.hole2 || roundData.hole3 || roundData.hole4 || roundData.hole5 || roundData.hole6 || roundData.hole7 || roundData.hole8 || roundData.hole9) ? true : false;
                            roundData.roundInfo.partialBack9 = !roundData.roundInfo.fullBack9 && (roundData.hole10 || roundData.hole11 || roundData.hole12 || roundData.hole13 || roundData.hole14 || roundData.hole15 || roundData.hole16 || roundData.hole17 || roundData.hole18) ? true : false;
                            
                            roundData.approach = {
                                ...roundData.approach,
                                dtgF9Average: parseInt((roundData.approach.dtgF9 / (9 - roundData.approach.f9Par5s)).toFixed(0)),
                                dtgB9Average: parseInt((roundData.approach.dtgB9 / (9 - roundData.approach.b9Par5s)).toFixed(0)),
                                dtgTotal: parseInt(roundData.approach.dtgF9) + parseInt(roundData.approach.dtgB9),
                                dtgTotalAverage: parseInt(((roundData.approach.dtgF9 + roundData.approach.dtgB9) / (18 - roundData.approach.f9Par5s - roundData.approach.b9Par5s)).toFixed(0)),
                        
                                dtgF9Par5Average: parseInt((roundData.approach.dtgF9Par5 / roundData.approach.f9Par5s).toFixed(0)),
                                dtgB9Par5Average: parseInt((roundData.approach.dtgB9Par5 / roundData.approach.b9Par5s).toFixed(0)),
                        
                                dtg2F9Par5Average: parseInt(parseInt(roundData.approach.dtg2F9Par5) / parseInt(roundData.approach.f9Par5s).toFixed(0)),
                                dtg2B9Par5Average: parseInt(parseInt(roundData.approach.dtg2B9Par5) / parseInt(roundData.approach.b9Par5s).toFixed(0)),
                                
                                dtgTotalPar5Average: parseInt(parseInt(parseInt(roundData.approach.dtgF9Par5) + parseInt(roundData.approach.dtgB9Par5)) / parseInt(parseInt(roundData.approach.f9Par5s) + parseInt(roundData.approach.b9Par5s)).toFixed(0)),
                                dtg2TotalPar5Average: parseInt(parseInt(parseInt(roundData.approach.dtg2F9Par5) + parseInt(roundData.approach.dtg2B9Par5)) / parseInt(parseInt(roundData.approach.f9Par5s) + parseInt(roundData.approach.b9Par5s)).toFixed(0))
                            }

                            // Putting
                            // roundData.putting.dthF9Average = roundData.roundInfo.fullFront9 ? parseInt(roundData.putting.dthF9Total / 9).toFixed(0) : "-";
                            // roundData.putting.dthB9Average = roundData.roundInfo.fullBack9 ? parseInt(roundData.putting.dthB9Total / 9).toFixed(0) : "-";
                            roundData.putting.dthTotalAverage = roundData.roundInfo.fullFront9 && roundData.roundInfo.fullBack9 ? parseInt((roundData.putting.dthTotal / 18).toFixed(0)) : "-";
                            // roundData.putting.fpmF9Average = roundData.roundInfo.fullFront9 ? parseInt(roundData.putting.fpmF9Total / 9).toFixed(0) : "-";
                            // roundData.putting.fpmB9Average = roundData.roundInfo.fullBack9 ? parseInt(roundData.putting.fpmB9Total / 9).toFixed(0) : "-";
                            roundData.putting.fpmTotalAverage = roundData.roundInfo.fullFront9 && roundData.roundInfo.fullBack9 ? parseInt((roundData.putting.fpmTotal / 18).toFixed(0)) : "-";

                            if (roundData.roundInfo.fullFront9 && roundData.roundInfo.fullBack9 && roundData.scoring.scoreToPar < 0) {
                                roundData.scoring.underParRound = true;
                            }

                            // Additional Holes
                            const additionalHoleCount = holeCount === 18 ? 128 : 65; // Determine which column additional holes are being recorded
                            if (row[additionalHoleCount]) { // First column for additional holes
                                roundData.additionalHoles = {};
                                let holeCount = 1;
                                let columnCount = additionalHoleCount;
                                for (let i = 0; i < 9; i++) {
                                    if (row[columnCount]) {
                                        roundData.additionalHoles[`additionalHole${holeCount}`] = {
                                            course: row[columnCount],
                                            courseKey: course.courseKey,
                                            scoreCardHoleAbbreviation: courses.filter(course => course.displayName === row[columnCount]).scoreCardHoleAbbreviation,
                                            hole: row[columnCount + 1],
                                            score: parseInt(row[columnCount + 2]),
                                            putts: parseInt(row[columnCount + 3]),
                                            fir: row[columnCount + 4],
                                            gir: row[columnCount + 5],
                                            dtg: row[columnCount + 6],
                                            dth: typeof row[columnCount + 7] === "number" ? row[columnCount + 7] : parseInt(row[columnCount + 7].split(", ")[0]),
                                            puttLength: typeof row[columnCount + 7] === "number" ? row[columnCount + 7] : parseInt(row[columnCount + 7].split(", ")[row[columnCount + 7].split(", ").length - 1]),
                                            notes: row[columnCount + 8] ? row[columnCount + 8] : ""
                                        }
                                        columnCount = columnCount + 9;
                                        holeCount++;
                                    }
                                }
                            }

                            // Cumulative data
                            // console.log("roundData.roundInfo.formattedDate",roundData.roundInfo.formattedDate)
                            // console.log("roundData.roundInfo.formattedDate[0]",roundData.roundInfo.formattedDate[0])
                            // setRoundYears(roundYears.push(roundData.roundInfo.formattedDate))

                            // console.log("roundData",roundData)




                            

                            if (!roundData.nonGhinRounds.legacyRound) {
                                const fairways = calculateFairways(roundData);
                                roundData.fairways = fairways;
    
                                const greens = calculateGreens(roundData);
                                roundData.greens = greens;
    
                                const puttLengths = calculatePuttLengths(roundData);
                                roundData.putting.puttLengthTotal = puttLengths.total;
                                roundData.putting.puttLengthF9 = puttLengths.f9;
                                roundData.putting.puttLengthB9 = puttLengths.b9;

                                const dthAndDtgTotals = calculateDthAndDtgTotals(roundData);
                                roundData.putting.dthTotal = dthAndDtgTotals.dthTotals.total;
                                roundData.putting.dthF9 = dthAndDtgTotals.dthTotals.f9;
                                roundData.putting.dthB9 = dthAndDtgTotals.dthTotals.b9;
                                roundData.approach.dtgTotal = dthAndDtgTotals.dtgTotals.total;
                                roundData.approach.dtgF9 = dthAndDtgTotals.dtgTotals.f9;
                                roundData.approach.dtgB9 = dthAndDtgTotals.dtgTotals.b9;
                            }

                            allRounds.push(roundData);
                        }
                    });
                }

                console.log("allRounds",allRounds)

                // Sort rounds by descending date
                allRounds.sort(function(a, b){
                    const aDate = a.roundInfo.date.split('/');
                    const aYear = parseInt(aDate[2]);
                    const aMonth = parseInt(aDate[0]);
                    const aDay = parseInt(aDate[1]);

                    const bDate = b.roundInfo.date.split('/');
                    const bYear = parseInt(bDate[2]);
                    const bMonth = parseInt(bDate[0]);
                    const bDay = parseInt(bDate[1]);

                    let order = 0;
                    if (aYear > bYear) {
                        order = -1;
                    } else if (aYear === bYear) {
                        if (aMonth > bMonth) {
                            order = -1;
                        } else if (aMonth === bMonth) {
                            if (aDay > bDay) {
                                order = -1;
                            }
                        }
                    }

                    return order
                });
                let sequence = 1;
                for (let round of allRounds) {
                    round.roundInfo.sequence = allRounds.length + 1 - sequence;
                    sequence++;
                }
                console.log("allRounds after upload should contain sequences in order:", allRounds)


                // Filter by yearFilter state
                const displayedRounds = [];
                if (typeof yearFilter === "number") {
                    for (let round of allRounds) {
                        const yearSuffix = round.roundInfo.date.split("/")[2]
                        if ((2000 + parseInt(yearSuffix)) == yearFilter) {
                            displayedRounds.push(round)
                        }
                    }
                }

                // Set handicap
                const roundsSortedByDate = allRounds.sort(function(a,b) { return ( a.sequence < b.sequence ? 1 : a.sequence > b.sequence ? -1 : 0); });
                let handicapRounds = [];
                let tempRoundYears = [];
                for (let round of roundsSortedByDate) {
                    let splitRoundDate = round.roundInfo.date.split("/");
                    let roundYear = splitRoundDate[2];
                    if (!tempRoundYears.includes(roundYear)) tempRoundYears.push(roundYear);
                    if (handicapRounds.length < 20 && round.roundInfo.fullFront9 && round.roundInfo.fullBack9 && !round.roundInfo.key.includes("Par3") && !round.nonGhinRounds.boozeRound) handicapRounds.push(round);
                }
                setRoundYears(tempRoundYears);

                // Set bottom border for last eligible handicap round
                const handicapRoundsSortedBySequence = handicapRounds.sort(function(a,b) { return ( a.sequence < b.sequence ? 1 : a.sequence > b.sequence ? -1 : 0); });
                setHandicapCutoffRoundKey(handicapRoundsSortedBySequence[19].key);
                
                const sortedHandicapRounds = handicapRounds.sort(function(a,b) { return ( a.scoring.scoreToPar > b.scoring.scoreToPar ? 1 : a.scoring.scoreToPar < b.scoring.scoreToPar ? -1 : 0); });
                let countedHandicapRounds = sortedHandicapRounds.slice(0,8);
                
                // Handicap rounds summary
                let handicapRoundMetics = {
                    handicapRoundScoresToPar: 0,
                    handicapRoundPutts: 0,
                    handicapRoundFirs: 0,
                    handicapRoundGirs: 0,
                    handicapRoundFpm: 0,
                    handicapRoundBirdies: 0,
                    handicapRoundBogeyPlus: 0
                }
                
                let handicapScoreToParTotal = 0;
                let handicapRoundKeys = [];
                for (let round of countedHandicapRounds) {
                    if (!round.nonGhinRounds.legacyRound) {
                        handicapScoreToParTotal += round.scoring.scoreToPar;
                        handicapRoundKeys.push(round.roundInfo.key);

                        // Handicap round data
                        handicapRoundMetics.handicapRoundScoresToPar = handicapRoundMetics.handicapRoundScoresToPar + round.scoring.scoreToPar;
                        handicapRoundMetics.handicapRoundPutts = handicapRoundMetics.handicapRoundPutts + round.putting.putts;
                        handicapRoundMetics.handicapRoundFirs = handicapRoundMetics.handicapRoundFirs + round.fairways.f;
                        handicapRoundMetics.handicapRoundGirs = handicapRoundMetics.handicapRoundGirs + (round.greens.g + round.greens.gur);
                        handicapRoundMetics.handicapRoundFpm = handicapRoundMetics.handicapRoundFpm + round.putting.puttLengthTotal;
                        handicapRoundMetics.handicapRoundBirdies = handicapRoundMetics.handicapRoundBirdies + (round.scoring.numBirdies + round.scoring.numEagles);
                        handicapRoundMetics.handicapRoundBogeyPlus = handicapRoundMetics.handicapRoundBogeyPlus + round.scoring.numBogeyPlus;
                    }
                }
                setHandicap((handicapScoreToParTotal / 8).toFixed(1));
                setHandicapMetrics(handicapRoundMetics);

                for (let round of allRounds) {
                    if (handicapRoundKeys.includes(round.roundInfo.key)) round.handicapRound = true;
                }

                // Format Excel worksheet data into Array of Objects
                const courseDataArray = [];
                for (let course of Object.keys(courseData)) {
                    courseDataArray.push({...courseData[course], courseKey: course})
                }
                setCourseInfo(courseDataArray);
                
                setPuttingData(allPutts);
                
                // console.log("allRounds",allRounds)
                setAllRounds(allRounds);
                setDisplayedRounds(displayedRounds);
                console.log("3 calling handleUpdateSummaryRow")
                handleUpdateSummaryRow(displayedRounds)
                setTableSort({ method: 'sequence', order: 'descending' });
            });
        };
    setDisplayUploadButton(false);
    setIsLoading(false);
}