import React, {useState, useEffect } from "react";
// Mui components
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Button,
    Checkbox,
    CircularProgress,
    Divider,
    FormControl,
    FormControlLabel,
    FormGroup,
    IconButton,
    MenuItem,
    Select,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Tooltip
} from '@mui/material';
// Mui Icons
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import NorthIcon from '@mui/icons-material/North';
import PushPin from '@mui/icons-material/PushPin';
import SportsGolfIcon from '@mui/icons-material/SportsGolf';
import SouthIcon from '@mui/icons-material/South';
// Tools
import axios from 'axios';
import * as moment from 'moment'
// CSS
import "../pool.css"
// Imports
import { dfsSalaries } from "../helpers/PoolSalaries";
// Testing
// import { testScheduleResponse } from "../test/testScheduleResponse";
// import { testTournamentResponse } from "../test/testTournamentResponse";
// import { testLeaderboardResponse } from "../test/testLeaderboardResponse";

// Deploy steps
// Publish latest commit to server
    // https://dashboard.render.com/web/srv-cu1kutd6l47c73a4v7og/deploys/dep-cu80q852ng1s73cuvoqg
// Publish latest commit to Netlify
    // https://app.netlify.com/sites/worldofjackgilson/deploys

// Next steps
// Hide illustrative player selection when tournament in progress (might need to add state)
    // Also need more validations for fields not added
        // Begin storing entries to mongo
            // Then fetch pool data
                // Create live pool display (pulling latest leaderboard data should world) - as part of this, identify if courses differ for each player between R1/R2/R3/R4
                    // At end of each day (if round status is complete), trigger pull of data 
// Email template


// Stableford
// could get scorecard data ONLY for selected golfers, for all others, "no one has selected this player"
// Calculate at end of each day? Not good for following live leaderboard - would cost a LOT to upgrade
    // For each player, would need to pull 4 times per day (16 per tournament)
        // Could display leaderboard and calculate stableford at end of day 
            // Would still require pull for every player

// Link to monitor Rapid API requests (60 starting 1/14/2025)
// https://rapidapi.com/developer/analytics/default-application_10075500


// After tournament wraps, could begin savings player scoring averages
    // Could fetch some legacy rounds if I still have fetches left for month
        // 1 needed for year schedule, 2 more for each tournament to pull tournamentData and leaderboardData
    // "Cut % made since X data" (5/6)
    // EV = salary / strokes under par (can't use old DFS salaries for these calulations)
        // Is there strenth of schedule


// Determine when to fetch new leaderboard data
    // Can be based on of "Tournament in progress"
    // Starting at X time of day, fetch every Y interval until Z time of day
// Also, when fetching tournament data, date checks for when to fetch tournament data may not work as expected
    // Need to accommodate that tournament has wrapped - should store a tournament "status" with leaderboard data
    

// Pricing $25 for first tournament, $20 after - tries to retain players
    // Helps keep the lights on (tooltip: server cost to host site, rapid API call pricing)


// Steps to get tournament ready
// Need to pull in DFS data first
    // Find a tournament on https://www.draftkings.com/lobby#/GOLF
        // Below table select "Export to CSV"
            // Upload to Google Drive
                // Open with Sheets
                    // Build object dfsSalaries in PoolSalaries.js
                        // *Manually input year and tournamentId OR calculate in Pool.jsx file with exceljs?
                            // Could manually upload to Mongo
// Identify if allPlayers contains list of players for year/tournament
    // If not, fetch from rapid API
        // Should automatically store to mongo
// Frontend should automatically display form when DFS data is available (should already have players from above section)


// Need to print list of players not yet found - should be excluded from form?





// Could beginmaking "predictive analysis" with ability to assign weight to various metrics (maybe using data golf)
    // 10% of "score" is previous 3 tournament results
    // 10% previous results at same tournament
    // 10% driving distance (weighted based on tournament)
    // 10% FPM putting
    // etc.



// CRON job for fetching new data?
    // first need to query /tournament endpoint (contains players)
        // Once tournament starts, pull from /leaderboards endpoint




// 500 is limit for month
// most tournament days in a month in 19
// Assuming I can calculate exact start time (and one final pull at 9pm EST to account for all update),
// could have 1 request every 20 minutes

// 500/20 = 25

// 1 data pull per year for schedule
// 10 data pulls per month for players
// 10 data pull per


// Can begin also pulling in other data from rapidapi (points/earnings/fedex rankings/world ranking - display table to arrange?)



// Allow for excel file upload - make google form first
// Then save to mongo
// Then pull in to page - accommodate for when "data is not available"



// Order of events - starting with first useEffect to identify configuration

// CONFIGURATION === "rapidApi"
    // Initialization calls retrieveScheduleDataRapid() - gets PGA tour season schedule
        // Saves response to scheduleResponse
            // Triggers useEffect [scheduleResponse]
                // Calls calculateScheduleData()
                    // Calls setSchedule() in local state
                    // Calls setActiveTournamentId() and highlightedTournamentId()
                    // Saves schedule to mongo
                        // Once schedule is saved to mongo
                            // Triggers useEffect [schedule]
                                // Calls retrieveTournamentDataRapid() - gets current tournament data
                                    // Saves response to tournamentResponse
                                        // Triggers useEffect [tournamentResponse]
                                            // Calls calculatePlayerData() and saves players to mongo
                                            // Calls calculateCourseData() and saves courses to mongo
                                            // Calls retrieveLeaderboardDataRapid() - gets current tournaments leaderboard
                                                // Saves response to leaderboardResponse
                                                    // Triggers useEffect [leaderboardResponse]
                                                        // Calls calculateLeaderboardData()
                                                            // Saves leaderboard to mongo

// CONFIGURATION === "mongo"
    // Initialization calls fetchMongoData()
        // Calls setSchedule() in local state
            // Identifies closest active tournament and calls setActiveTournamentId() and setHighlightedTournamentId() in local state
            // Calls fetchMongoCourses() - sets courses in local state
            // Calls fetchMongoPlayers() - sets courses in local state, fetch DFS data if salaries are available in useEffect [allPlayers]
            // Calls fetchMongoLeaderboard() - sets leaderboard in local state

const getActualYear = () => {
    const tempDate = new Date();
    const formattedTempDate = moment(tempDate).utc().format('MM/DD/YYYY');
    const formattedTempDateArray = formattedTempDate.split("/");
    return parseInt(formattedTempDateArray[2]);
}

const Pool = () => {
    // Config & dates
    const [screenWidth, setScreenWidth] = useState(window.innerWidth); // Number - sets screen width for component dynamism
    const configuration = "mongo"; // String - Use "mongo" to fetch saved data, "rapidApi" to query new tournament info
    const actualYear = getActualYear(); // Used in case currentYear not available should calculate current year
    const hardCodeDate = "01/21/25"; // String - Set to null when not in use, otherwise format "MM/DD/YY" (example: "01/01/25")
    const [currentDate, setCurrentDate] = useState(null); // String
    const [currentYear, setCurrentYear] = useState(null); // String
    const displayPreviousTournamentForOneDay = true; // Boolean - Ability to (TRUE) show previous tournament for one day after or (FALSE) until next tournament is closer // TODO: Need to determine when Rapid API tournament info is available, same with DFS data

    // Initial state to trigger fetching data
    const [hasStartedFetch, setHasStartedFetch] = useState(false); // Boolean

    // Loading states
    const [isLoading, setIsLoading] = useState(true); // Boolean
    const [isScheduleLoading, setIsScheduleLoading] = useState(false); // Boolean
    const [isCoursesLoading, setIsCoursesLoading] = useState(false); // Boolean
    const [isAllPlayersLoading, setIsAllPlayersLoading] = useState(false); // Boolean
    const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false); // Boolean
    const [isDfsLoading, setIsDfsLoading] = useState(false); // Boolean
    const [isPoolFormEntryLoading, setIsPoolFormEntryLoading] = useState(false); // Boolean
    const [isPoolLoading, setIsPoolLoading] = useState(false); // Boolean
    
    // API responses - can simply use rapidApi front end to get desired results and directly set to null state here
    const [preventScheduleRetries, setPreventScheduleRetries] = useState(false); // Boolean - prevents Rapid API from triggering mulitple schedule calls
    const [preventTournamentRetries, setPreventTournamentRetries] = useState(false); // Boolean - prevents Rapid API from triggering mulitple tournament calls
    const [preventRetries, setPreventLeaderboardRetries] = useState(false); // Boolean - prevents Rapid API from triggering multiple leaderboard calls
    
    const [scheduleResponse, setScheduleResponse] = useState(
        // NOT HARDCODING
        null

        // HARDCODING OBJECT FROM RAPID API - need to uncomment import
        // JSON.parse(JSON.stringify(
        //    testScheduleResponse - currently empty
        // ))
    ); // Object
    const [tournamentResponse, setTournamentResponse] = useState(
        // NOT HARDCODING
        null

        // HARDCODING OBJECT FROM RAPID API - need to uncomment import
        // JSON.parse(JSON.stringify(
        //    testTournamentResponse
        // ))
    ); // Object
    const [leaderboardResponse, setLeaderboardResponse] = useState(
        // NOT HARDCODING
        null

        // HARDCODING OBJECT FROM RAPID API - need to uncomment import
        // JSON.parse(JSON.stringify(
        //     testLeaderboardResponse
        // ))
    ); // Object

    // Mongo/Rapid API data
    const [schedule, setSchedule] = useState(null); // Object
    const [allPlayers, setAllPlayers] = useState(null); // Object
    const [courses, setCourses] = useState(null); // Object
    const [leaderboard, setLeaderboard] = useState(null); // Object
    const [dfs, setDfs] = useState(null); // Object

    // Pool data
    const [pool, setPool] = useState(null); // Array
    const [poolLeaderboard, setPoolLeaderboard] = useState([]); // Array
    const [poolLeaderboardUpdated, setPoolLeaderboardUpdated] = useState(false); // Boolean - prevents pool leaderboard from re-rendering
    const [leaderboardIsExpanded, setLeaderboardIsExpanded] = useState(false); // Boolean - controls when all leaderboard rows should be displayed if longer than pool leaderboard row count

    // UI interaction states
    const [highlightedTournamentId, setHighlightedTournamentId] = useState(null); // String
    const [activeTournamentId, setActiveTournamentId] = useState(null); // String
    const [activeTournamentDay, setActiveTournamentDay] = useState(null); // Number - controls which round should display on leaderboard
    const [dfsSortMethod, setDfsSortMethod] = useState("salary"); // String - sort players by "salary" or "name" 
    const [dfsSortOrder, setDfsSortOrder] = useState("descending"); // String - "ascending" vs "descending"
    const [sortedDfsSalaries, setSortedDfsSalaries] = useState([]); // Array - contains list of all player DFS salaries
    const [poolForm, setPoolForm] = useState({errors: {}}); // Object - contains all current pool form data
    const [displayEntrySubmittedMessage, setDisplayEntrySubmittedMessage] = useState(false) // Boolean - controls message displayed after pool entry is submitted
    const [displayPoolFormError, setDisplayPoolFormError] = useState(false); // Boolean - controls when pool form errors should be displayed (after submit attempt)
    const [illustrativePlayers, setIllustrativePlayers] = useState([]); // Array - list of illustrative players (not final)
    const [illustrativeSalaryCap, setIllustrativeSalaryCap] = useState(0); // Number - salary cap used with all illustrative players
    const [expandSelectedPlayers, setExpandSelectedPlayers] = useState(false); // Boolean - controls expansion state of 
    const [snackbarMessages, setSnackbarMessages] = useState([]); // String
    
    // Controls for display pool entry form
    const [readyToCalculateDfsSalaries, setReadyToCalculateDfsSalaries] = useState(false); // Boolean - if players are available and DFS salaries have not already been stored to mongo, begin calculations 

    
    // END USESTATES

    
    // START USEEFFECTS

    
    // Onload, get schedule, tournament data (players, course info, event info), and scoreboard
    useEffect(() => {
        if (!hasStartedFetch){
            // Set current date
            const date = new Date();            
            const tempDate = hardCodeDate ? hardCodeDate : moment(date).utc().format('MM/DD/YY');
            const fullYear = date.getFullYear();
            setCurrentDate(tempDate);
            setCurrentYear(fullYear);

            // START HARDCODED BLOCK
            
            // Hardcode actions with scheduleResponse/tournamentResponse/leaderboardResponse in useState() and save to mongo
            
            // --HARDCODE scheduleResponse
            // calculateScheduleData()
            
            // --HARDCODE tournamentResponse
            // calculateCourseData();
            // calculatePlayerData(); // If also fetching DFS data, uncomment below line
            // setReadyToCalculateDfsSalaries(true)
            
            // --HARDCODE leaderboardReponse
            // calculateLeaderboardData();

            // END HARDCODED BLOCK
            
            // When working locally, can comment below
            // if (configuration === "rapidApi") retrieveScheduleDataRapid();
            if (configuration === "mongo") fetchMongoSchedule(fullYear);

            // Prevent multiple rapidApi function calls
            setHasStartedFetch(true);
        }
    });

    // Screen width event listener
    useEffect(() => {
        const handleResize = () => {
          setScreenWidth(window.innerWidth);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // After scheduleResponse is returned, calculate schedule data
    useEffect(() => {
        calculateScheduleData();
    }, [scheduleResponse]);
    
    // After scheduleResponse is returned, fetch tournament data (players, course info, event info)
    useEffect(() => {
        if (configuration === "rapidApi") retrieveTournamentDataRapid();
        // Identify current tournament
        if (schedule && schedule.schedule) {
            const current = new Date(hardCodeDate || currentDate);
            const currentFormattedDate = current.getFullYear();
            let tempActiveTournamentId = null;
            let currentTournamentDay = null;
            let isReadyToFetchNewTournamentInfo = false; // If within window that that tournemant information is available, begin fetch
            let isReadyToGetUpdatedLeaderboardInfo = false; // If tournament in progress, should begin getting tournament info
            for (let i = 0; i < schedule.schedule.length; i++) {
                const currentTournament = schedule.schedule[i];
                const start = new Date(currentTournament.startDate);
                const end = new Date(currentTournament.endDate);
                // console.log("\n\ncurrent",current)
                // console.log("start",start)
                // console.log("end",end)
                // Date matches start or end date
                if ((current - start == 0) || (current - end == 0) || (i == schedule.schedule.length - 1)) {
                    if (current - start == 0) currentTournamentDay = 1;
                    if (current - end == 0) {
                        // console.log("***********EQUALS 0")
                        currentTournamentDay = 4;
                    }
                        
                    tempActiveTournamentId = currentTournament.tournamentId;
                    isReadyToGetUpdatedLeaderboardInfo = true; // On start date or end date, able to fetch a live leaderboard
                    break;
                }
                // Current date is before end date
                if (current < end) {
                    if (current > start) {
                        // Current date is after start date (tournament in progress)
                        tempActiveTournamentId = currentTournament.tournamentId;
                        if (current - start == 86400000) currentTournamentDay = 2; // 1 day since tournament start
                        if (current - start == 172800000) currentTournamentDay = 3; // 2 days since tournament start
                        isReadyToGetUpdatedLeaderboardInfo = true; // When tournament in progress, able to fetch a live leaderboard
                        break;
                    } else if (i > 0) {
                        const previousTournament = i > 0 ? schedule.schedule[i - 1] : null;
                        const previousEndDate = new Date(previousTournament.endDate);
                        if (current > previousEndDate) {
                            // Config variable - (TRUE) show previous tournament for one day after or (FALSE) until next tournament is closer
                            if (displayPreviousTournamentForOneDay) {
                                if ((current - previousEndDate) > 86400000) {
                                    // If beyond 1 day from previous tournament, begin showing next
                                    tempActiveTournamentId = currentTournament.tournamentId;
                                    // Display pool entry form when next tournament is approaching
                                    isReadyToFetchNewTournamentInfo = true;
                                    break;
                                } else {
                                    // If still within 1 day of previous tournament, continue showing previous  
                                    tempActiveTournamentId = previousTournament.tournamentId;
                                    break;
                                }
                            } else {
                                // Set to which ever date is closer
                                if ((current - previousEndDate) > (start - current)) {
                                    // If closer to next tournament, begin showing next
                                    tempActiveTournamentId = currentTournament.tournamentId;
                                    // Display pool entry form when next tournament is approaching
                                    isReadyToFetchNewTournamentInfo = true;
                                    break;
                                } else {
                                    // If closer in time to last tournaments end, keep active
                                    tempActiveTournamentId = previousTournament.tournamentId;
                                    break;
                                }
                            }
                        }
                    } else {
                        // Before first tournament of year
                        tempActiveTournamentId = currentTournament.tournamentId;
                        break
                    }
                }
            }
            // console.log("isReadyToFetchNewTournamentInfo", isReadyToFetchNewTournamentInfo)
            // console.log("dfsSalaries", dfsSalaries)
            // console.log("dfsSalaries.length > 0", dfsSalaries.length > 0)
            // console.log("((isReadyToFetchNewTournamentInfo) && (dfsSalaries.length > 0))", ((isReadyToFetchNewTournamentInfo) && (dfsSalaries.length > 0)))
            setActiveTournamentId(tempActiveTournamentId);
            setHighlightedTournamentId(tempActiveTournamentId);
            fetchMongoCourses(currentFormattedDate, tempActiveTournamentId);
            // If between tournaments and tournament data is ready to be fetched, first determine if data is already in mongo otherwise fetched from mongo
            fetchMongoPlayers(currentFormattedDate, tempActiveTournamentId, ((isReadyToFetchNewTournamentInfo) && (dfsSalaries.length > 0)) ? true : false);
            fetchMongoLeaderboard(currentFormattedDate, tempActiveTournamentId, isReadyToGetUpdatedLeaderboardInfo, currentTournamentDay);
            fetchMongoPoolEntries(currentFormattedDate, tempActiveTournamentId);
            // console.log("----currentTournamentDay",currentTournamentDay) // current bug with UTC date format sending current day + 1 
            if (currentTournamentDay) setActiveTournamentDay(currentTournamentDay); // Call setActiveTournamentDay when tournament in progress to aide leaderboard display
        }
    }, [schedule]);

    // After tournamentResponse is returned, set tournament data in mongo (players, course info, event info)
    useEffect(() => {
        if (configuration === "rapidApi") {
            calculateCourseData();
            calculatePlayerData();
            retrieveLeaderboardDataRapid();
        }
        if ((dfsSalaries.length > 0) && highlightedTournamentId) fetchMongoDfs(actualYear, highlightedTournamentId, true);
    }, [tournamentResponse]);

    // After leaderboardResponse is returned, set leaderboard data in mongo
    useEffect(() => {
        calculateLeaderboardData();
    }, [leaderboardResponse]);

    // After players have been set for current tournament, fetch DFS salaries from mongo
    useEffect(() => {
        if (actualYear && highlightedTournamentId) {
            fetchMongoDfs(actualYear, highlightedTournamentId, true)
        }
    }, [allPlayers])

    // If players already fetched and DFS salaries are not already in mongo, begin to store all data
    useEffect(() => {
        if (readyToCalculateDfsSalaries && allPlayers && dfsSalaries) {
            let tempPlayerSalaries = [];
    
            let allPlayersNameWithoutSpaces = []
            let tempAllPlayersWithoutSpaces = [];
            for (let i = 0; i < allPlayers.players.length; i++) {
                const currentPlayer = allPlayers.players[i];
                const playerNameWithoutSpaces = `${(currentPlayer.firstName).replace(" ", "")}${(currentPlayer.lastName).replace(" ", "")}`;
                allPlayersNameWithoutSpaces.push(playerNameWithoutSpaces)
                tempAllPlayersWithoutSpaces.push({
                    ...currentPlayer,
                    playerNameWithoutSpaces
                });
            }
    
            let salaryNamesWithoutSpaces = []
            let salaryPlayersNotFoundInPlayersListFromMongo = [];
            for (let i = 0; i < dfsSalaries.length; i++) {
                const currentDfsPlayer = dfsSalaries[i];
                const currentDfsPlayerWithoutSpaces = (currentDfsPlayer.name).replace(" ", "");
                salaryNamesWithoutSpaces.push(currentDfsPlayerWithoutSpaces)
                const playerFoundIndex = tempAllPlayersWithoutSpaces.findIndex(player => player.playerNameWithoutSpaces === currentDfsPlayerWithoutSpaces);
                if (playerFoundIndex >= 0) {
                    // Resetting player object to only include necessary fields (playerId can be linked to leaderboard)
                    tempPlayerSalaries.push({
                        firstName: tempAllPlayersWithoutSpaces[playerFoundIndex].firstName,
                        lastName: tempAllPlayersWithoutSpaces[playerFoundIndex].lastName,
                        playerId: tempAllPlayersWithoutSpaces[playerFoundIndex].playerId,
                        isAmateur: tempAllPlayersWithoutSpaces[playerFoundIndex].isAmateur,
                        salary: parseFloat((currentDfsPlayer.salary / 500).toFixed(2))
                    });
                } else {
                    console.error(`Player with salary not found in Rapid API data: ${currentDfsPlayer.name} (Salary: ${currentDfsPlayer.salary})`)
                    salaryPlayersNotFoundInPlayersListFromMongo.push({
                        ...currentDfsPlayer
                    });
                }
            }

            const tempSortedDfsSalaries = tempPlayerSalaries.sort((a, b) => {
                if (a.salary !== b.salary) {
                    return b.salary - a.salary; // Sort by "salary"
                } else {
                    return a.lastName - b.lastName; // If "salary" values are equal, sort by "lastName"
                }
            });

            const tempDfsObj = {
                year: actualYear,
                tournamentId: highlightedTournamentId,
                salaries: tempSortedDfsSalaries
            }

            setDfs(tempDfsObj);
            setSortedDfsSalaries(tempSortedDfsSalaries);
            saveDfs(tempDfsObj);
        }
    }, [allPlayers, readyToCalculateDfsSalaries])

    // Once pool data is fetched from mongo, begin calculating leaderboard
    useEffect(() => {
        if (pool && leaderboard && !poolLeaderboardUpdated) {
            calculatePoolData();
        }
    }, [pool, leaderboard])

    // Set loading state
    useEffect(() => {
        if (!(isScheduleLoading || isCoursesLoading || isAllPlayersLoading || isLeaderboardLoading || isDfsLoading || isPoolFormEntryLoading || isPoolLoading)) {
            setIsLoading(false);
        } else {
            setIsLoading(true);
        }
    }, [isScheduleLoading, isCoursesLoading, isAllPlayersLoading, isLeaderboardLoading, isDfsLoading, isPoolFormEntryLoading, isPoolLoading]);
    

    // END USEEFFECTS


    // START MONGO SAVES


    // Store schedule in mongo
    const saveSchedule = (obj) => {
        setIsScheduleLoading(true);
        axios.put('https://worldofjack-server.onrender.com/add-schedule', obj)
            .then((response) => {
                setSnackbarMessages([...snackbarMessages, "Schedule saved"]);
                setIsScheduleLoading(false);
            })
            .catch((error) => {
                setSnackbarMessages([...snackbarMessages, "Error saving schedule"]);
                console.error('Error saving schedule:', error);
                setIsScheduleLoading(false);
            });
    }

    // Store score info in mongo
    const saveCourses = (obj) => {
        setIsCoursesLoading(true);
        axios.put('https://worldofjack-server.onrender.com/add-courses', obj)
        .then((response) => {
            setSnackbarMessages([...snackbarMessages, "Courses saved"]);
            setIsCoursesLoading(false);
        })
        .catch((error) => {
            setSnackbarMessages([...snackbarMessages, "Error saving courses"]);
            console.error('Error saving courses:', error);
            setIsCoursesLoading(false);
        });
    }

    // Store tournament data in mongo (players, course info, event info)
    const savePlayers = (obj) => {
        setIsAllPlayersLoading(true);
        axios.put('https://worldofjack-server.onrender.com/add-players', obj)
            .then((response) => {
                setSnackbarMessages([...snackbarMessages, "Players saved"]);
                setIsAllPlayersLoading(false);
            })
            .catch((error) => {
                setSnackbarMessages([...snackbarMessages, "Error saving players"]);
                console.error('Error saving players:', error);
                setIsAllPlayersLoading(false);
            });
    }

    // Store leaerboard info in mongo
    const saveLeaderboard = (obj) => {
        setIsLeaderboardLoading(true);
        axios.put('https://worldofjack-server.onrender.com/add-leaderboard', obj)
            .then((response) => {
                setSnackbarMessages([...snackbarMessages, "Leaderboard saved"]);
                setIsLeaderboardLoading(false);
            })
            .catch((error) => {
                setSnackbarMessages([...snackbarMessages, "Error saving leaderboard"]);
                console.error('Error saving leaderboard:', error);
                setIsLeaderboardLoading(false);
            });
    }

    // Store leaerboard info in mongo
    const saveDfs = (obj) => {
        setIsDfsLoading(true);
        axios.put('https://worldofjack-server.onrender.com/add-dfs', obj)
            .then((response) => {
                setSnackbarMessages([...snackbarMessages, "DFS salaries saved"]);
                setIsDfsLoading(false);
            })
            .catch((error) => {
                setSnackbarMessages([...snackbarMessages, "Error saving DFS salaries"]);
                console.error('Error saving DFS salaries:', error);
                setIsDfsLoading(false);
            });
    }

    // Store pool form entry
    const savePoolFormEntry = (obj) => {
        setIsPoolFormEntryLoading(true);
        axios.post('https://worldofjack-server.onrender.com/add-poolEntry', obj)
            .then((response) => {
                setSnackbarMessages([...snackbarMessages, "Pool entry saved"]);
                setIsPoolFormEntryLoading(false);
                setPoolForm({
                    errors: {},
                    checkbox: false,
                    name: poolForm.name,
                    phone: poolForm.phone,
                    email: poolForm.email 
                });
                setDisplayEntrySubmittedMessage(true);
            })
            .catch((error) => {
                setSnackbarMessages([...snackbarMessages, "Error saving pool entry"]);
                console.error('Error saving pool entry form:', error);
                setIsPoolFormEntryLoading(false);
            });
    }


    // END MONGO SAVES


    // START MONGO GETS


    const fetchMongoSchedule = async (currentYear) => {
        setIsScheduleLoading(true);
        try {
            await axios.get("https://worldofjack-server.onrender.com/get-schedule", { params: { year: currentYear }})
                .then((response) => {
                    setSchedule(response.data);
                    setIsScheduleLoading(false);
                })
        } catch (err) {
            console.error('Error fetching saved schedule');
            setIsScheduleLoading(false);
        }
    }

    const fetchMongoCourses = async (currentYear, tournamentId) => {
        setIsCoursesLoading(true);
        try {
            await axios.get("https://worldofjack-server.onrender.com/get-courses", { params: { year: currentYear, tournamentId: tournamentId }})
                .then((response) => {
                    setCourses(response.data);
                    setIsCoursesLoading(false);
                })
        } catch (err) {
            console.error('Error fetching saved courses');
            setIsCoursesLoading(false);
        }
    }

    const fetchMongoPlayers = async (currentYear, tournamentId, retrieveTournamentDataWhenReadyAndSavedPlayersNotFound) => {
        setIsAllPlayersLoading(true);
        try {
            await axios.get("https://worldofjack-server.onrender.com/get-players", { params: { year: currentYear, tournamentId: tournamentId }})
                .then((response) => {
                    setAllPlayers(response.data);
                    setIsAllPlayersLoading(false);
                })
        } catch (err) {
            console.error('Error fetching saved players');
            setIsAllPlayersLoading(false);
            // console.log("retrieveTournamentDataWhenReadyAndSavedPlayersNotFound",retrieveTournamentDataWhenReadyAndSavedPlayersNotFound)
            if (retrieveTournamentDataWhenReadyAndSavedPlayersNotFound) {
                // retrieveTournamentDataRapid();
            }
        }
    }

    const fetchMongoLeaderboard = async (currentYear, tournamentId, isReadyToGetUpdatedLeaderboardInfo = false, currentTournamentDay = null) => {
        if (!setPreventTournamentRetries && currentYear && tournamentId) {
            setIsLeaderboardLoading(true);
            // Need to add timestamp to payload (in milliseconds)
            try {
                // await axios.get("https://worldofjack-server.onrender.com/get-leaderboard", { params: { year: currentYear, tournamentId: tournamentId }})
                await axios.get("https://worldofjack-server.onrender.com/get-leaderboard", { params: { year: currentYear, tournamentId: tournamentId }})
                    .then((response) => {
                        const timestamp = moment.utc().valueOf();
                        // Conditions for pulling an updated leaderboard below, otherwise set fetched leaderboard
                        if (
                            // It's been at least an hour since last fetch
                            ((timestamp - response.data.timestamp) > 3600000)
                            // It's a tournament day
                            && isReadyToGetUpdatedLeaderboardInfo
                            // Round is not in "Official" (completed) status
                            && !((currentTournamentDay === response.data.roundId) && (response.data.roundStatus !== "Official"))
                            // Tournament is not complete
                            && !response.data.status !== "Official"
                        ) {
                            console.log("Leaderboard last fetched greater than 1 hour ago, about to fetch new leaderboard");
                            setPreventTournamentRetries(true);
                            retrieveLeaderboardDataRapid();
                        } else {
                            // When not going to overwrite recently fetched leaderboard, set leaderboard and erase loading state
                            setLeaderboard(response.data);
                            setIsLeaderboardLoading(false);
                        }
                    })
            } catch (err) {
                // Fetch new leaderboard when tournament in progress and no existing leaderboard is available
                console.error(`Error fetching saved players${isReadyToGetUpdatedLeaderboardInfo && !preventRetries && ", attempting to fetch initial leaderboard"}`);
                if (isReadyToGetUpdatedLeaderboardInfo && !preventRetries) {
                    setPreventTournamentRetries(true);
                    retrieveLeaderboardDataRapid();
                } 
                setIsLeaderboardLoading(false);
            }
        }
    }

    const fetchMongoDfs = async (currentYear, tournamentId, beginDfsCalculations) => {
        setIsDfsLoading(true);
        if (currentYear && tournamentId) {
            try {
                await axios.get("https://worldofjack-server.onrender.com/get-dfs", { params: { year: currentYear, tournamentId: tournamentId }})
                    .then((response) => {
                        setDfs(response.data);
                        setSortedDfsSalaries(response.data.salaries);
                        setIsDfsLoading(false);
                    })
            } catch (err) {
                console.error('Error fetching saved DFS');
                setIsDfsLoading(false);
                if (beginDfsCalculations) setReadyToCalculateDfsSalaries(true);
            }
        } else {
            console.error(`Did not begin fetching DFS, did not have year (${currentYear}) or tournamantId (${tournamentId})`)
        }
    }

    const fetchMongoPoolEntries = async (currentYear, tournamentId) => {
        setIsPoolLoading(true);
        if (currentYear && tournamentId) {
            try {
                await axios.get("https://worldofjack-server.onrender.com/get-poolEntries", { params: { year: currentYear, tournamentId: tournamentId }})
                    .then((response) => {
                        setPool(response.data);
                        setIsPoolLoading(false);
                    })
            } catch (err) {
                console.error('Error fetching pool entries');
                setIsPoolLoading(false);
            }
        } else {
            console.error(`Did not begin fetching pool entries, did not have year (${currentYear}) or tournamantId (${tournamentId})`)
        }
    }


    // END MONGO GETS
    
    
    // START CALCULATIONS


    const calculateScheduleData = () => {
        if (scheduleResponse) {
            // Set tournament schedule
            let tempSchedule = [];
            for (let i = 0; i < scheduleResponse.schedule.length; i++) {
                const currentTournament = scheduleResponse.schedule[i];
                // In 2026, this might not work as expected, due to date formats
                const rawStartDate = currentTournament.date.start;
                const rawEndDate = currentTournament.date.end;
                const formattedStartDate = moment(rawStartDate).utc().format('MM/DD/YY');
                const formattedEndDate = moment(rawEndDate).utc().format('MM/DD/YY');
                tempSchedule.push({
                    tournamentId: currentTournament.tournId,
                    name: currentTournament.name,
                    startDate: formattedStartDate,
                    endDate: formattedEndDate,
                    weekNumber: parseInt(currentTournament.date.weekNumber)
                });
            }
            tempSchedule = tempSchedule.sort((a, b) => a.weekNumber - b.weekNumber)
            
            const tempScheduleObj = {
                year: scheduleResponse.year,
                schedule: tempSchedule
            };

            setSchedule(tempScheduleObj);
            saveSchedule(tempScheduleObj);
        }
    }

    const calculateCourseData = () => {
        if (tournamentResponse && tournamentResponse.courses) {
            // Set course(s)
            const responseCourses = tournamentResponse.courses;
            const tempCourses = []
            for (let i = 0; i < responseCourses.length; i++) {
                const currentCourse = responseCourses[i];
                tempCourses.push({
                    tournamentId: tournamentResponse.tournId,
                    courseId: currentCourse.courseId,
                    courseName: currentCourse.courseName,
                    holes: currentCourse.hole,
                    location: currentCourse.location,
                    parTotal: currentCourse.parTotal
                });
            }

            const tempCoursesObj = {
                year: tournamentResponse.year,
                tournamentId: tournamentResponse.tournId,
                courses: tempCourses
            };

            setCourses(tempCoursesObj);
            saveCourses(tempCoursesObj);
        }
    }

    const calculatePlayerData = () => {
        if (tournamentResponse && tournamentResponse.players) {
            // Set players
            const responsePlayers = tournamentResponse.players;
            const tempPlayers = []
            for (let i = 0; i < responsePlayers.length; i++) {
                const currentPlayer = responsePlayers[i];
                tempPlayers.push({
                    firstName: currentPlayer.firstName,
                    lastName: currentPlayer.lastName,
                    playerId: currentPlayer.playerId,
                    isAmateur: currentPlayer.isAmateur,
                    teeTimes: currentPlayer.teeTimes
                });
            }
            const tempAllPlayersObj = {
                year: tournamentResponse.year,
                tournamentId: tournamentResponse.tournId,
                players: tempPlayers,
            };

            setAllPlayers(tempAllPlayersObj);
            savePlayers(tempAllPlayersObj);
        } else {
            setSnackbarMessages([...snackbarMessages, "Player information for this tournament is not available yet."]);
            setAllPlayers(null);
        }
    }

    const calculateLeaderboardData = () => {
        if (leaderboardResponse && leaderboardResponse.leaderboardRows) {
            // Set leaderboard
            const responseLeaderboard = leaderboardResponse.leaderboardRows;
            const tempLeaderboard = []
            for (let i = 0; i < responseLeaderboard.length; i++) {
                const currentPlayer = responseLeaderboard[i];
                tempLeaderboard.push({
                    playerDemographics: {
                        firstName: currentPlayer.firstName || null,
                        lastName: currentPlayer.lastName || null,
                        playerId: currentPlayer.playerId || null,
                        isAmateur: currentPlayer.isAmateur || null,
                    },
                    tournamentInfo: {
                        teeTime: currentPlayer.teeTime || null,
                        courseId: currentPlayer.courseId || null,
                    },
                    scoring: {
                        totalScoreToPar: currentPlayer.total || null, // String - "-", "-23", "+9"
                        position: currentPlayer.position || null, // Number - determines standings, can definitely be "CUT" value (see AMEX)
                        rounds: currentPlayer.rounds || null,
                    },
                    progress: {currentRoundScore: currentPlayer.currentRoundScore || null, // Number - indicated 1-4 which round is being played currently
                        thru: currentPlayer.thru || null, // Appears as string "F" right now, could this be a number?
                    },
                });
            }

            const tempLeaderboardObj = {
                displayDownIcon: true, // Determines which direction leaderboard sort arrow should be pointed
                lastAppliedSortMethod: 1, // id passed from handleLeaderboardSortMethodChange based on row count
                roundId: leaderboardResponse.roundId,
                roundStatus: leaderboardResponse.roundStatus, // "Official" = completed round
                year: leaderboardResponse.year,
                tournamentId: leaderboardResponse.tournId,
                leaderboard: tempLeaderboard,
                timestamp: moment.utc().valueOf(),
                status: leaderboardResponse.status, // "In Progress" = tournament still in progress
                cutLines: leaderboardResponse.cutLines
            };

            setLeaderboard(tempLeaderboardObj);
            saveLeaderboard(tempLeaderboardObj);
        }
    }

    const calculatePoolData = () => {
        let tempPoolData = [];

        for (let i = 0; i < pool.length; i++) {
            let players = [];
            for (let j = 0; j < pool[i].entryData.selectedPlayers.length; j++) {
                const playerLeaderboardIndex = leaderboard.leaderboard.findIndex(player => player.playerDemographics.playerId === pool[i].entryData.selectedPlayers[j].playerId);
                const playerLeaderboardInfo = leaderboard.leaderboard[playerLeaderboardIndex];
                let tempPlayerObj = {
                    salary: pool[i].entryData.selectedPlayers[j].salary,
                    position: playerLeaderboardInfo.scoring.position,
                    lastName: playerLeaderboardInfo.playerDemographics.lastName,
                    firstName: playerLeaderboardInfo.playerDemographics.firstName,
                    playerId: playerLeaderboardInfo.playerDemographics.playerId,
                    totalScoreToPar: playerLeaderboardInfo.scoring.totalScoreToPar,
                    thru: playerLeaderboardInfo.progress.thru,
                    currentRoundScore: playerLeaderboardInfo.progress && playerLeaderboardInfo.progress.currentRoundScore ? playerLeaderboardInfo.progress.currentRoundScore : null,
                    roundsUsed: []
                };
                for (let round = 0; round < 4; round++) {
                    if (round < activeTournamentDay) {
                        tempPlayerObj[`round${round + 1}`] = playerLeaderboardInfo.scoring.rounds && playerLeaderboardInfo.scoring.rounds[round]
                            ? playerLeaderboardInfo.scoring.rounds[round].scoreToPar === "E"
                                ? "0"
                                : playerLeaderboardInfo.scoring.rounds[round].scoreToPar
                            : playerLeaderboardInfo.progress.currentRoundScore
                                ? playerLeaderboardInfo.progress.currentRoundScore
                                : "-"
                    }
                }
                players.push(tempPlayerObj);
            }

            // Array of arrays containing players whose round scores where counted
            let roundScoresUsedByPlayerIds = [];

            for (let round = 0; round < 4; round++) {
                let allRoundScores = [];
                for (let i = 0; i < players.length; i++) {
                    const playerLeaderboardIndex = leaderboard.leaderboard.findIndex(player => player.playerDemographics.playerId === players[i].playerId);
                    allRoundScores.push({
                        playerId: players[i].playerId,
                        thru: leaderboard.leaderboard[playerLeaderboardIndex].progress.thru ? leaderboard.leaderboard[playerLeaderboardIndex].progress.thru : "-",
                        scoreToPar: players[i][`round${round + 1}`]
                    })
                }
                allRoundScores = allRoundScores.sort((a, b) => (a.scoreToPar === "-" ? 18 : a.scoreToPar === "E" ? 0 : parseInt(a.scoreToPar)) - (b.scoreToPar === "-" ? 18 : b.scoreToPar === "E" ? 0 : parseInt(b.scoreToPar)));
                roundScoresUsedByPlayerIds.push(allRoundScores.slice(0, 4));
            }

            let tempScoringObj = {
                totalScoreToPar: 0,
                round1: 0,
                round2: 0,
                round3: 0,
                round4: 0,
            }

            for (let round = 0; round < 4; round++) {
                for (let i = 0; i < roundScoresUsedByPlayerIds[round].length; i++) {
                    const playerCurrentRoundScoreToPar = (!roundScoresUsedByPlayerIds[round]) || (roundScoresUsedByPlayerIds[round][i].scoreToPar === "-") ? 18 : roundScoresUsedByPlayerIds[round][i].scoreToPar === "E" ? 0 : parseInt(roundScoresUsedByPlayerIds[round][i].scoreToPar);
                    tempScoringObj[`round${round + 1}`] = tempScoringObj[`round${round + 1}`] + playerCurrentRoundScoreToPar;
                    tempScoringObj.totalScoreToPar = tempScoringObj.totalScoreToPar + playerCurrentRoundScoreToPar;
                    const playerIndex = players.findIndex(player => player.playerId == roundScoresUsedByPlayerIds[round][i].playerId);
                    players[playerIndex] = {
                        ...players[playerIndex],
                        roundsUsed: [...players[playerIndex].roundsUsed, round + 1]
                    }
                }
            }

            // Iterate each player
            for (let i = 0; i < players.length; i++) {
                // Store total strokes to par current player has contributed to total score
                let tempCountedScoreToPar = 0;

                // Iterate each round
                for (let round = 0; round < roundScoresUsedByPlayerIds.length; round++) {
                    // 
                    const countedScoreIndex = roundScoresUsedByPlayerIds[round].findIndex(countedScorePlayer => countedScorePlayer.playerId === players[i].playerId);
                    if (countedScoreIndex !== -1) {
                        let tempScoreToBeAdded = 0;
                        if (roundScoresUsedByPlayerIds[round][countedScoreIndex].scoreToPar === "-") {
                            tempScoreToBeAdded = 18;
                        } else if (roundScoresUsedByPlayerIds[round][countedScoreIndex].scoreToPar === "E") {
                            tempScoreToBeAdded = 0;
                        } else {
                            tempScoreToBeAdded = parseInt(roundScoresUsedByPlayerIds[round][countedScoreIndex].scoreToPar);
                        }
                        tempCountedScoreToPar = tempCountedScoreToPar + tempScoreToBeAdded;
                    }
                }                

                players[i] = {
                    ...players[i],
                    countedScoreToPar: tempCountedScoreToPar
                }
            }

            tempPoolData.push({
                name: pool[i].entryData.name,
                salaryCapUsed: pool[i].entryData.salaryCapUsed,
                scoring: tempScoringObj,
                players: players.sort((a, b) => 
                    (
                        a.totalScoreToPar === "E"
                            ? 0
                            : a.totalScoreToPar === "-"
                                ? a.position === "CUT"
                                    ? 100
                                    : 101       
                                : a.totalScoreToPar
                    ) - (
                        b.totalScoreToPar === "E"
                        ? 0
                        : b.totalScoreToPar === "-"
                            ? b.position === "CUT"
                                ? 100
                                : 101       
                            : b.totalScoreToPar
                    ) 
                ),
            });
        }

        setPoolLeaderboard(tempPoolData);
        setPoolLeaderboardUpdated(true);
    }


    // END CALCULATIONS


    // START RAPID API OPERATIONS


    // Retrieve schedule data (entire PGA season data)
    const retrieveScheduleDataRapid = async () => {
        // Link
        // https://rapidapi.com/slashgolf/api/live-golf-data/playground/apiendpoint_93236d46-7a6c-4406-aa79-d333d08b717e
        
        if (currentYear && !preventScheduleRetries) {
            setPreventScheduleRetries(true);
            setIsScheduleLoading(true);
    
            const options = {
                method: 'GET',
                url: 'https://live-golf-data.p.rapidapi.com/schedule',
                params: {
                    orgId: '1',
                    year: currentYear
                },
                headers: {
                    'x-rapidapi-host': 'live-golf-data.p.rapidapi.com',
                    // 'x-rapidapi-key': '0598eb6b02msh5b4a6094ffc4e05p1c4f7djsnb241d4f5f1fe' // .n
                    'x-rapidapi-key': '61ed57e536msh30168bd1f1e8ffep126523jsnfd01ffcdc1bf' // 97
                }
            };
            
            try {
                const response = await axios.request(options);
                setScheduleResponse(response.data);
                setIsScheduleLoading(false);
            } catch (error) {
                console.error(error);
                setIsScheduleLoading(false);
            }
        }
    }

    // Retrieve tournament data (players, course info, event info)
    const retrieveTournamentDataRapid = async () => {
        // Link
        // https://rapidapi.com/slashgolf/api/live-golf-data/playground/apiendpoint_8a041a6a-98bc-4ed2-95af-4dcdb76f7c66
        // console.log("highlightedTournamentId", highlightedTournamentId)
        // console.log("currentYear ", currentYear )
        // console.log("!preventTournamentRetries", !preventTournamentRetries)
        if (highlightedTournamentId && currentYear && !preventTournamentRetries) {
            setPreventTournamentRetries(true);
            setIsCoursesLoading(true);
            setIsAllPlayersLoading(true);
    
            const options = {
                method: 'GET',
                url: 'https://live-golf-data.p.rapidapi.com/tournament',
                params: {
                    orgId: '1',
                    tournId: highlightedTournamentId,
                    year: currentYear
                },
                headers: {
                    'x-rapidapi-host': 'live-golf-data.p.rapidapi.com',
                    // 'x-rapidapi-key': '0598eb6b02msh5b4a6094ffc4e05p1c4f7djsnb241d4f5f1fe' // .n
                    'x-rapidapi-key': '61ed57e536msh30168bd1f1e8ffep126523jsnfd01ffcdc1bf' // 97
                }
            };
        
            try {
                const response = await axios.request(options);
                setTournamentResponse(response.data);
                setIsCoursesLoading(false);
                setIsAllPlayersLoading(false);
            } catch (error) {
                console.error(error);
                setIsCoursesLoading(false);
                setIsAllPlayersLoading(false);
            }
        } else {
            console.error("Did not attempt to get tournament info because highlightedTournamentId is missing")
        }
    }

    // Retrieve leaderboard info when tournament is in progress
    const retrieveLeaderboardDataRapid = async () => {
        // Link
        // https://rapidapi.com/slashgolf/api/live-golf-data/playground/apiendpoint_a6e32f80-75c7-4c35-ab1b-bbd685ee82f3

        if (highlightedTournamentId && currentYear && !setPreventLeaderboardRetries) {
            setIsLeaderboardLoading(true);
    
            const options = {
                method: 'GET',
                url: 'https://live-golf-data.p.rapidapi.com/leaderboard',
                params: {
                    orgId: '1',
                    tournId: highlightedTournamentId,
                    year: currentYear
                },
                headers: {
                    'x-rapidapi-host': 'live-golf-data.p.rapidapi.com',
                    // 'x-rapidapi-key': '0598eb6b02msh5b4a6094ffc4e05p1c4f7djsnb241d4f5f1fe' // .n
                    'x-rapidapi-key': '61ed57e536msh30168bd1f1e8ffep126523jsnfd01ffcdc1bf' // 97
                }
            };
              
            try {
                const response = await axios.request(options);
                setLeaderboardResponse(response.data);
                setIsLeaderboardLoading(false);
            } catch (error) {
                setPreventLeaderboardRetries(true);
                console.error(error);
                setIsLeaderboardLoading(false);
            }
        } else {
            console.error("Did not attempt to get leaderboard info because highlightedTournamentId is missing")
        }
    }


    // END RAPID API OPERATIONS


    // START HANDLE FUNCTIONS


    const handleRemoveSnackbarMessage = (messageToBeRemoved) => {
        let currentSnackbarMessages = snackbarMessages;
        let tempSnackbarMessages = [];
        for (let i; i < currentSnackbarMessages.length; i++) {
            if (currentSnackbarMessages[i] !== messageToBeRemoved) tempSnackbarMessages.push(currentSnackbarMessages[i]);
        }
        setSnackbarMessages(tempSnackbarMessages);
    }
    
    const handleFormChange = (valueUpdated, value) => {
        let errors = poolForm && poolForm.errors ? poolForm.errors : {};
        if (valueUpdated === "email") {
            const regex = /\S+@\S+\.\S+/;
            if (!regex.test(value)) {
                errors = {
                    ...errors,
                    [valueUpdated]: {
                        value: "Email",
                        description: "Invalid Email"
                    }
                }
            } else {
                let tempErrors = {};
                for (let i = 0; i < Object.keys(errors).length; i++) {
                    if (Object.keys(errors)[i] !== valueUpdated) {
                        tempErrors = {
                            ...tempErrors,
                            [`${Object.keys(errors)[i]}`]: errors[Object.keys(errors)[i]]
                        }
                    }
                }
                errors = tempErrors;
            }
        }

        setPoolForm({
            ...poolForm,
            errors: errors,
            [valueUpdated]: value
        });
    }

    const handleSubmitPoolEntry = () => {
        if (Object.keys(poolForm.errors).length > 0) {
            setDisplayPoolFormError(true);
        } else {
            let poolSubmissionObject = {
                year: currentYear,
                tournamentId: highlightedTournamentId,
                entryData: {
                    name: poolForm.name,
                    email: poolForm.email,
                    phone: poolForm.phone,
                    selectedPlayers: illustrativePlayers,
                    salaryCapUsed: illustrativeSalaryCap
                }
            }
            savePoolFormEntry(poolSubmissionObject);
        }
    }

    const handleDfsSortMethod = (method) => {
        // Set sort method and order
        let newSortOrder = (dfsSortMethod === "lastName" && method === "salary") ? "descending" : "ascending";
        if (method === dfsSortMethod) {
            if (dfsSortOrder === "ascending") newSortOrder = "descending";
        } else {
            setDfsSortMethod(method);
        }
        setDfsSortOrder(newSortOrder);

        // Sort players
        let tempSortedDfsSalaries = sortedDfsSalaries;
        if (method === "salary") {
            tempSortedDfsSalaries = tempSortedDfsSalaries.sort((a, b) => {
                if (a.salary !== b.salary) {
                    return a.salary - b.salary; // Sort by 'salary'
                } else {
                    return a.lastName - b.lastName; // When 'salary' values are equal, sort by 'lastName'
                }
            });
        } else {
            // Sorting by lastName
            tempSortedDfsSalaries = tempSortedDfsSalaries.sort((a, b) => {
                if (a.lastName < b.lastName) return -1;
                if (a.lastName > b.lastName) return 1;
            });
        }

        // Reverse array worder when sortMethod is selected twice in a row 
        if (newSortOrder === "descending") {
            let newOrder = [];
            for (let i = tempSortedDfsSalaries.length - 1; i >= 0; i--) newOrder.push(tempSortedDfsSalaries[i]);
            tempSortedDfsSalaries = newOrder;
        }

        setSortedDfsSalaries(tempSortedDfsSalaries);
    }

    const handleSetIllustrativePlayers = (player) => {
        // Make copy of existing illustrativePlayers
        let tempIllustrativePlayers = [...illustrativePlayers];

        // Build array of existing illustrativePlayers playerId's
        let illustrativePlayerIds = [];
        for (let i = 0; i < [...illustrativePlayers].length; i++) illustrativePlayerIds.push([...illustrativePlayers][i].playerId);

        // Set new illustrativePlayers array
        if ([...illustrativePlayerIds].includes(player.playerId)) {
            // Exclude existing illustrativePlayer (currently being deselected)
            let tempNewPlayers = [];
            for (let i = 0; i < [...tempIllustrativePlayers].length; i++) {
                if ([...tempIllustrativePlayers][i].playerId !== player.playerId) tempNewPlayers.push([...tempIllustrativePlayers][i]);
            }
            tempIllustrativePlayers = [...tempNewPlayers];
        } else {
            // Add newly selected illustrativePlayer to existing array
            tempIllustrativePlayers.push(player);
        }

        // Calculate salary cap
        let tempIllustrativeSalaryCap = 0;
        for (let i = 0; i < tempIllustrativePlayers.length; i++) {
            tempIllustrativeSalaryCap = parseFloat((tempIllustrativeSalaryCap + tempIllustrativePlayers[i].salary).toFixed(2));
        }

        setIllustrativePlayers(tempIllustrativePlayers);
        setIllustrativeSalaryCap(tempIllustrativeSalaryCap);
    }

    const handleLeaderboardSortMethodChange = (id, valueFormatter, objectBeingCompared, valueBeingCompared, nestedValue = null) => {
        let tempLeaderboard = [];

        if (leaderboard.lastAppliedSortMethod === id) {
            // When sort method has not changed, reverse order of existing leaderboard
            tempLeaderboard = [...leaderboard.leaderboard].reverse();
        } else {
            if (valueFormatter === "parseInt") {
                if (nestedValue) {
                    if (nestedValue.nestedDataType === "array") {
                        tempLeaderboard = leaderboard.leaderboard.sort((a, b) => {
                            // When compare round scores, ensure round existing for both rounds being compared, other 100, set "E" value to 0
                            const aValue = a[objectBeingCompared][valueBeingCompared][nestedValue.nestedIndex] ? a[objectBeingCompared][valueBeingCompared][nestedValue.nestedIndex][nestedValue.nestedValue] === "E" ? 0 : parseInt(a[objectBeingCompared][valueBeingCompared][nestedValue.nestedIndex][nestedValue.nestedValue]) : a[nestedValue.fallbackDataValue] === "E" ? 0 : 1000;
                            const bValue = b[objectBeingCompared][valueBeingCompared][nestedValue.nestedIndex] ? b[objectBeingCompared][valueBeingCompared][nestedValue.nestedIndex][nestedValue.nestedValue] === "E" ? 0 : parseInt(b[objectBeingCompared][valueBeingCompared][nestedValue.nestedIndex][nestedValue.nestedValue]) : b[nestedValue.fallbackDataValue] === "E" ? 0 : 1000;
                            return aValue - bValue;
                        });
                    }
                } else {
                    if (valueBeingCompared === "totalScoreToPar") {
                        // Position should sort by totalScoreToPar, then by 
                        tempLeaderboard = leaderboard.leaderboard.sort((a, b) => {
                            const aValue = a[objectBeingCompared][valueBeingCompared] === "E" ? 0 : a[objectBeingCompared][valueBeingCompared] === "-" ? 1000 : parseInt(a[objectBeingCompared][valueBeingCompared]);
                            const bValue = b[objectBeingCompared][valueBeingCompared] === "E" ? 0 : b[objectBeingCompared][valueBeingCompared] === "-" ? 1000 : parseInt(b[objectBeingCompared][valueBeingCompared]);
                            return aValue - bValue;
                        });
                    } else {
                        tempLeaderboard = leaderboard.leaderboard.sort((a, b) => parseInt(a[objectBeingCompared][valueBeingCompared]) - parseInt(b[objectBeingCompared][valueBeingCompared]));
                    }
                }
            } else if (valueFormatter === "string")  {
                tempLeaderboard = leaderboard.leaderboard.sort((a, b) => a[objectBeingCompared][valueBeingCompared].localeCompare(b[objectBeingCompared][valueBeingCompared]));
            } else if (valueFormatter === "thru") {
                tempLeaderboard = leaderboard.leaderboard.sort((a, b) => {
                    const aValue = a[objectBeingCompared][valueBeingCompared] === "-" ? 0 : a[objectBeingCompared][valueBeingCompared].includes("F") ? 1000 : parseInt(a[objectBeingCompared][valueBeingCompared].replace("*", ""));
                    const bValue = b[objectBeingCompared][valueBeingCompared] === "-" ? 0 : b[objectBeingCompared][valueBeingCompared].includes("F") ? 1000 : parseInt(b[objectBeingCompared][valueBeingCompared].replace("*", ""));
                    const aValue2 = a.scoring.totalScoreToPar;
                    const bValue2 = a.scoring.totalScoreToPar;
                    return aValue === bValue ? bValue2 - aValue2 : aValue - bValue;
                });
            } else {
                tempLeaderboard = leaderboard.leaderboard.sort((a, b) => a[objectBeingCompared][valueBeingCompared] - b[objectBeingCompared][valueBeingCompared]);
            }
        }

        setLeaderboard({
            ...leaderboard,
            lastAppliedSortMethod: id,
            // displayDownIcon should be true unless sort method has not changed, should flip arrow direction
            displayDownIcon: leaderboard.lastAppliedSortMethod === id ? !leaderboard.displayDownIcon : true,
            leaderboard: tempLeaderboard
        });
    }


    // END HANDLE FUNCTIONS 


    // START UI FUNCTIONS


    const getSortedSchedule = () => {
        let tempSortedSchedule = [];
        const tempSchedule = schedule.schedule;
        const highlightedTournamentIndex = tempSchedule.findIndex(tournament => tournament.tournamentId === highlightedTournamentId);
        tempSortedSchedule.push(tempSchedule[highlightedTournamentIndex]);
        for (let i = 0; i < tempSchedule.length; i++) {
            if (i !== highlightedTournamentIndex) tempSortedSchedule.push(tempSchedule[i]);
            const majorTournamentNames = [
                "Masters Tournament",
                "PGA Championship",
                "U.S. Open",
                "The Open Championship"
            ];
            if (majorTournamentNames.includes(tempSchedule[i].name)) {
                const majorTournamentIndex = tempSortedSchedule.findIndex(tournament => tournament.tournamentId === tempSchedule[i].tournamentId)
                tempSortedSchedule[majorTournamentIndex] = {
                    ...tempSortedSchedule[majorTournamentIndex],
                    majorTournament: true
                }
            }
        }
        return tempSortedSchedule;
    }

    const sortedSchedule = schedule && schedule.schedule ? highlightedTournamentId ? getSortedSchedule() : schedule.schedule : [];

    const getTournamentDatesFormattedWithoutYear = (tournament) => {
        const startDateArray = tournament.startDate.split("/");
        const endDateArray = tournament.endDate.split("/");
        return `${startDateArray[0]}/${startDateArray[1]} - ${endDateArray[0]}/${endDateArray[1]}`;
    }

    const displayLeaderboardArrow = (id) => {
        if (leaderboard.lastAppliedSortMethod === id) {
            if (leaderboard.displayDownIcon) return <ArrowDropDownIcon />;
            else return <ArrowDropUpIcon />; 
        }
    }

    const handleScrollTo = (id) => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
    };


    // END UI FUNCTIONS


    // START RENDER FUNCTION


    return (
        <div className="flexColumn alignCenter paddingBottomMassive golf pool">
            {/* Display loader when fetching data */}
            {isLoading && <div className="alignCenter" style={{ marginTop: "40vh" }}><CircularProgress /></div>}
            {!isLoading && 
                <div className="width100Percent flexColumn alignCenter">
                    {/* Tournament selection dropdown */}
                    {schedule &&
                        <FormControl sx={{ m: 1 }} variant="filled">
                            <Select
                                labelId="demo-multiple-checkbox-label"
                                id="scheduleDropdown"
                                deafultValue={highlightedTournamentId}
                                value={activeTournamentId}
                                onChange={(e) => setActiveTournamentId(e.target.value)}
                            >
                                {sortedSchedule.map((tournament, i) => (
                                    <MenuItem key={tournament.tournamentId} value={tournament.tournamentId}>
                                        <div className={`width100Percent justifySpaceBetween ${highlightedTournamentId === tournament.tournamentId ? " hidePushPin" : ""}`}>
                                            <div className="flexRow marginRightMedium">
                                                <span className="marginRightMedium">{getTournamentDatesFormattedWithoutYear(tournament)}</span>
                                                {tournament.majorTournament && <SportsGolfIcon />}
                                                <b>{tournament.name}</b>
                                            </div>
                                            {i == 0 &&
                                                <PushPin />
                                            }
                                        </div>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    }


                    {/*
                    Pool entry form

                    Only display when current tournament is selected?
                        If future tournament is selected, display messaging "There is nothing to display right now"
                            Or just display future tournament info?


                    Static
                        tournament name
                        dates
                        Course

                    SCORING RULES modal
                    
                    Links for datagolf? as modal?
                    
                    Validations atop page
                    - Salary

                    Full Name
                    Email - field validation
                    List of players - multiple columns if there's room?

                    Radio button "I have submitted payment via Venmo or Apple Pay" <b>WITH THE TOURNAMENT NAME IN THE DESCRIPTION</b>
                    (optional) share venmo name if it's weird
                    (optional) phone number - in case one of your golfers has WD prior to tournament, I can text you (instead of email), otherwise I will choose a player for you with the next closest salary with highest PPG on DraftKings

                    if desktop, can display L/R section
                        Large text box for "suggestions"


                    Enable submit button once everything is valid


                    Regulations
                        Attempting to submit multiple entries without payment will result in both being removed
                        An email will be sent at the beginning on the tournament

                        Thank you for joining, and join us next week!



                        (Auto invite for next tournament - or opt out) button click should add to "email list" collection
                        Options for removing from email list
                    
                    */}



                    
                    {/* Pool entry form */}
                    {!leaderboard && dfs && dfs.salaries && (activeTournamentId === highlightedTournamentId) &&
                        <div style={{ width: "85%" }}>
                            {/* Pool entry form */}
                            <div className="flexColumn" style={{ width: "420px", margin: "16px auto" }}>
                                {/* Submitted message */}
                                {displayEntrySubmittedMessage && 
                                    <Alert severity="success" style={{ marginTop: "16px", marginBottom: "16px", width: "390px" }}>
                                        Your entry was submitted successfully. Your selections have been saved if you would like to submit another entry.
                                    </Alert>
                                }
                                {/* Errors */}
                                {Object.keys(poolForm.errors).length > 0 && displayPoolFormError && 
                                    <Alert severity="warning" style={{ marginTop: "16px", marginBottom: "16px", width: "420px" }}>
                                        <h3>Fix the following errors before submitting:</h3>
                                        <ul className="noMargin">
                                            {Object.keys(poolForm.errors).map(error => {
                                                return (
                                                    <li key={error.value}><b>{poolForm.errors[error].value}: </b> {poolForm.errors[error].description}</li>
                                                );
                                            })}
                                        </ul>
                                    </Alert>
                                }
                                {/* Entry form fields */}
                                <TextField value={poolForm.name || null} style={{ maxWidth: "420px" }} id="fullName" label="Full Name" variant="outlined" onChange={(e) => handleFormChange("name", e.target.value)} />
                                <TextField value={poolForm.phone || null} style={{ maxWidth: "420px" }} id="fullName" label="Phone" variant="outlined" onChange={(e) => handleFormChange("phone", e.target.value)} className="marginTopMedium"/>
                                <TextField value={poolForm.email || null} style={{ maxWidth: "420px" }} id="fullName" label="Email" variant="outlined" onChange={(e) => handleFormChange("email", e.target.value)} className="marginTopMedium"/>
                                <div className="formCheckbox marginTopMedium marginBottomMedium">
                                    <FormControlLabel control={<Checkbox onChange={() => handleFormChange("checkbox", poolForm.checkbox ? !poolForm.checkbox : true)} />} label={<div className="whiteFont">*I have paid via Venmo <b>@jcgilson</b> or Apple Pay <b>(317) 213-8188</b></div>} />
                                </div>
                                <Button
                                    variant="outlined"
                                    color="white"
                                    className="whiteButton"
                                    style={{ width: "84px", margin: "0 auto" }}
                                    disabled={(illustrativePlayers.length !== 6) || !poolForm.checkbox || (illustrativeSalaryCap > 100) || (displayPoolFormError && Object.keys(poolForm.errors).length > 0)}
                                    onClick={() => handleSubmitPoolEntry()}
                                >
                                    Submit
                                </Button>
                            </div>

                            <Divider className="marginTopExtraLarge" color="white" />

                            {/* Instructions and sorting */}
                            <div className="width100Percent flexRow justifySpaceBetween alignCenter" style={{ margin: "0 auto" }}>
                                <div className="flexRow">
                                    <h2 className="whiteFont">Select 6 players staying under the $100 salary cap</h2>
                                    <Tooltip
                                        title={
                                            <ul>
                                                <li key={1} className="whiteFont">Select 6 golfers staying under a $100 salary cap</li>
                                                <li key={2} className="whiteFont">Each round your top 4 golfers score is counted</li>
                                                <li key={3} className="whiteFont">Cut players round scores become +18</li>
                                            </ul>
                                        }
                                    >
                                        <InfoIcon fontSize="small" className="whiteFont marginLeftMedium" />
                                    </Tooltip>
                                </div>
                                <div className="flexRow alignCenter marginTopMedium marginBottomMedium">
                                    <h3 className="whiteFont paddingBottomExtraSmall">Sort by</h3>
                                    <div className="flexRow alignCenter marginLeftSmall" onClick={() => handleDfsSortMethod("salary")}>
                                        <div style={{ width: "24px" }}>
                                            {dfsSortMethod === "salary"
                                                ? dfsSortOrder === "ascending"
                                                ? <NorthIcon className="whiteFont" />
                                                : <SouthIcon className="whiteFont" />
                                                : null
                                            }
                                        </div>
                                        <h2 className="whiteFont paddingBottomSmall" style={{ textDecoration: "underline" }}>Salary</h2>
                                    </div>
                                    <div className="flexRow alignCenter marginLeftMedium" onClick={() => handleDfsSortMethod("lastName")}>
                                        <div style={{ width: "24px" }}>
                                            {dfsSortMethod === "lastName"
                                                ? dfsSortOrder === "ascending"
                                                ? <SouthIcon className="whiteFont" />
                                                : <NorthIcon className="whiteFont" />
                                                : null
                                            }
                                        </div>
                                        <h2 className="whiteFont paddingBottomSmall" style={{ textDecoration: "underline" }}>Name</h2>
                                    </div>
                                </div>
                            </div>

                            {/* Illustrative player selection */}
                            <FormGroup>
                                <ul style={{ marginTop: "0px", paddingLeft: "0", columnCount: screenWidth > 1480 ? "6" : screenWidth < 900 ? "2" : "3", columnGap: "16px" }}>
                                    {sortedDfsSalaries.map(player => {
                                        return (
                                            <li key={player.playerId} className={`flexRow alignCenter playerOption${!(illustrativePlayers.map(currentPlayer => currentPlayer.playerId)).includes(player.playerId) && illustrativePlayers.length == 6 ? " disabled" : ""}`} >
                                                <FormControlLabel
                                                    checked={(illustrativePlayers.map(currentPlayer => currentPlayer.playerId)).includes(player.playerId)}
                                                    disabled={
                                                        !(illustrativePlayers.map(currentPlayer => currentPlayer.playerId)).includes(player.playerId) && illustrativePlayers.length == 6
                                                    }
                                                    control={
                                                        <Checkbox onClick={() => handleSetIllustrativePlayers(player)}/>
                                                    }
                                                    label={
                                                        <p className="whiteFont" style={{ maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                            <span className="marginRightExtraSmall">$</span>
                                                            <b className="whiteFont" style={{ display: "inline-block", width: "40px" }}>{player.salary} </b>
                                                            {player.isAmateur ? "(a) " : ""}{player.lastName}, {player.firstName}
                                                        </p>
                                                    }
                                                />
                                                
                                            </li>
                                        )
                                    })}
                                </ul>
                            </FormGroup>

                            {/* Select illustrative players accordion */}
                            {illustrativePlayers.length > 0 &&
                                <div style={{ position: "fixed", left: "calc(50% - 150px)",bottom: "0px", width: "300px" }}>
                                    <Accordion expanded={expandSelectedPlayers && illustrativePlayers.length > 0} onChange={() => setExpandSelectedPlayers(!expandSelectedPlayers)}>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls="panel1bh-content"
                                            id="panel1bh-header"
                                        >
                                            <span className="width100Percent justifySpaceBetween"><div>Lineup ({illustrativePlayers.length}/6 selected)</div><div style={{ marginRight: "16px" }} className={illustrativeSalaryCap <= 100 ? "greenFont" : "redFont"}>${illustrativeSalaryCap}</div></span>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Divider className="marginBottomMedium" />
                                            {illustrativePlayers.sort((a, b) => {
                                                if (a.salary !== b.salary) {
                                                    return a.salary - b.salary; // Sort by 'salary'
                                                } else {
                                                    return a.lastName - b.lastName; // If 'salary' values are equal, sort by 'lastName'
                                                }
                                            }).map(player => {
                                                return (
                                                    <p
                                                        key={player.playerId}
                                                        className="flexRow marginTopExtraSmall marginBottomExtraSmall"
                                                    >
                                                        <span className="marginRightExtraSmall">$</span>
                                                        <b style={{ display: "inline-block", width: "36px" }}>{player.salary}</b>
                                                        {player.isAmateur ? "(a) " : ""}{player.firstName} {player.lastName}
                                                    </p>
                                                );
                                            })}
                                            <Divider className="marginTopMedium" />
                                            <div className="width100Percent justifySpaceBetween marginTopMedium">
                                                <p>Salary</p>
                                                <span>
                                                    <span className={illustrativeSalaryCap <= 100 ? "greenFont" : "redFont"}>${illustrativeSalaryCap} </span>
                                                    / $100
                                                </span>
                                            </div>
                                        </AccordionDetails>
                                    </Accordion>
                                </div>
                            }
                        </div>
                    }


                    {/* Pool leaderboard and Leaderboard */}
                    <div className={screenWidth > 1480 ? "flexFlowRowWrap" : "flexColumn"}>
                        {leaderboard && poolLeaderboard &&
                            <div id="poolLeaderboard" style={{ width: screenWidth < 1000 ? "95%" : "640px", marginLeft: screenWidth < 1000 ? "2.5%" : "0", marginRight: screenWidth > 1480 ? "64px" : "0" }}>
                                <div className="flexRow justifySpaceBetween alignCenter">
                                    <h1 className="whiteFont marginTopMedium marginBottomMedium">Pool</h1>
                                    {screenWidth < 1480 && <b className="textDecoration whiteFont floatRight" onClick={() => handleScrollTo('leaderboard')}>Jump to Leaderboard</b>}
                                </div>
                                <Table className="poolLeaderboard">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell key={1} style={{ width: "70px" }}onClick={() => null}><h3 className="whiteFont">Position</h3></TableCell>
                                            <TableCell key={2} style={{ width: "70px" }}><h3 className="whiteFont">Salary</h3></TableCell>
                                            <TableCell key={3} style={{ width: "200px" }}><h3 className="whiteFont">Name</h3></TableCell>
                                            <TableCell key={4} style={{ width: "70px", textAlign: "center" }}><h3 className="whiteFont">R1</h3></TableCell>
                                            <TableCell key={5} style={{ width: "70px", textAlign: "center" }}><h3 className="whiteFont">R2</h3></TableCell>
                                            <TableCell key={6} style={{ width: "70px", textAlign: "center" }}><h3 className="whiteFont">R3</h3></TableCell>
                                            <TableCell key={7} style={{ width: "70px", textAlign: "center" }}><h3 className="whiteFont">R4</h3></TableCell>
                                            <TableCell key={8} style={{ width: "70px", textAlign: "center" }}><h3 className="whiteFont">THRU</h3></TableCell>
                                            <TableCell key={9} style={{ width: "70px", textAlign: "center" }}><h3 className="whiteFont">Total</h3></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {poolLeaderboard.sort((a, b) => a.scoring.totalScoreToPar - b.scoring.totalScoreToPar).map((entry, i) => {
                                            return (
                                                <>
                                                    {/* Entry header */}
                                                    <TableRow key={i}>
                                                        <TableCell style={{ backgroundColor: "#013021AA" }} key={1}>{i + 1}</TableCell>
                                                        <TableCell style={{ backgroundColor: "#013021AA" }} key={2}>${entry.salaryCapUsed}</TableCell>
                                                        <TableCell style={{ backgroundColor: "#013021AA" }} key={3}>{entry.name}</TableCell>
                                                        <TableCell style={{ backgroundColor: "#013021AA", textAlign: "center" }} key={4}>{entry.scoring.round1}</TableCell>
                                                        <TableCell style={{ backgroundColor: "#013021AA", textAlign: "center" }} key={5}>{entry.scoring.round2}</TableCell>
                                                        <TableCell style={{ backgroundColor: "#013021AA", textAlign: "center" }} key={6}>{entry.scoring.round3}</TableCell>
                                                        <TableCell style={{ backgroundColor: "#013021AA", textAlign: "center" }} key={7}>{entry.scoring.round4}</TableCell>
                                                        <TableCell style={{ backgroundColor: "#013021AA", textAlign: "center" }} key={8}></TableCell>
                                                        <TableCell style={{ backgroundColor: "#013021AA", textAlign: "center" }} key={9}>{entry.scoring.totalScoreToPar}</TableCell>
                                                    </TableRow>
                                                    {/* Score rows */}
                                                    {entry.players.map((player, j) => {
                                                        return (
                                                            <TableRow key={j + 100000}>
                                                                <TableCell key={j}></TableCell>
                                                                <TableCell key={j + 1}>${player.salary}</TableCell>
                                                                <TableCell key={j + 2}>{player.isAmateur ? "(a) " : ""}{player.firstName} {player.lastName}</TableCell>
                                                                <TableCell key={j + 3} style={{ textAlign: "center" }} className={!player.roundsUsed.includes(1) ? "strikethroughFont" : ""}>{player.round1 == 0 ? "E" : ["CUT", "WD"].includes(player.position) && player.round1 === "-" ? "+18" : player.round1}</TableCell>
                                                                <TableCell key={j + 4} style={{ textAlign: "center" }} className={!player.roundsUsed.includes(2) ? "strikethroughFont" : ""}>{player.round2 == 0 ? "E" : ["CUT", "WD"].includes(player.position) && player.round2 === "-" ? "+18" : player.round2}</TableCell>
                                                                <TableCell key={j + 5} style={{ textAlign: "center" }} className={!player.roundsUsed.includes(3) ? "strikethroughFont" : ""}>{player.round3 == 0 ? "E" : ["CUT", "WD"].includes(player.position) && player.round3 === "-" ? "+18" : player.round3}</TableCell>
                                                                <TableCell key={j + 6} style={{ textAlign: "center" }} className={!player.roundsUsed.includes(4) ? "strikethroughFont" : ""}>{player.round4 == 0 ? "E" : ["CUT", "WD"].includes(player.position) && player.round4 === "-" ? "+18" : player.round4}</TableCell>
                                                                <TableCell key={j + 7} style={{ textAlign: "center" }}>{player.thru ? player.thru : "NS"}</TableCell>
                                                                <TableCell key={j + 8} style={{ textAlign: "center" }}>{parseInt(player.countedScoreToPar) > 0 ? `+${player.countedScoreToPar}` : player.countedScoreToPar}</TableCell>
                                                            </TableRow>
                                                        )
                                                    })}
                                                </>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        }

                        {leaderboard && leaderboard.leaderboard &&
                            <div id="leaderboard" style={{ width: screenWidth < 1000 ? "95%" : "640px", marginLeft: screenWidth < 1000 ? "2.5%" : "0", marginTop: screenWidth > 1480 ? "0" : "24px" }}>
                                <div className="flexRow justifySpaceBetween alignCenter">
                                    <h1 className="whiteFont marginTopMedium marginBottomMedium">Leaderboard</h1>
                                    {screenWidth < 1480 && <b className="textDecoration whiteFont" onClick={() => handleScrollTo('poolLeaderboard')}>Jump to Pool</b>}
                                </div>
                                <Table className="poolLeaderboard">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell style={{ width: "70px" }} onClick={() => handleLeaderboardSortMethodChange(1, "parseInt", "scoring", "totalScoreToPar")}><div className="flexFlowRowNoWrap alignCenter" style={{ width: "70px" }}><h3 className="whiteFont">Position</h3>{displayLeaderboardArrow(1)}</div></TableCell>
                                            <TableCell style={{ width: "200px" }} onClick={() => handleLeaderboardSortMethodChange(2, "string", "playerDemographics", "lastName")}><div className="flexFlowRowNoWrap alignCenter"><h3 className="whiteFont">Name</h3>{displayLeaderboardArrow(2)}</div></TableCell>
                                            <TableCell style={{ width: "70px" }} onClick={() => handleLeaderboardSortMethodChange(3, "parseInt", "scoring", "rounds", { nestedDataType: "array", nestedIndex: 0, nestedValue: "scoreToPar", fallbackDataObject: "progress", fallbackDataValue: "currentRoundScore" })}><div className="flexFlowRowNoWrap justifyCenter alignCenter"><h3 className="whiteFont">R1</h3>{displayLeaderboardArrow(3)}</div></TableCell>
                                            {leaderboard.roundId > 1 && <TableCell style={{ width: "70px" }} onClick={() => handleLeaderboardSortMethodChange(4, "parseInt", "scoring", "rounds", { nestedDataType: "array", nestedIndex: 1, nestedValue: "scoreToPar", fallbackDataObject: "progress", fallbackDataValue: "currentRoundScore" })}><div className="flexFlowRowNoWrap justifyCenter alignCenter"><h3 className="whiteFont">R2</h3>{displayLeaderboardArrow(4)}</div></TableCell>}
                                            {leaderboard.roundId > 2 && <TableCell style={{ width: "70px" }} onClick={() => handleLeaderboardSortMethodChange(5, "parseInt", "scoring", "rounds", { nestedDataType: "array", nestedIndex: 2, nestedValue: "scoreToPar", fallbackDataObject: "progress", fallbackDataValue: "currentRoundScore" })}><div className="flexFlowRowNoWrap justifyCenter alignCenter"><h3 className="whiteFont">R3</h3>{displayLeaderboardArrow(5)}</div></TableCell>}
                                            {leaderboard.roundId > 3 && <TableCell style={{ width: "70px" }} onClick={() => handleLeaderboardSortMethodChange(6, "parseInt", "scoring", "rounds", { nestedDataType: "array", nestedIndex: 3, nestedValue: "scoreToPar", fallbackDataObject: "progress", fallbackDataValue: "currentRoundScore" })}><div className="flexFlowRowNoWrap justifyCenter alignCenter"><h3 className="whiteFont">R4</h3>{displayLeaderboardArrow(6)}</div></TableCell>}
                                            {leaderboard.roundStatus !== "Official" && <TableCell style={{ width: "70px" }} onClick={() => handleLeaderboardSortMethodChange(7, "thru", "progress", "thru")}><div className="flexFlowRowNoWrap justifyCenter alignCenter"><h3 className="whiteFont">THRU</h3>{displayLeaderboardArrow(7)}</div></TableCell>} {/* Hide tournament day round is official */}
                                            <TableCell style={{ width: "70px" }} onClick={() => handleLeaderboardSortMethodChange(8, "parseInt", "scoring", "totalScoreToPar")}><div className="flexFlowRowNoWrap justifyCenter alignCenter"><h3 className="whiteFont">Score</h3>{displayLeaderboardArrow(8)}</div></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {leaderboard.leaderboard.map((player, i) => {
                                            if ((i < ((poolLeaderboard.length * 7) - 1)) || leaderboardIsExpanded) {
                                                return (
                                                    <TableRow key={i}>
                                                        <TableCell key={1}>{player.scoring.position}</TableCell>
                                                        <TableCell key={2}>{player.playerDemographics && player.playerDemographics.isAmateur ? "(a) " : ""}{player.playerDemographics.firstName} {player.playerDemographics.lastName}</TableCell>
                                                        {/* If round is complete display current score to par from scoring.rounds array */}
                                                        <TableCell style={{ textAlign: "center" }} key={3}>{player.scoring.rounds[0] ? player.scoring.rounds[0].scoreToPar : (player.progress && player.progress.currentRoundScore) ? player.progress.currentRoundScore : "-"}</TableCell>
                                                        {leaderboard.roundId > 1 && <TableCell style={{ textAlign: "center" }} key={4}>{player.scoring.rounds[1] ? player.scoring.rounds[1].scoreToPar : (player.progress && player.progress.currentRoundScore) ? player.progress.currentRoundScore : "-"}</TableCell>}
                                                        {leaderboard.roundId > 2 && <TableCell style={{ textAlign: "center" }} key={5}>{player.scoring.rounds[2] ? player.scoring.rounds[2].scoreToPar : (player.progress && player.progress.currentRoundScore) ? player.progress.currentRoundScore : "-"}</TableCell>}
                                                        {leaderboard.roundId > 3 && <TableCell style={{ textAlign: "center" }} key={6}>{player.scoring.rounds[3] ? player.scoring.rounds[3].scoreToPar : (player.progress && player.progress.currentRoundScore) ? player.progress.currentRoundScore : "-"}</TableCell>}
                                                        {leaderboard.roundStatus !== "Official" && <TableCell style={{ textAlign: "center" }} key={7}>{player.progress && player.progress.thru ? player.progress.thru : "-"}</TableCell>}
                                                        <TableCell style={{ textAlign: "center" }} key={8}>{player.scoring.totalScoreToPar}</TableCell>
                                                    </TableRow>
                                                );
                                            }
                                        })}
                                        {!leaderboardIsExpanded &&
                                            <TableRow key={"last"} className="hideBorderBottom">
                                                <TableCell className="width100Percent margin0Auto textCenter paddingTopMedium" colSpan={8} onClick={() => setLeaderboardIsExpanded(true)}>
                                                    <b className="textDecoration">Load more</b>
                                                </TableCell>
                                            </TableRow>
                                        }
                                    </TableBody>
                                </Table>
                            </div>
                        }
                    </div>
                </div>
            }

            {/* Snackbar */}
            {snackbarMessages && snackbarMessages.map((snackbarMessage, i) => {
                return (
                    <Snackbar
                        key={i}
                        open={snackbarMessages.length > 0}
                        autoHideDuration={6000}
                        onClose={() => handleRemoveSnackbarMessage(snackbarMessage)}
                        message={snackbarMessage}
                        action={<IconButton size="small" aria-label="close" style={{ color: "white" }} onClick={() => handleRemoveSnackbarMessage(snackbarMessage)}><CloseIcon color="white" /></IconButton>}
                    />
                )
            })}
        </div>
    );


    // END RENDER


}

export default Pool;