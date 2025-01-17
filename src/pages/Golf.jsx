import React, { useState, useEffect, useRef } from "react";
// Components
import GolfUploadButton from '../components/GolfUploadButton';
import GolfTable from '../components/GolfTable';
import GolfRoundsFilter from '../components/GolfRoundsFilter';
import PageLinks from '../components/PageLinks';
import ScorecardEntry from '../components/ScorecardEntry';
import ScorecardHelpModal from '../components/ScorecardHelpModal';
// MUI
import {
    TableBody, TableRow, TableCell, FormControl, CircularProgress, InputLabel, MenuItem, Select,
    ListItemText, Checkbox, Modal, Paper, Card, CardContent, Snackbar
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { Close } from '@mui/icons-material';
// Tools
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
// CSS
import "../shared.css"
// Helpers
import { golfRoundMetricHelper } from "../helpers/GolfRoundMetricHelper";
import { importFile } from "../helpers/ImportFileHelper";
import { createScorecard, calculateStats, courseSummary } from "../helpers/GolfFormatHelper";
import { courses } from "../helpers/GolfConsts";
const Excel = require('exceljs');

const Golf = () => {

    /**
     * Start scripts
     * npm start
     * 
     * Server:
     * cd server
     * node server.js
     * 
     * Redeploy:
     * npm run deploy
     * 
     */



        // Remove any attributes from existing scorecards if needed BEFORE upload
    // Enter scorecards
    // Begin refactor
        // Documentation of every function's purpose
        // Begin removing unused code/comments
        // Refactor and functions to simplify
    // Store previously saved info to DB (this will also be used for eventual golf leaderboards from rapidapi)
    // Publish site, connect DB
    // Remove logs/code clean-up
    // Complete documentation
    // Allow course info to be entered



    //  Configurable state
    const [activePage, setActivePage] = useState('Golf Rounds');
    const [yearFilter, setYearFilter] = useState(2024); // Can set default year here

    // Internal state
    const [displayUploadButton, setDisplayUploadButton] = useState(true);
    const [filters, setFilters] = useState(["2024"]);
    const [courseTours, setCourseTours] = useState(["South Suburban"]); // "Course Tour" tab shows "hole course by default"
    const [isLoading, setIsLoading] = useState(false);
    const [allRounds, setAllRounds] = useState([]);
    const [displayedRounds, setDisplayedRounds] = useState([]);
    const [courseInfo, setCourseInfo] = useState([]);
    const [roundYears, setRoundYears] = useState([]);
    const [tableSort, setTableSort] = useState({ method: 'date', order: 'descending' });
    const [activeRounds, setActiveRounds] = useState([]);
    const [activeScorecardEntry, setActiveScorecardEntry] = useState("southSuburban"); // Should make a variable "home course" to be reused in a number of places including scorecard entry, course tour
    const [activeScorecardEntryCourseInfo, setActiveScorecardEntryCourseInfo] = useState({});
    const [scorecardEntryData, setScorecardEntryData] = useState({});
    const [expandScorecard, setExpandScorecard] = useState(true);
    const [toggleCourseInfo, setToggleCourseInfo] = useState(false);
    const [expandSingleHoleMetric, setExpandSingleHoleMetric] = useState({ hole: "", expanded: false });
    const [puttingData, setPuttingData] = useState({});
    const [displayHelpModal, setDisplayHelpModal] = useState(false);
    const [handicap, setHandicap] = useState(0);
    const [handicapMetrics, setHandicapMetrics] = useState({});
    const [displayedRoundsToggle, setDisplayedRoundsToggle] = useState(false);
    const [approachView, setApproachView] = useState("distribution");
    const [displayLegacyFilterWarning, setDisplayLegacyFilterWarning] = useState(false);
    const [handicapCutoffRoundKey, setHandicapCutoffRoundKey] = useState("");
    const [filterableCourses, setFilterableCourses] = useState(['South Suburban']);
    const [editingExistingScorecard, setEditingExistingScorecard] = useState(false);

    const [displayedNumberOfRounds, setDisplayedNumberOfRounds] = useState(0);
    const [displayedHoles, setDisplayedHoles] = useState(0);
    const [displayedCourses, setDisplayedCourses] = useState(0);
    const [displayedScoringAverage, setDisplayedScoringAverage] = useState("");
    const [displayedPutts, setDisplayedPutts] = useState(0);
    const [displayedF, setDisplayedF] = useState("");
    const [displayedG, setDisplayedG] = useState("");
    const [displayedFPM, setDisplayedFPM] = useState("");
    const [displayedBirdies, setDisplayedBirdies] = useState("");
    const [displayedBogeyPlus, setDisplayedBogeyPlus] = useState("");
    const [scorecardRoundConfig, setScorecardRoundConfig] = useState("");
    const [selectedScorecardOptions, setSelectedScorecardOptions] = useState([{title: "18 Holes"}]);
    const [previouslySelectedScorecardOptions, setPreviouslySelectedScorecardOptions] = useState([]);
    const [displayScorecard9HoleRemovalModal, setDisplayScorecard9HoleRemovalModal] = useState(false);
    const [displayNumberHolesRemovedWarningSnackbar, setDisplayNumberHolesRemovedWarningSnackbar] = useState(false);
    const [displayScorecardSubmissionSnackbar, setDisplayScorecardSubmissionSnackbar] = useState(false);

    const pinnedCourse = "South Suburban"; // Course pinned atop scorecard entry
    const includePartialRounds = true; // Displays partial rounds

    // Get golf data from rapidapi
    // Scoreboard: https://rapidapi.com/slashgolf/api/live-golf-data/playground/apiendpoint_a6e32f80-75c7-4c35-ab1b-bbd685ee82f3
    // Leaderboard: https://rapidapi.com/slashgolf/api/live-golf-data/playground/apiendpoint_7f2f7f19-0407-4724-a1e5-abffc7c4a299
    // const [golfLeaderBoardData, setGolfLeaderBoardData] = useState({});
    // const getGolfData = async () => {
    //     const golfers = [
    //         {fName: "Scottie", lName: "Scheffler"}
    //     ];
    //     const options = {
    //         method: 'GET',
    //         url: 'https://live-golf-data.p.rapidapi.com/leaderboard',
    //         params: {
    //             orgId: '1',
    //             tournId: '475',
    //             year: '2024'
    //         },
    //         headers: {
    //             'x-rapidapi-key': '0598eb6b02msh5b4a6094ffc4e05p1c4f7djsnb241d4f5f1fe',
    //             'x-rapidapi-host': 'live-golf-data.p.rapidapi.com'
    //         }
    //     };
    //     const response = await axios.request(options);
    //     return response;
    // }
    // /**
    //  * HOOK: useEffect fetches golf leaderboard data
    //  * 
    //  * 
    //  */
    // useEffect(() => {
    //     try {
    //         const response = getGolfData();
    //         console.log(response);
    //     } catch (error) {
    //         console.error(error);
    //     }
    // }, [])
    // /**
    //  * HOOK: useEffect stores leaderboard data to mongo to be fetch
    //  * 
    //  * 
    //  */
    // useEffect(() => {
    //     // store to mongo
    // }, [golfLeaderBoardData])

    /**
     * HOOK: useEffect sets filter method when round data is fetched or a new round is added
     * 
     * 
     */
    useEffect(() => {
        changeSortMethod("sequence", "roundInfo");
        setIsLoading(false);

        // Set available round years (used for Annual Summaries)
        let tempRoundYears = [];
        for (let round of allRounds) {
            let splitRoundDate = round.roundInfo.date.split("/");
            let roundYear = splitRoundDate[2];
            if (!tempRoundYears.includes(roundYear)) tempRoundYears.push(roundYear);
        }
        setRoundYears(tempRoundYears);
    }, [allRounds]);
    
    const fileInputRef = useRef(null);

    // Set active scorecard course info
    useEffect(() => {
        if (courseInfo.length !== 0) {
            const tempActiveScorecardEntryCourseInfo = courseInfo.find(info => info.courseKey === activeScorecardEntry);
            setActiveScorecardEntryCourseInfo(tempActiveScorecardEntryCourseInfo)
        }
    }, [courseInfo, activeScorecardEntry])

    /**
     * HOOK: useEffect responsible for calculating round metrics
     * 
     * Sets the following
     * puttingData
     * 
     * Called by:
     * allRounds - After round data is fetched from MongoDB
     */
                                // This might not be necessary, already calculated when uploaded to DB
    // useEffect(() => {
    //     getPuttingData()
    // }, [allRounds])
    
    /**
     * HOOK: useEffect controls setting initial scorecardEntryData
     * 
     * Called by:
     * activeScoreCardEntryCourseInfo - Updated once course info is fetched
     * activePage - When user returns to Enter Scorecard page, reset scorecardEntryData
     */
    useEffect(() => {
        if (Object.keys(activeScorecardEntryCourseInfo).length !== 0 && !editingExistingScorecard) {
            const scorecardData = {
                date: new Date().toDateString()
            };
            for (let hole = 1; hole <= 18; hole++) {
                if (activeScorecardEntryCourseInfo[`hole${hole}`]) {
                    scorecardData[`hole${hole}`] = {
                        score: activeScorecardEntry === "" ? 100 : activeScorecardEntryCourseInfo[`hole${hole}`].par, // Default score to par
                        putts: 2,
                        fir: activeScorecardEntryCourseInfo[`hole${hole}`].par === 3 ? "NA" : "F",
                        gir: "G",
                        dtg: 1000,
                        dth: 1000,
                        puttLength: 1000,
                        notes: ""
                        // ...
                        // Notes don't need to be entered
                    };
                }
            }
            setScorecardEntryData(scorecardData);
        }
    }, [activeScorecardEntryCourseInfo, activePage]);
    // Similar to above, when entering scorecard and back 9 is added, populate default round info
                // Can probably configure this to be used for all instances of setting scorecardEntryData 
    const addActiveScorecardEntry9 = (addOrRemove9, which9) => { // Make this function reusabled and add front 9 holes by deafult by calling this function
        let tempScorecardEntryData = scorecardEntryData;
        
        let startingHoleBeingAdded = 1;
        let endingHoleBeingAdded = 18;
        if (addOrRemove9 === "add") {
            if (which9 === "front9") {
                startingHoleBeingAdded = 1;
                endingHoleBeingAdded = 9;
            } else if (which9 === "back9") {
                startingHoleBeingAdded = 10;
                endingHoleBeingAdded = 18;
            }
        }

        if (Object.keys(activeScorecardEntryCourseInfo).length !== 0) {
            for (let hole = startingHoleBeingAdded; hole <= endingHoleBeingAdded; hole++) {
                tempScorecardEntryData[`hole${hole}`] = {
                    score: activeScorecardEntry === "" ? 100 : activeScorecardEntryCourseInfo[`hole${hole}`].par, // Default score to par
                    putts: 2,
                    fir: activeScorecardEntryCourseInfo[`hole${hole}`].par === 3 ? "NA" : "F",
                    gir: "G",
                    dtg: 1000,
                    dth: 1000,
                    puttLength: 1000,
                    notes: ""
                    // ...
                    // Notes don't need to be entered
                };
                if (activeScorecardEntryCourseInfo[`hole${hole}`].par == 5) tempScorecardEntryData[`hole${hole}`].dtg2 = 1000;
            }
            setScorecardEntryData(tempScorecardEntryData);
        }
    }


    const getPuttingData = () => {
        const allPutts = [];

        (displayedRoundsToggle ? displayedRounds : allRounds).forEach(round => {
            const courseData = courseInfo.find(info => info.courseKey === round.roundInfo.courseKey);

            if (!round.nonGhinRounds.scrambleRound && Object.keys(courseData).length > 0) {
                for (let i = 1; i <= 18; i++) {
                    if (round[`hole${i}`] && round[`hole${i}`].putts) {
                        // if (round[`hole${i}`].dth === 6 && round[`hole${i}`].putts == 3) console.log("blah", round.roundInfo.key, round.roundInfo.date, i)
                        allPutts.push({
                            round: round.roundInfo.key,
                            date: round.roundInfo.date,
                            putts: round[`hole${i}`].putts,
                            dth: round[`hole${i}`].dth,
                            fpm: round[`hole${i}`].puttLength,
                            gir: round[`hole${i}`].gir,
                            scoreToPar: round[`hole${i}`].score - courseData[`hole${i}`].par // score
                        });
                        // if (round[`hole${i}`].puttLength >= 30) console.log("Displaying a hole with 30+ foot putt, hole:", i, "round", round)
                    }
                }
            }
        })

        setPuttingData(allPutts)
    }

    /**
     * HOOK: useEffect updates metric calculations
     * 
     * Updates the following:
     * puttingData 
     * 
     * Called by:
     * displayedRoundsToggle - User toggling between displayedRounds and allRounds OR allRounds being updated
     */
    useEffect(() => {
        getPuttingData()
    }, [allRounds, displayedRoundsToggle]);

    // Summary round for displayed rounds, function handles fetching new values when filters/date field is edited
    const handleUpdateSummaryRow = (summaryRowRounds) => {
        let uniqueCourses = [];
        let tempDisplayedHoles = 0;
        let tempDisplayedScoringTally = 0;
        let tempDisplayedPutts = 0;
        let tempDisplayed3Putts = 0;
        let tempDisplayedF = 0;
        let tempPar3 = 0
        let tempDisplayedG = 0;
        let tempDisplayedFPM = 0;
        let tempDisplayedBirdies = 0;
        let tempDisplayedBogeyPlus = 0;

        for (let round of summaryRowRounds) {
            if (!uniqueCourses.includes(round.roundInfo.courseKey)) uniqueCourses.push(round.roundInfo.courseKey);
            tempDisplayedHoles = tempDisplayedHoles + round.roundInfo.numHoles;
            tempDisplayedScoringTally = tempDisplayedScoringTally + round.scoring.scoreToPar;
            tempDisplayedPutts = tempDisplayedPutts + round.putting.putts;
            tempDisplayed3Putts = tempDisplayed3Putts + round.putting.num3Putts;
            tempDisplayedF = tempDisplayedF + round.fairways.f;
            tempPar3 = tempPar3 + round.fairways.na;
            tempDisplayedG = tempDisplayedG + round.greens.g;
            tempDisplayedFPM = tempDisplayedFPM + round.putting.fpmTotal;
            tempDisplayedBirdies = tempDisplayedBirdies + round.scoring.numBirdies;
            tempDisplayedBogeyPlus = tempDisplayedBogeyPlus + round.scoring.numBogeyPlus;
        }

        setDisplayedNumberOfRounds(summaryRowRounds.length);
        setDisplayedHoles(tempDisplayedHoles);
        setDisplayedCourses(uniqueCourses.length);
        setDisplayedScoringAverage(`${(72 + tempDisplayedScoringTally / tempDisplayedHoles * 18).toFixed(2)} (+${(tempDisplayedScoringTally / tempDisplayedHoles * 18).toFixed(2)})`);
        setDisplayedPutts(`${(tempDisplayedPutts / tempDisplayedHoles * 18).toFixed(2)} (${(tempDisplayed3Putts / tempDisplayedHoles * 18).toFixed(2)}, ${(tempDisplayed3Putts / tempDisplayedHoles * 100).toFixed(0)}%)`);
        setDisplayedF(`${(tempDisplayedF / (tempDisplayedHoles - tempPar3) * 14).toFixed(2)} (${(tempDisplayedF / (tempDisplayedHoles - tempPar3) * 100).toFixed(0)}%)`);
        setDisplayedG(`${(tempDisplayedG / tempDisplayedHoles * 18).toFixed(2)} (${(tempDisplayedG / tempDisplayedHoles * 100).toFixed(0)}%)`);
        setDisplayedFPM((tempDisplayedFPM / tempDisplayedHoles * 18).toFixed(2));
        setDisplayedBirdies(`${(tempDisplayedBirdies / tempDisplayedHoles * 18).toFixed(2)} (${(tempDisplayedBirdies / tempDisplayedHoles * 100).toFixed(0)}%)`);
        setDisplayedBogeyPlus(`${(tempDisplayedBogeyPlus / tempDisplayedHoles * 18).toFixed(2)} (${(tempDisplayedBogeyPlus / tempDisplayedHoles * 100).toFixed(0)}%)`);
    }

    // useEffect when user returns to Enter Scorecard page - not needed if added in [activeScorecardEntryCourseInfo, activePage] useeffect
    // 
    // useEffect(() => {
    //     if (activePage === "Enter Scorecard") setScorecardEntryData()
    // }, [activePage])

    /**
     * HOOK: useEffect controls setting initial filters/after new round is added to allRounds
     * 
     * TODO: fill out rest of this documentation, and this needs to actaully filter data
     */
    useEffect(() => {
        let tempRounds = allRounds;
        if (tempRounds.length > 0) {
            if (filters.includes(mostRecentRoundYear) && !filters.includes("All Years")) {
                tempRounds = tempRounds.filter(round => round.roundInfo.date && round.roundInfo.date.substring(round.roundInfo.date.length - 1, round.roundInfo.date.length) === mostRecentRoundYear.substring(mostRecentRoundYear.length - 1, mostRecentRoundYear));
            } else {
                setYearFilter("");
            }
            if (filters.includes("Full Rounds")) {
                tempRounds = tempRounds.filter(round => round.roundInfo.fullFront9 && round.roundInfo.fullBack9 && !round.roundInfo.key.includes("Par3") && !round.nonGhinRounds.boozeRound);
            }
            if (filters.includes("Handicap Rounds")) {
                tempRounds = tempRounds.filter(round => round.handicapRound);
            }
            
            // filterableCourses set in state, if filter is applied add to list below
            const coursesFiltered = [];
            for (let course of filterableCourses) {
                if (filters.includes(course)) coursesFiltered.push(course);
            }
            // If course filter is applied and current round course is not in that list then hide it
            if (coursesFiltered.length > 0) tempRounds = tempRounds.filter(round => coursesFiltered.includes(round.roundInfo.course));

            setDisplayedRounds(tempRounds);
        }
        handleUpdateSummaryRow(tempRounds); // Triggers update to summary row
    }, [allRounds, filters]);

    const handleSetYearFilter = (filter) => {
        const emptyYear = filter === '';
        const filterYear = parseInt(filter);
        if (filterYear >= 2022 && filterYear < 2100 && filterYear !== yearFilter) {
            let newRounds = [];
            for (let round of allRounds) {
                const yearSuffix = round.roundInfo.date.split("/")[2]
                if ((2000 + parseInt(yearSuffix)) == filterYear) {
                    newRounds.push(round);
                }
            }
            if (filters.includes(mostRecentRoundYear) && !filters.includes("All Years")) {
                newRounds = newRounds.filter(round => round.roundInfo.date && round.roundInfo.date.substring(round.roundInfo.date.length - 1, round.roundInfo.date.length) === mostRecentRoundYear.substring(mostRecentRoundYear.length - 1, mostRecentRoundYear));
            }
            if (filters.includes("Full Rounds")) {
                newRounds = newRounds.filter(round => round.roundInfo.fullFront9 && round.roundInfo.fullBack9 && !round.roundInfo.key.includes("Par3") && !round.nonGhinRounds.boozeRound);
            }
            if (filters.includes("Handicap Rounds")) {
                newRounds = newRounds.filter(round => round.handicapRound);
            }
            setDisplayedRounds(newRounds);
            console.log("2 calling handleUpdateSummaryRow")
            handleUpdateSummaryRow(newRounds);
        } else {
            if (filter === "") {
                setDisplayedRounds(allRounds);
                setDisplayedRounds(allRounds); // Triggers update to summary row
            }
        }
        
        setYearFilter(emptyYear ? "" : filterYear);
    }
    
    const editScorecard = (activeRound) => {
        setEditingExistingScorecard(true);
        setActivePage("Enter Scorecard");
        setActiveScorecardEntry(activeRound.roundInfo.courseKey);
        setScorecardEntryData(activeRound);
    }

    // All functions used to fetch data when Mongo is available
    // Fetch golf rounds
    useEffect(() => {
        setDisplayUploadButton(false);
        setIsLoading(true);
        const getGolfRounds = async () => {
            try {
                const reponse = await fetch('https://worldofjack-server.onrender.com/golfRounds')
                const data = await reponse.json();
                setAllRounds(data)
                // Filter by yearFilter state
                const displayedRounds = [];
                if (typeof yearFilter === "number") {
                    for (let round of data) {
                        const yearSuffix = round.roundInfo.date.split("/")[2]
                        if ((2000 + parseInt(yearSuffix)) == yearFilter) {
                            displayedRounds.push(round)
                        }
                    }
                }
                setDisplayedRounds(displayedRounds)
            } catch (error) {
                console.error("Error fetching rounds:", error)
            }
        }
        getGolfRounds();
    }, [])

    // Fetch course info
    useEffect(() => {
        const getCourseInfo = async () => {
            try {
                const reponse = await fetch('https://worldofjack-server.onrender.com/courseInfo')
                const data = await reponse.json();
                setCourseInfo(data)
            } catch (error) {
                console.error("Error fetching course info:", error)
            }
        }

        getCourseInfo();
    }, [])

    // All useEffects used for Excel upload only (separated for courseinfos and golfrounds collections)

    // Add row to golfrounds collection
    const addRound = (round) => {
        console.log("inserting round", round)
        axios.post('https://worldofjack-server.onrender.com/add-round', round)
        .then((response) => {
            setDisplayScorecardSubmissionSnackbar("success")
            // console.log("Response:", response)
        })
        .catch((error) => {
            setDisplayScorecardSubmissionSnackbar("error")
            console.error('Error adding golf round', error)
        })
    };

    // // Function to add golf rounds to Mongo - allow excel upload to update allRounds state
    // useEffect(() => {
    //     for (let round of allRounds) addRound(round)
    // }, [allRounds]);

    // Add info to courseinfos collection
    // const addCourseInfo = (info) => {
    //     axios.post('https://worldofjack-server.onrender.com/add-courseInfo', info)
    //     .then((response) => {
    //         // console.log("Response:", response)
    //     })
    //     .catch((error) => {
    //         console.error('There was an error adding course info', error)
    //     })
    // };

    // Function to add course info to Mongo
    // useEffect(() => {
    //     // Option to insert without key for each object
    //     // console.log(courseInfo)
    //     // Object.keys(courseInfo).forEach(key => {
    //     //     let currentObj = courseInfo[key]
    //     //     currentObj.courseKey = key
    //     //     // console.log("currentObj",currentObj)
    //     //     addCourseInfo(currentObj)
    //     // })
    //     for (let info of courseInfo) addCourseInfo(info)

    //     // addCourseInfo(courseInfo);
    // }, [courseInfo]);

    const handleImportFile = (e) => {
        importFile(
            e.target.files[0],
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
        );
    }

    const displayDefaultPage = displayedRounds.length !== 0;

    const handleActivePageChange = (e = null) => {
        setActivePage(e && e.target && e.target.value ? e.target.value : "Golf Rounds");
    }

    const handleSetActiveRounds = (roundKey) => {
        let tempActiveRounds = [...activeRounds];
        if (activeRounds.includes(roundKey)) {
            let activeRoundsWithoutCurrentlyDeselectedRound = [];
            tempActiveRounds.forEach((round) => {
                if (round !== roundKey) activeRoundsWithoutCurrentlyDeselectedRound.push(round);
            })
            tempActiveRounds = activeRoundsWithoutCurrentlyDeselectedRound;
        } else {
            tempActiveRounds.push(roundKey);
        }
        setActiveRounds(tempActiveRounds);
    }

    const changeSortMethod = (method, readingObjectPath, preventReorderingUponScorecardSubmission = false) => {
        // if (filters.includes("Annual Summaries")) {
        //     setTableSort({ method: "year", order: "ascending" });
        //     setFilters(["Annual Summaries"])
        // }
        // should not need to control this here, can likely just sort year directly


        let newSortOrder = "ascending";
        if (method === tableSort.method && !preventReorderingUponScorecardSubmission) {
            if (tableSort.order === "ascending") {
                newSortOrder = "descending";
            } else {
                newSortOrder = "ascending";
            }
        }
        let sortableRounds = displayedRounds.filter(round => !round.nonGhinRounds.legacyRound);

        if (displayedRounds.length !== sortableRounds.length) {
            setDisplayLegacyFilterWarning(true);
        }
        
        const sortedRounds = newSortOrder === "ascending" ?
            sortableRounds.sort(function(a,b) { return (a[readingObjectPath][method] < b[readingObjectPath][method]) ? 1 : ((b[readingObjectPath][method] < a[readingObjectPath][method]) ? -1 : 0); }) :
            sortableRounds.sort(function(a,b) { return (a[readingObjectPath][method] < b[readingObjectPath][method]) ? -1 : ((b[readingObjectPath][method] < a[readingObjectPath][method]) ? 1 : 0);} )

        setTableSort({ method, order: newSortOrder });
        setDisplayedRounds(sortedRounds);
    }

    const handleSetExpandSingleHoleMetric = (hole) => {
        if (expandSingleHoleMetric.expanded) {
            if (hole === expandSingleHoleMetric.hole) setExpandSingleHoleMetric({ hole: "", expanded: false });
            else setExpandSingleHoleMetric({ hole: hole, expanded: true });
        } else {
            setExpandSingleHoleMetric({ hole: hole, expanded: true });
        }
    }

    const updateScorecardEntryData = (value, field, hole) => {
        if (field === "date") {
            setScorecardEntryData({
                ...scorecardEntryData,
                date: value
            })
        } else {
            console.log("value", value)
            console.log("field", field)
            console.log("hole", hole)


            // Could explore automatically updating scorecard based on edits
                // Example: when number of putts updated to 1 and score is par

            // const local = true;
            // if (local) {
            //     // When number of putts updated to 1 and score is par
            //     if (field === "putts" && value === 1 && tempScorecardEntryData[hole].score) {
            //         tempScorecardEntryData[hole].gir = "X"
            //     }
            // }

            // console.log("Number.isNaN(value)",Number.isNaN(value))
            // console.log("typeof value", typeof value)
            // console.log("value === NaN", value === NaN)


            // %%% Going to try to update entire scorecard data based on single field entry
            // Also removing all comments
            
            let tempScorecardEntryData = scorecardEntryData;

            tempScorecardEntryData = {
                ...scorecardEntryData,
                [`${hole}`]: {
                    ...scorecardEntryData[hole],
                    [`${field}`]: value
                }
            }



            // For each DTG/DTG2/DTH/FPM value, negate 1000 values

            // Refactor DTG2 values - also need to do existing scorecards and ALL functions that use that format 

            tempScorecardEntryData = golfRoundMetricHelper(tempScorecardEntryData, value, field, hole, allRounds, editingExistingScorecard, activeScorecardEntryCourseInfo)

            // // When putts == 0, set dth/puttLength to 0
            // if (field === "putts" && value == 0) {
            //     tempScorecardEntryData[hole].dth = 0;
            //     tempScorecardEntryData[hole].puttLength = 0;
            // }




            console.log("about to push new tempScorecardEntryData",tempScorecardEntryData)




            setScorecardEntryData(tempScorecardEntryData)



            /** TODO: validations
             * when updated value is "Score" and score == bogey, FIR, automatically make GIR = "X"
             *      probably shouldnt do this because users may have not gotten to G yet, or assume first value
             *      could make this a "local" feature

            */
        }
    }

    const validateScorecard = (editingExistingScorecard) => {
        const isValid = true;
        console.log("1--scorecardEntryData",scorecardEntryData)
        console.log("2--activeScorecardEntry",activeScorecardEntry)
        console.log("3--activeScorecardEntryCourseInfo",activeScorecardEntryCourseInfo)

        // Disallow the following scenarios:
            // 1000 values for every text entry
            // Combinations:
                // F, X, 2 putts
                // F, G, 1 putts, Score: Par
                // Notes don't need validation
            // LB/OB/Sand shots visible on scorecard

        if (isValid) submitScorecard(editingExistingScorecard);
    }
    
    const submitScorecard = (editingExistingScorecard) => {
        let tempScorecardEntryData = scorecardEntryData;


        // // If only one putt, hide DTH field, use for dth/puttlength
        //         // Should rename dth to puttlength to puttLength1/puttLength2/puttLength3 everywhere not in local functions 
        //     // Could make 3 fields for 3pts, (ex: Putt #2)
        //     // Should relabel fields "Putt #1, Putt #2, Putt #3" on frontend (backend putt 2, allow array of DTH/FPM to accept 3 value anywhere? Might only be appliable to excel for now, coud accommodate in new app)  
        
        // // fields for DTG on p5 (also for p4 when not GIR? - if same value is)
        // // LB, Sand checkboxes for "sand shots" with +/- buttons (and populate value in hole notes automatically notes) 

        // // Need to highlight G-1 with green text or background color
        // // Scorecard icons should be filled buttons
        // // Automatically poplate missed GIR when 


        // // should 18 hole scorecard be displayed in one row?

        // // One big column for hole:
        // // Hole #
        // // Info
        // // Score
        //     // Data (which can take some vertical space)
        // // Putts
        //     // Data


        // // Golftable should allow mobile view - vertical card with  course info
        //     // ability to sort rounds by metric with filter
        //         // probably not this: activeFont for metric displayed on each card with ability dropdown to sortBy metric
        //         // Instead "sort by" dropdown atop page
        //             // When filtering by a metric, should abbreviate stats shown? Maybe not, try to condense cards/rows as best as possible, make "key" popup atop page
        // // Should also do the same with scorecard (or split into two rows) - create separate components for mobile entered scorecard/mobile scorecard entry/GolfTable? 

        // Everything below is responsible for resetting scorecard data, submitting to mongo, re-routing
            // Is is possible to do this on the fly but only re-calculate values based on value category being updated? (Scoring/putting/FIR/GIR) 


        // TODO: remove this? Keep in case another card is being entered at the same course
        // Feature idea: "Toast" message after round is submitted with call to action button to "Bulk edit" rounds in which we don't navigate back
        // tempScorecardEntryData.course = ""

        // Insert into mongo
        // addRound(tempScorecardEntryData); // TODO: add round to Mongo
        setScorecardEntryData({}); // TODO: allow this data to be edited - need to make "update" an action in server -> 
            // should be able to select any round, add option to edit scorecard should be visible on snackbar 
                // re-opens "Enter Scorecard" page ... "Editing in progress" should be displayed atop the page when reopening page //// or keep page open
            // Add "help" modal link accesible from all pages (top right of screen?)
        handleActivePageChange();

        if (editingExistingScorecard) {
            setEditingExistingScorecard(false);
            // Update existing round in Mongo
            axios.put('https://worldofjack-server.onrender.com/updateround', tempScorecardEntryData)
            .then(() => {
                setDisplayScorecardSubmissionSnackbar("success")
            })
            .catch((error) => {
                setDisplayScorecardSubmissionSnackbar("error")
                console.error('Error updating golf round', error)
            })

            // Remove round being edited from allRounds, then re-add
            let tempAllRounds = allRounds.filter(round => round.roundInfo.key !== tempScorecardEntryData.roundInfo.key)
            tempAllRounds.push(tempScorecardEntryData)
            setAllRounds(tempAllRounds)
            // Same as above with displayed rounds
            let tempDisplayedRounds = displayedRounds.filter(round => round.roundInfo.key !== tempScorecardEntryData.roundInfo.key)
            tempDisplayedRounds.push(tempScorecardEntryData)
            setDisplayedRounds(tempDisplayedRounds)
        } else {
            // Push to allrounds here directly (This will automatically recalculate stats)
            let newAllRounds = allRounds;
            newAllRounds.push(tempScorecardEntryData);
            setAllRounds(newAllRounds);
            let newDisplayedRounds = displayedRounds;
            newDisplayedRounds.push(tempScorecardEntryData);
            setDisplayedRounds(newDisplayedRounds); // TODO: When allRounds is updated, reload filtered rounds // Another TODO: onload, table should filter rounds automatically
            console.log("allRounds",allRounds)
            changeSortMethod("sequence", "roundInfo", true);
        }
    }

    const filterOptions = [];
    // const years
    const roundsSortedByDate = allRounds.length > 0 ? allRounds.sort(function(a, b){
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
    }) : null;

    const mostRecentRoundDate = allRounds.length > 0 ? roundsSortedByDate[0].roundInfo.date.split("/") : [];
    const mostRecentRoundYear = `20${mostRecentRoundDate[2]}`;
    if (mostRecentRoundDate.length !== 0) filterOptions.push(mostRecentRoundYear);
    filterOptions.push(
        'All Years',
        'Full Rounds',
        'Handicap Rounds',
        'Annual Summaries'
    );
    // filterableCourses contains list of courses that appear in filter
    filterableCourses.forEach(filterableCourse => {
        filterOptions.push(filterableCourse);
    })
    
    const courseTourOptions = [
        "South Suburban",
        "Gilead Highlands",
        "Anderson Glen",
        "Signature Holes"
    ];

    const handleFilterChange = (event: SelectChangeEvent<typeof filters>) => {
        const { target: { value } } = event;
        // When "Annnual Summaries" is selected
        if (value.includes("Annual Summaries")) {
            // If currently being added, should remove all other filters
            if (!filters.includes("Annual Summaries")) {
                setFilters(["Annual Summaries"]);
                changeSortMethod("sequence", "roundInfo");
            } else {
                // When Annual Summaries was already selected and a new filter is being applied, remove "Annual Summaries"
                const tempFilters = [];
                for (let i of value) {
                    if (!(i === "Annual Summaries")) tempFilters.push(i);
                }
                setFilters(tempFilters);
            }
        } else {
            setFilters(value);
        }
    };

    const handleCourseTourChange = (event: SelectChangeEvent<typeof courseTours>) => {
        const { target: { value } } = event;
        setCourseTours(value);
    };

    let getRoundTableClassName = (round, i) => {
        let className = "hideTableBottomBorderLastChildCell";
        if (round.scoring.underParRound) className += " backgroundColorEagleRow";
        if (activeRounds.includes(round.roundInfo.key)) className += " hideBorderBottom";
        if ((tableSort.method === 'sequence' && tableSort.order === 'descending') && (displayedRounds.length > 20) && (round.roundInfo.key === handicapCutoffRoundKey)) className += " handicapCutoffRoundBottomBorder";
        return className;
    }

    const getAnnualSummaryRows = () => {
        let tempSummaries = []
        for (let year of roundYears) {
            tempSummaries.push({
                year: year,
                yearDisplay: `20${year}`,
                sequence: parseInt(year),
                rounds: 0,
                uniqueCourses: [],
                tempDisplayedHoles: 0,
                tempDisplayedScoringTally: 0,
                tempDisplayedPutts: 0,
                tempDisplayed3Putts: 0,
                tempDisplayedF: 0,
                tempPar3: 0,
                tempDisplayedG: 0,
                tempDisplayedFPM: 0,
                tempDisplayedBirdies: 0,
                tempDisplayedBogeyPlus: 0,
            });
        }
        allRounds.forEach((round) => {
            const roundYear = round.roundInfo.date.split("/");
            if (round.roundInfo.fullFront9 && round.roundInfo.fullBack9 && !round.nonGhinRounds.boozeRound && !round.nonGhinRounds.scrambleRound) {
                const year = tempSummaries.findIndex(summaryYear => summaryYear.year === roundYear[2]);
                tempSummaries[year] = {
                    ...tempSummaries[year],
                    rounds: tempSummaries[year].rounds + 1,
                    uniqueCourses: !tempSummaries[year].uniqueCourses.includes(round.roundInfo.courseKey) ? [...tempSummaries[year].uniqueCourses, round.roundInfo.courseKey] : tempSummaries[year].uniqueCourses,
                    tempDisplayedHoles: tempSummaries[year].tempDisplayedHoles + round.roundInfo.numHoles,
                    tempDisplayedScoringTally: tempSummaries[year].tempDisplayedScoringTally + round.scoring.scoreToPar,
                    tempDisplayedPutts: tempSummaries[year].tempDisplayedPutts + round.putting.putts,
                    tempDisplayed3Putts: tempSummaries[year].tempDisplayed3Putts + round.putting.num3Putts,
                    tempDisplayedF: tempSummaries[year].tempDisplayedF + round.fairways.f,
                    tempPar3: tempSummaries[year].tempPar3 + round.fairways.na,
                    tempDisplayedG: tempSummaries[year].tempDisplayedG + round.greens.g,
                    tempDisplayedFPM: tempSummaries[year].tempDisplayedFPM + round.putting.fpmTotal,
                    tempDisplayedBirdies: tempSummaries[year].tempDisplayedBirdies + round.scoring.numBirdies,
                    tempDisplayedBogeyPlus: tempSummaries[year].tempDisplayedBogeyPlus + round.scoring.numBogeyPlus
                }
            }
        });
        
        // Apply sort method for existing table headers
        for (let i = 0; i < tempSummaries.length; i++) {
            tempSummaries[i] = {
                ...tempSummaries[i],
                scoreToPar: tempSummaries[i].tempDisplayedScoringTally / tempSummaries[i].tempDisplayedHoles,
                course: tempSummaries[i].uniqueCourses.length,
                putts: tempSummaries[i].tempDisplayedPutts / tempSummaries[i].tempDisplayedHoles,
                f: tempSummaries[i].tempDisplayedF / (tempSummaries[i].tempDisplayedHoles - tempSummaries[i].tempPar3),
                g: tempSummaries[i].tempDisplayedG / tempSummaries[i].tempDisplayedHoles,
                puttLengthTotal: tempSummaries[i].tempDisplayedFPM / tempSummaries[i].tempDisplayedHoles,
                numBirdies: tempSummaries[i].tempDisplayedBirdies / tempSummaries[i].tempDisplayedHoles,
                numBogeyPlus: tempSummaries[i].tempDisplayedBogeyPlus / tempSummaries[i].tempDisplayedHoles
            }
        }
        tempSummaries = tableSort.order === "ascending"
            ? tempSummaries.sort(function(a,b) { return (a[tableSort.method] < b[tableSort.method]) ? 1 : ((b[tableSort.method] < a[tableSort.method]) ? -1 : 0); })
            : tempSummaries.sort(function(a,b) { return (a[tableSort.method] < b[tableSort.method]) ? -1 : ((b[tableSort.method] < a[tableSort.method]) ? 1 : 0);} )

        return (
            <TableBody>
                {tempSummaries.map((year) => {
                    return (
                        <TableRow key={year.year}>
                            <TableCell key={1}>{year.yearDisplay} Rounds: <b>{year.rounds}</b></TableCell>
                            <TableCell key={2}>Total Holes: <b>{year.tempDisplayedHoles}</b></TableCell>
                            <TableCell key={3}>Total Courses: <b>{year.uniqueCourses.length}</b></TableCell>
                            <TableCell key={4}><b>{`${(72 + year.scoreToPar).toFixed(2)} (+${(year.scoreToPar).toFixed(2)})`}</b></TableCell>
                            <TableCell key={5}><b>{`${(year.tempDisplayedPutts / year.tempDisplayedHoles * 18).toFixed(2)} (${(year.tempDisplayed3Putts / year.tempDisplayedHoles * 18).toFixed(2)}, ${(year.tempDisplayed3Putts / year.tempDisplayedHoles * 100).toFixed(0)}%)`}</b></TableCell>
                            <TableCell key={6}><b>{`${(year.tempDisplayedF / (year.tempDisplayedHoles - year.tempPar3) * 14).toFixed(2)} (${(year.tempDisplayedF / (year.tempDisplayedHoles - year.tempPar3) * 100).toFixed(0)}%)`}</b></TableCell>
                            <TableCell key={7}><b>{`${(year.tempDisplayedG / year.tempDisplayedHoles * 18).toFixed(2)} (${(year.tempDisplayedG / year.tempDisplayedHoles * 100).toFixed(0)}%)`}</b></TableCell>
                            <TableCell key={8}><b>{(year.tempDisplayedFPM / year.tempDisplayedHoles * 18).toFixed(2)}</b></TableCell>
                            <TableCell key={9}><b>{`${(year.tempDisplayedBirdies / year.tempDisplayedHoles * 18).toFixed(2)} (${(year.tempDisplayedBirdies / year.tempDisplayedHoles * 100).toFixed(0)}%)`}</b></TableCell>
                            <TableCell key={10}><b>{`${(year.tempDisplayedBogeyPlus / year.tempDisplayedHoles * 18).toFixed(2)} (${(year.tempDisplayedBogeyPlus / year.tempDisplayedHoles * 100).toFixed(0)}%)`}</b></TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        )
    }

    {/*
        COMPONENT: Page Links

        Displays all pages atop page

        props:
            activePage      (string)    Current page
            setActivePage   (function)  Handles navigation change
    */}
    {!displayUploadButton &&
        <PageLinks
            activePage={activePage}
            setActivePage={setActivePage}
        />
    }

    // is this removing values from tempScorecardEntryData and doing nothing with it?
        // appears to be removing holes appropriately... not sure how
    const removeUnusedActiveScorecardEntryData = () => {
        const scorecardOptionTitles = selectedScorecardOptions.map(option => option.title)
        let tempScorecardEntryData = scorecardEntryData;
        if (scorecardOptionTitles.includes("Front 9")) {
            for (let hole = 10; hole <= 18; hole++) {
                if (tempScorecardEntryData[`hole${hole}`]) delete tempScorecardEntryData[`hole${hole}`];
            }
            if (!tempScorecardEntryData.hole1) addActiveScorecardEntry9("add", "front9")
        } else if (scorecardOptionTitles.includes("Back 9")) {
            for (let hole = 1; hole < 10; hole++) {
                if (tempScorecardEntryData[`hole${hole}`]) delete tempScorecardEntryData[`hole${hole}`];
            }
            if (!tempScorecardEntryData.hole10) addActiveScorecardEntry9("add", "back9")
        }
    }



    // Double check scorecard entry is adding/removing holes as expected
    // const addScorecardEntry9IfNeeded = () => {
    //     const scorecardOptionTitles = selectedScorecardOptions.map(option => option.title)
    //     if (scorecardOptionTitles.includes("Front 9") && !scorecardEntryData.hole1) addActiveScorecardEntry9("add", "front9");
    //     if (scorecardOptionTitles.includes("Back 9") && !scorecardEntryData.hole10) addActiveScorecardEntry9("add", "back9");
    // }

    /** 
     * HOOK: useEffect
     * 
     * 
     * When selectedScorecardOptions is updated, display modal to confirm that 9 holes will be lost
     */ 
    // useEffect(() => {
        
    //     // setDisplayScorecard9HoleRemovalModal(true)
    // }, [selectedScorecardOptions])
                // likely won't use this, call in function responsible for update below: search setDisplayScorecard9HoleRemovalModal  
    

    // %%%
    






    return (
		<div className="flexColumn alignCenter paddingBottomMassive golf">
			{/* <h1 className="serifFont marginBottomMedium">Golf</h1> */}
			{/* <h1 className="serifFont marginBottomMedium marginTopMedium">Golf</h1> */}

            {!displayUploadButton &&
                <div className="pageLinks marginTopMedium">
                    {[
                        "Golf Rounds",
                        // "Anderson Glen",
                        // "Gilead Highlands",
                        "Metrics",
                        "Course Tour",
                        "Historic Rounds",
                        "Historic Metrics",
                        "Enter Scorecard"
                    ].map((page, i) => {
                        return <a key={i} onClick={() => setActivePage(page)} className={`marginRightExtraLarge pageLinkFont${page === activePage ? " active" : ""}`}>{page}</a>
                    })}
                </div>
            }

            {displayLegacyFilterWarning &&
                <Paper className="flexRow justifySpaceBetween alignCenter marginTopMedium" style={{width: "75vw", padding: "8px 12px"}}>
                    <div className="flexColumn">
                        <b className="blackFont">Warning</b>
                        <span className="blackFont">Legacy rounds have been omitted from filtered results</span>
                    </div>
                    <Close className="blackFont" onClick={() => setDisplayLegacyFilterWarning(false)}/>
                </Paper>
            }

            {/* TODO 11/25/24: Modularize GolfTable into separate component */}
            {/* Default Golf Rounds view */}
            {/* {displayDefaultPage && activePage === "Golf Rounds" &&
                <GolfRounds
                    handleSetYearFilter={handleSetYearFilter}
                    tableSort={tableSort}
                    changeSortMethod={changeSortMethod}
                    roundYears={roundYears}



                    // Separate imports
                    getAnnualSummaryRows
                />
            } */}


            {/*
                COMPONENT: Golf Table

                Displays sortable (filtered) round info, renders scorecards

                props:

            */}
            {displayDefaultPage && activePage === "Golf Rounds" &&
                <GolfTable
                    yearFilter={yearFilter}
                    handleSetYearFilter={handleSetYearFilter}
                    tableSort={tableSort}
                    changeSortMethod={changeSortMethod}
                    filters={filters}
                    roundYears={roundYears}
                    getAnnualSummaryRows={getAnnualSummaryRows}
                    displayedNumberOfRounds={displayedNumberOfRounds}
                    displayedHoles={displayedHoles}
                    displayedCourses={displayedCourses}
                    displayedScoringAverage={displayedScoringAverage}
                    displayedPutts={displayedPutts}
                    displayedF={displayedF}
                    displayedG={displayedG}
                    displayedFPM={displayedFPM}
                    displayedBirdies={displayedBirdies}
                    displayedBogeyPlus={displayedBogeyPlus}
                    activePage={activePage}
                    displayedRounds={displayedRounds}
                    includePartialRounds={includePartialRounds}
                    getRoundTableClassName={getRoundTableClassName}
                    handleSetActiveRounds={handleSetActiveRounds}
                    createScorecard={createScorecard}
                    courseInfo={courseInfo}
                    expandScorecard={expandScorecard}
                    setExpandScorecard={setExpandScorecard}
                    toggleCourseInfo={toggleCourseInfo}
                    setToggleCourseInfo={setToggleCourseInfo}
                    handicap={handicap}
                    handicapMetrics={handicapMetrics}
                    activeRounds={activeRounds}
                    editScorecard={editScorecard}
                />
            }

            {/* {filters.includes("Handicap Rounds") && <div className="width100Percent marginTopMedium justifyCenter">
                    <span>Handicap: <b>{handicap}</b></span>
                </div>
            } */}

            {/* Metrics */}
            {!displayUploadButton && activePage === "Metrics" &&
                <div className="marginTopMedium" style={{ maxWidth: "90vw", marginLeft: "5vw" }}>
                    {/* {calculateStats(courseInfo, allRounds, puttingData)} */}
                    {calculateStats(courseInfo, allRounds, puttingData, displayedRounds, handicap, displayedRoundsToggle, setDisplayedRoundsToggle, approachView, setApproachView)}
                </div>        
            }

            {/* Course Tour */}
            {!displayUploadButton && activePage === "Course Tour" &&
                <div className="flexColumn justifyCenter marginTopMedium">
                    {/* Each hole summary, best score */}
                    {courseSummary(courseInfo, allRounds, expandSingleHoleMetric, handleSetExpandSingleHoleMetric, courseTours, displayedRounds, displayedRoundsToggle, setDisplayedRoundsToggle)}
                    {/* YouTube tour */}
                    {/* <iframe className="marginAuto" width="800" height="450" title="Course Tour" src="https://www.youtube.com/embed/8QFAY7l-TAg?autoplay=0&mute=1" /> */}
                </div>
            }

            {!displayUploadButton && activePage === "Enter Scorecard" &&
                <ScorecardEntry
                    activeScorecardEntry={activeScorecardEntry}
                    activeScorecardEntryCourseInfo={activeScorecardEntryCourseInfo}
                    setActiveScorecardEntry={setActiveScorecardEntry}
                    courses={courses}
                    pinnedCourse={pinnedCourse}
                    scorecardEntryData={scorecardEntryData}
                    updateScorecardEntryData={updateScorecardEntryData}
                    selectedScorecardOptions={selectedScorecardOptions}
                    setSelectedScorecardOptions={setSelectedScorecardOptions}
                    setDisplayNumberHolesRemovedWarningSnackbar={setDisplayNumberHolesRemovedWarningSnackbar}
                    addActiveScorecardEntry9={addActiveScorecardEntry9}
                    setPreviouslySelectedScorecardOptions={setPreviouslySelectedScorecardOptions}
                    setDisplayScorecard9HoleRemovalModal={setDisplayScorecard9HoleRemovalModal}
                    setDisplayHelpModal={setDisplayHelpModal}
                    validateScorecard={validateScorecard}
                    editingExistingScorecard={editingExistingScorecard}
                />
            }

            {/* 
                COMPONENT: Help modal displayed when entering scorecard
            */}
            {
                <ScorecardHelpModal
                    displayHelpModal={displayHelpModal}
                    setDisplayHelpModal={setDisplayHelpModal}
                />
            }

            {/*
                Modal to handle when scorecard entry switches from 18 Holes or swaps 9 holes
                Intent is to avoid accidentally removing 9 holes already entered
            */}
            <Modal
                open={displayScorecard9HoleRemovalModal}
                style={{width: "100%", margin: "auto"}}
            >
                <div className="backgroundColorWhite margin0Auto" style={{height: "200px", width: "200px"}}>
                    <p>This may delete current scores entered. Are you sure you would like to update round info?</p>
                    <button
                        onClick={() => {
                            setSelectedScorecardOptions(previouslySelectedScorecardOptions);
                            setDisplayScorecard9HoleRemovalModal(false);
                        }}
                    >
                        Revert Changes
                    </button>
                    <button 
                        onClick={() => {
                            removeUnusedActiveScorecardEntryData();
                            setDisplayScorecard9HoleRemovalModal(false);
                        }}
                    >
                        Continue
                    </button>
                </div>
            </Modal>

            <Snackbar
                open={displayNumberHolesRemovedWarningSnackbar}
                autoHideDuration={6000}
                onClose={() => setDisplayNumberHolesRemovedWarningSnackbar(false)}
                message='Cannot Remove "Front 9", "Back 9", and "18 Holes", retaining last selected option'
                // action={action}
            />

            <Snackbar
                open={["success", "error"].includes(displayScorecardSubmissionSnackbar)}
                autoHideDuration={6000}
                onClose={() => setDisplayScorecardSubmissionSnackbar(null)}
                message={displayScorecardSubmissionSnackbar === "success" ? "Scorecard saved" : "Error saving scorecard. See console for more details"}
            />

            {/*
                COMPONENT: Displayed Rounds Filter

                Applies filters to plans list 

                props:
                    filters             (array)     Default filters applied to plans list
                    handleFilterChange  (function)  Handles updating applied filters
                    filterOptions       (array)     All available filter options
            */}
            {!displayUploadButton && activePage !== "Enter Scorecard" && activePage !== "Course Tour" &&
                <GolfRoundsFilter
                    filters={filters}
                    handleFilterChange={handleFilterChange}
                    filterOptions={filterOptions}
                />
            }

            {/* Course Tour Course Filter */}
            {!displayUploadButton && activePage === "Course Tour" &&
                <div className="filterDropdownContainer width100Percent justifyCenter">
                    <FormControl sx={{ m: 1, width: 300 }} variant="filled">
                        <InputLabel id="demo-multiple-checkbox-label">Select Course</InputLabel>
                        <Select
                            labelId="demo-multiple-checkbox-label"
                            id="demo-multiple-checkbox"
                            multiple
                            value={courseTours}
                            onChange={handleCourseTourChange}
                            renderValue={(selected) => selected.join(', ')}
                        >
                            {courseTourOptions.map((courseTour) => (
                                <MenuItem key={courseTour} value={courseTour}>
                                    <Checkbox checked={courseTours.indexOf(courseTour) > -1} />
                                    <ListItemText primary={courseTour} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
            }

            {/* 
                Historic Rounds 
                Summary of all years prior to keeping detailed metrics
            */}
            {!displayUploadButton && activePage === "Historic Rounds" &&
                <div className="">
                    <Card sx={{ minWidth: 275 }}>
                        <CardContent>
                            <h1>hello</h1>
                        </CardContent>
                    </Card>
                </div>
            }



            {/*
                COMPONENT: Golf Upload Button

                Reponsible for uploading Excel file when not fetching from DB

                props:
                    onClick             (function)  resposible for opening fileInputRef
                    ref                 (ref)       opens file explorer
                    onChange            (function)  responsible for fetching golf data upon upload 
                
            */}
            {displayUploadButton &&
                <GolfUploadButton
                    onClickFunction={() => fileInputRef.current.click()}
                    fileInputRef={fileInputRef}
                    onChange={handleImportFile}
                />
            }

            {/* Loader */}
            {isLoading && <div className="alignCenter" style={{ marginTop: "40vh" }}><CircularProgress /></div>}
		</div>
    )
}

export default Golf;