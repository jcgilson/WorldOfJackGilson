const GolfUploadButton = (props) => {
    const {onClickFunction, fileInputRef, onChange} = props;

    return (
      <>
            <button
                onClick={onClickFunction}
                style={{ marginTop: "45vh" }}
                className="massiveButton"
            >
                Upload Golf Stats
            </button>
            <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={onChange}
            />
        </>
    )
}

export default GolfUploadButton;

{/* 
    V1 - Deprecated 1/9/25

    Images contained in Golf.jsx file. Opted to refactor to separate component and hide images/supporting text

    imports
    // Images
    // import scorecard from "../images/scorecard.png";
    // import singleHoleMetrics from "../images/singleHoleMetrics.png";
    // import metrics from "../images/metrics.png";

    {displayUploadButton &&
        <>
            <span className="massiveFont marginTopMassive paddingTopMassive">There is currently no data to display. Please upload stats below.</span>
            <span className="massiveFont marginTopMassive paddingTopMassive">Please upload stats below.</span>
            <div className="flexRow marginTopMassive">
                <div className="sectionBorder">
                    <h1>Enter Scorecards</h1>
                    <img src={scorecard} style={{ width: "400px" }} className="marginTopSmall" alt="Scorecard" />
                </div>
                <div className="sectionBorder">
                    <h1>Hole History</h1>
                    <img src={singleHoleMetrics} style={{ width: "400px" }} className="marginTopSmall" alt="Single Hole Metrics" />
                </div>
                <div className="sectionBorder">
                    <h1>Overall Metrics</h1>
                    <img src={metrics} style={{ width: "500px" }} className="marginTopSmall" alt="Single Hole Metrics" />
                </div>
            </div>
            <button
                onClick={() => fileInputRef.current.click()}
                className="marginTopMassive massiveButton"
            >
                Upload Golf Stats
            </button>
            <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={importFile}
            />
        </>
    }
*/}