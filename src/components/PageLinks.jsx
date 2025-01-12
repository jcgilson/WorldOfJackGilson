import { pageLinks } from "../helpers/GolfConsts";

const PageLinks = (props) => {
    const { activePage, setActivePage } = props;

    return (
        <div className="pageLinks marginTopMedium">
            {pageLinks.map((page, i) => {
                return <a key={i} onClick={() => setActivePage(page)} className={`marginRightExtraLarge pageLinkFont${page === activePage ? " active" : ""}`}>{page}</a>
            })}
        </div>
    )
}

export default PageLinks